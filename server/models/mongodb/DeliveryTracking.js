const mongoose = require('mongoose');

const DeliveryTrackingSchema = new mongoose.Schema({
  challanNo: { type: String, required: true, unique: true },
  transporterId: { type: String, required: true },
  transporterName: String,
  gpsLogs: [{
    lat: Number,
    lng: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  deliveryStatus: {
    type: String,
    enum: ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED'],
    default: 'DISPATCHED'
  },
  routeHistory: [String],
  eta: Date
}, {
  timestamps: true,
  collection: 'delivery_tracking'
});

module.exports = mongoose.model('DeliveryTracking', DeliveryTrackingSchema);
