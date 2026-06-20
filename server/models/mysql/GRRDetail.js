const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const GRRDetail = sequelize.define('GRR_Detail', {
  grr_detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  grr_no: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  part_no: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  challan_qty: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'GRR_Detail'
});

module.exports = GRRDetail;
