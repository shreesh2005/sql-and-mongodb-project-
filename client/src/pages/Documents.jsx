import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Upload, Download, Trash, File, Link as LinkIcon } from 'lucide-react';
import { formatDate } from '../lib/utils';

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('PO');
  const [refId, setRefId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchDocs = async () => {
    try {
      const res = await api.get('/api/documents');
      if (res.data.success) {
        setDocs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('referenceId', refId || 'N/A');

    try {
      const res = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setFile(null);
        setRefId('');
        document.getElementById('fileInput').value = '';
        fetchDocs();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (gridFsId, filename) => {
    // Generate authenticated download link
    const token = localStorage.getItem('token');
    // Open in new tab which will download
    const downloadUrl = `/api/documents/download/${gridFsId}?token=${token}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document from GridFS?')) {
      try {
        const res = await api.delete(`/api/documents/${id}`);
        if (res.data.success) {
          fetchDocs();
        }
      } catch (err) {
        alert('Failed to delete document');
      }
    }
  };

  const columns = [
    { 
      header: 'Filename', 
      cell: (row) => (
        <div className="flex items-center gap-2">
          <File size={16} className="text-blue-500" />
          <span className="font-semibold text-gray-800 dark:text-slate-200">{row.filename}</span>
        </div>
      )
    },
    { header: 'Type', accessor: 'documentType' },
    { 
      header: 'Association Reference', 
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <LinkIcon size={12} className="text-gray-400" />
          <span>{row.referenceId}</span>
        </div>
      ) 
    },
    { header: 'Size', accessor: (row) => `${(row.size / 1024).toFixed(1)} KB` },
    { header: 'Uploaded By', accessor: 'uploadedBy' },
    { header: 'Date', accessor: (row) => formatDate(row.createdAt) },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload(row.gridFsId, row.filename)}
            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            title="Download Document"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete Document"
          >
            <Trash size={15} />
          </button>
        </div>
      ) 
    }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Document Repository</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Upload and secure PDFs, Challans, GRR receipts, and Quality certificates using MongoDB GridFS.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Upload Form Panel */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Upload size={16} /> Upload New File</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 rounded text-xs border border-red-100">
                {error}
              </div>
            )}
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Choose File</label>
                <input
                  id="fileInput"
                  type="file"
                  required
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Document Category</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="PO">Purchase Order (PO)</option>
                  <option value="CHALLAN">Delivery Challan</option>
                  <option value="GRR">Goods Receipt (GRR)</option>
                  <option value="INSPECTION_IMAGE">QC Inspection Media</option>
                  <option value="VENDOR_DOC">Vendor Certification</option>
                  <option value="OTHER">Other Documents</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Reference ID (e.g. PO No)</label>
                <input
                  type="text"
                  placeholder="PO-2024-001"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload to GridFS'}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Documents Grid Table */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <DataTable columns={columns} data={docs} searchPlaceholder="Search documents, reference, type..." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
