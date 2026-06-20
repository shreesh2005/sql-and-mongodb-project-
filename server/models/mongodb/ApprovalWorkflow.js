const mongoose = require('mongoose');

const ApprovalWorkflowSchema = new mongoose.Schema({
  entityType: { type: String, enum: ['PO', 'MIR'], required: true },
  entityId: { type: String, required: true },
  approvalChain: [{
    role: { type: String, required: true }, // e.g. Purchase Manager, Store Manager
    user: String,
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    comment: String,
    timestamp: Date
  }],
  currentStage: String,
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  comments: [String]
}, {
  timestamps: true,
  collection: 'approval_workflows'
});

module.exports = mongoose.model('ApprovalWorkflow', ApprovalWorkflowSchema);
