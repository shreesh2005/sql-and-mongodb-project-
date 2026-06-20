const express = require('express');
const { GRR, GRRDetail, Challan, Part, Transporter } = require('../models/mysql');
const syncService = require('../services/syncService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');
const { sequelize } = require('../config/mysql');

const router = express.Router();

// @desc    Get all GRRs
// @route   GET /api/grr
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const grrs = await GRR.findAll({
      include: [
        { model: Challan, as: 'challan' },
        { model: GRRDetail, as: 'details' }
      ],
      order: [['grr_date', 'DESC']]
    });
    res.json({ success: true, count: grrs.length, data: grrs });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single GRR by number
// @route   GET /api/grr/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const grr = await GRR.findByPk(req.params.id, {
      include: [
        { model: Challan, as: 'challan' },
        { model: GRRDetail, as: 'details', include: [{ model: Part, as: 'part' }] }
      ]
    });

    if (!grr) {
      return res.status(404).json({ success: false, error: 'GRR not found' });
    }

    res.json({ success: true, data: grr });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new GRR (Transactional)
// @route   POST /api/grr
// @access  Private (Admin, Store Manager)
router.post('/', protect, authorize('Admin', 'Store Manager'), auditLog('CREATE_GRR', 'GRR'), async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { challan_no, grr_date, received_by, remarks, details } = req.body;

    // Check if challan exists
    const challan = await Challan.findByPk(challan_no);
    if (!challan) {
      return res.status(404).json({ success: false, error: 'Challan not found' });
    }

    // Get Transporter details for MongoDB sync
    const transporter = await Transporter.findByPk(challan.transporter_id);

    // Create GRR Header
    const grr = await GRR.create({
      challan_no,
      grr_date,
      received_by,
      remarks
    }, { transaction });

    // Prepare details
    const detailsToCreate = details.map(item => ({
      grr_no: grr.grr_no,
      part_no: item.part_no,
      challan_qty: item.challan_qty,
      description: item.description,
      remarks: item.remarks
    }));

    // Create GRR Details
    const grrDetails = await GRRDetail.bulkCreate(detailsToCreate, { transaction });

    await transaction.commit();

    // Trigger asynchronous sync to MongoDB (inventory movements, delivery status, alerts)
    syncService.syncGRR(
      grr, 
      grrDetails, 
      challan.vendor_code, 
      challan.transporter_id, 
      transporter ? transporter.transporter_name : 'N/A'
    );

    res.status(201).json({
      success: true,
      data: {
        ...grr.toJSON(),
        details: grrDetails
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
