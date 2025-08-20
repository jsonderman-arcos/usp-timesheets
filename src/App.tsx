import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import UserManagement from './components/Users/UserManagement';
import CrewManagement from './components/Crews/CrewManagement';
import TimesheetDataView from './components/Timesheets/TimesheetDataView';

// Placeholder components for routes not yet implemented

const GPSTracking = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">GPS Tracking</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <p className="text-gray-600">GPS Tracking and mapping will be implemented in Phase 3</p>
    </div>
  </div>
);

const Exceptions = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Exceptions</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <p className="text-gray-600">Exception management will be implemented in Phase 4</p>
    </div>
  </div>
);

const Reports = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <p className="text-gray-600">Reporting and export functionality will be implemented in Phase 4</p>
    </div>
  </div>
);

const Settings = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <p className="text-gray-600">Application settings will be implemented in future phases</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">USP</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="time-entries" element={<TimesheetDataView />} />
        <Route path="crews" element={<CrewManagement />} />
        <Route path="gps-tracking" element={<GPSTracking />} />
        <Route path="exceptions" element={<Exceptions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;