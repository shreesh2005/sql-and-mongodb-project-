const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Vendor = sequelize.define('Vendor', {
  vendor_code: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  vendor_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address_line1: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  pin_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  payment_terms: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Vendor'
});

module.exports = Vendor;
