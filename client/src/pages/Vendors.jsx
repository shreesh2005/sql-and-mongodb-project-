import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Plus, Award, Star, Mail, Phone, MapPin } from 'lucide-react';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [vendorCode, setVendorCode] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [formError, setFormError] = useState('');

  const fetchVendors = async () => {
    try {
      const res = await api.get('/api/vendors');
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const payload = {
        vendor_code: vendorCode,
        vendor_name: vendorName,
        email,
        phone,
        city,
        state,
        address_line1: address,
        pin_code: pinCode,
        payment_terms: paymentTerms
      };

      const res = await api.post('/api/vendors', payload);
      if (res.data.success) {
        setShowModal(false);
        // Reset Form
        setVendorCode('');
        setVendorName('');
        setEmail('');
        setPhone('');
        setCity('');
        setState('');
        setAddress('');
        setPinCode('');
        // Refresh list
        fetchVendors();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create vendor');
    }
  };

  const columns = [
    { header: 'Vendor Code', accessor: 'vendor_code' },
    { header: 'Name', accessor: 'vendor_name' },
    { 
      header: 'Contacts', 
      cell: (v) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1"><Mail size={12} className="text-gray-400" /> {v.email || '—'}</div>
          <div className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {v.phone || '—'}</div>
        </div>
      ) 
    },
    { 
      header: 'Location', 
      cell: (v) => (
        <div className="text-xs flex items-center gap-1">
          <MapPin size={12} className="text-gray-400" />
          <span>{v.city ? `${v.city}, ${v.state || ''}` : '—'}</span>
        </div>
      ) 
    },
    { header: 'Terms', accessor: 'payment_terms' },
    { 
      header: 'Quality Score', 
      cell: (v) => (
        <div className="flex items-center gap-1.5">
          <div className="w-12 bg-gray-200 rounded-full h-1.5 dark:bg-slate-700">
            <div 
              className={`h-1.5 rounded-full ${v.qualityScore > 95 ? 'bg-green-500' : v.qualityScore > 85 ? 'bg-amber-500' : 'bg-red-500'}`} 
              style={{ width: `${v.qualityScore}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-slate-200">{v.qualityScore}%</span>
        </div>
      ) 
    },
    { 
      header: 'Rejection Rate', 
      cell: (v) => (
        <span className={`text-xs font-semibold ${v.rejectionRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
          {v.rejectionRate}%
        </span>
      ) 
    }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Vendors Directory</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage vendor contacts, payment structures, and live MongoDB quality ratings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/10 transition-colors"
        >
          <Plus size={16} />
          <span>Register Vendor</span>
        </button>
      </div>

      {/* Main Vendor Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={vendors} searchPlaceholder="Search vendor code, name, city..." />
        </CardContent>
      </Card>

      {/* Register Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200">Register New SCM Vendor</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {formError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Vendor Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="VND-006"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tata Motors Ltd"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="vendor@company.com"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street 101, Industrial park"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Pin Code</label>
                  <input
                    type="text"
                    placeholder="400001"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Payment Terms</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-slate-300"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 45 Days">Net 45 Days</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                  <option value="Advance Payment">Advance Payment</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
