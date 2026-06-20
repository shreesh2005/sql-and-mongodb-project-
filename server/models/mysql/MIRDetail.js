const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const MIRDetail = sequelize.define('MIR_Detail', {
  mir_detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  mir_no: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  part_no: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  qty_issued: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'MIR_Detail'
});

module.exports = MIRDetail;
