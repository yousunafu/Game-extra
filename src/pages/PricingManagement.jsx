import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { manufacturers } from '../data/gameConsoles';
import { getAllConsoles } from '../utils/productMaster';
import { generateProductCode } from '../utils/productCodeGenerator';
import {
  getAllBasePrices,
  setAllBasePrice,
  getAllBuyerAdjustments,
  setBuyerAdjustment,
  deleteBuyerAdjustment,
  calculateBuyerPrice,
  getAllBuyers
} from '../utils/priceCalculator';
import './PricingManagement.css';

const PricingManagement = () => {
  const { isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('base'); // 'base' or 'buyer'
  
  // 基準価格タブ
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedConsole, setSelectedConsole] = useState('');
  const [availableConsoles, setAvailableConsoles] = useState([]);
  const [basePriceForm, setBasePriceForm] = useState({
    S: 0,
    A: 0,
    B: 0,
    C: 0
  });
  const [allBasePrices, setAllBasePrices] = useState({});
  
  // バイヤー調整タブ
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [adjustmentManufacturer, setAdjustmentManufacturer] = useState('');
  const [adjustmentConsole, setAdjustmentConsole] = useState('');
  const [adjustmentConsoles, setAdjustmentConsoles] = useState([]);
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'percentage', // 'percentage' or 'fixed'
    value: '',
    rank: 'all' // 'all', 'S', 'A', 'B', 'C'
  });
  const [buyerAdjustments, setBuyerAdjustments] = useState({});
  
  const [allGameConsoles, setAllGameConsoles] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAllGameConsoles(getAllConsoles());
    setAllBasePrices(getAllBasePrices());
    setBuyers(getAllBuyers());
  }, []);

  // 基準価格：メーカー選択時
  const handleManufacturerChange = (value) => {
    setSelectedManufacturer(value);
    setSelectedConsole('');
    
    if (value && allGameConsoles[value]) {
      setAvailableConsoles(allGameConsoles[value]);
    } else {
      setAvailableConsoles([]);
    }
  };

  // 基準価格：機種選択時
  const handleConsoleChange = (value) => {
    setSelectedConsole(value);
    
    // 機種コードを生成
    const productCode = generateProductCode(selectedManufacturer, value, 'console');
    
    // 既存の基準価格を読み込み
    const existingPrices = allBasePrices[productCode] || { S: 0, A: 0, B: 0, C: 0 };
    setBasePriceForm(existingPrices);
  };

  // 基準価格：保存
  const handleSaveBasePrice = () => {
    if (!selectedManufacturer || !selectedConsole) {
      setError('メーカーと機種を選択してください');
      return;
    }

    const productCode = generateProductCode(selectedManufacturer, selectedConsole, 'console');
    setAllBasePrice(productCode, basePriceForm);
    
    // 状態を更新
    setAllBasePrices(getAllBasePrices());
    setSuccess(`基準価格を保存しました（${productCode}）`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // バイヤー調整：バイヤー選択時
  const handleBuyerChange = (email) => {
    setSelectedBuyer(email);
    setBuyerAdjustments(getAllBuyerAdjustments(email));
  };

  // バイヤー調整：メーカー選択時
  const handleAdjustmentManufacturerChange = (value) => {
    setAdjustmentManufacturer(value);
    setAdjustmentConsole('');
    
    if (value && allGameConsoles[value]) {
      setAdjustmentConsoles(allGameConsoles[value]);
    } else {
      setAdjustmentConsoles([]);
    }
  };

  // バイヤー調整：適用
  const handleApplyAdjustment = () => {
    if (!selectedBuyer) {
      setError('バイヤーを選択してください');
      return;
    }
    
    if (!adjustmentManufacturer || !adjustmentConsole) {
      setError('機種を選択してください');
      return;
    }
    
    // valueを数値に変換
    const numValue = parseFloat(adjustmentForm.value);
    if (isNaN(numValue)) {
      setError('調整値を入力してください');
      return;
    }

    const productCode = generateProductCode(adjustmentManufacturer, adjustmentConsole, 'console');
    
    // 数値に変換したadjustmentFormを保存
    setBuyerAdjustment(selectedBuyer, productCode, {
      ...adjustmentForm,
      value: numValue
    });
    setBuyerAdjustments(getAllBuyerAdjustments(selectedBuyer));
    
    setSuccess('価格調整を適用しました');
    setTimeout(() => setSuccess(''), 3000);
    
    // フォームリセット
    setAdjustmentManufacturer('');
    setAdjustmentConsole('');
    setAdjustmentForm({
      type: 'percentage',
      value: '',
      rank: 'all'
    });
  };

  // バイヤー調整：削除
  const handleDeleteAdjustment = (productCode) => {
    if (!confirm('この価格調整を削除しますか？')) return;
    
    deleteBuyerAdjustment(selectedBuyer, productCode);
    setBuyerAdjustments(getAllBuyerAdjustments(selectedBuyer));
    setSuccess('価格調整を削除しました');
    setTimeout(() => setSuccess(''), 3000);
  };

  // 機種コードから機種情報を取得
  const getConsoleInfo = (productCode) => {
    // 全機種から検索
    for (const mfr of manufacturers) {
      const consoles = allGameConsoles[mfr.value] || [];
      for (const console of consoles) {
        const code = generateProductCode(mfr.value, console.value, 'console');
        if (code === productCode) {
          return {
            manufacturer: mfr.label,
            console: console.label
          };
        }
      }
    }
    return { manufacturer: '不明', console: '不明' };
  };

  // 調整の説明文を生成
  const getAdjustmentDescription = (adjustment) => {
    let desc = '';
    
    if (adjustment.type === 'percentage') {
      desc = `${adjustment.value > 0 ? '+' : ''}${adjustment.value}%`;
    } else {
      desc = `${adjustment.value > 0 ? '+' : ''}¥${Math.abs(adjustment.value).toLocaleString()}`;
    }
    
    if (adjustment.rank !== 'all') {
      desc += ` (${adjustment.rank}ランクのみ)`;
    }
    
    return desc;
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="pricing-management-container">
        <div className="unauthorized-message">
          <h1>⚠️ アクセス権限がありません</h1>
          <p>この画面は管理者・マネージャーのみアクセス可能です</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-management-container">
      <div className="page-header">
        <h1>💰 価格管理</h1>
        <p>基準価格の設定とバイヤー別価格調整</p>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* タブ切り替え */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'base' ? 'active' : ''}`}
          onClick={() => setActiveTab('base')}
        >
          📊 基準価格設定
        </button>
        <button
          className={`tab-btn ${activeTab === 'buyer' ? 'active' : ''}`}
          onClick={() => setActiveTab('buyer')}
        >
          🎯 バイヤー別価格調整
        </button>
      </div>

      {/* タブ1: 基準価格設定 */}
      {activeTab === 'base' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>📊 機種別基準価格設定</h2>
            <p className="section-description">各機種のランク別基準価格を設定します</p>
          </div>

          <div className="base-price-form">
            <div className="form-row">
              <div className="form-group">
                <label>メーカー *</label>
                <select
                  value={selectedManufacturer}
                  onChange={(e) => handleManufacturerChange(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {manufacturers.map(mfr => (
                    <option key={mfr.value} value={mfr.value}>{mfr.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>機種 *</label>
                <select
                  value={selectedConsole}
                  onChange={(e) => handleConsoleChange(e.target.value)}
                  disabled={!selectedManufacturer}
                >
                  <option value="">選択してください</option>
                  {availableConsoles.map(console => (
                    <option key={console.value} value={console.value}>
                      {console.label} ({console.year}年)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedConsole && (
              <div className="price-inputs-section">
                <h3>ランク別基準価格</h3>
                <div className="price-inputs-grid">
                  <div className="price-input-item rank-s">
                    <label>Sランク（極美品）</label>
                    <div className="input-with-unit">
                      <span className="unit">¥</span>
                      <input
                        type="number"
                        value={basePriceForm.S}
                        onChange={(e) => setBasePriceForm({...basePriceForm, S: parseInt(e.target.value) || 0})}
                        placeholder="28000"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="price-input-item rank-a">
                    <label>Aランク（美品）</label>
                    <div className="input-with-unit">
                      <span className="unit">¥</span>
                      <input
                        type="number"
                        value={basePriceForm.A}
                        onChange={(e) => setBasePriceForm({...basePriceForm, A: parseInt(e.target.value) || 0})}
                        placeholder="25000"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="price-input-item rank-b">
                    <label>Bランク（良品）</label>
                    <div className="input-with-unit">
                      <span className="unit">¥</span>
                      <input
                        type="number"
                        value={basePriceForm.B}
                        onChange={(e) => setBasePriceForm({...basePriceForm, B: parseInt(e.target.value) || 0})}
                        placeholder="20000"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="price-input-item rank-c">
                    <label>Cランク（難あり）</label>
                    <div className="input-with-unit">
                      <span className="unit">¥</span>
                      <input
                        type="number"
                        value={basePriceForm.C}
                        onChange={(e) => setBasePriceForm({...basePriceForm, C: parseInt(e.target.value) || 0})}
                        placeholder="15000"
                        step="100"
                      />
                    </div>
                  </div>
                </div>

                <button className="btn-save-price" onClick={handleSaveBasePrice}>
                  ✓ 基準価格を保存
                </button>
              </div>
            )}
          </div>

          {/* 設定済み基準価格一覧 */}
          <div className="base-price-list-section">
            <h2>設定済み基準価格一覧</h2>
            {Object.keys(allBasePrices).length === 0 ? (
              <div className="empty-state">基準価格が設定されていません</div>
            ) : (
              <div className="base-price-cards">
                {Object.entries(allBasePrices).map(([productCode, prices]) => {
                  const info = getConsoleInfo(productCode);
                  return (
                    <div key={productCode} className="base-price-card">
                      <div className="card-header">
                        <h3>{info.manufacturer} - {info.console}</h3>
                        <span className="product-code-badge">{productCode}</span>
                      </div>
                      <div className="price-grid">
                        <div className="price-item">
                          <span className="rank-label rank-s">S</span>
                          <span className="price-value">¥{prices.S?.toLocaleString() || 0}</span>
                        </div>
                        <div className="price-item">
                          <span className="rank-label rank-a">A</span>
                          <span className="price-value">¥{prices.A?.toLocaleString() || 0}</span>
                        </div>
                        <div className="price-item">
                          <span className="rank-label rank-b">B</span>
                          <span className="price-value">¥{prices.B?.toLocaleString() || 0}</span>
                        </div>
                        <div className="price-item">
                          <span className="rank-label rank-c">C</span>
                          <span className="price-value">¥{prices.C?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* タブ2: バイヤー別価格調整 */}
      {activeTab === 'buyer' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>🎯 バイヤー別価格調整</h2>
            <p className="section-description">特定のバイヤーに対して価格を調整できます</p>
          </div>

          <div className="buyer-adjustment-form">
            <div className="form-group">
              <label>バイヤー選択 *</label>
              <select
                value={selectedBuyer}
                onChange={(e) => handleBuyerChange(e.target.value)}
              >
                <option value="">選択してください</option>
                {buyers.map(buyer => (
                  <option key={buyer.email} value={buyer.email}>
                    {buyer.name} ({buyer.country || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {selectedBuyer && (
              <>
                <div className="adjustment-input-section">
                  <h3>新規調整を追加</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>メーカー *</label>
                      <select
                        value={adjustmentManufacturer}
                        onChange={(e) => handleAdjustmentManufacturerChange(e.target.value)}
                      >
                        <option value="">選択してください</option>
                        {manufacturers.map(mfr => (
                          <option key={mfr.value} value={mfr.value}>{mfr.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>機種 *</label>
                      <select
                        value={adjustmentConsole}
                        onChange={(e) => setAdjustmentConsole(e.target.value)}
                        disabled={!adjustmentManufacturer}
                      >
                        <option value="">選択してください</option>
                        {adjustmentConsoles.map(console => (
                          <option key={console.value} value={console.value}>
                            {console.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>対象ランク *</label>
                      <select
                        value={adjustmentForm.rank}
                        onChange={(e) => setAdjustmentForm({...adjustmentForm, rank: e.target.value})}
                      >
                        <option value="all">全ランク</option>
                        <option value="S">Sランクのみ</option>
                        <option value="A">Aランクのみ</option>
                        <option value="B">Bランクのみ</option>
                        <option value="C">Cランクのみ</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>調整方法 *</label>
                      <select
                        value={adjustmentForm.type}
                        onChange={(e) => setAdjustmentForm({...adjustmentForm, type: e.target.value})}
                      >
                        <option value="percentage">パーセント（%）</option>
                        <option value="fixed">固定額（円）</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      {adjustmentForm.type === 'percentage' ? '調整率（%）*' : '調整額（円）*'}
                    </label>
                    <div className="adjustment-value-input">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={adjustmentForm.value}
                        onChange={(e) => setAdjustmentForm({...adjustmentForm, value: e.target.value})}
                        placeholder={adjustmentForm.type === 'percentage' ? '例: 10 または -5' : '例: 3000 または -2000'}
                        step={adjustmentForm.type === 'percentage' ? '0.1' : '100'}
                      />
                      <span className="unit-label">
                        {adjustmentForm.type === 'percentage' ? '%' : '円'}
                      </span>
                    </div>
                    <small className="hint">
                      プラス値で値上げ、マイナス値で値下げ（キーボードで直接入力できます）
                    </small>
                  </div>

                  <button className="btn-apply-adjustment" onClick={handleApplyAdjustment}>
                    ✓ 調整を適用
                  </button>
                </div>

                {/* 現在の調整設定 */}
                <div className="current-adjustments-section">
                  <h3>現在の調整設定</h3>
                  {Object.keys(buyerAdjustments).length === 0 ? (
                    <div className="empty-state">調整設定がありません</div>
                  ) : (
                    <div className="adjustment-list">
                      {Object.entries(buyerAdjustments).map(([productCode, adjustment]) => {
                        const info = getConsoleInfo(productCode);
                        return (
                          <div key={productCode} className="adjustment-item">
                            <div className="adjustment-info">
                              <div className="product-name">
                                {info.manufacturer} - {info.console}
                              </div>
                              <div className="adjustment-details">
                                <span className="product-code">{productCode}</span>
                                <span className="adjustment-value">
                                  {getAdjustmentDescription(adjustment)}
                                </span>
                              </div>
                            </div>
                            <div className="adjustment-actions">
                              <button
                                className="btn-delete-adjustment"
                                onClick={() => handleDeleteAdjustment(productCode)}
                              >
                                🗑️ 削除
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* バイヤー別価格プレビュー */}
                {Object.keys(allBasePrices).length > 0 && (
                  <div className="price-preview-section">
                    <h3>💵 価格プレビュー（このバイヤー向け）</h3>
                    <div className="price-preview-grid">
                      {Object.entries(allBasePrices).map(([productCode, prices]) => {
                        const info = getConsoleInfo(productCode);
                        const hasAdjustment = buyerAdjustments[productCode];
                        
                        return (
                          <div key={productCode} className={`price-preview-card ${hasAdjustment ? 'has-adjustment' : ''}`}>
                            <div className="preview-card-header">
                              <div>
                                <h4>{info.console}</h4>
                                <span className="preview-manufacturer">{info.manufacturer}</span>
                              </div>
                              <span className="product-code-small">{productCode}</span>
                            </div>
                            <div className="preview-prices">
                              {['S', 'A', 'B', 'C'].map(rank => {
                                const calc = calculateBuyerPrice(productCode, rank, selectedBuyer);
                                const isAdjusted = calc.finalPrice !== calc.basePrice;
                                
                                return (
                                  <div key={rank} className={`preview-price-row ${isAdjusted ? 'adjusted' : ''}`}>
                                    <span className={`rank-tag rank-${rank.toLowerCase()}`}>{rank}</span>
                                    <div className="price-comparison">
                                      {isAdjusted && (
                                        <span className="base-price-small">¥{calc.basePrice.toLocaleString()}</span>
                                      )}
                                      <span className="final-price">¥{calc.finalPrice.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;

