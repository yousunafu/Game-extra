import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [selectedCustomers, setSelectedCustomers] = useState(['tokyo-games', 'global-gaming']);

  const kpiData = {
    totalSales: 12450000,
    totalPurchases: 8750000,
    grossProfit: 3700000,
    transactions: 245,
    salesChange: 15.3,
    purchaseChange: 12.1,
    profitChange: 22.8,
    transactionChange: -3.2
  };

  const salesTrendData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    datasets: [
      {
        label: '売上',
        data: [980000, 1050000, 1200000, 950000, 1100000, 1250000, 1080000, 990000, 1150000, 1300000, 1180000, 1220000],
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        tension: 0.1
      },
      {
        label: '買取',
        data: [680000, 750000, 820000, 650000, 780000, 850000, 720000, 690000, 800000, 880000, 810000, 820000],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.1
      }
    ]
  };

  const productSalesData = {
    labels: ['PlayStation 5', 'Nintendo Switch', 'PlayStation 4 Pro', 'Xbox Series X', 'Switch Lite', 'Switch OLED'],
    datasets: [{
      data: [35, 28, 15, 12, 6, 4],
      backgroundColor: [
        '#3498db',
        '#e74c3c',
        '#f39c12',
        '#27ae60',
        '#9b59b6',
        '#1abc9c'
      ]
    }]
  };

  const handleUpdateDashboard = () => {
    alert('ダッシュボードを更新しました');
  };

  const handleExportReport = (format) => {
    const formatName = format === 'pdf' ? 'PDF' : 'Excel';
    alert(`${formatName}レポートを生成しています...`);
  };

  const handleCustomerToggle = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>経営ダッシュボード</h1>
        <p className="subtitle">売買データの分析と可視化</p>
        
        <div className="date-filter">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="month">月別</option>
            <option value="quarter">四半期</option>
            <option value="year">年別</option>
            <option value="custom">期間指定</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span>〜</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button onClick={handleUpdateDashboard}>更新</button>
        </div>
      </div>
      
      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-icon sales">💰</div>
          <div className="kpi-value">¥{kpiData.totalSales.toLocaleString()}</div>
          <div className="kpi-label">総売上高</div>
          <div className={`kpi-change ${kpiData.salesChange > 0 ? 'positive' : 'negative'}`}>
            <span>{kpiData.salesChange > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(kpiData.salesChange)}% (前年同期比)</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon purchase">📦</div>
          <div className="kpi-value">¥{kpiData.totalPurchases.toLocaleString()}</div>
          <div className="kpi-label">総買取額</div>
          <div className={`kpi-change ${kpiData.purchaseChange > 0 ? 'positive' : 'negative'}`}>
            <span>{kpiData.purchaseChange > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(kpiData.purchaseChange)}% (前年同期比)</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon profit">📈</div>
          <div className="kpi-value">¥{kpiData.grossProfit.toLocaleString()}</div>
          <div className="kpi-label">粗利益</div>
          <div className={`kpi-change ${kpiData.profitChange > 0 ? 'positive' : 'negative'}`}>
            <span>{kpiData.profitChange > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(kpiData.profitChange)}% (前年同期比)</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon customers">🏢</div>
          <div className="kpi-value">{kpiData.transactions}</div>
          <div className="kpi-label">取引件数</div>
          <div className={`kpi-change ${kpiData.transactionChange > 0 ? 'positive' : 'negative'}`}>
            <span>{kpiData.transactionChange > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(kpiData.transactionChange)}% (前年同期比)</span>
          </div>
        </div>
      </div>
      
      <div className="grid-layout">
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">売上・買取推移</h2>
          </div>
          <div className="chart-container">
            <Line 
              data={salesTrendData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">商品別売上構成</h2>
          </div>
          <div className="chart-container">
            <Pie 
              data={productSalesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">顧客別・ランク別売上比較</h2>
        </div>
        
        <div className="customer-selector">
          <h3>顧客選択（複数選択可）</h3>
          <div className="checkbox-group">
            <label>
              <input 
                type="checkbox" 
                checked={selectedCustomers.includes('tokyo-games')}
                onChange={() => handleCustomerToggle('tokyo-games')}
              /> 
              Tokyo Games Inc.
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedCustomers.includes('global-gaming')}
                onChange={() => handleCustomerToggle('global-gaming')}
              /> 
              Global Gaming Ltd.
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedCustomers.includes('ny-collectors')}
                onChange={() => handleCustomerToggle('ny-collectors')}
              /> 
              NY Game Collectors
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedCustomers.includes('london-vintage')}
                onChange={() => handleCustomerToggle('london-vintage')}
              /> 
              London Vintage Games
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={selectedCustomers.includes('osaka-retro')}
                onChange={() => handleCustomerToggle('osaka-retro')}
              /> 
              Osaka Retro Store
            </label>
          </div>
        </div>
        
        <div className="chart-container">
          <Bar 
            data={{
              labels: ['Sランク', 'Aランク', 'Bランク', 'Cランク'],
              datasets: [
                {
                  label: 'Tokyo Games Inc.',
                  data: [450000, 380000, 220000, 150000],
                  backgroundColor: '#3498db'
                },
                {
                  label: 'Global Gaming Ltd.',
                  data: [520000, 420000, 180000, 100000],
                  backgroundColor: '#e74c3c'
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' }
              }
            }}
          />
        </div>
      </div>
      
      <div className="export-section">
        <h2>レポート出力</h2>
        <p>ダッシュボードのデータをレポート形式で出力できます</p>
        <div className="export-buttons">
          <button onClick={() => handleExportReport('pdf')}>PDFレポート</button>
          <button onClick={() => handleExportReport('excel')}>Excel出力</button>
          <button className="secondary">定期レポート設定</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;