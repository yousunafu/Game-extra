import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout, isCustomer, isOverseasCustomer, isStaff, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingEstimatesCount, setPendingEstimatesCount] = useState(0);
  const [pendingSalesCount, setPendingSalesCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // お客様の場合、承認待ちの見積もりをカウント
  // スタッフの場合、進行中の取引をカウント
  // 海外顧客の場合、見積もり受領済みをカウント
  useEffect(() => {
    if (isCustomer && user?.email) {
      const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
      const myPendingApps = allApplications.filter(
        app => app.customer.email === user.email && app.status === 'awaiting_approval'
      );
      setPendingEstimatesCount(myPendingApps.length);
    } else if (isOverseasCustomer && user?.email) {
      const salesRequests = JSON.parse(localStorage.getItem('salesRequests') || '[]');
      const myQuotedRequests = salesRequests.filter(
        req => req.customer.email === user.email && req.status === 'quoted'
      );
      setPendingEstimatesCount(myQuotedRequests.length);
    } else if (isStaff) {
      const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
      // 進行中の取引（in_inventory以外）をカウント
      const ongoingApps = allApplications.filter(app => app.status !== 'in_inventory');
      setPendingEstimatesCount(ongoingApps.length);
      
      // 販売リクエストの見積もり待ちをカウント
      const salesRequests = JSON.parse(localStorage.getItem('salesRequests') || '[]');
      const pendingSales = salesRequests.filter(req => req.status === 'pending');
      setPendingSalesCount(pendingSales.length);
    }
  }, [isCustomer, isOverseasCustomer, isStaff, user?.email, location.pathname]); // location変更時も更新

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              {isOverseasCustomer ? '🎮 Game Trading System' : '🎮 ゲーム買取システム'}
            </Link>
          </div>
          
          <nav className="nav-menu">
            {isCustomer && (
              <>
                <Link to="/buyback" className={isActive('/buyback') ? 'active' : ''}>
                  買取申込
                </Link>
                <Link to="/my-applications" className={`nav-link-with-badge ${isActive('/my-applications') ? 'active' : ''}`}>
                  申込履歴
                  {pendingEstimatesCount > 0 && (
                    <span className="notification-badge">{pendingEstimatesCount}</span>
                  )}
                </Link>
              </>
            )}

            {isOverseasCustomer && (
              <>
                <Link to="/sales-request" className={isActive('/sales-request') ? 'active' : ''}>
                  Product Request
                </Link>
                <Link to="/my-orders" className={`nav-link-with-badge ${isActive('/my-orders') ? 'active' : ''}`}>
                  Order History
                  {pendingEstimatesCount > 0 && (
                    <span className="notification-badge">{pendingEstimatesCount}</span>
                  )}
                </Link>
              </>
            )}
            
            {isStaff && (
              <>
                <Link to="/rating" className={`nav-link-with-badge ${isActive('/rating') ? 'active' : ''}`}>
                  買取査定
                  {pendingEstimatesCount > 0 && (
                    <span className="notification-badge">{pendingEstimatesCount}</span>
                  )}
                </Link>
                <Link to="/sales" className={`nav-link-with-badge ${isActive('/sales') ? 'active' : ''}`}>
                  販売管理
                  {pendingSalesCount > 0 && (
                    <span className="notification-badge">{pendingSalesCount}</span>
                  )}
                </Link>
                <Link to="/inventory" className={isActive('/inventory') ? 'active' : ''}>
                  在庫管理
                </Link>
                <Link to="/ledger" className={isActive('/ledger') ? 'active' : ''}>
                  古物台帳
                </Link>
              </>
            )}
            
            {isManager && (
              <>
                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                  ダッシュボード
                </Link>
                <Link to="/sales-analytics" className={isActive('/sales-analytics') ? 'active' : ''}>
                  販売分析
                </Link>
              </>
            )}
          </nav>
          
          <div className="user-info">
            <Link to="/account-settings" className="user-name-link">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">({getRoleDisplay(user?.role, isOverseasCustomer)})</span>
            </Link>
            <button onClick={handleLogout} className="logout-button">
              {isOverseasCustomer ? 'Logout' : 'ログアウト'}
            </button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="footer">
        <p>
          {isOverseasCustomer 
            ? '© 2024 Game Trading System' 
            : '© 2024 中古ゲーム機買取・在庫管理システム'
          }
        </p>
      </footer>
    </div>
  );
};

const getRoleDisplay = (role, isOverseas) => {
  if (isOverseas) {
    return 'Buyer';
  }
  
  switch(role) {
    case 'customer': return 'お客様';
    case 'overseas_customer': return 'Buyer';
    case 'staff': return 'スタッフ';
    case 'manager': return 'マネージャー';
    case 'admin': return '管理者';
    default: return '';
  }
};

export default Layout;