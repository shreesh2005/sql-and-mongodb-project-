import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area Container */}
      <div className="pl-64 min-h-screen flex flex-col">
        {/* Top Header Panel */}
        <Header />

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 p-6 pt-22 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
