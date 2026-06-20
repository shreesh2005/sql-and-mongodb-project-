const mongoose = require('mongoose');

const DocumentRepositorySchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: String,
  size: Number,
  gridFsId: { type: String, required: true }, // References GridFS bucket file ID
  documentType: {
    type: String,
    enum: ['PO', 'CHALLAN', 'GRR', 'INSPECTION_IMAGE', 'VENDOR_DOC', 'OTHER'],
    required: true
  },
  referenceId: String, // po_number, challan_no, grr_no, etc.
  uploadedBy: String
}, {
  timestamps: true,
  collection: 'document_repository'
});

module.exports = mongoose.model('DocumentRepository', DocumentRepositorySchema);
