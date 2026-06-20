const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const PartCategory = sequelize.define('Part_Category', {
  category_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  category_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category_type: {
    type: DataTypes.ENUM('RAW_MATERIAL', 'FINISHED_PART'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Part_Category'
});

module.exports = PartCategory;
