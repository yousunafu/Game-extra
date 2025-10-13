import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { manufacturers } from '../data/gameConsoles';
import './SalesAnalytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SalesAnalytics = () => {
  const [viewMode, setViewMode] = useState('selection'); // 'selection', 'user', 'seller-list', 'seller-detail', 'buyer-list', 'buyer-detail', 'product'
  const [salesData, setSalesData] = useState([]);
  const [buybackData, setBuybackData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // データ読み込み
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const sales = JSON.parse(localStorage.getItem('salesLedger') || '[]');
    const buyback = JSON.parse(localStorage.getItem('allApplications') || '[]');
    
    setSalesData(sales);
    setBuybackData(buyback);
  };

  const handleBack = () => {
    if (viewMode === 'seller-detail') {
      setViewMode('seller-list');
      setSelectedUser(null);
    } else if (viewMode === 'buyer-detail') {
      setViewMode('buyer-list');
      setSelectedUser(null);
    } else if (viewMode === 'seller-list' || viewMode === 'buyer-list') {
      setViewMode('user');
    } else if (viewMode === 'user' || viewMode === 'product') {
      setViewMode('selection');
    }
  };

  // === トップページ（選択画面） ===
  if (viewMode === 'selection') {
    return (
      <div className="analytics-container">
        <h1>📊 販売分析</h1>
        <p className="subtitle">顧客と商品の詳細な分析を行います</p>

        <div className="selection-screen">
          <button 
            className="selection-btn user-btn"
            onClick={() => setViewMode('user')}
          >
            <div className="btn-icon">👥</div>
            <div className="btn-title">ユーザー分析</div>
            <div className="btn-description">セラー・バイヤーの取引傾向を分析</div>
          </button>

          <button 
            className="selection-btn product-btn"
            onClick={() => setViewMode('product')}
          >
            <div className="btn-icon">📦</div>
            <div className="btn-title">商品別分析</div>
            <div className="btn-description">商品ごとの売れ行きと人気度を分析</div>
          </button>
        </div>
      </div>
    );
  }

  // === ユーザー分析（選択画面） ===
  if (viewMode === 'user') {
    const sellerCount = [...new Set(buybackData.map(b => b.customer?.email).filter(Boolean))].length;
    const buyerCount = [...new Set(salesData.map(s => s.customer?.name).filter(Boolean))].length;

    return (
      <div className="analytics-container">
        <div className="analytics-header-nav">
          <button className="back-btn" onClick={handleBack}>← 戻る</button>
          <div>
            <h1>👥 ユーザー分析</h1>
            <p className="subtitle">買取顧客と購入顧客の取引傾向を分析</p>
          </div>
        </div>

        <div className="selection-screen">
          <button 
            className="selection-btn seller-btn"
            onClick={() => setViewMode('seller-list')}
          >
            <div className="btn-icon">📤</div>
            <div className="btn-title">セラー分析</div>
            <div className="btn-description">買取顧客の傾向を分析</div>
            {sellerCount > 0 && <div className="btn-count">{sellerCount}名</div>}
          </button>

          <button 
            className="selection-btn buyer-btn"
            onClick={() => setViewMode('buyer-list')}
          >
            <div className="btn-icon">📥</div>
            <div className="btn-title">バイヤー分析</div>
            <div className="btn-description">購入顧客の傾向を分析</div>
            {buyerCount > 0 && <div className="btn-count">{buyerCount}名</div>}
          </button>
        </div>
      </div>
    );
  }

  // === セラー一覧 ===
  if (viewMode === 'seller-list') {
    return <SellerList 
      buybackData={buybackData}
      onBack={handleBack}
      onSelectSeller={(seller) => {
        setSelectedUser(seller);
        setViewMode('seller-detail');
      }}
    />;
  }

  // === セラー詳細 ===
  if (viewMode === 'seller-detail' && selectedUser) {
    return <SellerDetail 
      seller={selectedUser}
      buybackData={buybackData}
      onBack={handleBack}
    />;
  }

  // === バイヤー一覧 ===
  if (viewMode === 'buyer-list') {
    return <BuyerList 
      salesData={salesData}
      onBack={handleBack}
      onSelectBuyer={(buyer) => {
        setSelectedUser(buyer);
        setViewMode('buyer-detail');
      }}
    />;
  }

  // === バイヤー詳細 ===
  if (viewMode === 'buyer-detail' && selectedUser) {
    return <BuyerDetail 
      buyer={selectedUser}
      salesData={salesData}
      onBack={handleBack}
    />;
  }

  // === 商品別分析 ===
  if (viewMode === 'product') {
    return <ProductAnalysis 
      salesData={salesData}
      buybackData={buybackData}
      onBack={handleBack}
    />;
  }

  return null;
};

// ========================================
// セラー一覧コンポーネント
// ========================================
const SellerList = ({ buybackData, onBack, onSelectSeller }) => {
  // セラーごとに集計
  const getSellerList = () => {
    const sellers = {};
    
    buybackData.forEach(app => {
      if (app.status === 'pending' || app.status === 'rejected') return;
      
      const email = app.customer?.email;
      if (!email) return;
      
      if (!sellers[email]) {
        sellers[email] = {
          email: email,
          name: app.customer.name,
          phone: app.customer.phone,
          address: app.customer.address,
          occupation: app.customer.occupation,
          totalTransactions: 0,
          totalItems: 0,
          totalAmount: 0,
          applications: [],
          firstDate: app.date,
          lastDate: app.date
        };
      }
      
      sellers[email].totalTransactions += 1;
      sellers[email].applications.push(app);
      
      app.items.forEach(item => {
        if (item.estimatedPrice) {
          sellers[email].totalItems += item.quantity;
          sellers[email].totalAmount += item.estimatedPrice * item.quantity;
        }
      });
      
      if (new Date(app.date) < new Date(sellers[email].firstDate)) {
        sellers[email].firstDate = app.date;
      }
      if (new Date(app.date) > new Date(sellers[email].lastDate)) {
        sellers[email].lastDate = app.date;
      }
    });
    
    return Object.values(sellers).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const sellerList = getSellerList();

  return (
    <div className="analytics-container">
      <div className="analytics-header-nav">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <div>
          <h1>📤 セラー一覧</h1>
          <p className="subtitle">買取顧客（{sellerList.length}名）をクリックして詳細を確認</p>
        </div>
      </div>

      {sellerList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📤</div>
          <p>買取顧客データがありません</p>
        </div>
      ) : (
        <div className="user-list">
          {sellerList.map((seller) => {
            const avgAmount = seller.totalTransactions > 0 
              ? Math.round(seller.totalAmount / seller.totalTransactions) 
              : 0;
            
            const daysBetween = Math.floor((new Date(seller.lastDate) - new Date(seller.firstDate)) / (1000 * 60 * 60 * 24));
            const frequency = seller.totalTransactions > 1 
              ? `約${Math.round(daysBetween / (seller.totalTransactions - 1))}日に1回`
              : '初回のみ';

            return (
              <div 
                key={seller.email} 
                className="user-card"
                onClick={() => onSelectSeller(seller)}
              >
                <div className="user-card-header">
                  <div className="user-name">
                    <span className="name-icon">👤</span>
                    <span>{seller.name}</span>
                  </div>
                  <div className="user-badge">
                    {seller.totalTransactions}回買取
                  </div>
                </div>
                
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-label">総買取額</span>
                    <span className="stat-value highlight">¥{seller.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">買取点数</span>
                    <span className="stat-value">{seller.totalItems}点</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">平均買取額</span>
                    <span className="stat-value">¥{avgAmount.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">頻度</span>
                    <span className="stat-value">{frequency}</span>
                  </div>
                </div>
                
                <div className="user-card-footer">
                  <span>初回: {new Date(seller.firstDate).toLocaleDateString('ja-JP')}</span>
                  <span>最終: {new Date(seller.lastDate).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ========================================
// セラー詳細コンポーネント
// ========================================
const SellerDetail = ({ seller, buybackData, onBack }) => {
  // この顧客の取引データ
  const transactions = seller.applications.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 商品別集計
  const productStats = {};
  const consoleStats = {};
  const rankStats = { S: 0, A: 0, B: 0, C: 0 };
  
  transactions.forEach(app => {
    app.items.forEach(item => {
      const productKey = `${item.manufacturerLabel || item.manufacturer} ${item.consoleLabel || item.console}`;
      
      if (!productStats[productKey]) {
        productStats[productKey] = {
          name: productKey,
          quantity: 0,
          amount: 0,
          count: 0
        };
      }
      
      productStats[productKey].quantity += item.quantity;
      productStats[productKey].amount += (item.estimatedPrice || 0) * item.quantity;
      productStats[productKey].count += 1;
      
      // 機種別集計（メーカーではなく商品名で）
      const consoleName = item.consoleLabel || item.console;
      consoleStats[consoleName] = (consoleStats[consoleName] || 0) + item.quantity;
      
      if (item.assessedRank) {
        rankStats[item.assessedRank] = (rankStats[item.assessedRank] || 0) + item.quantity;
      }
    });
  });
  
  const topProducts = Object.values(productStats).sort((a, b) => b.amount - a.amount).slice(0, 5);
  
  // グラフ: 商品別買取額
  const productChartData = {
    labels: topProducts.map(p => p.name),
    datasets: [{
      label: '買取額',
      data: topProducts.map(p => p.amount),
      backgroundColor: 'rgba(231, 76, 60, 0.7)',
      borderColor: 'rgba(231, 76, 60, 1)',
      borderWidth: 1
    }]
  };
  
  // グラフ: 商品別数量（TOP5）
  const topConsoles = Object.entries(consoleStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  const consoleChartData = {
    labels: topConsoles.map(c => c[0]),
    datasets: [{
      data: topConsoles.map(c => c[1]),
      backgroundColor: [
        'rgba(52, 152, 219, 0.7)',
        'rgba(231, 76, 60, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(39, 174, 96, 0.7)',
        'rgba(155, 89, 182, 0.7)',
      ]
    }]
  };
  
  // グラフ: 時系列推移
  const timeSeriesData = transactions.reverse().map(app => ({
    date: new Date(app.date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    amount: app.items.reduce((sum, item) => sum + (item.estimatedPrice || 0) * item.quantity, 0)
  }));
  
  const timeSeriesChartData = {
    labels: timeSeriesData.map(d => d.date),
    datasets: [{
      label: '買取額',
      data: timeSeriesData.map(d => d.amount),
      borderColor: 'rgba(231, 76, 60, 1)',
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      tension: 0.3,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: { size: 11 },
          padding: 8
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return '¥' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 }
        }
      },
      y: {
        ticks: {
          font: { size: 10 },
          callback: function(value) {
            return '¥' + value.toLocaleString();
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          font: { size: 10 },
          padding: 6
        }
      }
    }
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header-nav">
        <button className="back-btn" onClick={onBack}>← 一覧に戻る</button>
        <div>
          <h1>👤 {seller.name} さんの取引詳細</h1>
          <p className="subtitle">買取履歴と傾向分析</p>
        </div>
      </div>

      {/* 顧客情報カード */}
      <div className="detail-card">
        <h2>📋 基本情報</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">氏名</span>
            <span className="info-value">{seller.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">メールアドレス</span>
            <span className="info-value">{seller.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">電話番号</span>
            <span className="info-value">{seller.phone || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">職業</span>
            <span className="info-value">{seller.occupation || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">住所</span>
            <span className="info-value">{seller.address || '-'}</span>
          </div>
        </div>
      </div>

      {/* サマリーKPI */}
      <div className="kpi-cards-compact">
        <div className="kpi-card-small">
          <div className="kpi-label-small">買取回数</div>
          <div className="kpi-value-small">{seller.totalTransactions}回</div>
        </div>
        <div className="kpi-card-small">
          <div className="kpi-label-small">総買取額</div>
          <div className="kpi-value-small highlight">¥{seller.totalAmount.toLocaleString()}</div>
        </div>
        <div className="kpi-card-small">
          <div className="kpi-label-small">買取点数</div>
          <div className="kpi-value-small">{seller.totalItems}点</div>
        </div>
        <div className="kpi-card-small">
          <div className="kpi-label-small">平均買取額</div>
          <div className="kpi-value-small">¥{Math.round(seller.totalAmount / seller.totalTransactions).toLocaleString()}</div>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid-layout-3col">
        <div className="chart-section-small">
          <h3>📊 商品別買取額 TOP5</h3>
          <div className="chart-container-small">
            <Bar data={productChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-section-small">
          <h3>🎮 商品別数量 TOP5</h3>
          <div className="chart-container-small">
            <Doughnut data={consoleChartData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-section-small">
          <h3>📈 買取額の推移</h3>
          <div className="chart-container-small">
            <Line data={timeSeriesChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* ランク傾向 */}
      <div className="detail-card">
        <h2>⭐ ランク別傾向</h2>
        <div className="rank-stats">
          {Object.entries(rankStats).filter(([_, count]) => count > 0).map(([rank, count]) => (
            <div key={rank} className="rank-stat-item">
              <span className={`rank-badge rank-${rank.toLowerCase()}`}>{rank}ランク</span>
              <span className="rank-count">{count}点</span>
              <span className="rank-percentage">
                ({Math.round((count / seller.totalItems) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 取引履歴 */}
      <div className="detail-card">
        <h2>📜 取引履歴（全{transactions.length}件）</h2>
        <div className="transaction-list">
          {transactions.reverse().map((app, index) => {
            const totalAmount = app.items.reduce((sum, item) => 
              sum + (item.estimatedPrice || 0) * item.quantity, 0
            );
            
            return (
              <div key={app.applicationNumber} className="transaction-item">
                <div className="transaction-header">
                  <div className="transaction-number">
                    #{transactions.length - index} - {app.applicationNumber}
                  </div>
                  <div>
                    <div className="transaction-date">
                      {new Date(app.date).toLocaleDateString('ja-JP')}
                    </div>
                    {app.assessedBy && (
                      <div className="transaction-staff">
                        担当: {app.assessedBy}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="transaction-items">
                  {app.items.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <span className={`rank-badge rank-${item.assessedRank?.toLowerCase() || 'b'}`}>
                        {item.assessedRank || '-'}
                      </span>
                      <span className="item-name">
                        {item.manufacturerLabel || item.manufacturer} {item.consoleLabel || item.console}
                        {item.color && ` (${item.color})`}
                      </span>
                      <span className="item-quantity">×{item.quantity}</span>
                      <span className="item-price">¥{((item.estimatedPrice || 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="transaction-total">
                  <span>合計</span>
                  <span className="total-amount">¥{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ========================================
// バイヤー一覧コンポーネント
// ========================================
const BuyerList = ({ salesData, onBack, onSelectBuyer }) => {
  // バイヤーごとに集計
  const getBuyerList = () => {
    const buyers = {};
    
    salesData.forEach(record => {
      const name = record.customer.name;
      
      if (!buyers[name]) {
        buyers[name] = {
          name: name,
          email: record.customer.email,
          country: record.customer.country || 'N/A',
          totalTransactions: 0,
          totalSales: 0,
          totalProfit: 0,
          totalItems: 0,
          records: [],
          firstDate: record.soldDate,
          lastDate: record.soldDate
        };
      }
      
      buyers[name].totalTransactions += 1;
      buyers[name].totalSales += record.summary.totalSalesAmount;
      buyers[name].totalProfit += record.summary.totalProfit;
      buyers[name].totalItems += record.items.reduce((sum, item) => sum + item.quantity, 0);
      buyers[name].records.push(record);
      
      if (new Date(record.soldDate) < new Date(buyers[name].firstDate)) {
        buyers[name].firstDate = record.soldDate;
      }
      if (new Date(record.soldDate) > new Date(buyers[name].lastDate)) {
        buyers[name].lastDate = record.soldDate;
      }
    });
    
    return Object.values(buyers).sort((a, b) => b.totalProfit - a.totalProfit);
  };

  const buyerList = getBuyerList();

  return (
    <div className="analytics-container">
      <div className="analytics-header-nav">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <div>
          <h1>📥 バイヤー一覧</h1>
          <p className="subtitle">購入顧客（{buyerList.length}社）をクリックして詳細を確認</p>
        </div>
      </div>

      {buyerList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📥</div>
          <p>購入顧客データがありません</p>
        </div>
      ) : (
        <div className="user-list">
          {buyerList.map((buyer) => {
            const profitRate = buyer.totalSales > 0 
              ? ((buyer.totalProfit / buyer.totalSales) * 100).toFixed(1) 
              : 0;
            
            const daysBetween = Math.floor((new Date(buyer.lastDate) - new Date(buyer.firstDate)) / (1000 * 60 * 60 * 24));
            const frequency = buyer.totalTransactions > 1 
              ? `約${Math.round(daysBetween / (buyer.totalTransactions - 1))}日に1回`
              : '初回のみ';

            return (
              <div 
                key={buyer.name} 
                className="user-card buyer-card"
                onClick={() => onSelectBuyer(buyer)}
              >
                <div className="user-card-header">
                  <div className="user-name">
                    <span className="name-icon">🏢</span>
                    <span>{buyer.name}</span>
                  </div>
                  <div className="user-badge buyer-badge">
                    {buyer.totalTransactions}回購入
                  </div>
                </div>
                
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-label">総購入額</span>
                    <span className="stat-value highlight">¥{buyer.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">総利益</span>
                    <span className="stat-value profit">¥{buyer.totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">利益率</span>
                    <span className="stat-value">{profitRate}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">購入頻度</span>
                    <span className="stat-value">{frequency}</span>
                  </div>
                </div>
                
                <div className="user-card-footer">
                  <span>🌍 {buyer.country}</span>
                  <span>初回: {new Date(buyer.firstDate).toLocaleDateString('ja-JP')}</span>
                  <span>最終: {new Date(buyer.lastDate).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ========================================
// バイヤー詳細コンポーネント
// ========================================
const BuyerDetail = ({ buyer, salesData, onBack }) => {
  const transactions = buyer.records.sort((a, b) => new Date(b.soldDate) - new Date(a.soldDate));
  
  // 商品別集計
  const productStats = {};
  const consoleStats = {};
  const rankStats = { S: 0, A: 0, B: 0, C: 0 };
  
  transactions.forEach(record => {
    record.items.forEach(item => {
      const productKey = item.product;
      
      if (!productStats[productKey]) {
        productStats[productKey] = {
          name: productKey,
          quantity: 0,
          sales: 0,
          profit: 0,
          count: 0
        };
      }
      
      productStats[productKey].quantity += item.quantity;
      productStats[productKey].sales += item.totalSalesAmount;
      productStats[productKey].profit += item.totalProfit;
      productStats[productKey].count += 1;
      
      // 商品名を取得（具体的な機種名）
      const consoleName = item.product;
      consoleStats[consoleName] = (consoleStats[consoleName] || 0) + item.quantity;
      
      rankStats[item.rank] = (rankStats[item.rank] || 0) + item.quantity;
    });
  });
  
  const topProducts = Object.values(productStats).sort((a, b) => b.profit - a.profit).slice(0, 5);
  
  // グラフ: 商品別利益
  const productChartData = {
    labels: topProducts.map(p => p.name),
    datasets: [{
      label: '利益額',
      data: topProducts.map(p => p.profit),
      backgroundColor: 'rgba(39, 174, 96, 0.7)',
      borderColor: 'rgba(39, 174, 96, 1)',
      borderWidth: 1
    }]
  };
  
  // グラフ: 商品別数量（TOP5）
  const topConsoles = Object.entries(consoleStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  const consoleChartData = {
    labels: topConsoles.map(c => c[0]),
    datasets: [{
      data: topConsoles.map(c => c[1]),
      backgroundColor: [
        'rgba(52, 152, 219, 0.7)',
        'rgba(231, 76, 60, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(39, 174, 96, 0.7)',
        'rgba(155, 89, 182, 0.7)',
      ]
    }]
  };
  
  // グラフ: 時系列推移
  const timeSeriesData = transactions.reverse().map(record => ({
    date: new Date(record.soldDate).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    sales: record.summary.totalSalesAmount,
    profit: record.summary.totalProfit
  }));
  
  const timeSeriesChartData = {
    labels: timeSeriesData.map(d => d.date),
    datasets: [
      {
        label: '販売額',
        data: timeSeriesData.map(d => d.sales),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.3
      },
      {
        label: '利益額',
        data: timeSeriesData.map(d => d.profit),
        borderColor: 'rgba(39, 174, 96, 1)',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: { size: 11 },
          padding: 8
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ¥' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 }
        }
      },
      y: {
        ticks: {
          font: { size: 10 },
          callback: function(value) {
            return '¥' + value.toLocaleString();
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          font: { size: 10 },
          padding: 6
        }
      }
    }
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header-nav">
        <button className="back-btn" onClick={onBack}>← 一覧に戻る</button>
        <div>
          <h1>🏢 {buyer.name} の取引詳細</h1>
          <p className="subtitle">購入履歴と収益分析</p>
        </div>
      </div>

      {/* 顧客情報カード */}
      <div className="detail-card">
        <h2>📋 基本情報</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">会社名</span>
            <span className="info-value">{buyer.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">メールアドレス</span>
            <span className="info-value">{buyer.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">国</span>
            <span className="info-value">🌍 {buyer.country}</span>
          </div>
        </div>
      </div>

      {/* サマリーKPI */}
      <div className="kpi-cards-compact">
        <div className="kpi-card-small">
          <div className="kpi-label-small">購入回数</div>
          <div className="kpi-value-small">{buyer.totalTransactions}回</div>
        </div>
        <div className="kpi-card-small">
          <div className="kpi-label-small">総購入額</div>
          <div className="kpi-value-small highlight">¥{buyer.totalSales.toLocaleString()}</div>
        </div>
        <div className="kpi-card-small">
          <div className="kpi-label-small">総利益</div>
          <div className="kpi-value-small profit">¥{buyer.totalProfit.toLocaleString()}</div>
        </div>
        <div className="kpi-card-small">
          <div className="kpi-label-small">利益率</div>
          <div className="kpi-value-small">
            {((buyer.totalProfit / buyer.totalSales) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid-layout-3col">
        <div className="chart-section-small">
          <h3>💰 商品別利益 TOP5</h3>
          <div className="chart-container-small">
            <Bar data={productChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-section-small">
          <h3>🎮 購入商品別数量 TOP5</h3>
          <div className="chart-container-small">
            <Doughnut data={consoleChartData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-section-small">
          <h3>📈 販売額・利益の推移</h3>
          <div className="chart-container-small">
            <Line data={timeSeriesChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* ランク傾向 */}
      <div className="detail-card">
        <h2>⭐ 好みランク傾向</h2>
        <div className="rank-stats">
          {Object.entries(rankStats).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).map(([rank, count]) => (
            <div key={rank} className="rank-stat-item">
              <span className={`rank-badge rank-${rank.toLowerCase()}`}>{rank}ランク</span>
              <span className="rank-count">{count}点</span>
              <span className="rank-percentage">
                ({Math.round((count / buyer.totalItems) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 取引履歴 */}
      <div className="detail-card">
        <h2>📜 取引履歴（全{transactions.length}件）</h2>
        <div className="transaction-list">
          {transactions.reverse().map((record, index) => (
            <div key={record.id} className="transaction-item">
              <div className="transaction-header">
                <div className="transaction-number">
                  #{transactions.length - index} - {record.requestNumber}
                </div>
                <div>
                  <div className="transaction-date">
                    {new Date(record.soldDate).toLocaleDateString('ja-JP')}
                  </div>
                  {record.salesStaffName && (
                    <div className="transaction-staff">
                      担当: {record.salesStaffName.split('（')[0]}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="transaction-items">
                {record.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span className={`rank-badge rank-${item.rank.toLowerCase()}`}>
                      {item.rank}
                    </span>
                    <span className="item-name">{item.product}</span>
                    <span className="item-quantity">×{item.quantity}</span>
                    <span className="item-price">¥{item.totalSalesAmount.toLocaleString()}</span>
                    <span className="item-profit">
                      利益: ¥{item.totalProfit.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="transaction-total">
                <div>
                  <span>販売額: ¥{record.summary.totalSalesAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="profit-text">利益: ¥{record.summary.totalProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================
// 商品別分析コンポーネント（簡易版）
// ========================================
const ProductAnalysis = ({ salesData, buybackData, onBack }) => {
  // 商品統計
  const getProductStats = () => {
    const stats = {};
    
    salesData.forEach(record => {
      record.items.forEach(item => {
        const key = `${item.product}_${item.rank}`;
        if (!stats[key]) {
          stats[key] = {
            product: item.product,
            rank: item.rank,
            totalSold: 0,
            totalSales: 0,
            totalProfit: 0
          };
        }
        
        stats[key].totalSold += item.quantity;
        stats[key].totalSales += item.totalSalesAmount;
        stats[key].totalProfit += item.totalProfit;
      });
    });
    
    return Object.values(stats);
  };

  const productStats = getProductStats();
  const topProducts = productStats.sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 20);

  return (
    <div className="analytics-container">
      <div className="analytics-header-nav">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <div>
          <h1>📦 商品別分析</h1>
          <p className="subtitle">商品ごとの売れ行きと利益分析</p>
        </div>
      </div>

      {topProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>商品データがありません</p>
        </div>
      ) : (
        <div className="detail-section">
          <h2>🏆 商品別利益ランキング TOP20</h2>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>順位</th>
                  <th>商品名</th>
                  <th>ランク</th>
                  <th>販売数</th>
                  <th>販売額</th>
                  <th>利益額</th>
                  <th>利益率</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => {
                  const profitRate = product.totalSales > 0 
                    ? ((product.totalProfit / product.totalSales) * 100).toFixed(1) 
                    : 0;
                  
                  return (
                    <tr key={idx}>
                      <td className="rank-number">{idx + 1}</td>
                      <td className="product-name">{product.product}</td>
                      <td>
                        <span className={`rank-badge rank-${product.rank.toLowerCase()}`}>
                          {product.rank}
                        </span>
                      </td>
                      <td>{product.totalSold}台</td>
                      <td className="amount-cell">¥{product.totalSales.toLocaleString()}</td>
                      <td className="amount-cell profit">¥{product.totalProfit.toLocaleString()}</td>
                      <td className="rate-cell">{profitRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesAnalytics;
