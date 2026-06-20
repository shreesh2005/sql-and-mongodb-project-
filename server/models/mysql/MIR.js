const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const MIR = sequelize.define('MIR', {
  mir_no: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  mir_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  requested_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ISSUED', 'PARTIAL', 'CANCELLED'),
    allowNull: true,
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'MIR'
});

module.exports = MIR;
