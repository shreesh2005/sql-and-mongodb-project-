import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../lib/api';
import { Sun, Moon, Bell, Search, LogOut, Check, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/notifications');
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to fetch notifications.');
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.length;

  return (
    <header className="h-16 border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 fixed top-0 right-0 left-64 z-10 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-96 max-w-lg">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
          <Search size={18} />
        </span>
        <input
          type="search"
          placeholder="Global search (vendors, parts, POs, docs)..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-colors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right Tools */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme Mode"
        >
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 relative transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-30 dark:bg-slate-900 dark:border-slate-800">
              <div className="px-4 py-1.5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40">
                <span className="font-semibold text-xs text-gray-700 dark:text-slate-200">System Alerts</span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400">{unreadCount} Pending</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-slate-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 flex items-start justify-between border-b border-gray-50 dark:border-slate-800 last:border-b-0"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          {notif.type === 'ALERT' || notif.type === 'WARNING' ? (
                            <CircleAlert size={12} className="text-red-500" />
                          ) : null}
                          <p className="text-xs font-semibold truncate text-gray-800 dark:text-slate-200">{notif.title}</p>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-normal mt-0.5">{notif.message}</p>
                      </div>
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-500 dark:hover:bg-slate-800"
                        title="Dismiss Alert"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Bar */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-sm text-blue-600 dark:bg-slate-800 dark:text-blue-400">
            {user?.name.charAt(0)}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300 max-w-[100px] truncate">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
