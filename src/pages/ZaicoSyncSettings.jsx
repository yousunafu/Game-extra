import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ZaicoSyncManager from '../components/ZaicoSyncManager';
import { callZaicoApi } from '../utils/zaicoApi';
import './ZaicoSyncSettings.css';

const ZaicoSyncSettings = () => {
  const [activeTab, setActiveTab] = useState('sync');
  const navigate = useNavigate();
  
  // APIキー設定の状態
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('未接続');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [buybackSyncEnabled, setBuybackSyncEnabled] = useState(true);
  const [salesSyncEnabled, setSalesSyncEnabled] = useState(true);

  // コンポーネントマウント時に保存された設定を読み込み
  useEffect(() => {
    const savedApiKey = localStorage.getItem('zaicoApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setConnectionStatus('設定済み');
    }
    
    // 同期設定の読み込み
    const savedAutoSync = localStorage.getItem('zaicoAutoSync');
    const savedBuybackSync = localStorage.getItem('zaicoBuybackSync');
    const savedSalesSync = localStorage.getItem('zaicoSalesSync');
    
    if (savedAutoSync !== null) setAutoSyncEnabled(savedAutoSync === 'true');
    if (savedBuybackSync !== null) setBuybackSyncEnabled(savedBuybackSync === 'true');
    if (savedSalesSync !== null) setSalesSyncEnabled(savedSalesSync === 'true');
  }, []);

  // APIキー保存
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      alert('APIキーを入力してください');
      return;
    }
    
    localStorage.setItem('zaicoApiKey', apiKey);
    setConnectionStatus('保存済み');
    alert('APIキーを保存しました');
  };

  // 接続テスト
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      alert('APIキーを入力してください');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('テスト中...');

    try {
      // 一時的にAPIキーを設定してテスト
      const originalApiKey = localStorage.getItem('zaicoApiKey');
      localStorage.setItem('zaicoApiKey', apiKey);
      
      // 簡単なAPI呼び出しでテスト
      await callZaicoApi('/inventories?page=1&per_page=1');
      
      setConnectionStatus('接続成功');
      alert('Zaico APIへの接続に成功しました！');
      
      // 元のAPIキーを復元
      if (originalApiKey) {
        localStorage.setItem('zaicoApiKey', originalApiKey);
      }
    } catch (error) {
      console.error('接続テストエラー:', error);
      setConnectionStatus('接続失敗');
      
      // エラーメッセージを詳細に表示
      let errorMessage = `接続に失敗しました: ${error.message}`;
      
      if (error.message.includes('API レスポンスがJSON形式ではありません')) {
        errorMessage += '\n\n🔍 問題: APIがHTMLエラーページを返しています\n';
        errorMessage += '📋 解決方法: APIキーまたはエンドポイントURLを確認してください';
      } else if (error.message.includes('HTTP error! status: 401')) {
        errorMessage += '\n\n🔑 問題: 認証に失敗しました\n';
        errorMessage += '📋 解決方法: APIキーが正しいか確認してください';
      } else if (error.message.includes('HTTP error! status: 404')) {
        errorMessage += '\n\n🌐 問題: APIエンドポイントが見つかりません\n';
        errorMessage += '📋 解決方法: APIのベースURLを確認してください';
      }
      
      alert(errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 同期設定保存
  const handleSaveSyncSettings = () => {
    localStorage.setItem('zaicoAutoSync', autoSyncEnabled.toString());
    localStorage.setItem('zaicoBuybackSync', buybackSyncEnabled.toString());
    localStorage.setItem('zaicoSalesSync', salesSyncEnabled.toString());
    alert('同期設定を保存しました');
  };

  // 全データクリア
  const handleClearAllData = () => {
    if (confirm('本当に全データをクリアしますか？この操作は元に戻せません。')) {
      localStorage.clear();
      alert('全データをクリアしました。ページを再読み込みします。');
      window.location.reload();
    }
  };

  return (
    <div className="zaico-sync-settings">
      <div className="page-header">
        <h1>Zaico同期管理</h1>
        <p>Zaicoとの在庫同期設定と管理を行います</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'sync' ? 'active' : ''}`}
          onClick={() => setActiveTab('sync')}
        >
          同期管理
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'sync' && (
          <div className="sync-section">
            <ZaicoSyncManager />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="settings-card">
              <h3>API設定</h3>
              <div className="setting-item">
                <label>Zaico APIキー</label>
                <input 
                  type="password" 
                  placeholder="APIキーを入力してください"
                  className="api-key-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button className="save-btn" onClick={handleSaveApiKey}>保存</button>
              </div>
              
              <div className="setting-item">
                <label>接続テスト</label>
                <button 
                  className="test-btn" 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? 'テスト中...' : '接続テスト'}
                </button>
                <span className={`connection-status ${connectionStatus === '接続成功' ? 'connected' : ''}`}>
                  {connectionStatus}
                </span>
              </div>
            </div>

            <div className="settings-card">
              <h3>同期設定</h3>
              <div className="setting-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  />
                  自動同期を有効にする
                </label>
              </div>
              
              <div className="setting-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={buybackSyncEnabled}
                    onChange={(e) => setBuybackSyncEnabled(e.target.checked)}
                  />
                  買取時の自動同期
                </label>
              </div>
              
              <div className="setting-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={salesSyncEnabled}
                    onChange={(e) => setSalesSyncEnabled(e.target.checked)}
                  />
                  販売時の自動同期
                </label>
              </div>
              
              <div className="setting-item">
                <button className="save-btn" onClick={handleSaveSyncSettings}>
                  同期設定を保存
                </button>
              </div>
            </div>

            <div className="settings-card">
              <h3>データ管理</h3>
              <div className="setting-item">
                <button className="danger-btn" onClick={handleClearAllData}>
                  全データクリア
                </button>
                <p className="warning-text">※ この操作は元に戻せません</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZaicoSyncSettings;
