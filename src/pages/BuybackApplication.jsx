import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { manufacturers, gameConsoles, colors, conditions, accessories } from '../data/gameConsoles';
import './BuybackApplication.css';

const BuybackApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 発送方法, 2: 商品登録
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productType: 'console', // 'console' or 'software'
    manufacturer: '',
    console: '',
    color: '', // カラー（任意）
    softwareName: '',
    condition: '',
    accessories: '',
    quantity: 1
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [availableConsoles, setAvailableConsoles] = useState([]);
  
  // 発送方法
  const [shippingInfo, setShippingInfo] = useState({
    shippingMethod: 'kit', // 'kit' or 'own'
    boxSizeLarge: 0,
    boxSizeSmall: 0,
    kitDeliveryDate: '',
    pickupDate: '',
    pickupTime: ''
  });

  // メーカー選択時に機種リストを更新
  const handleManufacturerChange = (manufacturerValue) => {
    setCurrentItem({
      ...currentItem,
      manufacturer: manufacturerValue,
      console: '' // 機種選択をリセット
    });
    
    if (manufacturerValue && gameConsoles[manufacturerValue]) {
      setAvailableConsoles(gameConsoles[manufacturerValue]);
    } else {
      setAvailableConsoles([]);
    }
  };

  const handleAddItem = () => {
    // バリデーション
    if (!currentItem.manufacturer || !currentItem.console || !currentItem.condition) {
      alert('必須項目を入力してください');
      return;
    }

    // ゲーム本体の場合は付属品も必須
    if (currentItem.productType === 'console' && !currentItem.accessories) {
      alert('付属品を選択してください');
      return;
    }

    // ソフトの場合はソフト名も必須
    if (currentItem.productType === 'software' && !currentItem.softwareName) {
      alert('ソフト名を入力してください');
      return;
    }

    const manufacturerLabel = manufacturers.find(m => m.value === currentItem.manufacturer)?.label;
    const consoleLabel = availableConsoles.find(c => c.value === currentItem.console)?.label;
    const conditionLabel = conditions.find(c => c.value === currentItem.condition)?.label;
    const colorLabel = currentItem.color || ''; // カラーは任意なのでラベルも任意
    const accessoriesLabel = currentItem.accessories ? accessories.find(a => a.value === currentItem.accessories)?.label : '';

    const newItem = {
      id: Date.now(),
      ...currentItem,
      productTypeLabel: currentItem.productType === 'console' ? 'ゲーム本体' : 'ゲームソフト',
      manufacturerLabel,
      consoleLabel,
      colorLabel,
      conditionLabel,
      accessoriesLabel
    };

    setItems([...items, newItem]);
    setCurrentItem({ 
      productType: 'console',
      manufacturer: '',
      console: '',
      color: '',
      softwareName: '',
      condition: '',
      accessories: '',
      quantity: 1
    });
    setAvailableConsoles([]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    const status = shippingInfo.shippingMethod === 'kit' ? 'applied' : 'pickup_scheduled';

    const applicationData = {
      applicationNumber: `BUY-${Date.now()}`,
      type: 'detailed',
      status: status,
      customer: {
        name: user.name,
        birthDate: user.birthDate,
        occupation: user.occupation,
        email: user.email,
        phone: user.phone,
        address: user.address,
        postalCode: user.postalCode
      },
      shippingInfo: shippingInfo,
      items: items,
      date: new Date().toISOString()
    };

    // allApplicationsに追加
    const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
    allApplications.push(applicationData);
    localStorage.setItem('allApplications', JSON.stringify(allApplications));

    console.log('申込データ:', applicationData);
    
    alert(`買取申込を受付けました。\n申込番号: ${applicationData.applicationNumber}`);
    
    // ホーム画面に戻る
    navigate('/');
  };

  const validateShippingInfo = () => {
    if (shippingInfo.shippingMethod === 'kit') {
      if (shippingInfo.boxSizeLarge === 0 && shippingInfo.boxSizeSmall === 0) {
        alert('ダンボールを少なくとも1枚以上選択してください');
        return false;
      }
      if (!shippingInfo.kitDeliveryDate) {
        alert('キット配送希望日を選択してください');
        return false;
      }
    } else if (shippingInfo.shippingMethod === 'own') {
      if (!shippingInfo.pickupDate) {
        alert('集荷希望日を選択してください');
        return false;
      }
      if (!shippingInfo.pickupTime) {
        alert('集荷希望時間帯を選択してください');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateShippingInfo()) {
      return;
    }
    setStep(2);
  };

  const totalQuantity = items.reduce((sum, item) => sum + parseInt(item.quantity), 0);

  return (
    <div className="buyback-container">
      <div className="page-header-with-back">
        <h1>ゲーム機買取申込</h1>
        {step === 2 && (
          <button onClick={() => setStep(1)} className="back-button-header">
            ← 発送方法に戻る
          </button>
        )}
      </div>
      <p className="subtitle">
        {step === 1 && '発送方法を選択してください'}
        {step === 2 && 'お売りいただける商品を入力してください'}
      </p>

      {step === 1 && (
        <>
          <div className="form-section">
            <h2>📦 発送方法の選択</h2>
            
            <div className="simple-form">
              <div className="form-group-full">
                <label className="section-label">
                  <span className="label-icon">📦</span>
                  <span>発送方法をお選びください *</span>
                </label>
                <div className="radio-group-vertical">
                  <label className="radio-label-block">
                    <input
                      type="radio"
                      value="kit"
                      checked={shippingInfo.shippingMethod === 'kit'}
                      onChange={(e) => setShippingInfo({...shippingInfo, shippingMethod: e.target.value})}
                    />
                    <div className="radio-content">
                      <strong>📮 無料宅配キットを送ってほしい</strong>
                      <span className="radio-desc">ダンボールと緩衝材を無料でお届けします</span>
                    </div>
                  </label>

                  {shippingInfo.shippingMethod === 'kit' && (
                    <div className="nested-form kit-form">
                      <p className="nested-form-title">📏 ダンボールサイズと枚数</p>
                      <div className="form-row">
                        <div className="form-group">
                          <label>🔳 大サイズ（枚数）</label>
                          <input
                            type="number"
                            min="0"
                            value={shippingInfo.boxSizeLarge}
                            onChange={(e) => setShippingInfo({...shippingInfo, boxSizeLarge: parseInt(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>
                        <div className="form-group">
                          <label>🔲 小サイズ（枚数）</label>
                          <input
                            type="number"
                            min="0"
                            value={shippingInfo.boxSizeSmall}
                            onChange={(e) => setShippingInfo({...shippingInfo, boxSizeSmall: parseInt(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>📅 キット配送希望日 *</label>
                        <input
                          type="date"
                          value={shippingInfo.kitDeliveryDate}
                          onChange={(e) => setShippingInfo({...shippingInfo, kitDeliveryDate: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <label className="radio-label-block">
                    <input
                      type="radio"
                      value="own"
                      checked={shippingInfo.shippingMethod === 'own'}
                      onChange={(e) => setShippingInfo({...shippingInfo, shippingMethod: e.target.value})}
                    />
                    <div className="radio-content">
                      <strong>📦 自分で箱を用意する</strong>
                      <span className="radio-desc bonus">🎁 査定額500円アップ！</span>
                    </div>
                  </label>

                  {shippingInfo.shippingMethod === 'own' && (
                    <div className="nested-form own-form">
                      <p className="nested-form-title bonus-title">🎁 500円ボーナス対象</p>
                      <div className="form-group">
                        <label>📅 集荷希望日 *</label>
                        <input
                          type="date"
                          value={shippingInfo.pickupDate}
                          onChange={(e) => setShippingInfo({...shippingInfo, pickupDate: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>🕐 集荷希望時間帯 *</label>
                        <select
                          value={shippingInfo.pickupTime}
                          onChange={(e) => setShippingInfo({...shippingInfo, pickupTime: e.target.value})}
                        >
                          <option value="">選択してください</option>
                          <option value="morning">☀️ 午前中（9-12時）</option>
                          <option value="12-14">🕐 12-14時</option>
                          <option value="14-16">🕑 14-16時</option>
                          <option value="16-18">🕔 16-18時</option>
                          <option value="18-20">🕕 18-20時</option>
                          <option value="19-21">🌙 19-21時</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleNextStep} className="submit-button detailed-next">
                次へ：商品登録 →
              </button>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          
          <div className="form-section">
        <h2>📝 商品登録</h2>
        
        <div className="product-type-section detailed-section">
          <label className="section-label-small">
            <span className="label-icon-small">🎮</span>
            <span>STEP 1: 商品タイプ *</span>
          </label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="console"
                checked={currentItem.productType === 'console'}
                onChange={(e) => setCurrentItem({...currentItem, productType: e.target.value, softwareName: ''})}
              />
              <span>ゲーム本体</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="software"
                checked={currentItem.productType === 'software'}
                onChange={(e) => setCurrentItem({...currentItem, productType: e.target.value})}
              />
              <span>ゲームソフト</span>
            </label>
          </div>
        </div>

        <div className="detailed-select-section">
          <label className="section-label-small">
            <span className="label-icon-small">🏢</span>
            <span>STEP 2: 商品の詳細を入力してください *</span>
          </label>
          
          <div className="product-select">
            <div className="form-group manufacturer-field">
              <label>🏭 メーカー *</label>
              <select 
                value={currentItem.manufacturer} 
                onChange={(e) => handleManufacturerChange(e.target.value)}
              >
                <option value="">選択してください</option>
                {manufacturers.map(mfr => (
                  <option key={mfr.value} value={mfr.value}>{mfr.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>🎮 ゲーム機種 *</label>
              <select 
                value={currentItem.console} 
                onChange={(e) => setCurrentItem({...currentItem, console: e.target.value})}
                disabled={!currentItem.manufacturer}
              >
                <option value="">選択してください</option>
                {availableConsoles.map(console => (
                  <option key={console.value} value={console.value}>{console.label}</option>
                ))}
              </select>
            </div>

            {currentItem.productType === 'console' && (
              <div className="form-group color-field">
                <label>🎨 カラー（任意）</label>
                <select 
                  value={currentItem.color} 
                  onChange={(e) => setCurrentItem({...currentItem, color: e.target.value})}
                >
                  <option value="">選択しない</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group condition-field">
              <label>⭐ 状態 *</label>
              <select value={currentItem.condition} onChange={(e) => setCurrentItem({...currentItem, condition: e.target.value})}>
                <option value="">選択してください</option>
                {conditions.map(condition => (
                  <option key={condition.value} value={condition.value}>{condition.label}</option>
                ))}
              </select>
            </div>

            {currentItem.productType === 'console' && (
              <div className="form-group accessories-field">
                <label>📦 付属品 *</label>
                <select value={currentItem.accessories} onChange={(e) => setCurrentItem({...currentItem, accessories: e.target.value})}>
                  <option value="">選択してください</option>
                  {accessories.map(accessory => (
                    <option key={accessory.value} value={accessory.value}>{accessory.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group quantity-field">
              <label>🔢 数量</label>
              <input 
                type="number" 
                min="1" 
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          {currentItem.productType === 'software' && (
            <div className="software-name-section">
              <div className="form-group form-group-full-width">
                <label>💿 ソフト名 *</label>
                <input
                  type="text"
                  value={currentItem.softwareName}
                  onChange={(e) => setCurrentItem({...currentItem, softwareName: e.target.value})}
                  placeholder="例: ゼルダの伝説 ティアーズ オブ ザ キングダム"
                />
              </div>
            </div>
          )}

          <button onClick={handleAddItem} className="add-button">
            ➕ 商品を追加
          </button>
        </div>
      </div>

      <div className="form-section">
        <div className="list-header">
          <h2>📋 買取リスト</h2>
          {items.length > 0 && (
            <span className="item-count-badge">{items.length}点の商品</span>
          )}
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>商品が追加されていません</p>
          </div>
        ) : (
          <div className="buyback-list">
            {items.map(item => (
              <div key={item.id} className="buyback-item">
                <div className="item-details">
                  <span className="item-type-badge">{item.productTypeLabel}</span>
                  {item.productType === 'software' ? (
                    <>
                      <h4>{item.softwareName}</h4>
                      <p className="console-info">{item.manufacturerLabel} - {item.consoleLabel}</p>
                    </>
                  ) : (
                    <>
                      <h4>{item.manufacturerLabel} - {item.consoleLabel}</h4>
                      {item.colorLabel && <p className="color-info">カラー: {item.colorLabel}</p>}
                    </>
                  )}
                  <p>
                    状態: {item.conditionLabel}
                    {item.productType === 'console' && item.accessoriesLabel && ` / 付属品: ${item.accessoriesLabel}`}
                    {' / 数量: '}{item.quantity}点
                  </p>
                </div>
                <button onClick={() => handleRemoveItem(item.id)} className="remove-button">削除</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="submit-section">
          <button onClick={() => setShowConfirm(true)} className="submit-button detailed-submit">
            ✅ 申込内容を確認する
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="modal">
          <div className="modal-content-compact">
            <div className="modal-header">
              <h2>📋 買取申込内容の確認</h2>
              <button className="modal-close" onClick={() => setShowConfirm(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* 商品リスト */}
              <div className="confirm-section">
                <h3>🎮 買取商品（{items.length}点）</h3>
                <div className="confirm-items">
                  {items.map(item => (
                    <div key={item.id} className="confirm-item">
                      <div className="confirm-item-main">
                        <span className="confirm-type-badge">
                          {item.productType === 'console' ? '🎮' : '💿'}
                        </span>
                        <div className="confirm-item-info">
                          {item.productType === 'software' ? (
                            <>
                              <div className="confirm-product-name">{item.softwareName}</div>
                              <div className="confirm-product-sub">{item.manufacturerLabel} - {item.consoleLabel}</div>
                            </>
                          ) : (
                            <>
                              <div className="confirm-product-name">{item.consoleLabel}</div>
                              <div className="confirm-product-sub">
                                {item.manufacturerLabel}
                                {item.colorLabel && ` · ${item.colorLabel}`}
                                {item.accessoriesLabel && ` · ${item.accessoriesLabel}`}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="confirm-item-details">
                        <span className="confirm-condition">{item.conditionLabel}</span>
                        <span className="confirm-quantity">×{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="confirm-total">
                  合計 <strong>{totalQuantity}点</strong>
                </div>
              </div>

              {/* 発送情報とお客様情報を2カラムで */}
              <div className="confirm-grid">
                <div className="confirm-section">
                  <h3>📦 発送方法</h3>
                  <div className="confirm-info-box">
                    <p>
                      {shippingInfo.shippingMethod === 'kit' 
                        ? `📮 無料宅配キット` 
                        : '📦 自分で用意'}
                    </p>
                    {shippingInfo.shippingMethod === 'kit' && (
                      <p className="confirm-detail">
                        大: {shippingInfo.boxSizeLarge}枚 / 小: {shippingInfo.boxSizeSmall}枚
                      </p>
                    )}
                  </div>
                </div>

                <div className="confirm-section">
                  <h3>👤 お客様情報</h3>
                  <div className="confirm-info-box">
                    <p><strong>{user.name}</strong></p>
                    {user.birthDate && (
                      <p className="confirm-detail">🎂 生年月日: {user.birthDate}</p>
                    )}
                    {user.occupation && (
                      <p className="confirm-detail">💼 職業: {user.occupation}</p>
                    )}
                    <p className="confirm-detail">📧 {user.email}</p>
                    <p className="confirm-detail">📞 {user.phone}</p>
                    <p className="confirm-detail">📍 {user.postalCode} {user.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">
                ← 戻って修正
              </button>
              <button onClick={handleSubmit} className="btn-primary-large">
                ✓ この内容で申込を確定する
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default BuybackApplication;