import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, ClipboardCheck, ArrowDownToLine, Eye } from 'lucide-react';
import { formatDate } from '../lib/utils';

const GRR = () => {
  const [grrs, setGrrs] = useState([]);
  const [challans, setChallans] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGrr, setSelectedGrr] = useState(null);

  // Form State
  const [challanNo, setChallanNo] = useState('');
  const [grrDate, setGrrDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedBy, setReceivedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const [grrLines, setGrrLines] = useState([{ part_no: '', challan_qty: 1, description: '', remarks: '' }]);
  const [formError, setFormError] = useState('');

  const fetchGrrs = async () => {
    try {
      const res = await api.get('/api/grr');
      if (res.data.success) {
        setGrrs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load GRRs:', err);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/api/challans'),
        api.get('/api/parts')
      ]);
      if (cRes.data.success) setChallans(cRes.data.data);
      if (pRes.data.success) setParts(pRes.data.data);
    } catch (err) {
      console.error('Failed to load dependecies:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchGrrs(), fetchDependencies()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddLine = () => {
    setGrrLines([...grrLines, { part_no: '', challan_qty: 1, description: '', remarks: '' }]);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...grrLines];
    updated[index][field] = value;
    
    if (field === 'part_no') {
      const part = parts.find(p => p.part_no === value);
      if (part) {
        updated[index]['description'] = part.description;
      }
    }

    setGrrLines(updated);
  };

  const handleRemoveLine = (index) => {
    if (grrLines.length > 1) {
      setGrrLines(grrLines.filter((_, i) => i !== index));
    }
  };

  const handleCreateGrr = async (e) => {
    e.preventDefault();
    setFormError('');

    if (grrLines.some(l => !l.part_no || l.challan_qty <= 0)) {
      setFormError('Please select parts and enter positive quantities for all lines.');
      return;
    }

    try {
      const payload = {
        challan_no: challanNo,
        grr_date: grrDate,
        received_by: receivedBy,
        remarks,
        details: grrLines
      };

      const res = await api.post('/api/grr', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        // Reset
        setChallanNo('');
        setReceivedBy('');
        setRemarks('');
        setGrrLines([{ part_no: '', challan_qty: 1, description: '', remarks: '' }]);
        fetchGrrs();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to generate GRR');
    }
  };

  const handleViewDetails = async (grrNo) => {
    try {
      const res = await api.get(`/api/grr/${grrNo}`);
      if (res.data.success) {
        setSelectedGrr(res.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'GRR Number', accessor: 'grr_no' },
    { header: 'Challan Number', accessor: 'challan_no' },
    { header: 'Date Received', accessor: (row) => formatDate(row.grr_date) },
    { header: 'Received By', accessor: 'received_by' },
    { header: 'General Remarks', accessor: 'remarks' },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row.grr_no)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="View GRR Lines"
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Goods Received Reports</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Register incoming vendor deliveries and track material descriptions.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/10 transition-colors"
        >
          <Plus size={16} />
          <span>New Goods Receipt (GRR)</span>
        </button>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={grrs} searchPlaceholder="Search GRR, Challan, Inspector..." />
        </CardContent>
      </Card>

      {/* Create GRR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><ClipboardCheck size={16} /> Generate Goods Received Report</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleCreateGrr} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Select Delivery Challan *</label>
                  <select
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 font-medium text-gray-700 dark:text-slate-300"
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                  >
                    <option value="">-- Select Dispatched Challan --</option>
                    {challans.map(c => (
                      <option key={c.challan_no} value={c.challan_no}>{c.challan_no} (PO: {c.po_number})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">GRR Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={grrDate}
                    onChange={(e) => setGrrDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Received By (Officer Name)</label>
                  <input
                    type="text"
                    placeholder="Ramesh Verma"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">General Notes</label>
                  <input
                    type="text"
                    placeholder="E.g., boxes checked, items intact"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-1 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300">Materials Received</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
                  >
                    + Add Material Line
                  </button>
                </div>

                {grrLines.map((line, idx) => (
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
                          <option key={p.part_no} value={p.part_no}>{p.description} ({p.part_no})</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Challan Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                        value={line.challan_qty}
                        onChange={(e) => handleLineChange(idx, 'challan_qty', Number(e.target.value))}
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Line Remarks</label>
                      <input
                        type="text"
                        placeholder="Condition checks"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                        value={line.remarks}
                        onChange={(e) => handleLineChange(idx, 'remarks', e.target.value)}
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
                  Save GRR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRR Detail Modal */}
      {showDetailModal && selectedGrr && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><ArrowDownToLine size={16} /> GRR Lines Summary</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-gray-500">Challan Reference:</span>
                  <p className="font-bold text-gray-850 dark:text-slate-300">{selectedGrr.challan_no}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Date Received:</span>
                  <p className="font-bold text-gray-850 dark:text-slate-300">{formatDate(selectedGrr.grr_date)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border border-gray-150 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/40 font-bold text-gray-500">
                    <tr>
                      <th className="px-4 py-2 border-b">Part Number</th>
                      <th className="px-4 py-2 border-b">Description</th>
                      <th className="px-4 py-2 border-b text-center">Challan Qty</th>
                      <th className="px-4 py-2 border-b">Line Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGrr.details?.map((line) => (
                      <tr key={line.grr_detail_id} className="border-b dark:border-slate-800/50">
                        <td className="px-4 py-2 font-semibold text-blue-600">{line.part_no}</td>
                        <td className="px-4 py-2">{line.part?.description || line.description}</td>
                        <td className="px-4 py-2 text-center font-bold">{line.challan_qty}</td>
                        <td className="px-4 py-2 italic text-gray-500">{line.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedGrr.remarks && (
                <div className="bg-gray-50 dark:bg-slate-800/40 p-3 rounded-lg border text-xs">
                  <span className="font-semibold text-gray-500 block">General Remarks</span>
                  <p className="text-gray-700 dark:text-slate-300 mt-0.5">"{selectedGrr.remarks}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRR;
