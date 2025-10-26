import React, { useState, useEffect, useCallback } from 'react';
import './Ledger.css';

const Ledger = () => {
  const [salesRecords, setSalesRecords] = useState([]);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    transactionType: '',
    productSearch: '',
    skuSearch: '',
    customerSearch: ''
  });

  // 販売記録を読み込み
  useEffect(() => {
    const ledger = JSON.parse(localStorage.getItem('salesLedger') || '[]');
    setSalesRecords(ledger);
  }, []);

  const loadLedgerRecords = useCallback(() => {
    const allRecords = [];
    
    // 在庫データから買取記録を取得
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
    
    // デバッグ情報をコンソールに出力
    console.log('=== 古物台帳: データ読み込み状況 ===');
    console.log('inventory件数:', inventory.length);
    console.log('allApplications件数:', allApplications.length);
    console.log('inventoryサンプル:', inventory.slice(0, 2));
    console.log('allApplicationsサンプル:', allApplications.slice(0, 2));
    
    inventory.forEach(item => {
      if (item.sourceType === 'customer' && item.applicationNumber) {
        const app = allApplications.find(a => a.applicationNumber === item.applicationNumber);
        
        // appがなくても、inventoryにcustomer情報があれば使用
        const customerInfo = app && app.customer ? app.customer : (item.customer || null);
        
        if (customerInfo) {
          // 管理番号がある場合は各管理番号ごとに1レコード作成
          const managementNumbers = item.managementNumbers || [];
          if (managementNumbers.length > 0) {
            managementNumbers.forEach(mgmtNumber => {
              allRecords.push({
                id: `${item.id}-${mgmtNumber}`,
                date: new Date(item.registeredDate).toLocaleDateString('ja-JP'),
                type: '買取',
                sku: item.id,
                managementNumber: mgmtNumber,
                productName: item.productType === 'software' ? item.softwareName : `${item.manufacturerLabel} - ${item.consoleLabel}`,
                features: `${item.colorLabel || ''} ${item.conditionLabel || ''}`.trim() || '-',
                rank: item.assessedRank,
                quantity: 1,
                price: item.acquisitionPrice || item.buybackPrice,
                customerName: customerInfo.name,
                customerAddress: `${customerInfo.postalCode || ''} ${customerInfo.address || ''}`.trim(),
                customerOccupation: customerInfo.occupation || '-',
                customerAge: customerInfo.birthDate ? Math.floor((new Date() - new Date(customerInfo.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : '-',
                saleDate: '-',
                salePrice: '-',
                buyer: '-',
                status: 'in-stock'
              });
            });
          } else {
            // 管理番号がない場合は従来通り
            allRecords.push({
              id: item.id,
              date: new Date(item.registeredDate).toLocaleDateString('ja-JP'),
              type: '買取',
              sku: item.id,
              managementNumber: '-',
              productName: item.productType === 'software' ? item.softwareName : `${item.manufacturerLabel} - ${item.consoleLabel}`,
              features: `${item.colorLabel || ''} ${item.conditionLabel || ''}`.trim() || '-',
              rank: item.assessedRank,
              quantity: item.quantity,
              price: item.acquisitionPrice || item.buybackPrice,
              customerName: customerInfo.name,
              customerAddress: `${customerInfo.postalCode || ''} ${customerInfo.address || ''}`.trim(),
              customerOccupation: customerInfo.occupation || '-',
              customerAge: customerInfo.birthDate ? Math.floor((new Date() - new Date(customerInfo.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : '-',
              saleDate: '-',
              salePrice: '-',
              buyer: '-',
              status: 'in-stock'
            });
          }
        }
      }
    });
    
    // 新しい販売履歴（salesHistory）から販売記録を取得
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    console.log('=== 古物台帳: 販売履歴読み込み ===');
    console.log('salesHistory件数:', salesHistory.length);
    console.log('salesHistoryサンプル:', salesHistory.slice(0, 3));
    
    salesHistory.forEach(sale => {
      console.log('処理中の販売記録:', sale.id, sale.salesChannel, sale.soldTo);
      console.log('販売記録詳細:', {
        id: sale.id,
        salesChannel: sale.salesChannel,
        soldTo: sale.soldTo,
        soldAt: sale.soldAt,
        soldPrice: sale.soldPrice,
        managementNumbers: sale.managementNumbers
      });
      
      // 買取記録を生成（buybackInfoがある場合）
      if (sale.buybackInfo && sale.buybackInfo.customer) {
        const buybackInfo = sale.buybackInfo;
        const buybackManagementNumbers = sale.managementNumbers || [];
        
        if (buybackManagementNumbers.length > 0) {
          buybackManagementNumbers.forEach(mgmtNumber => {
            allRecords.push({
              id: `BUYBACK-${sale.id}-${mgmtNumber}`,
              date: new Date(buybackInfo.buybackDate).toLocaleDateString('ja-JP'),
              type: '買取',
              sku: sale.inventoryItemId,
              managementNumber: mgmtNumber,
              productName: sale.productType === 'software' ? sale.softwareName : `${sale.manufacturerLabel} - ${sale.consoleLabel}`,
              features: `${sale.colorLabel || ''} ランク:${sale.assessedRank}`.trim(),
              rank: sale.assessedRank,
              quantity: 1,
              price: buybackInfo.buybackPrice,
              customerName: buybackInfo.customer.name,
              customerAddress: `${buybackInfo.customer.postalCode || ''} ${buybackInfo.customer.address || ''}`.trim(),
              customerOccupation: buybackInfo.customer.occupation || '-',
              customerAge: buybackInfo.customer.birthDate ? Math.floor((new Date() - new Date(buybackInfo.customer.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : '-',
              saleDate: '-',
              salePrice: '-',
              buyer: '-',
              status: 'sold' // 売却済み
            });
          });
        } else {
          // 管理番号なし
          allRecords.push({
            id: `BUYBACK-${sale.id}`,
            date: new Date(buybackInfo.buybackDate).toLocaleDateString('ja-JP'),
            type: '買取',
            sku: sale.inventoryItemId,
            managementNumber: '-',
            productName: sale.productType === 'software' ? sale.softwareName : `${sale.manufacturerLabel} - ${sale.consoleLabel}`,
            features: `${sale.colorLabel || ''} ランク:${sale.assessedRank}`.trim(),
            rank: sale.assessedRank,
            quantity: sale.quantity,
            price: buybackInfo.buybackPrice,
            customerName: buybackInfo.customer.name,
            customerAddress: `${buybackInfo.customer.postalCode || ''} ${buybackInfo.customer.address || ''}`.trim(),
            customerOccupation: buybackInfo.customer.occupation || '-',
            customerAge: buybackInfo.customer.birthDate ? Math.floor((new Date() - new Date(buybackInfo.customer.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : '-',
            saleDate: '-',
            salePrice: '-',
            buyer: '-',
            status: 'sold' // 売却済み
          });
        }
      }
      
      // 管理番号がある場合は各管理番号ごとに1レコード作成
      const managementNumbers = sale.managementNumbers || [];
      console.log('管理番号:', managementNumbers);
      if (managementNumbers.length > 0) {
        managementNumbers.forEach(mgmtNumber => {
          allRecords.push({
            id: `${sale.id}-${mgmtNumber}`,
            date: new Date(sale.soldAt).toLocaleDateString('ja-JP'),
            type: '販売',
            sku: sale.inventoryItemId,
            managementNumber: mgmtNumber,
            productName: sale.productType === 'software' ? sale.softwareName : `${sale.manufacturerLabel} - ${sale.consoleLabel}`,
            features: `${sale.colorLabel || ''} ランク:${sale.assessedRank}`.trim(),
            rank: sale.assessedRank,
            quantity: 1,
            price: '-',
            customerName: '-',
            customerAddress: '-',
            customerOccupation: '-',
            customerAge: '-',
            saleDate: new Date(sale.soldAt).toLocaleDateString('ja-JP'),
            salePrice: sale.soldPrice,
            buyer: sale.soldTo,
            status: 'sold'
          });
        });
      } else {
        // 管理番号がない場合は従来通り（Zaico同期の場合は必ず表示）
        console.log('管理番号なしの販売記録を処理:', sale.id, sale.salesChannel, sale.soldTo);
        console.log('古物台帳レコード作成:', {
          id: sale.id,
          type: '販売',
          productName: sale.productType === 'software' ? sale.softwareName : `${sale.manufacturerLabel} - ${sale.consoleLabel}`,
          customerName: sale.soldTo,
          salesChannel: sale.salesChannel
        });
        allRecords.push({
          id: sale.id,
          date: new Date(sale.soldAt).toLocaleDateString('ja-JP'),
          type: '販売',
          sku: sale.inventoryItemId,
          managementNumber: '-',
          productName: sale.productType === 'software' ? sale.softwareName : `${sale.manufacturerLabel} - ${sale.consoleLabel}`,
          features: `${sale.colorLabel || ''} ランク:${sale.assessedRank}`.trim(),
          rank: sale.assessedRank,
          quantity: sale.quantity,
          price: '-',
          customerName: '-',
          customerAddress: '-',
          customerOccupation: '-',
          customerAge: '-',
          saleDate: new Date(sale.soldAt).toLocaleDateString('ja-JP'),
          salePrice: sale.soldPrice,
          buyer: sale.soldTo,
          status: 'sold'
        });
      }
    });
    
    // 日付順にソート（新しい順）
    allRecords.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateB - dateA;
    });
    
    // 重複レコードを削除（商品名、価格、日時の組み合わせで重複判定）
    const uniqueRecords = [];
    const seenCombinations = new Set();
    
    allRecords.forEach(record => {
      // 重複判定のキーを作成（管理番号も含める）
      const duplicateKey = `${record.productName}-${record.price}-${record.date}-${record.customerName}-${record.customerAddress}-${record.managementNumber}`;
      
      if (!seenCombinations.has(duplicateKey)) {
        seenCombinations.add(duplicateKey);
        uniqueRecords.push(record);
      } else {
        console.log('重複レコードをスキップ:', record.id, record.productName, record.price, record.customerAddress, record.managementNumber);
      }
    });
    
    // フィルター処理
    let filteredRecords = uniqueRecords;
    
    // 日付フィルター
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date.split('/').reverse().join('-'));
        return recordDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date.split('/').reverse().join('-'));
        return recordDate <= toDate;
      });
    }
    
    // 取引種別フィルター
    if (filters.transactionType) {
      const typeMap = { 'purchase': '買取', 'sale': '販売' };
      filteredRecords = filteredRecords.filter(record => record.type === typeMap[filters.transactionType]);
    }
    
    // 商品名検索
    if (filters.productSearch) {
      const searchTerm = filters.productSearch.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.productName.toLowerCase().includes(searchTerm)
      );
    }
    
    // SKU検索
    if (filters.skuSearch) {
      const searchTerm = filters.skuSearch.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.sku.toLowerCase().includes(searchTerm) ||
        record.managementNumber.toLowerCase().includes(searchTerm)
      );
    }
    
    // 顧客名検索
    if (filters.customerSearch) {
      const searchTerm = filters.customerSearch.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.customerName.toLowerCase().includes(searchTerm) ||
        (record.buyer && record.buyer.toLowerCase().includes(searchTerm))
      );
    }
    
    console.log('=== 古物台帳: 最終レコード ===');
    console.log('元のレコード数:', allRecords.length);
    console.log('重複削除後のレコード数:', uniqueRecords.length);
    console.log('フィルター後のレコード数:', filteredRecords.length);
    console.log('販売レコード数:', filteredRecords.filter(r => r.type === '販売').length);
    console.log('Zaico同期レコード数:', filteredRecords.filter(r => r.customerAddress === 'Zaico同期').length);
    console.log('レコードサンプル:', filteredRecords.slice(0, 5));
    
    setRecords(filteredRecords);
  }, [filters]);

  // 初期読み込み
  useEffect(() => {
    loadLedgerRecords();
  }, [loadLedgerRecords]);

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    // フィルター条件に基づいてレコードを再読み込み
    loadLedgerRecords();
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
    // フィルターをクリアした後、レコードを再読み込み
    setTimeout(() => {
      console.log('フィルターをクリアしました。古物台帳を再読み込みします。');
      loadLedgerRecords();
    }, 100);
  };

  // 重複データをクリーンアップする関数
  const cleanupDuplicateRecords = () => {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    const uniqueSales = [];
    const seenCombinations = new Set();
    
    console.log('=== 重複クリーンアップ開始 ===');
    console.log('元の販売履歴件数:', salesHistory.length);
    
    salesHistory.forEach(sale => {
      // 重複判定のキーを作成（商品名、価格、日時、顧客名、販売チャネルの組み合わせ）
      const duplicateKey = `${sale.inventoryItemId}-${sale.soldPrice}-${sale.soldAt}-${sale.soldTo}-${sale.salesChannel}`;
      
      if (!seenCombinations.has(duplicateKey)) {
        seenCombinations.add(duplicateKey);
        uniqueSales.push(sale);
        console.log('保持:', sale.id, sale.soldTo, sale.soldPrice, sale.salesChannel);
      } else {
        console.log('重複削除:', sale.id, sale.soldTo, sale.soldPrice, sale.salesChannel);
      }
    });
    
    localStorage.setItem('salesHistory', JSON.stringify(uniqueSales));
    console.log('重複クリーンアップ完了:', {
      元の件数: salesHistory.length,
      クリーンアップ後: uniqueSales.length,
      削除件数: salesHistory.length - uniqueSales.length
    });
    
    // 古物台帳を再読み込み
    loadLedgerRecords();
  };

  const clearAllRecords = () => {
    if (window.confirm('⚠️ 古物台帳の全記録を削除します。この操作は取り消せません。\n\n本当に実行しますか？')) {
      if (window.confirm('🚨 最終確認：古物台帳の全記録を完全に削除します。\n\nこの操作は絶対に取り消せません。\n\n本当に実行しますか？')) {
        console.log('=== 古物台帳全記録削除開始 ===');
        
        // 販売履歴をクリア
        localStorage.removeItem('salesHistory');
        console.log('販売履歴をクリアしました');
        
        // 古物台帳データをクリア
        localStorage.removeItem('ledger');
        console.log('古物台帳データをクリアしました');
        
        // 在庫データをクリア
        localStorage.removeItem('inventory');
        console.log('在庫データをクリアしました');
        
        // 買取申請データをクリア
        localStorage.removeItem('allApplications');
        console.log('買取申請データをクリアしました');
        
        // 古物台帳を再読み込み
        loadLedgerRecords();
        
        alert('✅ 古物台帳の全記録を削除しました。');
        console.log('古物台帳全記録削除完了');
      }
    }
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
          <div className="info-value">{records.filter(r => r.type === '販売').length}</div>
        </div>
        <div className="info-item">
          <div className="info-label">総仕入れ額</div>
          <div className="info-value" style={{ color: '#e74c3c' }}>
            ¥{records.filter(r => r.type === '買取').reduce((sum, r) => sum + (Number(r.price) || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">総販売額</div>
          <div className="info-value" style={{ color: '#3498db' }}>
            ¥{records.filter(r => r.type === '販売').reduce((sum, r) => sum + (Number(r.salePrice) || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">総利益</div>
          <div className="info-value" style={{ color: '#27ae60' }}>
            ¥{records.filter(r => r.type === '販売').reduce((sum, r) => {
              const salePrice = Number(r.salePrice) || 0;
              const buyPrice = Number(r.price) || 0;
              return sum + (salePrice - buyPrice);
            }, 0).toLocaleString()}
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

      {/* 古物台帳テーブル */}
      <div className="ledger-table-section">
        <div className="action-buttons">
          <div className="left-actions">
            <span className="record-count">全{records.length}件</span>
          </div>
          <div className="right-actions">
            <button onClick={cleanupDuplicateRecords} style={{backgroundColor: '#ff6b6b', color: 'white'}}>
              重複クリーンアップ
            </button>
            <button onClick={clearAllRecords} style={{backgroundColor: '#dc3545', color: 'white'}}>
              🗑️ 全記録クリア
            </button>
            <button onClick={handleExportData}>エクスポート</button>
            <button onClick={() => window.print()}>印刷</button>
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
          
          {records.length === 0 && (
            <div className="empty-records">
              <p>古物台帳に記録がありません</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Ledger;