const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');
const DocumentRepository = require('../models/mongodb/DocumentRepository');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLog = require('../middleware/auditLogger');
const { Readable } = require('stream');

const router = express.Router();

// Setup Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

let bucket;
mongoose.connection.on('connected', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'documents'
  });
});

// @desc    Upload file to GridFS
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), auditLog('UPLOAD_DOCUMENT', 'DocumentRepository'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { documentType, referenceId } = req.body;

    if (!documentType) {
      return res.status(400).json({ success: false, error: 'Please specify documentType' });
    }

    if (!bucket) {
      return res.status(500).json({ success: false, error: 'GridFS storage bucket is not initialized yet' });
    }

    // Create a upload stream to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });

    // Write file buffer to stream
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);

    uploadStream.on('error', (err) => {
      return res.status(500).json({ success: false, error: 'GridFS upload error' });
    });

    uploadStream.on('finish', async () => {
      // Save metadata in DocumentRepository collection
      const doc = await DocumentRepository.create({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        gridFsId: uploadStream.id.toString(),
        documentType,
        referenceId: referenceId || 'N/A',
        uploadedBy: req.user ? req.user.name : 'SYSTEM'
      });

      res.status(201).json({ success: true, data: doc });
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get all document metadata
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.type) query.documentType = req.query.type;
    if (req.query.ref) query.referenceId = req.query.ref;

    const docs = await DocumentRepository.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
});

// @desc    Download file from GridFS
// @route   GET /api/documents/download/:gridFsId
// @access  Private
router.get('/download/:gridFsId', protect, async (req, res, next) => {
  try {
    if (!bucket) {
      return res.status(500).json({ success: false, error: 'GridFS storage bucket is not initialized' });
    }

    const doc = await DocumentRepository.findOne({ gridFsId: req.params.gridFsId });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document metadata not found' });
    }

    res.set({
      'Content-Type': doc.contentType,
      'Content-Disposition': `attachment; filename="${doc.filename}"`,
      'Content-Length': doc.size
    });

    const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.gridFsId));
    downloadStream.pipe(res);

    downloadStream.on('error', () => {
      return res.status(404).json({ success: false, error: 'File not found in storage' });
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Delete document from GridFS and metadata repo
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, auditLog('DELETE_DOCUMENT', 'DocumentRepository'), async (req, res, next) => {
  try {
    if (!bucket) {
      return res.status(500).json({ success: false, error: 'GridFS storage bucket is not initialized' });
    }

    const doc = await DocumentRepository.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Delete from GridFS bucket
    try {
      await bucket.delete(new ObjectId(doc.gridFsId));
    } catch (err) {
      console.warn('File not found in GridFS, deleting metadata anyway.');
    }

    // Delete metadata
    await doc.deleteOne();

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
