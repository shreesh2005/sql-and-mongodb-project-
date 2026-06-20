const express = require('express');
const Notification = require('../models/mongodb/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user notifications (filtered by user ID or user role)
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    // Find notifications targeting this user OR targeting this user's role group
    const notifications = await Notification.find({
      $or: [
        { userId: req.user._id.toString() },
        { role: req.user.role },
        { userId: null, role: null } // general broadcasts
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as read by adding userId to readBy array
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id.toString())) {
      notification.readBy.push(req.user._id.toString());
      notification.isRead = true;
      await notification.save();
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
