const mongoose = require('mongoose');

const InventoryMovementSchema = new mongoose.Schema({
  partNo: { type: String, required: true },
  description: String,
  movementType: {
    type: String,
    enum: ['INWARD', 'OUTWARD', 'TRANSFER', 'ADJUSTMENT'],
    required: true
  },
  quantity: { type: Number, required: true },
  fromLocation: String,
  toLocation: String,
  referenceId: String, // e.g., GRR_No or MIR_No
  user: String,
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'inventory_movements'
});

module.exports = mongoose.model('InventoryMovement', InventoryMovementSchema);
