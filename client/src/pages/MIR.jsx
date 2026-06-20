import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, PackageOpen, Eye, ArrowUpRight } from 'lucide-react';
import { formatDate } from '../lib/utils';

const MIR = () => {
  const [mirs, setMirs] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMir, setSelectedMir] = useState(null);

  // Form State
  const [mirNo, setMirNo] = useState('');
  const [mirDate, setMirDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedBy, setRequestedBy] = useState('');
  const [department, setDepartment] = useState('Production');
  const [mirLines, setMirLines] = useState([{ part_no: '', qty_issued: 1 }]);
  const [formError, setFormError] = useState('');

  const fetchMirs = async () => {
    try {
      const res = await api.get('/api/mir');
      if (res.data.success) {
        setMirs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load MIRs:', err);
    }
  };

  const fetchParts = async () => {
    try {
      const res = await api.get('/api/parts');
      if (res.data.success) {
        setParts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load parts:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchMirs(), fetchParts()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddLine = () => {
    setMirLines([...mirLines, { part_no: '', qty_issued: 1 }]);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...mirLines];
    updated[index][field] = value;
    setMirLines(updated);
  };

  const handleRemoveLine = (index) => {
    if (mirLines.length > 1) {
      setMirLines(mirLines.filter((_, i) => i !== index));
    }
  };

  const handleCreateMir = async (e) => {
    e.preventDefault();
    setFormError('');

    if (mirLines.some(l => !l.part_no || l.qty_issued <= 0)) {
      setFormError('Please select parts and enter positive quantities for all lines.');
      return;
    }

    try {
      const payload = {
        mir_no: mirNo,
        mir_date: mirDate,
        requested_by: requestedBy,
        department,
        status: 'ISSUED', // Issue stock immediately on submit
        details: mirLines
      };

      const res = await api.post('/api/mir', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setMirNo('');
        setRequestedBy('');
        setMirLines([{ part_no: '', qty_issued: 1 }]);
        fetchMirs();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to request material issue');
    }
  };

  const handleViewDetails = async (mirNo) => {
    try {
      const res = await api.get(`/api/mir/${mirNo}`);
      if (res.data.success) {
        setSelectedMir(res.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'MIR Number', accessor: 'mir_no' },
    { header: 'Date Requisitioned', accessor: (row) => formatDate(row.mir_date) },
    { header: 'Department', accessor: 'department' },
    { header: 'Requested By', accessor: 'requested_by' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          row.status === 'ISSUED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status}
        </span>
      ) 
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row.mir_no)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="View Details"
        >
          <Eye size={16} />
        </button>
      ) 
    }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Material Issue Requisitions (MIR)</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Raise material requisitions for manufacturing assembly pipelines and log stock issues.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/10 transition-colors"
        >
          <Plus size={16} />
          <span>New Requisition (MIR)</span>
        </button>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={mirs} searchPlaceholder="Search MIR code, department, requester..." />
        </CardContent>
      </Card>

      {/* Create Requisition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><PackageOpen size={16} /> Requisition Stock Issuance</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleCreateMir} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">MIR Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="MIR-2024-006"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={mirNo}
                    onChange={(e) => setMirNo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">MIR Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={mirDate}
                    onChange={(e) => setMirDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Requested By (Manager Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Prod Mgr – D"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Department *</label>
                  <select
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Production">Production</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Quality">Quality</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-1 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300">Requisition Items</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
                  >
                    + Add Line Item
                  </button>
                </div>

                {mirLines.map((line, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Select Part</label>
                      <select
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                        value={line.part_no}
                        onChange={(e) => handleLineChange(idx, 'part_no', e.target.value)}
                      >
                        <option value="">-- Select --</option>
                        {parts.map(p => (
                          <option key={p.part_no} value={p.part_no}>
                            {p.description} ({p.part_no}) | Available Stock: {p.opening_stock}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28">
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Issue Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                        value={line.qty_issued}
                        onChange={(e) => handleLineChange(idx, 'qty_issued', Number(e.target.value))}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
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
                  Issue Materials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MIR Detail Modal */}
      {showDetailModal && selectedMir && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><ArrowUpRight size={16} /> MIR Requisition Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-gray-500">Requested Department:</span>
                  <p className="font-bold text-gray-805 dark:text-slate-300">{selectedMir.department}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Date Issued:</span>
                  <p className="font-bold text-gray-805 dark:text-slate-300">{formatDate(selectedMir.mir_date)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border border-gray-150 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/40 font-bold text-gray-500">
                    <tr>
                      <th className="px-4 py-2 border-b">Part Number</th>
                      <th className="px-4 py-2 border-b">Description</th>
                      <th className="px-4 py-2 border-b text-center">Qty Issued</th>
                      <th className="px-4 py-2 border-b">Issue Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMir.details?.map((line) => (
                      <tr key={line.mir_detail_id} className="border-b dark:border-slate-800/50">
                        <td className="px-4 py-2 font-semibold text-blue-600">{line.part_no}</td>
                        <td className="px-4 py-2">{line.part?.description || '—'}</td>
                        <td className="px-4 py-2 text-center font-bold">{line.qty_issued}</td>
                        <td className="px-4 py-2">{formatDate(line.issue_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MIR;
