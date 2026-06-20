const express = require('express');
const { QualityInspection, GRRDetail, GRR, Challan, Part, Vendor } = require('../models/mysql');
const syncService = require('../services/syncService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');
const { sequelize } = require('../config/mysql');

const router = express.Router();

// @desc    Get all quality inspections
// @route   GET /api/quality-inspections
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const inspections = await QualityInspection.findAll({
      include: [
        {
          model: GRRDetail,
          as: 'grrDetail',
          include: [
            { model: Part, as: 'part', attributes: ['description', 'unit_of_measure'] },
            {
              model: GRR,
              as: 'grr',
              include: [{ model: Challan, as: 'challan', include: [{ model: Vendor, as: 'vendor' }] }]
            }
          ]
        }
      ],
      order: [['inspection_date', 'DESC']]
    });
    res.json({ success: true, count: inspections.length, data: inspections });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single quality inspection
// @route   GET /api/quality-inspections/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const inspection = await QualityInspection.findByPk(req.params.id, {
      include: [
        {
          model: GRRDetail,
          as: 'grrDetail',
          include: [
            { model: Part, as: 'part' },
            { model: GRR, as: 'grr', include: [{ model: Challan, as: 'challan', include: [{ model: Vendor, as: 'vendor' }] }] }
          ]
        }
      ]
    });

    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection record not found' });
    }

    res.json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new Quality Inspection (Transactional & Updates Stock)
// @route   POST /api/quality-inspections
// @access  Private (Admin, Inspector)
router.post('/', protect, authorize('Admin', 'Inspector'), auditLog('CREATE_INSPECTION', 'QualityInspection'), async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { grr_detail_id, inspection_date, accepted_qty, rejected_qty, status, inspector_name, remarks } = req.body;

    // Check if GRR Detail line exists
    const grrDetail = await GRRDetail.findByPk(grr_detail_id, {
      include: [{ model: GRR, as: 'grr', include: [{ model: Challan, as: 'challan' }] }],
      transaction
    });

    if (!grrDetail) {
      return res.status(404).json({ success: false, error: 'GRR Line details not found' });
    }

    // Verify sums match
    if (Number(accepted_qty) + Number(rejected_qty) !== grrDetail.challan_qty) {
      return res.status(400).json({
        success: false,
        error: `Sum of accepted (${accepted_qty}) and rejected (${rejected_qty}) must equal Challan quantity (${grrDetail.challan_qty})`
      });
    }

    // Create the inspection record
    const inspection = await QualityInspection.create({
      grr_detail_id,
      inspection_date,
      accepted_qty,
      rejected_qty,
      status,
      inspector_name,
      remarks
    }, { transaction });

    // Update physical opening_stock in Part table with the accepted quantities
    const part = await Part.findByPk(grrDetail.part_no, { transaction });
    if (part) {
      const newStock = Number(part.opening_stock) + Number(accepted_qty);
      await part.update({ opening_stock: newStock }, { transaction });
    }

    await transaction.commit();

    // Fetch vendor details for MongoDB performance score update
    const vendor = await Vendor.findByPk(grrDetail.grr.challan.vendor_code);

    // Trigger asynchronous sync to MongoDB (quality reports, vendor performance, alerts)
    syncService.syncQualityInspection(
      inspection, 
      grrDetail, 
      grrDetail.grr.challan.vendor_code, 
      vendor ? vendor.vendor_name : 'N/A'
    );

    res.status(201).json({ success: true, data: inspection });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
