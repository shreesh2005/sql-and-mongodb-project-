import React, { useEffect, useState, useContext } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Plus, Eye, CheckCircle2, XCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../lib/utils';

const PurchaseOrders = () => {
  const { user } = useContext(AuthContext);
  const [pos, setPos] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);

  // New PO Form State
  const [poNumber, setPoNumber] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  const [poLines, setPoLines] = useState([{ part_no: '', ordered_qty: 1, unit_rate: 0.00 }]);
  const [formError, setFormError] = useState('');

  // Approval Form State
  const [approvalComment, setApprovalComment] = useState('');

  const fetchPos = async () => {
    try {
      const res = await api.get('/api/purchase-orders');
      if (res.data.success) {
        setPos(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load POs:', err);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/api/vendors'),
        api.get('/api/parts')
      ]);
      if (vRes.data.success) setVendors(vRes.data.data);
      if (pRes.data.success) setParts(pRes.data.data);
    } catch (err) {
      console.error('Failed to load dependency masters:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchPos(), fetchDependencies()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddLine = () => {
    setPoLines([...poLines, { part_no: '', ordered_qty: 1, unit_rate: 0.00 }]);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...poLines];
    updated[index][field] = value;

    // Auto fill unit rate if part is selected from catalog
    if (field === 'part_no') {
      const part = parts.find(p => p.part_no === value);
      if (part) {
        updated[index]['unit_rate'] = parseFloat(part.unit_rate);
      }
    }

    setPoLines(updated);
  };

  const handleRemoveLine = (index) => {
    if (poLines.length > 1) {
      setPoLines(poLines.filter((_, i) => i !== index));
    }
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate lines
    if (poLines.some(l => !l.part_no || l.ordered_qty <= 0)) {
      setFormError('Please select parts and enter positive quantities for all lines.');
      return;
    }

    try {
      const payload = {
        po_number: poNumber,
        vendor_code: vendorCode,
        po_date: poDate,
        expected_delivery_date: expectedDate || null,
        details: poLines
      };

      const res = await api.post('/api/purchase-orders', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        // Reset
        setPoNumber('');
        setVendorCode('');
        setExpectedDate('');
        setPoLines([{ part_no: '', ordered_qty: 1, unit_rate: 0.00 }]);
        fetchPos();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create PO');
    }
  };

  const handleViewDetails = async (poNum) => {
    try {
      const res = await api.get(`/api/purchase-orders/${poNum}`);
      if (res.data.success) {
        setSelectedPo(res.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkflowAction = async (status) => {
    try {
      const res = await api.put(`/api/purchase-orders/${selectedPo.po_number}/approve`, {
        status,
        comment: approvalComment
      });

      if (res.data.success) {
        setApprovalComment('');
        setShowDetailModal(false);
        fetchPos();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Workflow update failed');
    }
  };

  const columns = [
    { header: 'PO Number', accessor: 'po_number' },
    { header: 'Vendor', accessor: (row) => row.vendor ? row.vendor.vendor_name : row.vendor_code },
    { header: 'PO Date', accessor: (row) => formatDate(row.po_date) },
    { header: 'Delivery Date', accessor: (row) => formatDate(row.expected_delivery_date) },
    { header: 'Total Value', accessor: (row) => formatCurrency(row.total_amount) },
    { 
      header: 'Workflow Stage', 
      cell: (row) => {
        const isApp = row.approvalStatus === 'APPROVED';
        const isRej = row.approvalStatus === 'REJECTED';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isApp ? 'bg-green-100 text-green-700' : isRej ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isApp ? 'APPROVED' : isRej ? 'REJECTED' : `${row.currentStage} (Pending)`}
          </span>
        );
      } 
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row.po_number)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="View Details"
        >
          <Eye size={16} />
        </button>
      ) 
    }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  const isBuyer = ['Admin', 'Purchase Manager'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Purchase Orders</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage purchase order lifecycles, procurement pricing agreements, and approval gates.</p>
        </div>
        {isBuyer && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/10 transition-colors"
          >
            <Plus size={16} />
            <span>Create PO</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={pos} searchPlaceholder="Search PO code, vendor..." />
        </CardContent>
      </Card>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><ShoppingCart size={16} /> Raise Purchase Requisition</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleCreatePo} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">PO Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="PO-2024-006"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Select Vendor *</label>
                  <select
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendors.map(v => (
                      <option key={v.vendor_code} value={v.vendor_code}>{v.vendor_name} ({v.vendor_code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">PO Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-1 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300">Purchase Items (3NF Lines)</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
                  >
                    + Add Line Item
                  </button>
                </div>

                {poLines.map((line, idx) => (
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
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                        value={line.ordered_qty}
                        onChange={(e) => handleLineChange(idx, 'ordered_qty', Number(e.target.value))}
                      />
                    </div>

                    <div className="w-28">
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Unit Rate (INR)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                        value={line.unit_rate}
                        onChange={(e) => handleLineChange(idx, 'unit_rate', parseFloat(e.target.value))}
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  Raise PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Detail & Workflow Approval Drawer */}
      {showDetailModal && selectedPo && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200">PO Details: {selectedPo.po_number}</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Core details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-gray-500">Vendor:</span>
                  <p className="font-bold text-gray-800 dark:text-slate-300">{selectedPo.vendor?.vendor_name || selectedPo.vendor_code}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">PO Date:</span>
                  <p className="font-bold text-gray-800 dark:text-slate-300">{formatDate(selectedPo.po_date)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-150 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-slate-800/40 font-bold text-gray-500">
                    <tr>
                      <th className="px-4 py-2 border-b">Part</th>
                      <th className="px-4 py-2 border-b text-center">Qty</th>
                      <th className="px-4 py-2 border-b text-right">Rate</th>
                      <th className="px-4 py-2 border-b text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPo.details?.map((line) => (
                      <tr key={line.po_detail_id} className="border-b dark:border-slate-800/50">
                        <td className="px-4 py-2 font-medium">{line.part?.description || line.part_no}</td>
                        <td className="px-4 py-2 text-center">{line.ordered_qty}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(line.unit_rate)}</td>
                        <td className="px-4 py-2 text-right font-bold">{formatCurrency(line.ordered_qty * line.unit_rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="text-right text-xs">
                <span className="text-gray-500 font-semibold">Total Amount: </span>
                <span className="font-bold text-base text-gray-900 dark:text-white">{formatCurrency(selectedPo.total_amount)}</span>
              </div>

              {/* MongoDB Workflow state */}
              {selectedPo.workflow && (
                <div className="bg-gray-50 dark:bg-slate-800/40 rounded-xl p-4 border border-gray-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">MongoDB Approval Pipeline Status</h4>
                  
                  <div className="space-y-3">
                    {selectedPo.workflow.approvalChain.map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-xs items-start">
                        <div className="mt-0.5">
                          {step.status === 'APPROVED' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : step.status === 'REJECTED' ? (
                            <XCircle size={16} className="text-red-500" />
                          ) : (
                            <AlertCircle size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700 dark:text-slate-300">{step.role}</span>
                            <span className="text-[10px] text-gray-400">{step.timestamp ? formatDate(step.timestamp) : 'Pending'}</span>
                          </div>
                          {step.user && <p className="text-[10px] text-gray-500 mt-0.5">Verified by: {step.user}</p>}
                          {step.comment && <p className="text-[10px] text-gray-600 dark:text-slate-400 italic mt-0.5">"{step.comment}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show Approval Actions to matched Role group */}
                  {selectedPo.workflow.status === 'PENDING' && 
                   selectedPo.workflow.currentStage === user?.role && (
                    <div className="pt-3 border-t border-gray-200 dark:border-slate-700 space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Approval Comment</label>
                        <textarea
                          placeholder="Provide approval/rejection reason..."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none"
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleWorkflowAction('REJECTED')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold shadow"
                        >
                          Reject PO
                        </button>
                        <button
                          onClick={() => handleWorkflowAction('APPROVED')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-semibold shadow"
                        >
                          Approve PO
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
