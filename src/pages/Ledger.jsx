import React, { useState, useEffect } from 'react';
import './Ledger.css';

const Ledger = () => {
  const [salesRecords, setSalesRecords] = useState([]);
  const [expandedRecord, setExpandedRecord] = useState(null);

  // 販売記録を読み込み
  useEffect(() => {
    const ledger = JSON.parse(localStorage.getItem('salesLedger') || '[]');
    setSalesRecords(ledger);
  }, []);

  const [records] = useState([]);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    transactionType: '',
    productSearch: '',
    skuSearch: '',
    customerSearch: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    alert('検索を実行しました');
  };

  const handleClearSearch = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      transactionType: '',
      productSearch: '',
      skuSearch: '',
      customerSearch: ''
    });
  };

  const handleExportData = () => {
    const format = prompt('エクスポート形式を選択してください:\n1. CSV\n2. Excel\n3. PDF', '1');
    if (format) {
      const formatName = format === '1' ? 'CSV' : format === '2' ? 'Excel' : 'PDF';
      alert(`古物台帳を${formatName}形式でエクスポートしました`);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'sold': return <span className="status-badge status-sold">売却済</span>;
      case 'in-stock': return <span className="status-badge status-in-stock">在庫</span>;
      case 'reserved': return <span className="status-badge status-reserved">予約済</span>;
      default: return null;
    }
  };

  return (
    <div className="ledger-container">
      <h1>個別管理台帳（古物台帳）</h1>
      <p className="subtitle">古物営業法に基づく取引記録の管理</p>

      <div className="law-notice">
        <h3>⚖️ 古物営業法対応</h3>
        <p>この台帳は古物営業法第16条に基づく帳簿として管理されています。必須記載事項：取引年月日、品目、特徴、数量、代価、相手方の住所・氏名・職業・年齢</p>
      </div>

      <div className="search-section">
        <h3>検索条件</h3>
        <div className="search-controls">
          <div className="form-group">
            <label>取引日（開始）</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>取引日（終了）</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>取引種別</label>
            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
            >
              <option value="">全て</option>
              <option value="purchase">買取</option>
              <option value="sale">販売</option>
            </select>
          </div>
          <div className="form-group">
            <label>商品名</label>
            <input
              type="text"
              value={filters.productSearch}
              onChange={(e) => handleFilterChange('productSearch', e.target.value)}
              placeholder="商品名で検索"
            />
          </div>
          <div className="form-group">
            <label>SKU/管理番号</label>
            <input
              type="text"
              value={filters.skuSearch}
              onChange={(e) => handleFilterChange('skuSearch', e.target.value)}
              placeholder="SKUまたは管理番号"
            />
          </div>
          <div className="form-group">
            <label>相手方氏名</label>
            <input
              type="text"
              value={filters.customerSearch}
              onChange={(e) => handleFilterChange('customerSearch', e.target.value)}
              placeholder="氏名で検索"
            />
          </div>
        </div>
        <div className="search-actions">
          <button onClick={handleSearch}>検索</button>
          <button onClick={handleClearSearch} className="secondary">クリア</button>
        </div>
      </div>

      <div className="info-section">
        <div className="info-item">
          <div className="info-label">販売記録件数</div>
          <div className="info-value">{salesRecords.length}</div>
        </div>
        <div className="info-item">
          <div className="info-label">総仕入れ額</div>
          <div className="info-value" style={{ color: '#e74c3c' }}>
            ¥{salesRecords.reduce((sum, r) => sum + r.summary.totalAcquisitionCost, 0).toLocaleString()}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">総販売額</div>
          <div className="info-value" style={{ color: '#3498db' }}>
            ¥{salesRecords.reduce((sum, r) => sum + r.summary.totalSalesAmount, 0).toLocaleString()}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">総利益</div>
          <div className="info-value" style={{ color: '#27ae60' }}>
            ¥{salesRecords.reduce((sum, r) => sum + r.summary.totalProfit, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 販売記録セクション */}
      {salesRecords.length > 0 && (
        <div className="sales-records-section">
          <h2>📊 販売記録（利益計算）</h2>
          <p className="section-subtitle">海外バイヤーへの販売記録と利益を確認できます</p>
          
          {salesRecords.map(record => (
            <div key={record.id} className="sales-record-card">
              <div 
                className="sales-record-header"
                onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
              >
                <div className="record-header-left">
                  <h3>販売記録 {record.id}</h3>
                  <p className="record-date">販売日: {new Date(record.soldDate).toLocaleDateString('ja-JP')}</p>
                  <p className="record-request">リクエスト番号: {record.requestNumber}</p>
                </div>
                <div className="record-header-right">
                  <div className="record-summary">
                    <div className="summary-item">
                      <span className="summary-label">仕入れ:</span>
                      <span className="summary-value cost">¥{record.summary.totalAcquisitionCost.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">販売:</span>
                      <span className="summary-value sales">¥{record.summary.totalSalesAmount.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">利益:</span>
                      <span className="summary-value profit">¥{record.summary.totalProfit.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="expand-icon">{expandedRecord === record.id ? '▼' : '▶'}</span>
                </div>
              </div>

              {expandedRecord === record.id && (
                <div className="sales-record-details">
                  <div className="customer-info">
                    <h4>👤 顧客情報</h4>
                    <p><strong>名前:</strong> {record.customer.name}</p>
                    <p><strong>国:</strong> {record.customer.country || 'N/A'}</p>
                    <p><strong>メール:</strong> {record.customer.email}</p>
                  </div>

                  <div className="items-detail">
                    <h4>📦 販売商品詳細</h4>
                    <table className="sales-detail-table">
                      <thead>
                        <tr>
                          <th>商品名</th>
                          <th>ランク</th>
                          <th>数量</th>
                          <th>仕入れ単価</th>
                          <th>仕入れ合計</th>
                          <th>販売単価</th>
                          <th>販売合計</th>
                          <th>利益/台</th>
                          <th>利益合計</th>
                          <th>仕入れ元</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.product}</td>
                            <td>
                              <span className={`rank-badge rank-${item.rank.toLowerCase()}`}>
                                {item.rank}
                              </span>
                            </td>
                            <td>{item.quantity}台</td>
                            <td>¥{item.acquisitionPrice.toLocaleString()}</td>
                            <td>¥{item.totalAcquisitionCost.toLocaleString()}</td>
                            <td>¥{item.salesPrice.toLocaleString()}</td>
                            <td>¥{item.totalSalesAmount.toLocaleString()}</td>
                            <td className="profit-cell">¥{item.profit.toLocaleString()}</td>
                            <td className="profit-cell">¥{item.totalProfit.toLocaleString()}</td>
                            <td>
                              {item.source.type === 'customer' ? (
                                <span>👤 {item.source.name}</span>
                              ) : (
                                <span>🏢 {item.source.name}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
                          <td colSpan="4">合計</td>
                          <td>¥{record.summary.totalAcquisitionCost.toLocaleString()}</td>
                          <td colSpan="1"></td>
                          <td>¥{record.summary.totalSalesAmount.toLocaleString()}</td>
                          <td colSpan="1"></td>
                          <td className="profit-total">¥{record.summary.totalProfit.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 以下のセクションは非表示 */}
      {false && (
        <>
          <div className="action-buttons">
            <div className="left-actions">
              <button className="add-button">新規登録</button>
              <button>インポート</button>
            </div>
            <div className="right-actions">
              <button onClick={handleExportData}>エクスポート</button>
              <button>印刷</button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>取引日</th>
                  <th>取引種別</th>
                  <th>SKU</th>
                  <th>管理番号</th>
                  <th>品目（商品名）</th>
                  <th>特徴（カラー・状態）</th>
                  <th>ランク</th>
                  <th>数量</th>
                  <th>代価</th>
                  <th>相手方氏名</th>
                  <th>相手方住所</th>
                  <th>相手方職業</th>
                  <th>相手方年齢</th>
                  <th>販売日</th>
                  <th>販売価格</th>
                  <th>販売先</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td className={record.type === '買取' ? 'type-purchase' : 'type-sale'}>{record.type}</td>
                    <td><span className="sku-code">{record.sku}</span></td>
                    <td>{record.managementNumber}</td>
                    <td>{record.productName}</td>
                    <td>{record.features}</td>
                    <td><span className={`rank-badge rank-${record.rank.toLowerCase()}`}>{record.rank}</span></td>
                    <td>{record.quantity}</td>
                    <td>¥{record.price.toLocaleString()}</td>
                    <td>{record.customerName}</td>
                    <td>{record.customerAddress}</td>
                    <td>{record.customerOccupation}</td>
                    <td>{record.customerAge}</td>
                    <td>{record.saleDate}</td>
                    <td>{record.salePrice === '-' ? '-' : `¥${Number(record.salePrice).toLocaleString()}`}</td>
                    <td>{record.buyer}</td>
                    <td>{getStatusBadge(record.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="load-more">
            <button>さらに読み込む</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Ledger;