const mongoose = require('mongoose');

const QualityReportSchema = new mongoose.Schema({
  grrNo: { type: Number, required: true },
  inspectionId: { type: Number, required: true, unique: true },
  partNo: { type: String, required: true },
  inspectionImages: [String], // URLs or base64
  videos: [String],
  attachments: [{
    name: String,
    fileId: String // references GridFS or file path
  }],
  remarks: String,
  inspectorDetails: {
    name: String,
    signatureId: String
  },
  aiObservations: [String]
}, {
  timestamps: true,
  collection: 'quality_reports'
});

module.exports = mongoose.model('QualityReport', QualityReportSchema);
