const express = require('express');
const { Challan, Vendor, Transporter, PurchaseOrder } = require('../models/mysql');
const DeliveryTracking = require('../models/mongodb/DeliveryTracking');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');

const router = express.Router();

// @desc    Get all challans
// @route   GET /api/challans
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const challans = await Challan.findAll({
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendor_name'] },
        { model: Transporter, as: 'transporter', attributes: ['transporter_name'] },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['po_number'] }
      ],
      order: [['challan_date', 'DESC']]
    });

    // Merge with MongoDB delivery tracking status
    const enrichedChallans = await Promise.all(challans.map(async (ch) => {
      const tracking = await DeliveryTracking.findOne({ challanNo: ch.challan_no });
      return {
        ...ch.toJSON(),
        deliveryStatus: tracking ? tracking.deliveryStatus : 'DISPATCHED'
      };
    }));

    res.json({ success: true, count: enrichedChallans.length, data: enrichedChallans });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single challan
// @route   GET /api/challans/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const challan = await Challan.findByPk(req.params.id, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: Transporter, as: 'transporter' },
        { model: PurchaseOrder, as: 'purchaseOrder' }
      ]
    });

    if (!challan) {
      return res.status(404).json({ success: false, error: 'Challan not found' });
    }

    const tracking = await DeliveryTracking.findOne({ challanNo: challan.challan_no });

    res.json({
      success: true,
      data: {
        ...challan.toJSON(),
        tracking: tracking || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new Challan
// @route   POST /api/challans
// @access  Private (Admin, Vendor, Purchase Manager)
router.post('/', protect, authorize('Admin', 'Vendor', 'Purchase Manager'), auditLog('CREATE_CHALLAN', 'Challan'), async (req, res, next) => {
  try {
    const { challan_no, challan_date, vendor_code, transporter_id, po_number, remarks } = req.body;

    // Check references
    const transporter = await Transporter.findByPk(transporter_id);
    if (!transporter) {
      return res.status(404).json({ success: false, error: 'Transporter not found' });
    }

    const challan = await Challan.create({
      challan_no,
      challan_date,
      vendor_code,
      transporter_id,
      po_number,
      remarks
    });

    // Seed GPS tracking simulation in MongoDB
    // Coordinates corresponding to typical routes (e.g. Pune/Nashik to Mumbai)
    const seedLat = 18.5204 + (Math.random() - 0.5) * 0.1;
    const seedLng = 73.8567 + (Math.random() - 0.5) * 0.1;

    await DeliveryTracking.create({
      challanNo: challan_no,
      transporterId: transporter_id,
      transporterName: transporter.transporter_name,
      deliveryStatus: 'DISPATCHED',
      gpsLogs: [
        { lat: seedLat, lng: seedLng, timestamp: new Date() }
      ],
      routeHistory: ['Dispatched from vendor warehouse.'],
      eta: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) // 2 days from now
    });

    res.status(201).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
