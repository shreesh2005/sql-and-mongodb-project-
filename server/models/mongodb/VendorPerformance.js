const mongoose = require('mongoose');

const VendorPerformanceSchema = new mongoose.Schema({
  vendorCode: { type: String, required: true, unique: true },
  vendorName: { type: String, required: true },
  ratings: [{
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  deliveryHistory: [{
    poNumber: String,
    expectedDate: Date,
    actualDate: Date,
    onTime: Boolean
  }],
  rejectionRate: { type: Number, default: 0 }, // percentage
  qualityScore: { type: Number, default: 100 }, // scale of 100
  comments: [String],
  performanceTrend: [{
    month: String, // YYYY-MM
    qualityScore: Number,
    deliveryScore: Number
  }]
}, {
  timestamps: true,
  collection: 'vendor_performance'
});

module.exports = mongoose.model('VendorPerformance', VendorPerformanceSchema);
