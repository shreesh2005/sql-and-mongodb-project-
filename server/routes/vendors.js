const express = require('express');
const { Vendor } = require('../models/mysql');
const VendorPerformance = require('../models/mongodb/VendorPerformance');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');

const router = express.Router();

// @desc    Get all vendors with optional performance scores
// @route   GET /api/vendors
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const vendors = await Vendor.findAll();
    
    // Enrich with MongoDB performance rating data if exists
    const enrichedVendors = await Promise.all(vendors.map(async (v) => {
      const perf = await VendorPerformance.findOne({ vendorCode: v.vendor_code });
      return {
        ...v.toJSON(),
        qualityScore: perf ? perf.qualityScore : 100,
        rejectionRate: perf ? perf.rejectionRate : 0,
        ratingsCount: perf ? perf.ratings.length : 0
      };
    }));

    res.json({ success: true, count: enrichedVendors.length, data: enrichedVendors });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single vendor by code
// @route   GET /api/vendors/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const perf = await VendorPerformance.findOne({ vendorCode: vendor.vendor_code });

    res.json({
      success: true,
      data: {
        ...vendor.toJSON(),
        performance: perf || {
          qualityScore: 100,
          rejectionRate: 0,
          ratings: [],
          deliveryHistory: [],
          comments: []
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private (Admin, Purchase Manager)
router.post('/', protect, authorize('Admin', 'Purchase Manager'), auditLog('CREATE_VENDOR', 'Vendor'), async (req, res, next) => {
  try {
    const vendor = await Vendor.create(req.body);
    
    // Initialize MongoDB performance entry
    await VendorPerformance.create({
      vendorCode: vendor.vendor_code,
      vendorName: vendor.vendor_name,
      ratings: [],
      deliveryHistory: [],
      rejectionRate: 0,
      qualityScore: 100,
      comments: ['Vendor created in database.']
    });

    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// @desc    Update vendor details
// @route   PUT /api/vendors/:id
// @access  Private (Admin, Purchase Manager)
router.put('/:id', protect, authorize('Admin', 'Purchase Manager'), auditLog('UPDATE_VENDOR', 'Vendor'), async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    await vendor.update(req.body);
    
    // Keep name in sync in MongoDB
    if (req.body.vendor_name) {
      await VendorPerformance.updateOne(
        { vendorCode: vendor.vendor_code },
        { $set: { vendorName: req.body.vendor_name } }
      );
    }

    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), auditLog('DELETE_VENDOR', 'Vendor'), async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    await vendor.destroy();
    
    // Clean up MongoDB performance profile
    await VendorPerformance.deleteOne({ vendorCode: req.params.id });

    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @desc    Rate a vendor directly
// @route   POST /api/vendors/:id/rate
// @access  Private (Admin, Purchase Manager, Inspector)
router.post('/:id/rate', protect, authorize('Admin', 'Purchase Manager', 'Inspector'), auditLog('RATE_VENDOR', 'VendorPerformance'), async (req, res, next) => {
  const { rating, comment } = req.body;
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const perf = await VendorPerformance.findOneAndUpdate(
      { vendorCode: vendor.vendor_code },
      {
        $push: { ratings: { rating, comment } }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: perf });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
