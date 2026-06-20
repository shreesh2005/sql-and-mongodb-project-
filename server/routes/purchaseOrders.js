const express = require('express');
const { PurchaseOrder, PurchaseOrderDetail, Vendor, Part } = require('../models/mysql');
const ApprovalWorkflow = require('../models/mongodb/ApprovalWorkflow');
const syncService = require('../services/syncService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');
const { sequelize } = require('../config/mysql');

const router = express.Router();

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const pos = await PurchaseOrder.findAll({
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendor_name'] },
        { model: PurchaseOrderDetail, as: 'details' }
      ],
      order: [['po_date', 'DESC']]
    });

    // Fetch MongoDB workflow status for each PO
    const enrichedPos = await Promise.all(pos.map(async (po) => {
      const workflow = await ApprovalWorkflow.findOne({ entityType: 'PO', entityId: po.po_number });
      return {
        ...po.toJSON(),
        approvalStatus: workflow ? workflow.status : 'PENDING',
        currentStage: workflow ? workflow.currentStage : 'Store Manager'
      };
    }));

    res.json({ success: true, count: enrichedPos.length, data: enrichedPos });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single PO by number
// @route   GET /api/purchase-orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: PurchaseOrderDetail, as: 'details', include: [{ model: Part, as: 'part' }] }
      ]
    });

    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    const workflow = await ApprovalWorkflow.findOne({ entityType: 'PO', entityId: po.po_number });

    res.json({
      success: true,
      data: {
        ...po.toJSON(),
        workflow: workflow || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new Purchase Order (Transactional)
// @route   POST /api/purchase-orders
// @access  Private (Admin, Purchase Manager)
router.post('/', protect, authorize('Admin', 'Purchase Manager'), auditLog('CREATE_PO', 'PurchaseOrder'), async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { po_number, vendor_code, po_date, expected_delivery_date, details } = req.body;

    // Check if vendor exists
    const vendor = await Vendor.findByPk(vendor_code);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Calculate total amount
    let total_amount = 0;
    const detailsToCreate = details.map(item => {
      total_amount += Number(item.ordered_qty) * Number(item.unit_rate);
      return {
        po_number,
        part_no: item.part_no,
        ordered_qty: item.ordered_qty,
        unit_rate: item.unit_rate
      };
    });

    // Create PO Header
    const po = await PurchaseOrder.create({
      po_number,
      vendor_code,
      po_date,
      expected_delivery_date,
      total_amount,
      status: 'PENDING'
    }, { transaction });

    // Create PO Details
    const poDetails = await PurchaseOrderDetail.bulkCreate(detailsToCreate, { transaction });

    await transaction.commit();

    // Trigger asynchronous sync to MongoDB (workflows, notifications, analytics)
    syncService.syncPurchaseOrder(po, poDetails, vendor.vendor_name);

    res.status(201).json({
      success: true,
      data: {
        ...po.toJSON(),
        details: poDetails
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// @desc    Approve/Reject PO workflow stage in MongoDB
// @route   PUT /api/purchase-orders/:id/approve
// @access  Private (Admin, Purchase Manager, Store Manager)
router.put('/:id/approve', protect, authorize('Admin', 'Purchase Manager', 'Store Manager'), auditLog('APPROVE_PO', 'ApprovalWorkflow'), async (req, res, next) => {
  const { status, comment } = req.body; // status: APPROVED or REJECTED
  const po_number = req.params.id;

  try {
    const workflow = await ApprovalWorkflow.findOne({ entityType: 'PO', entityId: po_number });
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found for this PO' });
    }

    // Find first pending step in workflow chain matching user's role
    const chainIndex = workflow.approvalChain.findIndex(step => step.role === req.user.role && step.status === 'PENDING');
    if (chainIndex === -1 && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'You do not have a pending approval role in this stage' });
    }

    const idx = chainIndex === -1 ? 0 : chainIndex; // Admin fallback to first or active step
    
    workflow.approvalChain[idx].status = status;
    workflow.approvalChain[idx].user = req.user.username;
    workflow.approvalChain[idx].comment = comment || 'Approved';
    workflow.approvalChain[idx].timestamp = new Date();

    // If rejected, reject overall workflow
    if (status === 'REJECTED') {
      workflow.status = 'REJECTED';
    } else {
      // If approved, check if there's any remaining PENDING role in the chain
      const nextPending = workflow.approvalChain.find(step => step.status === 'PENDING');
      if (nextPending) {
        workflow.currentStage = nextPending.role;
      } else {
        workflow.status = 'APPROVED';
        workflow.currentStage = 'COMPLETED';

        // Update MySQL PO Status to COMPLETE/APPROVED once workflow is fully clear
        await PurchaseOrder.update({ status: 'COMPLETE' }, { where: { po_number } });
      }
    }

    if (comment) {
      workflow.comments.push(`[${req.user.role} - ${req.user.name}]: ${comment}`);
    }

    await workflow.save();

    res.json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
