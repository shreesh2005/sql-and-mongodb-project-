import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/ui/DataTable';
import Loader from '../components/ui/Loader';
import { Card, CardContent } from '../components/ui/Card';
import { ShieldCheck, Trash, Edit } from 'lucide-react';
import { formatDate } from '../lib/utils';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Viewer');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRole = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/users/${editingUser._id}`, { role: selectedRole });
      if (res.data.success) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user login account?')) {
      try {
        const res = await api.delete(`/api/users/${id}`);
        if (res.data.success) {
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: (row) => row.email || '—' },
    { 
      header: 'Access Role', 
      cell: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 uppercase">
          {row.role}
        </span>
      ) 
    },
    { header: 'Vendor Link', accessor: (row) => row.vendorCode || '—' },
    { header: 'Date Created', accessor: (row) => formatDate(row.createdAt) },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditRole(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit User Role"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => handleDeleteUser(row._id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete User"
          >
            <Trash size={15} />
          </button>
        </div>
      ) 
    }
  ];

  if (loading) return <Loader size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">User Access Management</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Audit active user credentials and set role access guidelines (RBAC).</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable columns={columns} data={users} searchPlaceholder="Search users..." />
        </CardContent>
      </Card>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 flex items-center gap-1.5"><ShieldCheck size={16} /> Update SCM User Role</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block">User Account</span>
                <p className="font-bold text-sm text-gray-800 dark:text-slate-300">{editingUser.name} ({editingUser.username})</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Assign Role</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs dark:bg-slate-800 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="Admin">Admin</option>
                  <option value="Purchase Manager">Purchase Manager</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Inspector">Inspector</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  Update Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
