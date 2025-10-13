import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { manufacturers, gameConsoles, colors } from '../data/gameConsoles';
import './SalesRequest.css';

const SalesRequest = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productType: 'console',
    manufacturer: '',
    console: '',
    color: '',
    softwareName: '',
    condition: '',
    packageType: '',
    includedItems: {
      console: true,
      software: true,
      box: false,
      manual: false,
      controller: false,
      charger: false,
      cables: false,
      bonusItems: false
    },
    quantity: 1
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [availableConsoles, setAvailableConsoles] = useState([]);
  const [notes, setNotes] = useState('');

  // 英語マッピング
  const manufacturersEN = {
    'nintendo': 'Nintendo',
    'sony': 'Sony',
    'microsoft': 'Microsoft',
    'other': 'Other'
  };

  const consolesEN = {
    'Nintendo Switch（有機ELモデル）': 'Nintendo Switch (OLED Model)',
    'Newニンテンドー3DS': 'New Nintendo 3DS',
    'ニンテンドー3DS': 'Nintendo 3DS',
    'ニンテンドーDSi': 'Nintendo DSi',
    'ニンテンドーDS Lite': 'Nintendo DS Lite',
    'ニンテンドーDS': 'Nintendo DS',
    'ゲームキューブ': 'GameCube',
    'ゲームボーイアドバンス（SPを含む）': 'Game Boy Advance (incl. SP)',
    'ゲームボーイカラー': 'Game Boy Color',
    'スーパーファミコン': 'Super Famicom',
    'ゲームボーイ': 'Game Boy',
    'ファミリーコンピュータ': 'Famicom',
    'PlayStation 5 デジタル・エディション': 'PlayStation 5 Digital Edition',
    'ドリームキャスト': 'Dreamcast',
    'ワンダースワン': 'WonderSwan',
    'セガサターン': 'Sega Saturn',
    'ネオジオ': 'Neo Geo',
    'PCエンジン': 'PC Engine',
    'その他（手入力）': 'Other (Manual Input)'
  };

  const colorsEN = {
    'ホワイト': 'White',
    'ブラック': 'Black',
    'ブルー': 'Blue',
    'レッド': 'Red',
    'グレー': 'Gray',
    'ピンク': 'Pink',
    'イエロー': 'Yellow',
    'グリーン': 'Green',
    'パープル': 'Purple',
    'オレンジ': 'Orange',
    'ターコイズ': 'Turquoise',
    'コーラル': 'Coral',
    'ネオンブルー': 'Neon Blue',
    'ネオンレッド': 'Neon Red',
    'その他': 'Other'
  };

  // メーカー選択時に機種リストを更新
  const handleManufacturerChange = (manufacturerValue) => {
    setCurrentItem({
      ...currentItem,
      manufacturer: manufacturerValue,
      console: ''
    });
    
    if (manufacturerValue && gameConsoles[manufacturerValue]) {
      setAvailableConsoles(gameConsoles[manufacturerValue]);
    } else {
      setAvailableConsoles([]);
    }
  };

  // パッケージタイプ選択時の処理
  const handlePackageTypeChange = (packageType) => {
    let includedItems;
    
    if (currentItem.productType === 'console') {
      // ゲーム機本体用
      includedItems = { console: true, software: true, box: false, manual: false, controller: false, charger: false, cables: false, bonusItems: false };
      
      switch(packageType) {
        case 'complete':
          includedItems = { console: true, software: true, box: true, manual: true, controller: true, charger: true, cables: true, bonusItems: false };
          break;
        case 'near_complete':
          includedItems = { console: true, software: true, box: false, manual: false, controller: true, charger: true, cables: true, bonusItems: false };
          break;
        case 'console_only':
          includedItems = { console: true, software: true, box: false, manual: false, controller: false, charger: false, cables: false, bonusItems: false };
          break;
        case 'junk':
          includedItems = { console: true, software: true, box: false, manual: false, controller: false, charger: false, cables: false, bonusItems: false };
          break;
        case 'custom':
          includedItems = currentItem.includedItems;
          break;
        default:
          break;
      }
    } else {
      // ゲームソフト用
      includedItems = { console: true, software: true, box: false, manual: false, controller: false, charger: false, cables: false, bonusItems: false };
      
      switch(packageType) {
        case 'complete':
          includedItems = { console: true, software: true, box: true, manual: true, controller: false, charger: false, cables: false, bonusItems: true };
          break;
        case 'box_manual':
          includedItems = { console: true, software: true, box: true, manual: true, controller: false, charger: false, cables: false, bonusItems: false };
          break;
        case 'software_only':
          includedItems = { console: true, software: true, box: false, manual: false, controller: false, charger: false, cables: false, bonusItems: false };
          break;
        case 'custom':
          includedItems = currentItem.includedItems;
          break;
        default:
          break;
      }
    }
    
    setCurrentItem({
      ...currentItem,
      packageType,
      includedItems
    });
  };

  const handleAddItem = () => {
    // バリデーション
    if (!currentItem.manufacturer || !currentItem.console) {
      alert('Please fill in all required fields');
      return;
    }

    if (currentItem.productType === 'software' && !currentItem.softwareName) {
      alert('Please enter software name');
      return;
    }

    const manufacturerLabelJP = manufacturers.find(m => m.value === currentItem.manufacturer)?.label;
    const manufacturerLabel = manufacturersEN[currentItem.manufacturer] || manufacturerLabelJP;
    const consoleLabelJP = availableConsoles.find(c => c.value === currentItem.console)?.label;
    const consoleLabel = consolesEN[consoleLabelJP] || consoleLabelJP;
    const colorLabel = currentItem.color ? (colorsEN[currentItem.color] || currentItem.color) : '';
    
    const conditionLabels = {
      'brand_new': 'Brand New',
      'like_new': 'Like New',
      'excellent': 'Excellent',
      'good': 'Good',
      'acceptable': 'Acceptable',
      'junk': 'For Parts'
    };
    const conditionLabel = conditionLabels[currentItem.condition] || '';

    const packageTypeLabels = currentItem.productType === 'console' ? {
      'complete': 'Complete Set',
      'near_complete': 'Near Complete',
      'console_only': 'Console Only',
      'junk': 'For Parts',
      'custom': 'Custom'
    } : {
      'complete': 'Complete Set',
      'box_manual': 'Box + Manual',
      'software_only': 'Disc/Cartridge Only',
      'custom': 'Custom'
    };
    const packageTypeLabel = packageTypeLabels[currentItem.packageType] || '';

    const newItem = {
      id: Date.now(),
      ...currentItem,
      productTypeLabel: currentItem.productType === 'console' ? 'Console' : 'Software',
      manufacturerLabel,
      consoleLabel,
      colorLabel,
      conditionLabel,
      packageTypeLabel,
      quotedPrice: 0, // スタッフが後で入力
      availableStock: 0 // スタッフが後で確認
    };

    setItems([...items, newItem]);
    setCurrentItem({ 
      productType: 'console',
      manufacturer: '',
      console: '',
      color: '',
      softwareName: '',
      condition: '',
      packageType: '',
      includedItems: {
        console: true,
        software: true,
        box: false,
        manual: false,
        controller: false,
        charger: false,
        cables: false,
        bonusItems: false
      },
      quantity: 1
    });
    setAvailableConsoles([]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      alert('Please add at least one product');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    const requestData = {
      requestNumber: `REQ-${Date.now()}`,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        country: user.country || 'Japan',
        language: user.language || 'ja'
      },
      items: items,
      notes: notes,
      status: 'pending', // pending → quoted → approved → shipped
      date: new Date().toISOString()
    };

    // salesRequestsに追加
    const salesRequests = JSON.parse(localStorage.getItem('salesRequests') || '[]');
    salesRequests.push(requestData);
    localStorage.setItem('salesRequests', JSON.stringify(salesRequests));

    console.log('リクエストデータ:', requestData);
    
    alert(`Request submitted successfully!\nRequest Number: ${requestData.requestNumber}`);
    setItems([]);
    setNotes('');
    setShowConfirm(false);
  };

  const totalQuantity = items.reduce((sum, item) => sum + parseInt(item.quantity), 0);

  return (
    <div className="sales-request-container">
      <h1>Product Purchase Request</h1>
      <p className="subtitle">Add products you wish to purchase</p>

      <div className="request-form-card">
        <h2>🛒 Product Information</h2>

        {/* 商品タイプ選択 */}
        <div className="form-group">
          <label>📦 Product Type</label>
          <div className="product-type-toggle">
            <button
              className={currentItem.productType === 'console' ? 'active' : ''}
              onClick={() => setCurrentItem({...currentItem, productType: 'console', softwareName: ''})}
            >
              🎮 Game Console
            </button>
            <button
              className={currentItem.productType === 'software' ? 'active' : ''}
              onClick={() => setCurrentItem({...currentItem, productType: 'software', color: ''})}
            >
              💿 Game Software
            </button>
          </div>
        </div>

        {/* メーカー・機種・カラー（横並び） */}
        <div className="form-row-three">
          <div className="form-group">
            <label>🏭 Manufacturer</label>
            <select 
              value={currentItem.manufacturer} 
              onChange={(e) => handleManufacturerChange(e.target.value)}
            >
              <option value="">Please select</option>
              {manufacturers.map(manu => (
                <option key={manu.value} value={manu.value}>
                  {manufacturersEN[manu.value] || manu.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>🎮 Model</label>
            <select 
              value={currentItem.console} 
              onChange={(e) => setCurrentItem({...currentItem, console: e.target.value})}
              disabled={!currentItem.manufacturer}
            >
              <option value="">Please select</option>
              {availableConsoles.map(console => (
                <option key={console.value} value={console.value}>
                  {consolesEN[console.label] || console.label} ({console.year})
                </option>
              ))}
            </select>
          </div>

          {currentItem.productType === 'console' && (
            <div className="form-group form-group-small">
              <label>🎨 Color</label>
              <select 
                value={currentItem.color} 
                onChange={(e) => setCurrentItem({...currentItem, color: e.target.value})}
              >
                <option value="">None</option>
                {colors.map(color => (
                  <option key={color} value={color}>{colorsEN[color] || color}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ソフト名入力（ソフトのみ） */}
        {currentItem.productType === 'software' && (
          <div className="form-group">
            <label>💿 Software Name</label>
            <input 
              type="text" 
              value={currentItem.softwareName}
              onChange={(e) => setCurrentItem({...currentItem, softwareName: e.target.value})}
              placeholder="Ex: Splatoon 3"
            />
          </div>
        )}

        {/* 商品状態 */}
        <div className="form-group">
          <label>📋 Condition</label>
          <select 
            value={currentItem.condition}
            onChange={(e) => setCurrentItem({...currentItem, condition: e.target.value})}
          >
            <option value="">Select condition</option>
            <option value="brand_new">Brand New / Factory Sealed</option>
            <option value="like_new">Like New / Open Box</option>
            <option value="excellent">Excellent / Very Good</option>
            <option value="good">Good / Used - Good</option>
            <option value="acceptable">Acceptable / Fair</option>
            <option value="junk">For Parts / Junk</option>
          </select>
        </div>

        {/* 付属品（ゲーム機本体の場合） */}
        {currentItem.productType === 'console' && (
          <>
            <div className="form-group">
              <label>📦 Included Items</label>
              <select 
                value={currentItem.packageType}
                onChange={(e) => handlePackageTypeChange(e.target.value)}
              >
                <option value="">Select package type</option>
                <option value="complete">Complete Set (Box, Manual, All Accessories)</option>
                <option value="near_complete">Near Complete (No Box/Manual)</option>
                <option value="console_only">Console Only</option>
                <option value="custom">Custom (Select below)</option>
                <option value="junk">For Parts / Junk</option>
              </select>
            </div>

            {/* カスタム選択時のチェックボックス */}
            {currentItem.packageType === 'custom' && (
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.console}
                    disabled
                  />
                  Console (Required)
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.box}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, box: e.target.checked}
                    })}
                  />
                  Original Box
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.manual}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, manual: e.target.checked}
                    })}
                  />
                  Manual / Instructions
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.controller}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, controller: e.target.checked}
                    })}
                  />
                  Controller(s)
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.charger}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, charger: e.target.checked}
                    })}
                  />
                  Charger / AC Adapter
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.cables}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, cables: e.target.checked}
                    })}
                  />
                  Cables (Power/AV/HDMI)
                </label>
              </div>
            )}
          </>
        )}

        {/* 付属品（ゲームソフトの場合） */}
        {currentItem.productType === 'software' && (
          <>
            <div className="form-group">
              <label>📦 Included Items</label>
              <select 
                value={currentItem.packageType}
                onChange={(e) => handlePackageTypeChange(e.target.value)}
              >
                <option value="">Select package type</option>
                <option value="complete">Complete Set (Box, Manual, Bonus Items)</option>
                <option value="box_manual">Box + Manual Only</option>
                <option value="software_only">Disc/Cartridge Only</option>
                <option value="custom">Custom (Select below)</option>
              </select>
            </div>

            {/* カスタム選択時のチェックボックス */}
            {currentItem.packageType === 'custom' && (
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.software}
                    disabled
                  />
                  Disc/Cartridge (Required)
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.box}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, box: e.target.checked}
                    })}
                  />
                  Original Box
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.manual}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, manual: e.target.checked}
                    })}
                  />
                  Manual / Instructions
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={currentItem.includedItems.bonusItems}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      includedItems: {...currentItem.includedItems, bonusItems: e.target.checked}
                    })}
                  />
                  Bonus Items / DLC
                </label>
              </div>
            )}
          </>
        )}

        {/* 数量 */}
        <div className="form-group">
          <label>🔢 Quantity</label>
          <input 
            type="number" 
            min="1"
            value={currentItem.quantity}
            onChange={(e) => setCurrentItem({...currentItem, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
          />
        </div>

        <button 
          className="add-item-button"
          onClick={handleAddItem}
          disabled={!currentItem.manufacturer || !currentItem.console}
        >
          ➕ Add Product
        </button>
      </div>

      {/* 追加された商品リスト */}
      {items.length > 0 && (
        <div className="items-list-card">
          <h2>📋 Requested Products ({totalQuantity} items)</h2>
          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Manufacturer・Model</th>
                  <th>Color</th>
                  <th>Software</th>
                  <th>Condition</th>
                  <th>Package</th>
                  <th>Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className={`type-badge ${item.productType}`}>
                        {item.productType === 'console' ? '🎮' : '💿'}
                      </span>
                    </td>
                    <td>
                      <div className="product-name">
                        {item.manufacturerLabel} / {item.consoleLabel}
                      </div>
                    </td>
                    <td>{item.colorLabel || '-'}</td>
                    <td>{item.softwareName || '-'}</td>
                    <td className="condition-cell">{item.conditionLabel || '-'}</td>
                    <td className="package-cell">{item.packageTypeLabel || '-'}</td>
                    <td className="quantity">{item.quantity}</td>
                    <td>
                      <button 
                        className="remove-button"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 備考欄 */}
          <div className="form-group">
            <label>📝 Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: With box and manual, Preferred delivery date, etc."
              rows="3"
            />
          </div>

          <button className="submit-button" onClick={handleSubmit}>
            📤 Submit Request
          </button>
        </div>
      )}

      {/* 確認モーダル */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 Confirm Purchase Request</h2>
              <button className="modal-close" onClick={() => setShowConfirm(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* 商品リスト */}
              <div className="confirm-section">
                <h3>📦 Requested Products</h3>
                <div className="confirm-items">
                  {items.map(item => (
                    <div key={item.id} className="confirm-item">
                      <span className={`confirm-type-badge ${item.productType}`}>
                        {item.productType === 'console' ? '🎮' : '💿'}
                      </span>
                      <div className="confirm-item-info">
                        <div className="confirm-product-name">
                          {item.manufacturerLabel} {item.consoleLabel}
                        </div>
                        <div className="confirm-product-sub">
                          {item.colorLabel && `Color: ${item.colorLabel}`}
                          {item.softwareName && ` / ${item.softwareName}`}
                          {item.conditionLabel && ` / ${item.conditionLabel}`}
                          {item.packageTypeLabel && ` / ${item.packageTypeLabel}`}
                        </div>
                      </div>
                      <div className="confirm-quantity">
                        ×{item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 備考 */}
              {notes && (
                <div className="confirm-section">
                  <h3>📝 Notes</h3>
                  <div className="confirm-info-box">
                    <p>{notes}</p>
                  </div>
                </div>
              )}

              {/* お客様情報 */}
              <div className="confirm-section">
                <h3>👤 Customer Information</h3>
                <div className="confirm-info-box">
                  <p><strong>{user.name}</strong></p>
                  <p className="confirm-detail">📧 {user.email}</p>
                  {user.phone && <p className="confirm-detail">📞 {user.phone}</p>}
                  {user.country && <p className="confirm-detail">🌍 Country: {user.country}</p>}
                  {user.address && <p className="confirm-detail">📍 {user.address}</p>}
                  {user.postalCode && <p className="confirm-detail">📮 Postal Code: {user.postalCode}</p>}
                  {user.birthDate && <p className="confirm-detail">🎂 Birth Date: {user.birthDate}</p>}
                  {user.occupation && <p className="confirm-detail">💼 Occupation: {user.occupation}</p>}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                Back
              </button>
              <button className="btn-primary-large" onClick={handleConfirmSubmit}>
                ✓ Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesRequest;

