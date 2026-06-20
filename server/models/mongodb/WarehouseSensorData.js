const mongoose = require('mongoose');

const WarehouseSensorDataSchema = new mongoose.Schema({
  sensorId: { type: String, required: true },
  warehouseId: { type: String, required: true },
  temperature: Number,
  humidity: Number,
  readings: [{
    timestamp: { type: Date, default: Date.now },
    value: Number,
    type: { type: String, enum: ['TEMP', 'HUMID', 'PRESSURE'] }
  }],
  status: { type: String, enum: ['OK', 'WARNING', 'CRITICAL'], default: 'OK' }
}, {
  timestamps: true,
  collection: 'warehouse_sensor_data'
});

module.exports = mongoose.model('WarehouseSensorData', WarehouseSensorDataSchema);
