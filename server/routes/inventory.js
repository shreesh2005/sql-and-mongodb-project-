const express = require('express');
const { Part, PartCategory } = require('../models/mysql');
const InventoryMovement = require('../models/mongodb/InventoryMovement');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @desc    Get live stock position with reorder status (SQL Query 15 equivalent)
// @route   GET /api/inventory/status
// @access  Private
router.get('/status', protect, async (req, res, next) => {
  try {
    const parts = await Part.findAll({
      include: [{ model: PartCategory, as: 'category' }]
    });

    const stockStatus = parts.map(p => {
      const current_stock = p.opening_stock;
      const min_stock = p.minimum_stock;
      
      let status = 'ADEQUATE';
      if (current_stock < min_stock) {
        status = 'REORDER NOW';
      } else if (current_stock < min_stock * 1.5) {
        status = 'LOW STOCK';
      }

      return {
        part_no: p.part_no,
        description: p.description,
        unit_of_measure: p.unit_of_measure,
        category: p.category ? p.category.category_name : 'N/A',
        current_stock,
        minimum_stock: min_stock,
        order_quantity: p.order_quantity,
        stock_status: status
      };
    });

    res.json({ success: true, count: stockStatus.length, data: stockStatus });
  } catch (error) {
    next(error);
  }
});

// @desc    Get reorder alerts (SQL Query 3 equivalent)
// @route   GET /api/inventory/reorder-alerts
// @access  Private
router.get('/reorder-alerts', protect, async (req, res, next) => {
  try {
    const alerts = await Part.findAll({
      where: {
        opening_stock: {
          [Op.lt]: sequelize.col('minimum_stock')
        }
      },
      include: [{ model: PartCategory, as: 'category' }]
    });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    // If the sequelize.col syntax fails, we can do manual filter
    try {
      const allParts = await Part.findAll({ include: [{ model: PartCategory, as: 'category' }] });
      const filtered = allParts.filter(p => p.opening_stock < p.minimum_stock);
      res.json({ success: true, count: filtered.length, data: filtered });
    } catch (err) {
      next(err);
    }
  }
});

// @desc    Get inventory movements from MongoDB
// @route   GET /api/inventory/movements
// @access  Private
router.get('/movements', protect, async (req, res, next) => {
  try {
    const movements = await InventoryMovement.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: movements.length, data: movements });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
