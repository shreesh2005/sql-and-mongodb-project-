import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Truck, Eye } from 'lucide-react';
import { formatDate } from '../lib/utils';

const Challans = () => {
  const [challans, setChallans] = useState([]);
  const [pos, setPos] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [challanNo, setChallanNo] = useState('');
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorCode, setVendorCode] = useState('');
  const [transporterId, setTransporterId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  const fetchChallans = async () => {
    try {
      const res = await api.get('/api/challans');
      if (res.data.success) {
        setChallans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load challans:', err);
    }
  };

  const fetchDependencies = async () => {
    try {
      // Simulate loading standard CDAC seeding transporters
      // TRP-001 to TRP-005
      const [pRes, vRes] = await Promise.all([
        api.get('/api/purchase-orders'),
        api.get('/api/vendors')
      ]);

      if (pRes.data.success) setPos(pRes.data.data);
      if (vRes.data.success) setVendors(vRes.data.data);

      // We can seed static transporters in select option
      setTransporters([
        { id: 'TRP-001', name: 'Blue Dart Logistics' },
        { id: 'TRP-002', name: 'DTDC Courier' },
        { id: 'TRP-003', name: 'Delhivery Ltd' },
        { id: 'TRP-004', name: 'VRL Logistics' },
        { id: 'TRP-005', name: 'TCI Express' }
      ]);

    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchChallans(), fetchDependencies()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateChallan = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const payload = {
        challan_no: challanNo,
        challan_date: challanDate,
        vendor_code: vendorCode,
        transporter_id: transporterId,
        po_number: poNumber,
        remarks
      };

      const res = await api.post('/api/challans', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        // Reset
        setChallanNo('');
        setVendorCode('');
        setTransporterId('');
        setPoNumber('');
        setRemarks('');
        fetchChallans();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create Challan');
    }
  };

  const columns = [
    { header: 'Challan Number', accessor: 'challan_no' },
    { header: 'Dispatch Date', accessor: (row) => formatDate(row.challan_date) },
    { header: 'PO Link', accessor: 'po_number' },
    { header: 'Vendor', accessor: (row) => row.vendor ? row.vendor.vendor_name : row.vendor_code },
    { header: 'Transporter', accessor: (row) => row.transporter ? row.transporter.transporter_name : row.transporter_id },
    { 
      header: 'Delivery Track', 
      cell: (row) => {
        const isDel = row.deliveryStatus === 'DELIVERED';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isDel ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 animate-pulse'
          }`}>
            {row.deliveryStatus}
          </span>
        );
      } 
    },
    { header: 'Remarks', accessor: 'remarks' }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Delivery Challans</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Track dispatches from vendors and transporters with GPS logs in MongoDB.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/10 transition-colors"
        >
          <Plus size={16} />
          <span>Dispatch Challan</span>
        </button>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={challans} searchPlaceholder="Search challans..." />
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><Truck size={16} /> Log Shipment Dispatch</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleCreateChallan} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Challan Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="CHN-006"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Dispatch Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={challanDate}
                    onChange={(e) => setChallanDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Vendor *</label>
                  <select
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                  >
                    <option value="">-- Select Vendor --</option>
                    {vendors.map(v => (
                      <option key={v.vendor_code} value={v.vendor_code}>{v.vendor_name} ({v.vendor_code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Link Purchase Order *</label>
                  <select
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                  >
                    <option value="">-- Select PO Link --</option>
                    {pos.map(po => (
                      <option key={po.po_number} value={po.po_number}>{po.po_number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Assign Transporter *</label>
                <select
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700"
                  value={transporterId}
                  onChange={(e) => setTransporterId(e.target.value)}
                >
                  <option value="">-- Choose Transporter --</option>
                  {transporters.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Material conditions, dispatch instructions"
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
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challans;
