import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { User, Shield, Info, Sun, Moon } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Portal Settings</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage SCM user profile configurations and interface themes.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><User size={16} /> My SCM Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-lg text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-slate-200">{user?.name}</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">Username: {user?.username}</p>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2 dark:border-slate-800">
              <p><span className="font-semibold text-gray-500">Email:</span> {user?.email || '—'}</p>
              <p className="flex items-center gap-1">
                <span className="font-semibold text-gray-500">Access Role:</span> 
                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-slate-800 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                  {user?.role}
                </span>
              </p>
              {user?.vendorCode && (
                <p><span className="font-semibold text-gray-500">Linked Vendor:</span> {user.vendorCode}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Shield size={16} /> System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-slate-200">Interface Display Theme</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">Switch between dark mode and light mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900"
              >
                {darkMode ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} />}
                <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
              </button>
            </div>

            <div className="border-t pt-4 space-y-2 dark:border-slate-800 flex gap-2">
              <Info size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-normal">
                This SCM system utilizes role-based access control. Endpoints and navigation items are restricted depending on your department assignment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
