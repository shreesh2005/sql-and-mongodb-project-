const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Part = sequelize.define('Part', {
  part_no: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  unit_of_measure: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  unit_rate: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  opening_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minimum_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  order_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  part_type: {
    type: DataTypes.ENUM('RAW', 'FINISHED'),
    allowNull: false
  }
}, {
  tableName: 'Part'
});

module.exports = Part;
