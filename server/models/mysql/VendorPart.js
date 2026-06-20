const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const VendorPart = sequelize.define('Vendor_Part', {
  vendor_code: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  part_no: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  vendor_rate: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  lead_time_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  is_preferred: {
    type: DataTypes.TINYINT(1),
    allowNull: true,
    defaultValue: 0
  }
}, {
  tableName: 'Vendor_Part'
});

module.exports = VendorPart;
