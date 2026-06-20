const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Transporter = sequelize.define('Transporter', {
  transporter_id: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  transporter_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING(100),
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
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Transporter'
});

module.exports = Transporter;
