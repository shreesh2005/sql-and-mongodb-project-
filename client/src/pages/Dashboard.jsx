import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { formatCurrency } from '../lib/utils';
import {
  Users,
  FileText,
  ClipboardList,
  IndianRupee,
  ShieldAlert,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  const { kpis, vendorRankings, monthlySpend } = data || {
    kpis: { totalVendors: 0, totalPOs: 0, pendingGRRs: 0, inventoryValue: 0, rejectedQty: 0 },
    vendorRankings: [],
    monthlySpend: []
  };

  const statCards = [
    { title: 'Active Vendors', value: kpis.totalVendors, description: 'Registered supply partners', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
    { title: 'Purchase Orders', value: kpis.totalPOs, description: 'POs issued this fiscal', icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
    { title: 'Pending GRRs', value: kpis.pendingGRRs, description: 'Awaiting quality tests', icon: ClipboardList, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' },
    { title: 'Inventory Value', value: formatCurrency(kpis.inventoryValue), description: 'Current stock value', icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { title: 'Rejected Materials', value: `${kpis.rejectedQty} units`, description: 'Rejections in incoming quality checks', icon: ShieldAlert, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Supply Chain Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Real-time SCM operations, procurement trends, and quality benchmarks.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{card.value}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{card.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon size={20} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Spend and Quality Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* SCM Monthly Spend (Area Chart) */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Procurement Spending Trend</CardTitle>
            <CardDescription>Monthly capital allocation across PO shipments (INR)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpend}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Spend']} />
                <Area type="monotone" dataKey="totalSpend" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendor Rankings (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Top Vendor Quality Scores</CardTitle>
            <CardDescription>Rated on a scale of 100 based on QC results</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {vendorRankings.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No performance records found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorRankings} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                  <YAxis dataKey="vendorName" type="category" stroke="#94A3B8" fontSize={9} width={80} />
                  <Tooltip />
                  <Bar dataKey="qualityScore" radius={[0, 4, 4, 0]}>
                    {vendorRankings.map((entry, index) => {
                      const color = entry.qualityScore > 95 ? '#10b981' : entry.qualityScore > 85 ? '#f59e0b' : '#ef4444';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SCM Info banner */}
      <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg relative overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="font-bold text-lg flex items-center gap-1.5"><Sparkles size={18} /> Enterprise Database Integration</h3>
            <p className="text-xs text-blue-100 max-w-xl">This hybrid workspace synchronizes relational MySQL master and transactional records with MongoDB document and performance schemas instantly.</p>
          </div>
          <a
            href="/documents"
            className="px-4 py-2 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow"
          >
            Manage Files & Docs
          </a>
        </CardContent>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-2xl" />
      </Card>
    </div>
  );
};

export default Dashboard;
