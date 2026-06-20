const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const PurchaseOrder = sequelize.define('Purchase_Order', {
  po_number: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  vendor_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  po_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expected_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PARTIAL', 'COMPLETE', 'CANCELLED'),
    allowNull: true,
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'Purchase_Order'
});

module.exports = PurchaseOrder;
