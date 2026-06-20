import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardContent } from '../components/ui/Card';
import { formatDate } from '../lib/utils';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/api/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    { header: 'Action', accessor: 'action' },
    { header: 'Entity', accessor: 'entity' },
    { header: 'Record ID', accessor: 'entityId' },
    { header: 'User', accessor: 'username' },
    { header: 'Timestamp', accessor: (row) => formatDate(row.timestamp) },
    { 
      header: 'Payload Details', 
      cell: (row) => (
        <pre className="text-[10px] bg-gray-50 dark:bg-slate-800 p-2 rounded max-w-xs overflow-x-auto truncate">
          {JSON.stringify(row.after || row.before || {}, null, 2)}
        </pre>
      ) 
    }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Audit Logs & Change Tracking</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Timeline of all administrative updates, material allocations, and document creation logs.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={logs} searchPlaceholder="Search actions, user, record ID..." />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
