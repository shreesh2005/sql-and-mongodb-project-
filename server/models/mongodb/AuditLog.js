const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: String,
  username: String,
  action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'
  entity: { type: String, required: true }, // e.g., 'PurchaseOrder', 'Challan', 'GRR'
  entityId: { type: String, required: true },
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'audit_logs'
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
