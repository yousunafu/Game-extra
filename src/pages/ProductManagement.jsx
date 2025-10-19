import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { manufacturers } from '../data/gameConsoles';
import { 
  getAllConsoles, 
  getCustomConsoles,
  suggestNextConsoleCode, 
  addNewConsole, 
  updateConsole, 
  deleteConsole,
  isCustomConsole 
} from '../utils/productMaster';
import './ProductManagement.css';

const ProductManagement = () => {
  const { isAdmin, isManager } = useAuth();
  const [allConsoles, setAllConsoles] = useState({});
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsole, setEditingConsole] = useState(null);
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    labelEn: '',
    year: new Date().getFullYear(),
    codeNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConsoles();
  }, []);

  const loadConsoles = () => {
    const consoles = getAllConsoles();
    setAllConsoles(consoles);
  };

  const handleOpenAddModal = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    const suggestedCode = suggestNextConsoleCode(manufacturer);
    setFormData({
      value: '',
      label: '',
      labelEn: '',
      year: new Date().getFullYear(),
      codeNumber: suggestedCode
    });
    setError('');
    setSuccess('');
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      value: '',
      label: '',
      labelEn: '',
      year: new Date().getFullYear(),
      codeNumber: ''
    });
    setError('');
  };

  const handleOpenEditModal = (manufacturer, console) => {
    if (!isCustomConsole(manufacturer, console.value)) {
      alert('デフォルト機種は編集できません。カスタム追加された機種のみ編集可能です。');
      return;
    }
    
    setSelectedManufacturer(manufacturer);
    setEditingConsole(console);
    
    // valueから番号部分を抽出
    const match = console.value.match(/(\d+)$/);
    const codeNumber = match ? match[1] : '';
    
    setFormData({
      value: console.value,
      label: console.label,
      labelEn: console.labelEn || '',
      year: console.year,
      codeNumber: codeNumber
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingConsole(null);
    setFormData({
      value: '',
      label: '',
      labelEn: '',
      year: new Date().getFullYear(),
      codeNumber: ''
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ラベルから自動でvalueを生成
  const handleLabelChange = (e) => {
    const label = e.target.value;
    setFormData(prev => ({
      ...prev,
      label: label,
      // valueを自動生成（小文字、スペース→ハイフン）
      value: label
        .toLowerCase()
        .replace(/[\s　]+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/--+/g, '-')
        .trim()
    }));
  };

  const validateForm = () => {
    if (!formData.label || !formData.year || !formData.codeNumber) {
      setError('必須項目を入力してください');
      return false;
    }

    if (formData.year < 1980 || formData.year > 2100) {
      setError('発売年は1980〜2100の範囲で入力してください');
      return false;
    }

    return true;
  };

  const handleAddConsole = () => {
    if (!validateForm()) return;

    const newConsole = {
      value: formData.value || `custom-${Date.now()}`,
      label: formData.label,
      labelEn: formData.labelEn,
      year: parseInt(formData.year),
      codeNumber: formData.codeNumber
    };

    const result = addNewConsole(selectedManufacturer, newConsole);
    
    if (result.success) {
      setSuccess(`機種「${formData.label}」を追加しました`);
      loadConsoles();
      handleCloseAddModal();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleUpdateConsole = () => {
    if (!validateForm()) return;

    const updatedConsole = {
      value: formData.value,
      label: formData.label,
      labelEn: formData.labelEn,
      year: parseInt(formData.year),
      codeNumber: formData.codeNumber
    };

    const result = updateConsole(selectedManufacturer, editingConsole.value, updatedConsole);
    
    if (result.success) {
      setSuccess(`機種「${formData.label}」を更新しました`);
      loadConsoles();
      handleCloseEditModal();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleDeleteConsole = (manufacturer, console) => {
    if (!isCustomConsole(manufacturer, console.value)) {
      alert('デフォルト機種は削除できません。カスタム追加された機種のみ削除可能です。');
      return;
    }

    if (!confirm(`機種「${console.label}」を削除しますか？\n※在庫で使用されている場合は削除できません。`)) {
      return;
    }

    const result = deleteConsole(manufacturer, console.value);
    
    if (result.success) {
      setSuccess(`機種「${console.label}」を削除しました`);
      loadConsoles();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      alert(result.error);
    }
  };

  const getFilteredConsoles = (manufacturer) => {
    const consoles = allConsoles[manufacturer] || [];
    if (!searchTerm) return consoles;
    
    return consoles.filter(c => 
      c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getManufacturerLabel = (value) => {
    return manufacturers.find(m => m.value === value)?.label || value;
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="product-management-container">
        <div className="unauthorized-message">
          <h1>⚠️ アクセス権限がありません</h1>
          <p>この画面は管理者・マネージャーのみアクセス可能です</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management-container">
      <div className="page-header">
        <h1>🎮 商品マスタ管理</h1>
        <p>取り扱い機種の追加・編集・削除</p>
      </div>

      {success && <div className="success-message">{success}</div>}

      <div className="search-section">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 機種名で検索..."
          className="search-input"
        />
      </div>

      <div className="manufacturers-grid">
        {manufacturers.map(mfr => {
          const consoles = getFilteredConsoles(mfr.value);
          const customCount = consoles.filter(c => c.custom).length;
          
          return (
            <div key={mfr.value} className="manufacturer-section">
              <div className="manufacturer-header">
                <div className="manufacturer-title">
                  <h2>{mfr.label}</h2>
                  <span className="console-count">
                    {consoles.length}機種
                    {customCount > 0 && <span className="custom-count">（+{customCount}）</span>}
                  </span>
                </div>
                <button 
                  className="btn-add-console" 
                  onClick={() => handleOpenAddModal(mfr.value)}
                >
                  ➕ 追加
                </button>
              </div>

              <div className="console-list">
                {consoles.length === 0 ? (
                  <div className="empty-console-list">機種が登録されていません</div>
                ) : (
                  consoles.map(console => (
                    <div 
                      key={console.value} 
                      className={`console-item ${console.custom ? 'custom' : 'default'}`}
                    >
                      <div className="console-info">
                        <div className="console-name">
                          {console.label}
                          {console.custom && <span className="custom-badge">追加</span>}
                        </div>
                        <div className="console-meta">
                          <span className="console-code">{console.value}</span>
                          <span className="console-year">{console.year}年</span>
                        </div>
                      </div>
                      {console.custom && (
                        <div className="console-actions">
                          <button 
                            className="btn-edit" 
                            onClick={() => handleOpenEditModal(mfr.value, console)}
                            title="編集"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteConsole(mfr.value, console)}
                            title="削除"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>新規機種を追加 - {getManufacturerLabel(selectedManufacturer)}</h2>
              <button className="modal-close" onClick={handleCloseAddModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>機種名（日本語）*</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleLabelChange}
                  placeholder="例: Nintendo Switch 2"
                />
              </div>

              <div className="form-group">
                <label>機種名（英語・任意）</label>
                <input
                  type="text"
                  name="labelEn"
                  value={formData.labelEn}
                  onChange={handleChange}
                  placeholder="例: Nintendo Switch 2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>発売年 *</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1980"
                    max="2100"
                  />
                </div>

                <div className="form-group">
                  <label>機種コード番号 *</label>
                  <input
                    type="text"
                    name="codeNumber"
                    value={formData.codeNumber}
                    onChange={handleChange}
                    placeholder="01"
                    maxLength="2"
                    className="code-input"
                  />
                  <small className="hint">2桁の番号（自動提案済み）</small>
                </div>
              </div>

              <div className="form-group">
                <label>機種ID（自動生成）</label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="自動生成されます"
                  className="value-input"
                />
                <small className="hint">機種名から自動生成されます（編集可）</small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCloseAddModal}>
                  キャンセル
                </button>
                <button className="btn-primary" onClick={handleAddConsole}>
                  ✓ 追加する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && editingConsole && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>機種を編集 - {getManufacturerLabel(selectedManufacturer)}</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>機種名（日本語）*</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="例: Nintendo Switch 2"
                />
              </div>

              <div className="form-group">
                <label>機種名（英語・任意）</label>
                <input
                  type="text"
                  name="labelEn"
                  value={formData.labelEn}
                  onChange={handleChange}
                  placeholder="例: Nintendo Switch 2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>発売年 *</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1980"
                    max="2100"
                  />
                </div>

                <div className="form-group">
                  <label>機種コード番号 *</label>
                  <input
                    type="text"
                    name="codeNumber"
                    value={formData.codeNumber}
                    onChange={handleChange}
                    placeholder="01"
                    maxLength="2"
                    className="code-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>機種ID</label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="switch-2"
                  className="value-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCloseEditModal}>
                  キャンセル
                </button>
                <button className="btn-primary" onClick={handleUpdateConsole}>
                  ✓ 更新する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

