import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/user/UserDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import RideBooking from './pages/user/RideBooking';
import SnackOrdering from './pages/user/SnackOrdering';
import DriverRides from './pages/driver/DriverRides';
import DriverDeliveries from './pages/driver/DriverDeliveries';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRides from './pages/admin/AdminRides';
import AdminSnacks from './pages/admin/AdminSnacks';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* User Routes */}
            <Route 
              path="/user" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/rides" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <RideBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/snacks" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <SnackOrdering />
                </ProtectedRoute>
              } 
            />
            
            {/* Driver Routes */}
            <Route 
              path="/driver" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/rides" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverRides />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/deliveries" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDeliveries />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/rides" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRides />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/snacks" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSnacks />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;