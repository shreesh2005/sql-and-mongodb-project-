const express = require('express');
const { Part, PartCategory } = require('../models/mysql');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');

const router = express.Router();

// @desc    Get all parts with category
// @route   GET /api/parts
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const parts = await Part.findAll({
      include: [{ model: PartCategory, as: 'category' }]
    });
    res.json({ success: true, count: parts.length, data: parts });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single part by part_no
// @route   GET /api/parts/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const part = await Part.findByPk(req.params.id, {
      include: [{ model: PartCategory, as: 'category' }]
    });
    if (!part) {
      return res.status(404).json({ success: false, error: 'Part not found' });
    }
    res.json({ success: true, data: part });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new part
// @route   POST /api/parts
// @access  Private (Admin, Purchase Manager, Store Manager)
router.post('/', protect, authorize('Admin', 'Purchase Manager', 'Store Manager'), auditLog('CREATE_PART', 'Part'), async (req, res, next) => {
  try {
    const part = await Part.create(req.body);
    res.status(201).json({ success: true, data: part });
  } catch (error) {
    next(error);
  }
});

// @desc    Update part details
// @route   PUT /api/parts/:id
// @access  Private (Admin, Purchase Manager, Store Manager)
router.put('/:id', protect, authorize('Admin', 'Purchase Manager', 'Store Manager'), auditLog('UPDATE_PART', 'Part'), async (req, res, next) => {
  try {
    const part = await Part.findByPk(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, error: 'Part not found' });
    }
    await part.update(req.body);
    res.json({ success: true, data: part });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete part
// @route   DELETE /api/parts/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), auditLog('DELETE_PART', 'Part'), async (req, res, next) => {
  try {
    const part = await Part.findByPk(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, error: 'Part not found' });
    }
    await part.destroy();
    res.json({ success: true, message: 'Part deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
