import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Loader from './components/ui/Loader';

// Pages Import
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import PurchaseOrders from './pages/PurchaseOrders';
import Challans from './pages/Challans';
import GRR from './pages/GRR';
import QualityInspection from './pages/QualityInspection';
import MIR from './pages/MIR';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import Documents from './pages/Documents';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Search from './pages/Search';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader size="large" className="min-h-screen flex items-center justify-center dark:bg-slate-950" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Core Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendors" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Purchase Manager', 'Viewer']}>
                  <Vendors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchase-orders" 
              element={
                <ProtectedRoute>
                  <PurchaseOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/challans" 
              element={
                <ProtectedRoute>
                  <Challans />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/grr" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Store Manager', 'Viewer']}>
                  <GRR />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quality-inspections" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Inspector', 'Viewer']}>
                  <QualityInspection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mir" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Store Manager', 'Viewer']}>
                  <MIR />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Store Manager', 'Viewer']}>
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Purchase Manager', 'Viewer']}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
