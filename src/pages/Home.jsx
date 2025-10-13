import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { insertMockAnalyticsData } from '../utils/insertMockAnalyticsData';
import './Home.css';

const Home = () => {
  const { user, isCustomer, isOverseasCustomer, isStaff, isManager } = useAuth();

  const handleResetMockData = () => {
    const confirmed = window.confirm('📊 販売分析用データをリセットしますか？\n\n現在のデータを削除して、初期のモックデータに戻します。\nこの操作は取り消せません。');
    if (confirmed) {
      // データをクリア
      localStorage.removeItem('salesLedger');
      localStorage.removeItem('allApplications');
      
      // モックデータを再投入
      const result = insertMockAnalyticsData();
      if (result.success) {
        alert(`✅ データをリセットしました！\n\n📊 販売記録: ${result.salesCount}件\n📤 買取申込: ${result.applicationsCount}件\n\n初期のモックデータに戻りました。`);
        window.location.reload(); // ページをリロードして反映
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
              onClick={handleResetMockData}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
            >
              🔄 販売分析データをリセット
            </button>
            <p style={{ marginTop: '10px', color: '#7f8c8d', fontSize: '14px' }}>
              販売分析のデータを初期状態に戻します（既存データは削除されます）
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;