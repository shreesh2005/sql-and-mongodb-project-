const express = require('express');
const { Part, Vendor, PurchaseOrder } = require('../models/mysql');
const DocumentRepository = require('../models/mongodb/DocumentRepository');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @desc    Global search across parts, vendors, POs, and uploaded documents
// @route   GET /api/search
// @access  Private
router.get('/', protect, async (req, res, next) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Please provide a search term' });
  }

  try {
    // 1. Search Vendors (MySQL)
    const vendors = await Vendor.findAll({
      where: {
        [Op.or]: [
          { vendor_code: { [Op.like]: `%${query}%` } },
          { vendor_name: { [Op.like]: `%${query}%` } },
          { city: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: 10
    });

    // 2. Search Parts (MySQL)
    const parts = await Part.findAll({
      where: {
        [Op.or]: [
          { part_no: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: 10
    });

    // 3. Search Purchase Orders (MySQL)
    const pos = await PurchaseOrder.findAll({
      where: {
        [Op.or]: [
          { po_number: { [Op.like]: `%${query}%` } },
          { vendor_code: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: 10
    });

    // 4. Search Documents (MongoDB)
    const docs = await DocumentRepository.find({
      $or: [
        { filename: { $regex: query, $options: 'i' } },
        { documentType: { $regex: query, $options: 'i' } },
        { referenceId: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    res.json({
      success: true,
      data: {
        vendors,
        parts,
        pos,
        documents: docs
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
