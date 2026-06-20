const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: String,
  role: String, // Can target a specific role group
  type: {
    type: String,
    enum: ['INFO', 'WARNING', 'ALERT', 'ACTION'],
    default: 'INFO'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  readBy: [String], // userIds
  isRead: { type: Boolean, default: false }, // for direct user targets
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

module.exports = mongoose.model('Notification', NotificationSchema);
