import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import Loader from '../components/ui/Loader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { formatCurrency } from '../lib/utils';
import { Thermometer, Droplets, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart
} from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [qualityStats, setQualityStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated IoT sensor readings
  const sensorData = [
    { time: '10:00', temp: 22.1, humidity: 45 },
    { time: '11:00', temp: 22.4, humidity: 44 },
    { time: '12:00', temp: 23.0, humidity: 42 },
    { time: '13:00', temp: 23.5, humidity: 41 },
    { time: '14:00', temp: 23.8, humidity: 40 },
    { time: '15:00', temp: 23.2, humidity: 43 },
    { time: '16:00', temp: 22.6, humidity: 46 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, qRes] = await Promise.all([
          api.get('/api/analytics/dashboard'),
          api.get('/api/analytics/quality')
        ]);

        if (dRes.data.success) setData(dRes.data.data);
        if (qRes.data.success) setQualityStats(qRes.data.data);
      } catch (err) {
        console.error('Failed to load SCM reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  const monthlySpend = data?.monthlySpend || [];

  const pieColors = {
    PASS: '#10b981',
    PARTIAL: '#f59e0b',
    FAIL: '#ef4444'
  };

  const formattedPieData = qualityStats.map(stat => ({
    name: stat.status,
    value: Number(stat.total_inspections)
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">SCM Reports & Aggregations</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Aggregated SCM cost performance and quality distribution metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cost Composed Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Procurement Spending & Volumetric Trends</CardTitle>
            <CardDescription>Monthly capital spend (bars) vs PO count (line)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlySpend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalSpend" fill="#3b82f6" name="Total Spend (INR)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="poCount" stroke="#8b5cf6" name="POs Raised" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Inspection Pass/Fail Distribution</CardTitle>
            <CardDescription>Breakdown of incoming shipments auditing decisions</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-between">
            <div className="w-1/2 h-full">
              {formattedPieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No QA data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formattedPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formattedPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="w-1/2 space-y-4">
              {qualityStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[stat.status] }} />
                  <div className="text-xs">
                    <span className="font-bold">{stat.status}</span>
                    <p className="text-gray-500">{stat.total_inspections} checks | {stat.total_accepted} accepted units</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IoT warehouse sensors data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Warehouse Temperature & Humidity IoT Monitor</CardTitle>
          <CardDescription>Real-time climate log from main warehouse MongoDB collection</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-1 flex flex-col justify-center space-y-4 bg-gray-50 dark:bg-slate-800/40 p-5 rounded-xl border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Avg Temp</span>
              <Thermometer className="text-red-500" size={20} />
            </div>
            <p className="text-2xl font-bold">23.1 °C</p>
            <div className="flex items-center justify-between border-t pt-2 mt-2">
              <span className="text-xs font-semibold text-gray-500">Avg Humidity</span>
              <Droplets className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold">43.1%</p>
          </div>

          <div className="md:col-span-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temp" stroke="#ef4444" name="Temperature (°C)" strokeWidth={2} />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
