const mongoose = require('mongoose');

const ProcurementAnalyticsSchema = new mongoose.Schema({
  period: { type: String, required: true, unique: true }, // YYYY-MM
  totalSpend: { type: Number, default: 0 },
  poCount: { type: Number, default: 0 },
  vendorBreakdown: [{
    vendorCode: String,
    vendorName: String,
    spend: Number
  }],
  categoryBreakdown: [{
    categoryId: Number,
    categoryName: String,
    spend: Number
  }],
  topPartsSourced: [{
    partNo: String,
    description: String,
    quantity: Number,
    spend: Number
  }]
}, {
  timestamps: true,
  collection: 'procurement_analytics'
});

module.exports = mongoose.model('ProcurementAnalytics', ProcurementAnalyticsSchema);
