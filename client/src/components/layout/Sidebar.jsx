import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  PackageCheck,
  ClipboardCheck,
  PackageOpen,
  Boxes,
  History,
  FileCheck,
  FolderOpen,
  Settings,
  ShieldCheck,
  LogOut,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Purchase Manager', 'Store Manager', 'Inspector', 'Vendor', 'Viewer'] },
    { name: 'Vendors', path: '/vendors', icon: Users, roles: ['Admin', 'Purchase Manager', 'Viewer'] },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: FileSpreadsheet, roles: ['Admin', 'Purchase Manager', 'Store Manager', 'Vendor', 'Viewer'] },
    { name: 'Challans & Deliveries', path: '/challans', icon: PackageCheck, roles: ['Admin', 'Purchase Manager', 'Store Manager', 'Vendor', 'Viewer'] },
    { name: 'Goods Receipt (GRR)', path: '/grr', icon: ClipboardCheck, roles: ['Admin', 'Store Manager', 'Viewer'] },
    { name: 'Quality Inspection', path: '/quality-inspections', icon: FileCheck, roles: ['Admin', 'Inspector', 'Viewer'] },
    { name: 'Material Issue (MIR)', path: '/mir', icon: PackageOpen, roles: ['Admin', 'Store Manager', 'Viewer'] },
    { name: 'Inventory Live', path: '/inventory', icon: Boxes, roles: ['Admin', 'Store Manager', 'Viewer'] },
    { name: 'SCM Analytics', path: '/analytics', icon: TrendingUp, roles: ['Admin', 'Purchase Manager', 'Viewer'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: History, roles: ['Admin'] },
    { name: 'Document Center', path: '/documents', icon: FolderOpen, roles: ['Admin', 'Purchase Manager', 'Store Manager', 'Inspector', 'Vendor', 'Viewer'] },
    { name: 'User Access Control', path: '/users', icon: ShieldCheck, roles: ['Admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin', 'Purchase Manager', 'Store Manager', 'Inspector', 'Vendor', 'Viewer'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col fixed inset-y-0 left-0 z-20 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">T</div>
          <span className="font-bold text-lg tracking-wider text-white">TATA SUPPLY</span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
