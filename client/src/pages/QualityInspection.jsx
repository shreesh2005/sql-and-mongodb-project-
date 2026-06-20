import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { FileCheck, ShieldAlert, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDate } from '../lib/utils';

const QualityInspection = () => {
  const [inspections, setInspections] = useState([]);
  const [grrDetails, setGrrDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [grrDetailId, setGrrDetailId] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [acceptedQty, setAcceptedQty] = useState(0);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [status, setStatus] = useState('PASS');
  const [inspectorName, setInspectorName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  // Sourced Challan Qty Helper
  const [selectedGrrDetail, setSelectedGrrDetail] = useState(null);

  const fetchInspections = async () => {
    try {
      const res = await api.get('/api/quality-inspections');
      if (res.data.success) {
        setInspections(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inspections:', err);
    }
  };

  const fetchGrrDetails = async () => {
    try {
      // Fetch all GRR reports and extract lines that require quality checking
      const res = await api.get('/api/grr');
      if (res.data.success) {
        // Flatten details list
        const lines = [];
        res.data.data.forEach(g => {
          g.details.forEach(d => {
            lines.push({
              ...d,
              grr_date: g.grr_date,
              challan_no: g.challan_no
            });
          });
        });

        // Filter out lines that have already been inspected to find pending QA lines
        const qRes = await api.get('/api/quality-inspections');
        const inspectedIds = new Set(qRes.data.data.map(q => q.grr_detail_id));
        const pending = lines.filter(l => !inspectedIds.has(l.grr_detail_id));

        setGrrDetails(pending);
      }
    } catch (err) {
      console.error('Failed to load pending GRR details:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchInspections(), fetchGrrDetails()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleGrrDetailChange = (id) => {
    setGrrDetailId(id);
    const detail = grrDetails.find(d => String(d.grr_detail_id) === String(id));
    setSelectedGrrDetail(detail || null);
    if (detail) {
      setAcceptedQty(detail.challan_qty);
      setRejectedQty(0);
      setStatus('PASS');
    }
  };

  const handleQtyChange = (field, val) => {
    if (!selectedGrrDetail) return;
    const total = selectedGrrDetail.challan_qty;
    
    if (field === 'accepted') {
      const acc = Math.min(total, Math.max(0, val));
      setAcceptedQty(acc);
      setRejectedQty(total - acc);
      setStatus(acc === total ? 'PASS' : acc === 0 ? 'FAIL' : 'PARTIAL');
    } else {
      const rej = Math.min(total, Math.max(0, val));
      setRejectedQty(rej);
      setAcceptedQty(total - rej);
      setStatus(rej === 0 ? 'PASS' : rej === total ? 'FAIL' : 'PARTIAL');
    }
  };

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!grrDetailId) {
      setFormError('Please select a GRR line to inspect.');
      return;
    }

    try {
      const payload = {
        grr_detail_id: Number(grrDetailId),
        inspection_date: inspectionDate,
        accepted_qty: Number(acceptedQty),
        rejected_qty: Number(rejectedQty),
        status,
        inspector_name: inspectorName,
        remarks
      };

      const res = await api.post('/api/quality-inspections', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setGrrDetailId('');
        setSelectedGrrDetail(null);
        setInspectorName('');
        setRemarks('');
        // Refresh lists
        await Promise.all([fetchInspections(), fetchGrrDetails()]);
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit inspection');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'inspection_id' },
    { header: 'GRR #', accessor: (row) => row.grrDetail ? row.grrDetail.grr_no : '—' },
    { header: 'Part No', accessor: (row) => row.grrDetail ? row.grrDetail.part_no : '—' },
    { header: 'Date', accessor: (row) => formatDate(row.inspection_date) },
    { header: 'Accepted', accessor: 'accepted_qty' },
    { header: 'Rejected', accessor: 'rejected_qty' },
    { 
      header: 'QC Result', 
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          row.status === 'PASS' ? 'bg-green-100 text-green-700' : row.status === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status}
        </span>
      ) 
    },
    { header: 'Inspector', accessor: 'inspector_name' },
    { header: 'Remarks', accessor: 'remarks' }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Quality Inspection</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Audit incoming shipments, log defect rejections, and verify stock quality parameters.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/10 transition-colors"
        >
          <FileCheck size={16} />
          <span>Perform Inspection</span>
        </button>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={inspections} searchPlaceholder="Search inspector, part no, status..." />
        </CardContent>
      </Card>

      {/* Perform QA Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><Sparkles size={16} /> Inspect Incoming Shipment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleCreateInspection} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Select Pending GRR Line *</label>
                <select
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                  value={grrDetailId}
                  onChange={(e) => handleGrrDetailChange(e.target.value)}
                >
                  <option value="">-- Choose Pending Material Receipt Line --</option>
                  {grrDetails.map(d => (
                    <option key={d.grr_detail_id} value={d.grr_detail_id}>
                      GRR: {d.grr_no} | Part: {d.part_no} ({d.challan_qty} units received)
                    </option>
                  ))}
                </select>
              </div>

              {selectedGrrDetail && (
                <div className="p-3 bg-blue-50/50 dark:bg-slate-800/30 rounded-lg border border-blue-100 dark:border-slate-800 text-xs space-y-1 text-gray-700 dark:text-slate-300">
                  <p><span className="font-bold">Part No:</span> {selectedGrrDetail.part_no}</p>
                  <p><span className="font-bold">Part Description:</span> {selectedGrrDetail.description || selectedGrrDetail.part?.description}</p>
                  <p><span className="font-bold">Original Challan Qty:</span> {selectedGrrDetail.challan_qty} units</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Accepted Qty *</label>
                  <input
                    type="number"
                    required
                    disabled={!selectedGrrDetail}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 disabled:opacity-50"
                    value={acceptedQty}
                    onChange={(e) => handleQtyChange('accepted', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Rejected Qty *</label>
                  <input
                    type="number"
                    required
                    disabled={!selectedGrrDetail}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 disabled:opacity-50"
                    value={rejectedQty}
                    onChange={(e) => handleQtyChange('rejected', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">QC Decision *</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-1.5 border border-gray-150 rounded-lg text-xs bg-gray-50 font-bold dark:bg-slate-800 dark:border-slate-700"
                    value={status}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Inspection Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Inspector Signature Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., QC Deepak Jain"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Remarks & Anomalies</label>
                <input
                  type="text"
                  placeholder="Surface rust defects, component failing, etc."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  Submit QA Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityInspection;
