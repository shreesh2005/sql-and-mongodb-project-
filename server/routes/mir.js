const express = require('express');
const { MIR, MIRDetail, Part } = require('../models/mysql');
const syncService = require('../services/syncService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');
const { sequelize } = require('../config/mysql');

const router = express.Router();

// @desc    Get all MIRs
// @route   GET /api/mir
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const mirList = await MIR.findAll({
      include: [{ model: MIRDetail, as: 'details' }],
      order: [['mir_date', 'DESC']]
    });
    res.json({ success: true, count: mirList.length, data: mirList });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single MIR by number
// @route   GET /api/mir/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const mir = await MIR.findByPk(req.params.id, {
      include: [{ model: MIRDetail, as: 'details', include: [{ model: Part, as: 'part' }] }]
    });

    if (!mir) {
      return res.status(404).json({ success: false, error: 'MIR not found' });
    }

    res.json({ success: true, data: mir });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new MIR and issue materials (Transactional & Decrements Stock)
// @route   POST /api/mir
// @access  Private (Admin, Store Manager)
router.post('/', protect, authorize('Admin', 'Store Manager'), auditLog('CREATE_MIR', 'MIR'), async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { mir_no, mir_date, requested_by, department, status, details } = req.body;

    // Verify stock availability before issuing
    for (const item of details) {
      const part = await Part.findByPk(item.part_no, { transaction });
      if (!part) {
        return res.status(404).json({ success: false, error: `Part ${item.part_no} not found` });
      }
      if (Number(part.opening_stock) < Number(item.qty_issued)) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for Part ${item.part_no}. Available: ${part.opening_stock}, Requisitioned: ${item.qty_issued}`
        });
      }
    }

    // Create MIR Header
    const mir = await MIR.create({
      mir_no,
      mir_date,
      requested_by,
      department,
      status: status || 'PENDING'
    }, { transaction });

    // Create details and update stock
    const detailsToCreate = [];
    for (const item of details) {
      detailsToCreate.push({
        mir_no,
        part_no: item.part_no,
        qty_issued: item.qty_issued,
        issue_date: item.issue_date || mir_date
      });

      // Decrement stock in MySQL
      const part = await Part.findByPk(item.part_no, { transaction });
      const newStock = Number(part.opening_stock) - Number(item.qty_issued);
      await part.update({ opening_stock: newStock }, { transaction });
    }

    const mirDetails = await MIRDetail.bulkCreate(detailsToCreate, { transaction });

    await transaction.commit();

    // Trigger asynchronous sync to MongoDB (outward movements, approvals)
    syncService.syncMIR(mir, mirDetails);

    res.status(201).json({
      success: true,
      data: {
        ...mir.toJSON(),
        details: mirDetails
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
