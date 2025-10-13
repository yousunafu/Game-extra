import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { insertMockAnalyticsData } from '../utils/insertMockAnalyticsData';
import './Home.css';

const Home = () => {
  const { user, isCustomer, isOverseasCustomer, isStaff, isManager } = useAuth();

  const handleInsertMockData = () => {
    const confirmed = window.confirm('販売分析用のモックデータを投入しますか？\n\n既存のsalesLedgerとallApplicationsが上書きされます。');
    if (confirmed) {
      const result = insertMockAnalyticsData();
      if (result.success) {
        alert(`✅ モックデータを投入しました！\n\n📊 販売記録: ${result.salesCount}件\n📤 買取申込: ${result.applicationsCount}件\n\n「販売分析」メニューから確認できます。`);
      }
    }
  };

  return (
    <div className="home-container">
      <h1>
        {isOverseasCustomer 
          ? `Welcome, ${user?.name}` 
          : `ようこそ、${user?.name}さん`
        }
      </h1>
      
      {isCustomer && (
        <div className="welcome-section">
          <h2>お客様メニュー</h2>
          <div className="menu-grid">
            <Link to="/buyback" className="menu-card">
              <div className="menu-icon">📦</div>
              <h3>買取申込</h3>
              <p>お持ちのゲーム機を簡単に買取申込</p>
            </Link>
            <Link to="/my-applications" className="menu-card">
              <div className="menu-icon">📋</div>
              <h3>申込履歴</h3>
              <p>過去の申込状況を確認</p>
            </Link>
          </div>
        </div>
      )}

      {isOverseasCustomer && (
        <div className="welcome-section">
          <h2>Customer Menu</h2>
          <div className="menu-grid">
            <Link to="/sales-request" className="menu-card overseas">
              <div className="menu-icon">🛒</div>
              <h3>Product Request</h3>
              <p>Request game consoles and software</p>
            </Link>
            <Link to="/my-orders" className="menu-card overseas">
              <div className="menu-icon">📋</div>
              <h3>Order History</h3>
              <p>Check your order status</p>
            </Link>
          </div>
        </div>
      )}

      {isStaff && (
        <div className="welcome-section">
          <h2>業務メニュー</h2>
          <div className="menu-grid">
            <Link to="/rating" className="menu-card">
              <div className="menu-icon">💰</div>
              <h3>買取査定</h3>
              <p>申込商品の査定を行う</p>
            </Link>
            <Link to="/sales" className="menu-card">
              <div className="menu-icon">🛒</div>
              <h3>販売管理</h3>
              <p>商品の販売処理を管理</p>
            </Link>
            <Link to="/inventory" className="menu-card">
              <div className="menu-icon">📊</div>
              <h3>在庫管理</h3>
              <p>在庫状況を確認・管理</p>
            </Link>
            <Link to="/ledger" className="menu-card">
              <div className="menu-icon">📚</div>
              <h3>古物台帳</h3>
              <p>取引記録の管理</p>
            </Link>
          </div>
        </div>
      )}

      {isManager && (
        <div className="welcome-section">
          <h2>管理メニュー</h2>
          <div className="menu-grid">
            <Link to="/dashboard" className="menu-card special">
              <div className="menu-icon">📈</div>
              <h3>経営ダッシュボード</h3>
              <p>売上分析・経営指標の確認</p>
            </Link>
            <Link to="/sales-analytics" className="menu-card special">
              <div className="menu-icon">📊</div>
              <h3>販売分析</h3>
              <p>顧客・商品の詳細分析</p>
            </Link>
          </div>
        </div>
      )}

      {(isManager || isStaff) && (
        <div className="welcome-section" style={{ marginTop: '30px', borderTop: '2px dashed #e0e0e0', paddingTop: '30px' }}>
          <h2>🧪 開発者ツール</h2>
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleInsertMockData}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                backgroundColor: '#9b59b6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(155, 89, 182, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#8e44ad'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#9b59b6'}
            >
              📊 販売分析用モックデータを投入
            </button>
            <p style={{ marginTop: '10px', color: '#7f8c8d', fontSize: '14px' }}>
              販売分析機能のデモ用に、サンプルデータを投入します
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;