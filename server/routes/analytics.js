const express = require('express');
const { Part, Vendor, PurchaseOrder, QualityInspection, GRR } = require('../models/mysql');
const VendorPerformance = require('../models/mongodb/VendorPerformance');
const ProcurementAnalytics = require('../models/mongodb/ProcurementAnalytics');
const QualityReport = require('../models/mongodb/QualityReport');
const { protect } = require('../middleware/auth');
const { sequelize } = require('../config/mysql');

const router = express.Router();

// @desc    Get dashboard metrics (MySQL + MongoDB hybrid analytics)
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    // 1. Total vendors (MySQL)
    const totalVendors = await Vendor.count();

    // 2. Total Purchase Orders (MySQL)
    const totalPOs = await PurchaseOrder.count();

    // 3. Pending GRR (those without quality inspection)
    // We count GRR detail records that do not have associated inspections
    const pendingGRRs = await GRR.count({
      where: sequelize.literal(`grr_no NOT IN (
        SELECT DISTINCT g.grr_no 
        FROM Quality_Inspection q 
        JOIN GRR_Detail gd ON q.grr_detail_id = gd.grr_detail_id
        JOIN GRR g ON gd.grr_no = g.grr_no
      )`)
    });

    // 4. Inventory Value calculation (MySQL)
    const parts = await Part.findAll({ attributes: ['opening_stock', 'unit_rate'] });
    const inventoryValue = parts.reduce((acc, p) => acc + (p.opening_stock * parseFloat(p.unit_rate)), 0);

    // 5. Total Rejections (MySQL)
    const rejections = await QualityInspection.sum('rejected_qty') || 0;
    const accepted = await QualityInspection.sum('accepted_qty') || 0;

    // 6. Vendor quality performance list (MongoDB)
    const vendorRankings = await VendorPerformance.find()
      .select('vendorCode vendorName qualityScore rejectionRate')
      .sort({ qualityScore: -1 })
      .limit(5);

    // 7. Monthly SCM Procurement spend trend (MongoDB)
    const monthlySpend = await ProcurementAnalytics.find()
      .select('period totalSpend poCount')
      .sort({ period: 1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        kpis: {
          totalVendors,
          totalPOs,
          pendingGRRs,
          inventoryValue: parseFloat(inventoryValue.toFixed(2)),
          rejectedQty: rejections,
          acceptedQty: accepted
        },
        vendorRankings,
        monthlySpend
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Detailed quality report analysis (MongoDB Aggregation Pipeline)
// @route   GET /api/analytics/quality
// @access  Private
router.get('/quality', protect, async (req, res, next) => {
  try {
    // Aggregation pipeline to group quality inspections by status
    const qiStats = await QualityInspection.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('inspection_id')), 'total_inspections'],
        [sequelize.fn('SUM', sequelize.col('accepted_qty')), 'total_accepted'],
        [sequelize.fn('SUM', sequelize.col('rejected_qty')), 'total_rejected']
      ],
      group: ['status']
    });

    res.json({ success: true, data: qiStats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
