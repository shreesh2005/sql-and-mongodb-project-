import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { AlertCircle, ArrowUpRight, ArrowDownLeft, RefreshCw, Layers } from 'lucide-react';
import { formatDate } from '../lib/utils';

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        api.get('/api/inventory/status'),
        api.get('/api/inventory/movements')
      ]);

      if (sRes.data.success) setStock(sRes.data.data);
      if (mRes.data.success) setMovements(mRes.data.data);
    } catch (err) {
      console.error('Failed to load inventory logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const stockColumns = [
    { header: 'Part No', accessor: 'part_no' },
    { header: 'Description', accessor: 'description' },
    { header: 'UOM', accessor: 'unit_of_measure' },
    { header: 'Category', accessor: 'category' },
    { header: 'Current Stock', accessor: 'current_stock' },
    { header: 'Min Level', accessor: 'minimum_stock' },
    { header: 'Reorder Qty', accessor: 'order_quantity' },
    { 
      header: 'Stock Status', 
      cell: (row) => {
        const isReo = row.stock_status === 'REORDER NOW';
        const isLow = row.stock_status === 'LOW STOCK';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isReo ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
          }`}>
            {row.stock_status}
          </span>
        );
      } 
    }
  ];

  const movementColumns = [
    { 
      header: 'Type', 
      cell: (row) => {
        const isIn = row.movementType === 'INWARD';
        return (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
            isIn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isIn ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
            {row.movementType}
          </span>
        );
      }
    },
    { header: 'Part No', accessor: 'partNo' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Source/Destination', accessor: (row) => row.movementType === 'INWARD' ? 'Vendor Delivery' : row.toLocation || 'Production' },
    { header: 'Doc Reference', accessor: 'referenceId' },
    { header: 'Operator', accessor: 'user' },
    { header: 'Timestamp', accessor: (row) => formatDate(row.timestamp) }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  const reorderAlerts = stock.filter(p => p.stock_status === 'REORDER NOW');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Live Inventory Position</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Real-time stock ledger, replenishment alerts, and MongoDB transaction logs.</p>
        </div>
        <button
          onClick={fetchInventoryData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900"
        >
          <RefreshCw size={14} />
          <span>Refresh stock</span>
        </button>
      </div>

      {/* Critical Reorder Alerts Alert Banner */}
      {reorderAlerts.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 rounded-xl flex gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-xs text-red-800 dark:text-red-300">Replenishment Alert Required</h4>
            <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
              The following {reorderAlerts.length} parts are currently below minimum stock levels and need immediate purchase orders raised:
              <span className="font-bold ml-1">{reorderAlerts.map(p => p.part_no).join(', ')}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Live Stock Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers size={18} className="text-blue-600" /> Physical Stock Balance Ledger</CardTitle>
          <CardDescription>Current balance recorded in MySQL. Recalculated dynamically after GRR/MIR.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={stockColumns} data={stock} searchPlaceholder="Search part no, description..." />
        </CardContent>
      </Card>

      {/* MongoDB Stock Movements Log */}
      <Card>
        <CardHeader>
          <CardTitle>MongoDB Inventory Movements History</CardTitle>
          <CardDescription>Inward/Outward transactions recorded in MongoDB.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={movementColumns} data={movements} searchPlaceholder="Search by part number, reference doc..." />
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
