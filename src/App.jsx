import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import CustomerLogin from './components/CustomerLogin';
import BuyerLogin from './components/BuyerLogin';
import StaffLogin from './components/StaffLogin';
import Register from './components/Register';
import BuyerRegister from './components/BuyerRegister';
import StaffManagement from './pages/StaffManagement';
import ProductManagement from './pages/ProductManagement';
import PricingManagement from './pages/PricingManagement';
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
import UserManagement from './pages/UserManagement';
import ZaicoSyncSettings from './pages/ZaicoSyncSettings';
import ApiKeyChecker from './components/ApiKeyChecker';
import { insertMockAnalyticsData } from './utils/insertMockAnalyticsData';

function AppContent() {
  const { isAuthenticated } = useAuth();

  // 初回起動時にモックデータを自動投入
  useEffect(() => {
    const salesLedger = localStorage.getItem('salesLedger');
    const allApplications = localStorage.getItem('allApplications');
    
    // データが空の場合のみ自動投入
    if (!salesLedger || !allApplications) {
      console.log('📊 初回起動: 販売分析用モックデータを自動投入します...');
      insertMockAnalyticsData();
      console.log('✅ モックデータの投入が完了しました');
    }
  }, []);

  return (
    <ApiKeyChecker>
      <Routes>
      {/* ログイン画面（3つ） */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <CustomerLogin />
      } />
      
      <Route path="/intl/portal/auth" element={
        isAuthenticated ? <Navigate to="/" replace /> : <BuyerLogin />
      } />
      
      <Route path="/sys/staff/auth" element={
        isAuthenticated ? <Navigate to="/" replace /> : <StaffLogin />
      } />
      
      {/* 後方互換のためのリダイレクト */}
      <Route path="/login/customer" element={<Navigate to="/login" replace />} />
      <Route path="/login/buyer" element={<Navigate to="/intl/portal/auth" replace />} />
      <Route path="/login/staff" element={<Navigate to="/sys/staff/auth" replace />} />
      
      {/* 登録画面 */}
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Register />
      } />
      
      <Route path="/intl/portal/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <BuyerRegister />
      } />
      
      {/* 後方互換 */}
      <Route path="/register/buyer" element={<Navigate to="/intl/portal/register" replace />} />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* スタッフ管理画面 */}
      <Route path="/sys/admin/staff-management" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <Layout>
            <StaffManagement />
          </Layout>
        </PrivateRoute>
      } />
      
      {/* 商品マスタ管理画面 */}
      <Route path="/sys/admin/product-management" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <Layout>
            <ProductManagement />
          </Layout>
        </PrivateRoute>
      } />
      
      {/* 価格管理画面 */}
      <Route path="/sys/admin/pricing-management" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <Layout>
            <PricingManagement />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/sys/admin/user-management" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <Layout>
            <UserManagement />
          </Layout>
        </PrivateRoute>
      } />
      
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
      
      <Route path="/settings/zaico-sync" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <Layout>
            <ZaicoSyncSettings />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ApiKeyChecker>
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