const express = require('express');
const AuditLog = require('../models/mongodb/AuditLog');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin only)
router.get('/', protect, authorize('Admin'), async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
