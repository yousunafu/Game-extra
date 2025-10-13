import React, { useState, useEffect } from 'react';
import { manufacturers, gameConsoles, colors, conditions } from '../data/gameConsoles';
import './Inventory.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');
  
  // 表示モード
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // 在庫追加モーダル関連
  const [showAddModal, setShowAddModal] = useState(false);
  const [sourceType, setSourceType] = useState(null); // null, 'customer', 'supplier'
  const [availableConsoles, setAvailableConsoles] = useState([]);
  
  // フォームデータ
  const [formData, setFormData] = useState({
    productType: 'console',
    manufacturer: '',
    console: '',
    color: '',
    softwareName: '',
    condition: '',
    assessedRank: '',
    quantity: 1,
    acquisitionPrice: 0,
    // 顧客買取の場合
    customerName: '',
    customerEmail: '',
    // 業者仕入れの場合
    supplierName: '',
    invoiceNumber: '',
    // 共通
    notes: ''
  });

  // 在庫データを読み込み
  useEffect(() => {
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    setInventory(inventoryData);
  }, []);

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.buybackPrice * item.quantity), 0);
  const averagePrice = totalItems > 0 ? Math.round(totalValue / totalItems) : 0;

  // フィルタリング
  const filteredInventory = inventory.filter(item => {
    // 商品名検索（機種名、ソフト名、カラーを含む）
    const searchText = `${item.consoleLabel || ''} ${item.softwareName || ''} ${item.colorLabel || ''}`.toLowerCase();
    const matchesSearch = searchText.includes(searchTerm.toLowerCase());
    
    // 商品タイプフィルター
    const matchesProductType = !productTypeFilter || item.productType === productTypeFilter;
    
    // メーカーフィルター
    const matchesManufacturer = !manufacturerFilter || item.manufacturer === manufacturerFilter;
    
    // ランクフィルター
    const matchesRank = !rankFilter || item.assessedRank === rankFilter;
    
    return matchesSearch && matchesProductType && matchesManufacturer && matchesRank;
  });

  const handleExportData = () => {
    const format = prompt('エクスポート形式を選択してください:\n1. CSV\n2. Excel\n3. PDF', '1');
    if (format) {
      const formatName = format === '1' ? 'CSV' : format === '2' ? 'Excel' : 'PDF';
      alert(`在庫データを${formatName}形式でエクスポートしました`);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedItem(null);
    setViewMode('list');
  };

  // 在庫変更履歴を取得（localStorageから）
  const getInventoryHistory = (itemId) => {
    const history = JSON.parse(localStorage.getItem('inventoryHistory') || '[]');
    return history.filter(h => h.itemId === itemId).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // 関連する買取・販売記録を取得（在庫推移を含む）
  const getRelatedTransactions = (item) => {
    const transactions = [];
    const inventoryHistory = JSON.parse(localStorage.getItem('inventoryHistory') || '[]');
    const itemHistory = inventoryHistory.filter(h => h.itemId === item.id);
    
    // 買取記録（初回登録）
    if (item.applicationNumber) {
      const applications = JSON.parse(localStorage.getItem('allApplications') || '[]');
      const app = applications.find(a => a.applicationNumber === item.applicationNumber);
      if (app) {
        const addHistory = itemHistory.find(h => h.type === 'add' && h.relatedTransaction?.applicationNumber === item.applicationNumber);
        transactions.push({
          type: 'buyback',
          date: item.registeredDate || app.date,
          party: app.customer.name,
          status: app.status,
          applicationNumber: item.applicationNumber,
          stockChange: addHistory ? `+${addHistory.change}台` : `+${item.quantity}台`,
          stockAfter: addHistory?.afterQuantity || item.quantity,
          performedBy: addHistory?.performedBy
        });
      }
    }
    
    // 販売記録
    const salesLedger = JSON.parse(localStorage.getItem('salesLedger') || '[]');
    const sales = salesLedger.filter(s => 
      s.items && s.items.some(si => si.inventoryId === item.id)
    );
    sales.forEach(sale => {
      const saleItem = sale.items.find(si => si.inventoryId === item.id);
      const saleHistory = itemHistory.find(h => 
        h.type === 'sale' && h.relatedTransaction?.requestNumber === sale.requestNumber
      );
      
      transactions.push({
        type: 'sales',
        date: sale.soldDate || sale.date,
        party: sale.customer.name,
        status: 'completed',
        requestNumber: sale.requestNumber,
        stockChange: saleItem ? `-${saleItem.quantity}台` : '-',
        stockAfter: saleHistory?.afterQuantity,
        performedBy: saleHistory?.performedBy
      });
    });
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // モーダルを開く
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setSourceType(null);
    resetForm();
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowAddModal(false);
    setSourceType(null);
    resetForm();
  };

  // フォームをリセット
  const resetForm = () => {
    setFormData({
      productType: 'console',
      manufacturer: '',
      console: '',
      color: '',
      softwareName: '',
      condition: '',
      assessedRank: '',
      quantity: 1,
      acquisitionPrice: 0,
      customerName: '',
      customerEmail: '',
      supplierName: '',
      invoiceNumber: '',
      notes: ''
    });
    setAvailableConsoles([]);
  };

  // メーカー変更時に機種リストを更新
  const handleManufacturerChange = (manufacturerValue) => {
    setFormData({
      ...formData,
      manufacturer: manufacturerValue,
      console: ''
    });
    
    if (manufacturerValue && gameConsoles[manufacturerValue]) {
      setAvailableConsoles(gameConsoles[manufacturerValue]);
    } else {
      setAvailableConsoles([]);
    }
  };

  // フォーム入力変更
  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // 在庫追加処理
  const handleAddInventory = () => {
    // バリデーション
    if (!formData.manufacturer || !formData.console || !formData.assessedRank || !formData.acquisitionPrice) {
      alert('必須項目を入力してください');
      return;
    }

    if (formData.productType === 'software' && !formData.softwareName) {
      alert('ソフト名を入力してください');
      return;
    }

    if (sourceType === 'customer' && !formData.customerName) {
      alert('顧客名を入力してください');
      return;
    }

    if (sourceType === 'supplier' && !formData.supplierName) {
      alert('仕入れ先を選択してください');
      return;
    }

    // ラベル取得
    const manufacturerLabel = manufacturers.find(m => m.value === formData.manufacturer)?.label;
    const consoleLabel = availableConsoles.find(c => c.value === formData.console)?.label;
    const conditionLabel = formData.condition ? conditions.find(c => c.value === formData.condition)?.label : '';

    // 在庫アイテム作成
    const inventoryItem = {
      id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceType: sourceType,
      applicationNumber: `MANUAL-${Date.now()}`,
      
      // 商品情報
      productType: formData.productType,
      manufacturer: formData.manufacturer,
      manufacturerLabel: manufacturerLabel,
      console: formData.console,
      consoleLabel: consoleLabel,
      color: formData.color || '',
      colorLabel: formData.color || '',
      softwareName: formData.softwareName || '',
      condition: formData.condition || '',
      conditionLabel: conditionLabel || '',
      assessedRank: formData.assessedRank,
      quantity: formData.quantity,
      acquisitionPrice: formData.acquisitionPrice,
      buybackPrice: formData.acquisitionPrice, // 互換性のため
      
      // 仕入れ元情報
      ...(sourceType === 'customer' ? {
        customer: {
          name: formData.customerName,
          email: formData.customerEmail || ''
        }
      } : {}),
      
      ...(sourceType === 'supplier' ? {
        supplier: {
          name: formData.supplierName,
          invoiceNumber: formData.invoiceNumber || ''
        }
      } : {}),
      
      // メタ情報
      registeredDate: new Date().toISOString(),
      notes: formData.notes || ''
    };

    // 在庫に追加
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    inventoryData.push(inventoryItem);
    localStorage.setItem('inventory', JSON.stringify(inventoryData));
    
    // 在庫変更履歴を記録
    const inventoryHistory = JSON.parse(localStorage.getItem('inventoryHistory') || '[]');
    inventoryHistory.push({
      itemId: inventoryItem.id,
      type: 'add',
      change: formData.quantity,
      beforeQuantity: 0,
      afterQuantity: formData.quantity,
      date: new Date().toISOString(),
      performedBy: 'スタッフ（手動登録）',
      reason: sourceType === 'customer' 
        ? `顧客買取（${formData.customerName}）` 
        : `業者仕入れ（${formData.supplierName}）`,
      relatedTransaction: {
        type: sourceType,
        reference: sourceType === 'supplier' ? formData.invoiceNumber : formData.customerEmail
      }
    });
    localStorage.setItem('inventoryHistory', JSON.stringify(inventoryHistory));

    // 画面更新
    setInventory(inventoryData);
    alert('在庫を追加しました');
    handleCloseModal();
  };

  return (
    <div className="inventory-container">
      {viewMode === 'list' ? (
        <>
      <h1>在庫管理サマリー</h1>
      <p className="subtitle">在庫全体の概要を確認できます</p>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-value">{totalItems}</div>
          <div className="card-label">総在庫数</div>
        </div>
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-value">¥{totalValue.toLocaleString()}</div>
          <div className="card-label">在庫評価額</div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-value">¥{averagePrice.toLocaleString()}</div>
          <div className="card-label">平均単価</div>
        </div>
        <div className="summary-card">
          <div className="card-icon">🎮</div>
          <div className="card-value">{inventory.length}</div>
          <div className="card-label">商品種別数</div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleOpenAddModal} className="add-inventory-button">➕ 在庫を手動追加</button>
        <button onClick={handleExportData}>データエクスポート</button>
        <button className="secondary">データ更新</button>
      </div>

      <div className="filter-section">
        <h3>🔍 フィルター</h3>
        <div className="filter-controls">
          <div className="form-group">
            <label>商品検索</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="機種名、ソフト名、カラーで検索"
            />
          </div>
          <div className="form-group">
            <label>商品タイプ</label>
            <select value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value)}>
              <option value="">全て</option>
              <option value="console">🎮 ゲーム本体</option>
              <option value="software">💿 ゲームソフト</option>
            </select>
          </div>
          <div className="form-group">
            <label>メーカー</label>
            <select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)}>
              <option value="">全て</option>
              {manufacturers.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>査定ランク</label>
            <select value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
              <option value="">全て</option>
              <option value="S">S（極美品）</option>
              <option value="A">A（美品）</option>
              <option value="B">B（良品）</option>
              <option value="C">C（難あり）</option>
            </select>
          </div>
        </div>
      </div>

      <h2>📦 商品別在庫一覧（{filteredInventory.length}件）</h2>
      
      {filteredInventory.length === 0 ? (
        <div className="empty-inventory">
          <div className="empty-icon">📦</div>
          <p>在庫データがありません</p>
          <p className="empty-hint">買取査定ページから「在庫に登録」すると、こちらに表示されます</p>
        </div>
      ) : (
        <table className="inventory-table">
          <thead>
            <tr>
              <th>商品タイプ</th>
              <th>メーカー</th>
              <th>機種/ソフト名</th>
              <th>カラー</th>
              <th>ランク</th>
              <th>数量</th>
              <th>買取単価</th>
              <th>評価額</th>
              <th>登録日</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id} onClick={() => handleViewDetails(item)}>
                <td>
                  <span className="type-badge">
                    {item.productType === 'console' ? '🎮 本体' : '💿 ソフト'}
                  </span>
                </td>
                <td className="manufacturer-cell">{item.manufacturerLabel}</td>
                <td className="product-name">
                  {item.productType === 'software' ? (
                    <>
                      <div className="software-name">{item.softwareName}</div>
                      <div className="console-name">{item.consoleLabel}</div>
                    </>
                  ) : (
                    <div>{item.consoleLabel}</div>
                  )}
                </td>
                <td className="color-cell">
                  {item.colorLabel ? (
                    <span className="color-badge">{item.colorLabel}</span>
                  ) : (
                    <span className="no-color">-</span>
                  )}
                </td>
                <td>
                  <span className={`rank-badge rank-${item.assessedRank.toLowerCase()}`}>
                    {item.assessedRank}
                  </span>
                </td>
                <td className="quantity-cell">{item.quantity}</td>
                <td className="price-cell">¥{item.buybackPrice.toLocaleString()}</td>
                <td className="value-cell">¥{(item.buybackPrice * item.quantity).toLocaleString()}</td>
                <td className="date-cell">{new Date(item.registeredDate).toLocaleDateString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="5">合計</td>
              <td>{filteredInventory.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td>-</td>
              <td>¥{filteredInventory.reduce((sum, item) => sum + (item.buybackPrice * item.quantity), 0).toLocaleString()}</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      )}

      {/* 在庫追加モーダル */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 在庫を手動追加</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              {/* 仕入れ元選択 */}
              {!sourceType && (
                <div className="source-type-selection">
                  <h3>仕入れ元を選択してください</h3>
                  <div className="source-buttons">
                    <button 
                      className="source-btn customer-btn"
                      onClick={() => setSourceType('customer')}
                    >
                      <div className="source-icon">👤</div>
                      <h4>顧客からの買取</h4>
                      <p>個人のお客様から買い取った商品</p>
                    </button>
                    <button 
                      className="source-btn supplier-btn"
                      onClick={() => setSourceType('supplier')}
                    >
                      <div className="source-icon">🏢</div>
                      <h4>業者から仕入れ</h4>
                      <p>駿河屋などの業者から仕入れた商品</p>
                    </button>
                  </div>
                </div>
              )}

              {/* 顧客買取フォーム */}
              {sourceType === 'customer' && (
                <div className="add-inventory-form">
                  <button className="back-to-source" onClick={() => setSourceType(null)}>
                    ← 仕入れ元選択に戻る
                  </button>
                  
                  <h3>👤 顧客買取 - 在庫登録</h3>
                  
                  <div className="form-section-group">
                    <h4>📦 商品情報</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>商品タイプ *</label>
                        <div className="radio-group">
                          <label>
                            <input
                              type="radio"
                              value="console"
                              checked={formData.productType === 'console'}
                              onChange={(e) => handleFormChange('productType', e.target.value)}
                            />
                            🎮 ゲーム本体
                          </label>
                          <label>
                            <input
                              type="radio"
                              value="software"
                              checked={formData.productType === 'software'}
                              onChange={(e) => handleFormChange('productType', e.target.value)}
                            />
                            💿 ゲームソフト
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>メーカー *</label>
                        <select 
                          value={formData.manufacturer}
                          onChange={(e) => handleManufacturerChange(e.target.value)}
                        >
                          <option value="">選択してください</option>
                          {manufacturers.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>機種 *</label>
                        <select 
                          value={formData.console}
                          onChange={(e) => handleFormChange('console', e.target.value)}
                          disabled={!formData.manufacturer}
                        >
                          <option value="">選択してください</option>
                          {availableConsoles.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.productType === 'console' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>カラー（任意）</label>
                          <select 
                            value={formData.color}
                            onChange={(e) => handleFormChange('color', e.target.value)}
                          >
                            <option value="">選択しない</option>
                            {colors.map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {formData.productType === 'software' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>ソフト名 *</label>
                          <input
                            type="text"
                            value={formData.softwareName}
                            onChange={(e) => handleFormChange('softwareName', e.target.value)}
                            placeholder="例: ゼルダの伝説 ティアーズ オブ ザ キングダム"
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label>状態（任意）</label>
                        <select 
                          value={formData.condition}
                          onChange={(e) => handleFormChange('condition', e.target.value)}
                        >
                          <option value="">選択しない</option>
                          {conditions.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>査定ランク *</label>
                        <select 
                          value={formData.assessedRank}
                          onChange={(e) => handleFormChange('assessedRank', e.target.value)}
                        >
                          <option value="">選択してください</option>
                          <option value="S">S（極美品）</option>
                          <option value="A">A（美品）</option>
                          <option value="B">B（良品）</option>
                          <option value="C">C（難あり）</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>数量 *</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="form-group">
                        <label>買取単価（円）*</label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={formData.acquisitionPrice}
                          onChange={(e) => handleFormChange('acquisitionPrice', parseInt(e.target.value) || 0)}
                          placeholder="25000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section-group">
                    <h4>👤 顧客情報（簡易版）</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>顧客名 *</label>
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => handleFormChange('customerName', e.target.value)}
                          placeholder="山田太郎"
                        />
                      </div>

                      <div className="form-group">
                        <label>メールアドレス（任意）</label>
                        <input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                          placeholder="yamada@example.com"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group full-width">
                        <label>備考（任意）</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          placeholder="特記事項があれば入力してください"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={handleCloseModal}>キャンセル</button>
                    <button className="btn-primary" onClick={handleAddInventory}>✅ 在庫に追加</button>
                  </div>
                </div>
              )}

              {/* 業者仕入れフォーム */}
              {sourceType === 'supplier' && (
                <div className="add-inventory-form">
                  <button className="back-to-source" onClick={() => setSourceType(null)}>
                    ← 仕入れ元選択に戻る
                  </button>
                  
                  <h3>🏢 業者仕入れ - 在庫登録</h3>
                  
                  <div className="form-section-group">
                    <h4>📦 商品情報</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>商品タイプ *</label>
                        <div className="radio-group">
                          <label>
                            <input
                              type="radio"
                              value="console"
                              checked={formData.productType === 'console'}
                              onChange={(e) => handleFormChange('productType', e.target.value)}
                            />
                            🎮 ゲーム本体
                          </label>
                          <label>
                            <input
                              type="radio"
                              value="software"
                              checked={formData.productType === 'software'}
                              onChange={(e) => handleFormChange('productType', e.target.value)}
                            />
                            💿 ゲームソフト
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>メーカー *</label>
                        <select 
                          value={formData.manufacturer}
                          onChange={(e) => handleManufacturerChange(e.target.value)}
                        >
                          <option value="">選択してください</option>
                          {manufacturers.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>機種 *</label>
                        <select 
                          value={formData.console}
                          onChange={(e) => handleFormChange('console', e.target.value)}
                          disabled={!formData.manufacturer}
                        >
                          <option value="">選択してください</option>
                          {availableConsoles.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.productType === 'console' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>カラー（任意）</label>
                          <select 
                            value={formData.color}
                            onChange={(e) => handleFormChange('color', e.target.value)}
                          >
                            <option value="">選択しない</option>
                            {colors.map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {formData.productType === 'software' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>ソフト名 *</label>
                          <input
                            type="text"
                            value={formData.softwareName}
                            onChange={(e) => handleFormChange('softwareName', e.target.value)}
                            placeholder="例: ゼルダの伝説 ティアーズ オブ ザ キングダム"
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label>状態（任意）</label>
                        <select 
                          value={formData.condition}
                          onChange={(e) => handleFormChange('condition', e.target.value)}
                        >
                          <option value="">選択しない</option>
                          {conditions.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>査定ランク *</label>
                        <select 
                          value={formData.assessedRank}
                          onChange={(e) => handleFormChange('assessedRank', e.target.value)}
                        >
                          <option value="">選択してください</option>
                          <option value="S">S（極美品）</option>
                          <option value="A">A（美品）</option>
                          <option value="B">B（良品）</option>
                          <option value="C">C（難あり）</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>数量 *</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="form-group">
                        <label>仕入れ単価（円）*</label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={formData.acquisitionPrice}
                          onChange={(e) => handleFormChange('acquisitionPrice', parseInt(e.target.value) || 0)}
                          placeholder="30000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section-group">
                    <h4>🏢 仕入れ先情報</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>仕入れ先 *</label>
                        <select
                          value={formData.supplierName}
                          onChange={(e) => handleFormChange('supplierName', e.target.value)}
                        >
                          <option value="">選択してください</option>
                          <option value="駿河屋">駿河屋</option>
                          <option value="ブックオフ">ブックオフ</option>
                          <option value="じゃんぱら">じゃんぱら</option>
                          <option value="ソフマップ">ソフマップ</option>
                          <option value="ハードオフ">ハードオフ</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>伝票番号（任意）</label>
                        <input
                          type="text"
                          value={formData.invoiceNumber}
                          onChange={(e) => handleFormChange('invoiceNumber', e.target.value)}
                          placeholder="SRG-2024-001"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group full-width">
                        <label>備考（任意）</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          placeholder="特記事項があれば入力してください"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={handleCloseModal}>キャンセル</button>
                    <button className="btn-primary" onClick={handleAddInventory}>✅ 在庫に追加</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        /* 個別管理台帳画面 */
        <div className="item-detail-view">
          <div className="detail-header">
            <h1>📋 個別管理台帳</h1>
            <button className="back-btn" onClick={handleBackToList}>
              ← 在庫一覧に戻る
            </button>
          </div>

          {selectedItem && (
            <>
              {/* 商品情報カード */}
              <div className="detail-card">
                <h2>🎮 商品情報</h2>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">商品ID:</span>
                    <span className="detail-value">{selectedItem.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">商品タイプ:</span>
                    <span className="detail-value">
                      {selectedItem.productType === 'console' ? 'ゲーム本体' : 'ゲームソフト'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">メーカー:</span>
                    <span className="detail-value">{selectedItem.manufacturerLabel}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">機種:</span>
                    <span className="detail-value">{selectedItem.consoleLabel}</span>
                  </div>
                  {selectedItem.colorLabel && (
                    <div className="detail-row">
                      <span className="detail-label">カラー:</span>
                      <span className="detail-value">{selectedItem.colorLabel}</span>
                    </div>
                  )}
                  {selectedItem.softwareName && (
                    <div className="detail-row">
                      <span className="detail-label">ソフト名:</span>
                      <span className="detail-value">{selectedItem.softwareName}</span>
                    </div>
                  )}
                  {selectedItem.conditionLabel && (
                    <div className="detail-row">
                      <span className="detail-label">状態:</span>
                      <span className="detail-value">{selectedItem.conditionLabel}</span>
                    </div>
                  )}
                  {selectedItem.accessoriesLabel && (
                    <div className="detail-row">
                      <span className="detail-label">付属品:</span>
                      <span className="detail-value">{selectedItem.accessoriesLabel}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">査定ランク:</span>
                    <span className={`rank-badge rank-${selectedItem.assessedRank?.toLowerCase()}`}>
                      {selectedItem.assessedRank}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">現在在庫数:</span>
                    <span className="detail-value highlight">{selectedItem.quantity}台</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">仕入れ単価:</span>
                    <span className="detail-value">¥{(selectedItem.acquisitionPrice || selectedItem.buybackPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">登録日:</span>
                    <span className="detail-value">
                      {new Date(selectedItem.registeredDate).toLocaleString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 仕入れ元情報 */}
              <div className="detail-card">
                <h2>📥 仕入れ元情報</h2>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">仕入れ元タイプ:</span>
                    <span className="detail-value">
                      {selectedItem.sourceType === 'customer' ? '👤 顧客買取' : '🏢 業者仕入れ'}
                    </span>
                  </div>
                  {selectedItem.sourceType === 'customer' && selectedItem.customer && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">顧客名:</span>
                        <span className="detail-value">{selectedItem.customer.name}</span>
                      </div>
                      {selectedItem.customer.birthDate && (
                        <div className="detail-row">
                          <span className="detail-label">生年月日:</span>
                          <span className="detail-value">{selectedItem.customer.birthDate}</span>
                        </div>
                      )}
                      {selectedItem.customer.occupation && (
                        <div className="detail-row">
                          <span className="detail-label">職業:</span>
                          <span className="detail-value">{selectedItem.customer.occupation}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">電話番号:</span>
                        <span className="detail-value">{selectedItem.customer.phone || '-'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">メールアドレス:</span>
                        <span className="detail-value">{selectedItem.customer.email}</span>
                      </div>
                      {selectedItem.customer.postalCode && (
                        <div className="detail-row">
                          <span className="detail-label">郵便番号:</span>
                          <span className="detail-value">{selectedItem.customer.postalCode}</span>
                        </div>
                      )}
                      {selectedItem.customer.address && (
                        <div className="detail-row">
                          <span className="detail-label">住所:</span>
                          <span className="detail-value">{selectedItem.customer.address}</span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedItem.sourceType === 'supplier' && selectedItem.supplier && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">仕入れ先:</span>
                        <span className="detail-value">{selectedItem.supplier.name}</span>
                      </div>
                      {selectedItem.invoiceNumber && (
                        <div className="detail-row">
                          <span className="detail-label">伝票番号:</span>
                          <span className="detail-value">{selectedItem.invoiceNumber}</span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedItem.applicationNumber && (
                    <div className="detail-row">
                      <span className="detail-label">申込番号:</span>
                      <span className="detail-value">{selectedItem.applicationNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 取引履歴・在庫推移 */}
              <div className="detail-card">
                <h2>📊 取引履歴・在庫推移</h2>
                {getRelatedTransactions(selectedItem).length === 0 ? (
                  <div className="empty-history">
                    <p>取引履歴がありません</p>
                  </div>
                ) : (
                  <div className="transaction-timeline">
                    {getRelatedTransactions(selectedItem).map((trans, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className={`trans-type-badge ${trans.type}`}>
                              {trans.type === 'buyback' ? '📥 買取' : '📤 販売'}
                            </span>
                            <span className="trans-date">
                              {new Date(trans.date).toLocaleString('ja-JP')}
                            </span>
                          </div>
                          <div className="timeline-details">
                            <p><strong>取引先:</strong> {trans.party}</p>
                            {trans.applicationNumber && (
                              <p><strong>申込番号:</strong> {trans.applicationNumber}</p>
                            )}
                            {trans.requestNumber && (
                              <p><strong>リクエスト番号:</strong> {trans.requestNumber}</p>
                            )}
                            <div className="stock-change-info">
                              <span className={`stock-change ${trans.type === 'buyback' ? 'increase' : 'decrease'}`}>
                                在庫変動: {trans.stockChange}
                              </span>
                              {trans.stockAfter !== undefined && (
                                <span className="stock-after">
                                  → 在庫: {trans.stockAfter}台
                                </span>
                              )}
                            </div>
                            {trans.performedBy && (
                              <p className="performed-by">👤 担当者: {trans.performedBy}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventory;