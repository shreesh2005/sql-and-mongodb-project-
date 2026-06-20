const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Challan = sequelize.define('Challan', {
  challan_no: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  challan_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  vendor_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  transporter_id: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  po_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Challan'
});

module.exports = Challan;
