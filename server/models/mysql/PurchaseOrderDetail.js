const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const PurchaseOrderDetail = sequelize.define('Purchase_Order_Detail', {
  po_detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  po_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  part_no: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  ordered_qty: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_rate: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'Purchase_Order_Detail'
});

module.exports = PurchaseOrderDetail;
