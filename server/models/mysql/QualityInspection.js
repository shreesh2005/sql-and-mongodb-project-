const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const QualityInspection = sequelize.define('Quality_Inspection', {
  inspection_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  grr_detail_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inspection_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  accepted_qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rejected_qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PASS', 'FAIL', 'PARTIAL'),
    allowNull: false
  },
  inspector_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Quality_Inspection'
});

module.exports = QualityInspection;
