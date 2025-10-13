import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import BuyerRegister from './components/BuyerRegister';
import Home from './pages/Home';
import Unauthorized from './pages/Unauthorized';
import AccountSettings from './pages/AccountSettings';
import BuybackApplication from './pages/BuybackApplication';
import MyApplications from './pages/MyApplications';
import SalesRequest from './pages/SalesRequest';
import MyOrders from './pages/MyOrders';
import Rating from './pages/Rating';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Ledger from './pages/Ledger';
import Dashboard from './pages/Dashboard';
import SalesAnalytics from './pages/SalesAnalytics';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Register />
      } />
      
      <Route path="/register/buyer" element={
        isAuthenticated ? <Navigate to="/" replace /> : <BuyerRegister />
      } />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Home />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/account-settings" element={
        <PrivateRoute>
          <Layout>
            <AccountSettings />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/buyback" element={
        <PrivateRoute allowedRoles={['customer']}>
          <Layout>
            <BuybackApplication />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/my-applications" element={
        <PrivateRoute allowedRoles={['customer']}>
          <Layout>
            <MyApplications />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/sales-request" element={
        <PrivateRoute allowedRoles={['overseas_customer']}>
          <Layout>
            <SalesRequest />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/my-orders" element={
        <PrivateRoute allowedRoles={['overseas_customer']}>
          <Layout>
            <MyOrders />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/rating" element={
        <PrivateRoute allowedRoles={['staff', 'admin', 'manager']}>
          <Layout>
            <Rating />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/sales" element={
        <PrivateRoute allowedRoles={['staff', 'admin', 'manager']}>
          <Layout>
            <Sales />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/inventory" element={
        <PrivateRoute allowedRoles={['staff', 'admin', 'manager']}>
          <Layout>
            <Inventory />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/ledger" element={
        <PrivateRoute allowedRoles={['staff', 'admin', 'manager']}>
          <Layout>
            <Ledger />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['manager', 'admin']}>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/sales-analytics" element={
        <PrivateRoute allowedRoles={['staff', 'admin', 'manager']}>
          <Layout>
            <SalesAnalytics />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;