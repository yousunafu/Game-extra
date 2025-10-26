import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './MyApplications.css';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);
  const [printApp, setPrintApp] = useState(null); // 印刷する申込を管理

  // 自分の申込履歴を取得
  useEffect(() => {
    const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
    // 自分のメールアドレスでフィルタ
    const myApplications = allApplications.filter(app => app.customer.email === user.email);
    // 承認待ちを上に、その後は新しい順
    const sortedApplications = myApplications.sort((a, b) => {
      // 承認待ちを最優先
      if (a.status === 'awaiting_approval' && b.status !== 'awaiting_approval') return -1;
      if (a.status !== 'awaiting_approval' && b.status === 'awaiting_approval') return 1;
      // それ以外は日付順（新しい順）
      return new Date(b.date) - new Date(a.date);
    });
    setApplications(sortedApplications);
  }, [user.email]);

  // データの更新を監視
  const refreshApplications = () => {
    const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
    const myApplications = allApplications.filter(app => app.customer.email === user.email);
    // 承認待ちを上に、その後は新しい順
    const sortedApplications = myApplications.sort((a, b) => {
      if (a.status === 'awaiting_approval' && b.status !== 'awaiting_approval') return -1;
      if (a.status !== 'awaiting_approval' && b.status === 'awaiting_approval') return 1;
      return new Date(b.date) - new Date(a.date);
    });
    setApplications(sortedApplications);
  };

  // 承認待ちの件数
  const pendingCount = applications.filter(app => app.status === 'awaiting_approval').length;

  // 承認処理（二重確認）
  const handleApprove = (app) => {
    // 1回目の確認
    const firstConfirm = window.confirm(
      `この見積もり内容で承認しますか？\n\n合計買取金額: ¥${calculateTotal(app.items, app.shippingInfo).toLocaleString()}`
    );
    
    if (!firstConfirm) return;

    // 2回目の確認
    const secondConfirm = window.confirm(
      '本当によろしいですか？\n承認後は取り消すことができません。'
    );
    
    if (!secondConfirm) return;

    // ステータスを更新
    const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
    const updatedApplications = allApplications.map(a => {
      if (a.applicationNumber === app.applicationNumber) {
        return { ...a, status: 'approved' };
      }
      return a;
    });

    localStorage.setItem('allApplications', JSON.stringify(updatedApplications));
    refreshApplications();
    alert('承認が完了しました。お振込までお待ちください。');
  };

  // 拒否処理
  const handleReject = (app) => {
    const confirm = window.confirm(
      'この見積もりを拒否しますか？\n商品は返送されます。'
    );
    
    if (!confirm) return;

    // ステータスを更新
    const allApplications = JSON.parse(localStorage.getItem('allApplications') || '[]');
    const updatedApplications = allApplications.map(a => {
      if (a.applicationNumber === app.applicationNumber) {
        return { ...a, status: 'rejected' };
      }
      return a;
    });

    localStorage.setItem('allApplications', JSON.stringify(updatedApplications));
    refreshApplications();
    alert('見積もりを拒否しました。商品は返送されます。');
  };

  const calculateTotal = (items, shippingInfo) => {
    if (!items) return 0;
    const itemsTotal = items.reduce((sum, item) => sum + (item.buybackPrice || 0) * item.quantity, 0);
    return itemsTotal;
  };

  // 見積書印刷
  const handlePrint = (app) => {
    // 印刷する申込を設定
    setPrintApp(app.applicationNumber);
    
    setTimeout(() => {
      window.print();
      // 印刷後にリセット
      setTimeout(() => setPrintApp(null), 100);
    }, 100);
  };

  // 会社情報（Rating.jsxと同じ）
  const companyInfo = {
    name: '株式会社ゲーム買取センター',
    postalCode: '〒160-0022',
    address: '東京都新宿区新宿3-1-1',
    phone: 'TEL: 03-1234-5678',
    email: 'info@game-kaitori.jp',
    license: '古物商許可証：東京都公安委員会 第123456789号'
  };

  // 日本時間の今日の日付を取得
  const getTodayJST = () => {
    const now = new Date();
    const jstOffset = 9 * 60;
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    return jstTime.toISOString().split('T')[0];
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'applied': '📝 申込受付',
      'kit_sent': '📮 キット発送済',
      'pickup_scheduled': '🚚 集荷予定',
      'received': '📦 商品到着',
      'assessing': '🔍 査定中',
      'awaiting_approval': '⏳ 承認待ち',
      'approved': '✅ 買取確定',
      'rejected': '❌ 拒否',
      'in_inventory': '📊 完了'
    };
    return statusLabels[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      'applied': 'status-applied',
      'kit_sent': 'status-kit-sent',
      'pickup_scheduled': 'status-pickup',
      'received': 'status-received',
      'assessing': 'status-assessing',
      'awaiting_approval': 'status-waiting',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'in_inventory': 'status-completed'
    };
    return statusClasses[status] || 'status-default';
  };

  return (
    <>
      {/* 印刷用見積書 - printAppが設定されている時のみ表示 */}
      {applications.filter(app => app.applicationNumber === printApp).map(app => (
        <div key={`print-${app.applicationNumber}`} className="print-only estimate-sheet">
          <div className="estimate-header">
            <div className="estimate-header-left">
              <h1>買取見積書</h1>
              <div className="estimate-number">見積番号: {app.applicationNumber}</div>
              <div className="estimate-date">発行日: {getTodayJST()}</div>
            </div>
            <div className="estimate-header-right">
              <h2>{companyInfo.name}</h2>
              <p>{companyInfo.postalCode} {companyInfo.address}</p>
              <p>{companyInfo.phone}</p>
              <p>{companyInfo.email}</p>
              {app.assessorName && <p><strong>担当者:</strong> {app.assessorName}</p>}
            </div>
          </div>

          <div className="estimate-customer">
            <h2>お客様情報</h2>
            <p><strong>お名前:</strong> {app.customer.name} 様</p>
            {(app.customer.birthDate || app.customer.occupation) && (
              <p>
                {app.customer.birthDate && <><strong>生年月日:</strong> {app.customer.birthDate}</>}
                {app.customer.birthDate && app.customer.occupation && ' / '}
                {app.customer.occupation && <><strong>職業:</strong> {app.customer.occupation}</>}
              </p>
            )}
            <p><strong>住所:</strong> {app.customer.postalCode} {app.customer.address}</p>
            <p><strong>TEL:</strong> {app.customer.phone} / <strong>Email:</strong> {app.customer.email}</p>
          </div>

          <div className="estimate-message">
            <p>下記の通り、お見積もりいたします。</p>
          </div>

          <table className="estimate-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>品名</th>
                <th>状態</th>
                <th>査定ランク</th>
                <th>数量</th>
                <th>単価</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {app.items && app.items.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    {item.productType === 'software' ? (
                      <>
                        {item.softwareName}<br />
                        <small>({item.manufacturerLabel} - {item.consoleLabel})</small>
                      </>
                    ) : (
                      `${item.manufacturerLabel} - ${item.consoleLabel}`
                    )}
                  </td>
                  <td>{item.conditionLabel}</td>
                  <td>{item.assessedRank || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>¥{(item.buybackPrice || 0).toLocaleString()}</td>
                  <td>¥{((item.buybackPrice || 0) * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="estimate-total">
            <div className="total-row grand-total">
              <span>合計買取金額</span>
              <span>¥{calculateTotal(app.items, app.shippingInfo).toLocaleString()}</span>
            </div>
          </div>

          <div className="estimate-notes">
            <h3>備考</h3>
            {app.notes && <p>{app.notes}</p>}
            <p>※ 上記金額は査定結果に基づく買取金額です。</p>
            <p>※ 商品の状態により、金額が変更になる場合がございます。</p>
          </div>

          <div className="estimate-footer">
            <p className="license">{companyInfo.license}</p>
          </div>
        </div>
      ))}

      {/* 通常の画面表示 */}
      <div className="applications-container screen-only">
      <h1>申込履歴</h1>
      <p className="subtitle">過去の買取申込状況を確認できます</p>

      {/* 通知バナー */}
      {pendingCount > 0 && (
        <div className="notification-banner">
          <div className="notification-icon">🔔</div>
          <div className="notification-content">
            <strong>新しい見積もりが届いています！</strong>
            <p>{pendingCount}件の見積もりが承認待ちです。内容をご確認ください。</p>
          </div>
        </div>
      )}

      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>申込履歴がありません</p>
            <p className="empty-hint">買取申込ページから申し込みを行ってください</p>
          </div>
        ) : (
          applications.map(app => (
            <div key={app.applicationNumber} className={`application-card ${app.status === 'awaiting_approval' ? 'pending-approval' : ''}`}>
              <div 
                className={`card-header ${expandedApp === app.applicationNumber ? 'expanded' : ''}`}
                onClick={() => setExpandedApp(expandedApp === app.applicationNumber ? null : app.applicationNumber)}
              >
                <div className="header-left">
                  <h3>申込番号: {app.applicationNumber}</h3>
                  <p className="app-type">{app.type === 'simple' ? '🎯 カンタン見積もり' : '📝 詳細見積もり'}</p>
                  <p className="date">申込日: {new Date(app.date).toLocaleString('ja-JP')}</p>
                  {app.items && app.items.length > 0 && (
                    <p className="item-count">商品数: {app.items.length}点</p>
                  )}
                </div>
                <div className="header-right">
                  <div className={`status-badge ${getStatusClass(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </div>
                  <span className="expand-icon">{expandedApp === app.applicationNumber ? '▼' : '▶'}</span>
                </div>
              </div>

              {expandedApp === app.applicationNumber && (
                <div className="card-detail">

                {/* 発送情報（簡易表示） */}
                <div className="card-section">
                <h4>📦 発送方法</h4>
                <p>
                  {app.shippingInfo.shippingMethod === 'cashOnDelivery' 
                    ? '🚚 着払い（ヤマト運輸指定）' 
                    : '📦 お客様自身での発送'
                  }
                </p>
              </div>

                {/* 商品リスト */}
                {app.items && app.items.length > 0 && (
                  <div className="card-section">
                  <h4>🎮 申込商品（{app.items.length}点）</h4>
                  <ul className="items-list">
                    {app.items.map((item, index) => (
                      <li key={item.id || index}>
                        {item.productType === 'software' ? (
                          <>
                            <strong>{item.softwareName}</strong>
                            <br />
                            <small>{item.manufacturerLabel} - {item.consoleLabel}</small>
                          </>
                        ) : (
                          `${item.manufacturerLabel} - ${item.consoleLabel}`
                        )}
                        {' '}× {item.quantity}点
                        {item.assessedRank && (
                          <span className="item-assessment">
                            {' '}（ランク: {item.assessedRank} / 単価: ¥{(item.buybackPrice || 0).toLocaleString()}）
                          </span>
                        )}
                      </li>
                    ))}
                    </ul>
                  </div>
                )}

                {/* 査定結果表示 */}
                {(app.status === 'awaiting_approval' || app.status === 'approved' || app.status === 'in_inventory') && 
                  app.items && app.items.length > 0 && (
                  <div className="card-section assessment-section">
                  <h4>💰 査定結果</h4>
                  <div className="assessment-total">
                    <span className="total-label">合計買取金額</span>
                    <span className="total-amount">¥{calculateTotal(app.items, app.shippingInfo).toLocaleString()}</span>
                  </div>
                  
                  <div className="assessment-actions">
                    <button 
                      onClick={() => setSelectedApp(selectedApp === app.applicationNumber ? null : app.applicationNumber)}
                      className="detail-toggle-btn"
                    >
                      {selectedApp === app.applicationNumber ? '▲ 詳細を閉じる' : '▼ 詳細を見る'}
                    </button>
                    <button 
                      onClick={() => handlePrint(app)}
                      className="print-estimate-btn"
                    >
                      🖨️ 見積書を印刷
                    </button>
                  </div>

                  {selectedApp === app.applicationNumber && (
                    <div className="assessment-detail">
                      <table className="detail-table">
                        <thead>
                          <tr>
                            <th>商品</th>
                            <th>ランク</th>
                            <th>数量</th>
                            <th>単価</th>
                            <th>小計</th>
                          </tr>
                        </thead>
                        <tbody>
                          {app.items.map((item, index) => (
                            <tr key={item.id || index}>
                              <td>
                                {item.productType === 'software' ? (
                                  <>
                                    {item.softwareName}
                                    <br />
                                    <small style={{color: '#95a5a6'}}>
                                      {item.manufacturerLabel} - {item.consoleLabel}
                                    </small>
                                  </>
                                ) : (
                                  `${item.manufacturerLabel} - ${item.consoleLabel}`
                                )}
                              </td>
                              <td>{item.assessedRank || '-'}</td>
                              <td>{item.quantity}</td>
                              <td>¥{(item.buybackPrice || 0).toLocaleString()}</td>
                              <td>¥{((item.buybackPrice || 0) * item.quantity).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 承認待ちの場合、承認・拒否ボタン */}
                {app.status === 'awaiting_approval' && (
                  <div className="card-footer approval-section">
                  <p className="approval-message">
                    ⚠️ 査定が完了しました。上記の見積もり内容をご確認の上、承認または拒否を選択してください。
                  </p>
                  <div className="approval-buttons">
                    <button 
                      onClick={() => handleReject(app)}
                      className="reject-btn"
                    >
                      ❌ 拒否する
                    </button>
                    <button 
                      onClick={() => handleApprove(app)}
                      className="approve-btn"
                    >
                      ✅ 承認する
                    </button>
                    </div>
                  </div>
                )}

                {/* 買取確定の場合 */}
                {app.status === 'approved' && (
                  <div className="card-footer approved-section">
                  <p className="approved-message">
                      ✅ 買取が確定しました。事業者より振込手続きについてご連絡いたします。
                    </p>
                  </div>
                )}

                {/* 完了の場合 */}
                {app.status === 'in_inventory' && (
                  <div className="card-footer completed-section">
                  <p className="completed-message">
                    🎉 取引が完了しました。ご利用ありがとうございました。
                    </p>
                  </div>
                )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default MyApplications;

