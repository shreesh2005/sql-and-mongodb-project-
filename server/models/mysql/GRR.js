const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const GRR = sequelize.define('GRR', {
  grr_no: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  challan_no: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  grr_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  received_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'GRR'
});

module.exports = GRR;
