import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './MyOrders.css';

// 担当者名から英語名を抽出
const getEnglishName = (fullName) => {
  if (!fullName) return '';
  const match = fullName.match(/（(.+?)）/);
  return match ? match[1] : fullName;
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // 為替レート（USD to JPY）- Sales.jsxと同じ
  const EXCHANGE_RATE = 150; // $1 = ¥150

  // JPYをUSDに変換
  const convertToUSD = (jpy) => {
    return Math.round(jpy / EXCHANGE_RATE * 100) / 100; // 小数点2桁
  };

  // 自分の注文履歴を取得
  useEffect(() => {
    const salesRequests = JSON.parse(localStorage.getItem('salesRequests') || '[]');
    // 自分のメールアドレスでフィルタ
    const myOrders = salesRequests.filter(req => req.customer.email === user.email);
    // 見積もり受領済みを上に、その後は新しい順
    const sortedOrders = myOrders.sort((a, b) => {
      // quoted（承認待ち）を最優先
      if (a.status === 'quoted' && b.status !== 'quoted') return -1;
      if (a.status !== 'quoted' && b.status === 'quoted') return 1;
      // それ以外は日付順（新しい順）
      return new Date(b.date) - new Date(a.date);
    });
    setOrders(sortedOrders);
  }, [user.email]);

  // データの更新を監視
  const refreshOrders = () => {
    const salesRequests = JSON.parse(localStorage.getItem('salesRequests') || '[]');
    const myOrders = salesRequests.filter(req => req.customer.email === user.email);
    const sortedOrders = myOrders.sort((a, b) => {
      if (a.status === 'quoted' && b.status !== 'quoted') return -1;
      if (a.status !== 'quoted' && b.status === 'quoted') return 1;
      return new Date(b.date) - new Date(a.date);
    });
    setOrders(sortedOrders);
  };

  // 見積もり受領済みの件数
  const pendingCount = orders.filter(order => order.status === 'quoted').length;

  // 承認処理（二重確認）
  const handleApprove = (order) => {
    const total = calculateTotal(order.items) + (order.shippingFee || 0);
    // 1回目の確認
    const firstConfirm = window.confirm(
      `Approve this quote?\n\nTotal Amount: $${convertToUSD(total).toFixed(2)}`
    );
    
    if (!firstConfirm) return;

    // 2回目の確認
    const secondConfirm = window.confirm(
      'Are you sure?\nThis action cannot be undone.'
    );
    
    if (!secondConfirm) return;

    // ステータスを更新
    const salesRequests = JSON.parse(localStorage.getItem('salesRequests') || '[]');
    const updatedRequests = salesRequests.map(req => {
      if (req.requestNumber === order.requestNumber) {
        return { ...req, status: 'approved' };
      }
      return req;
    });

    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));
    refreshOrders();
    alert('Quote approved. Please proceed with payment.');
  };

  // 拒否処理
  const handleDecline = (order) => {
    const confirm = window.confirm(
      'Decline this quote?\nYou can submit a new request later.'
    );
    
    if (!confirm) return;

    // ステータスを更新
    const salesRequests = JSON.parse(localStorage.getItem('salesRequests') || '[]');
    const updatedRequests = salesRequests.map(req => {
      if (req.requestNumber === order.requestNumber) {
        return { ...req, status: 'declined' };
      }
      return req;
    });

    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));
    refreshOrders();
    alert('Quote declined.');
  };

  const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.quotedPrice || 0) * item.quantity, 0);
  };

  // 見積書印刷
  const handlePrint = (order) => {
    const tempSelectedOrder = selectedOrder;
    setSelectedOrder(order.requestNumber);
    
    setTimeout(() => {
      window.print();
      setSelectedOrder(tempSelectedOrder);
    }, 100);
  };

  // 会社情報
  const companyInfo = {
    name: '株式会社ゲーム買取センター',
    nameEn: 'Game Trading Center Co., Ltd.',
    postalCode: '〒160-0022',
    address: '東京都新宿区新宿3-1-1',
    addressEn: '3-1-1 Shinjuku, Shinjuku-ku, Tokyo 160-0022, Japan',
    phone: 'TEL: 03-1234-5678',
    phoneEn: 'TEL: +81-3-1234-5678',
    email: 'info@game-kaitori.jp',
    license: '古物商許可証：東京都公安委員会 第123456789号',
    licenseEn: 'Used Goods Business License: Tokyo Metropolitan Police No. 123456789'
  };

  const getTodayJST = () => {
    const now = new Date();
    const jstOffset = 9 * 60;
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    return jstTime.toISOString().split('T')[0];
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': '⏳ Pending Quote',
      'quoted': '📋 Quote Received',
      'approved': '✅ Approved',
      'payment_confirmed': '💳 Payment Confirmed',
      'shipped': '📦 Shipped',
      'declined': '❌ Declined'
    };
    return statusLabels[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'quoted': 'status-quoted',
      'approved': 'status-approved',
      'payment_confirmed': 'status-payment',
      'shipped': 'status-shipped',
      'declined': 'status-declined'
    };
    return statusClasses[status] || 'status-default';
  };

  const toggleExpand = (requestNumber) => {
    setExpandedOrder(expandedOrder === requestNumber ? null : requestNumber);
  };

  return (
    <div className="orders-container">
      <h1>My Order History</h1>
      <p className="subtitle">Check your purchase requests and quotes</p>

      {/* 通知バナー */}
      {pendingCount > 0 && (
        <div className="notification-banner">
          <div className="notification-icon">🔔</div>
          <div className="notification-content">
            <strong>New quote received!</strong>
            <p>{pendingCount} quote(s) awaiting your approval. Please review.</p>
          </div>
        </div>
      )}

      {/* 注文一覧 */}
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No orders yet</p>
          <p className="empty-hint">Submit a product request to get started</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div 
              key={order.requestNumber}
              className={`order-card ${order.status === 'quoted' ? 'pending-approval' : ''}`}
            >
              {/* カードヘッダー（クリック可能） */}
              <div 
                className="card-header-clickable"
                onClick={() => toggleExpand(order.requestNumber)}
              >
                <div className="card-header-left">
                  <h3>Request No.: {order.requestNumber}</h3>
                  <p className="card-date">📅 {new Date(order.date).toLocaleDateString('en-US')}</p>
                </div>
                <div className="card-header-right">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="expand-icon">
                    {expandedOrder === order.requestNumber ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* 展開時の詳細 */}
              {expandedOrder === order.requestNumber && (
                <div className="card-details">
                  {/* 商品リスト */}
                  <div className="details-section">
                    <h4>📦 Requested Products</h4>
                    <div className="items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="item-row">
                          <div className="item-info">
                            <span className={`item-type ${item.productType}`}>
                              {item.productType === 'console' ? '🎮' : '💿'}
                            </span>
                            <div className="item-details">
                              <p className="item-name">
                                {item.productType === 'software' 
                                  ? `${item.softwareName} (${item.consoleLabel})` 
                                  : `${item.manufacturerLabel} ${item.consoleLabel}`
                                }
                              </p>
                              <p className="item-specs">
                                {item.colorLabel && `Color: ${item.colorLabel}`}
                                {item.conditionLabel && ` • ${item.conditionLabel}`}
                                {item.packageTypeLabel && ` • ${item.packageTypeLabel}`}
                              </p>
                            </div>
                          </div>
                          <div className="item-price-section">
                            <span className="item-quantity">×{item.quantity}</span>
                            {item.quotedPrice > 0 && (
                              <>
                                <span className="item-unit-price">${convertToUSD(item.quotedPrice).toFixed(2)}</span>
                                <span className="item-subtotal">${convertToUSD(item.quotedPrice * item.quantity).toFixed(2)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 合計金額（見積もり受領後のみ） */}
                    {['quoted', 'approved', 'payment_confirmed', 'shipped'].includes(order.status) && (
                      <div className="order-total-section">
                        <div className="order-total">
                          <span className="total-label">Subtotal:</span>
                          <span className="total-value">${convertToUSD(calculateTotal(order.items)).toFixed(2)}</span>
                        </div>
                        {order.shippingFee && (
                          <div className="order-total">
                            <span className="total-label">Shipping Fee:</span>
                            <span className="total-value">${convertToUSD(order.shippingFee).toFixed(2)}</span>
                          </div>
                        )}
                        {order.deliveryDays && (
                          <div className="order-total">
                            <span className="total-label">Estimated Delivery:</span>
                            <span className="total-value">{order.deliveryDays} days</span>
                          </div>
                        )}
                        <div className="order-total grand-total">
                          <span className="total-label">Total Amount:</span>
                          <span className="total-value">${convertToUSD(calculateTotal(order.items) + (order.shippingFee || 0)).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 備考 */}
                  {order.notes && (
                    <div className="details-section">
                      <h4>📝 Notes</h4>
                      <p className="notes-text">{order.notes}</p>
                    </div>
                  )}

                  {/* 発送情報（発送済みの場合） */}
                  {order.status === 'shipped' && (
                    <div className="details-section shipping-info">
                      <h4>📦 Shipping Information</h4>
                      <p><strong>Method:</strong> {order.shippingMethod || 'EMS'}</p>
                      {order.trackingNumber && (
                        <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                      )}
                      {order.shippedDate && (
                        <p><strong>Shipped Date:</strong> {order.shippedDate}</p>
                      )}
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="card-actions">
                    {/* 承認・拒否ボタン（見積もり受領時のみ） */}
                    {order.status === 'quoted' && (
                      <>
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(order)}
                        >
                          ✓ Approve Quote
                        </button>
                        <button 
                          className="btn-decline"
                          onClick={() => handleDecline(order)}
                        >
                          ✕ Decline
                        </button>
                      </>
                    )}

                    {/* 印刷ボタン（見積もり受領後） */}
                    {['quoted', 'approved', 'payment_confirmed', 'shipped'].includes(order.status) && (
                      <button 
                        className="btn-print"
                        onClick={() => handlePrint(order)}
                      >
                        🖨️ Print Quote
                      </button>
                    )}

                    {/* 承認済みメッセージ */}
                    {order.status === 'approved' && (
                      <div className="info-message">
                        ℹ️ Please proceed with payment. We will ship once payment is confirmed.
                      </div>
                    )}

                    {/* 入金確認済みメッセージ */}
                    {order.status === 'payment_confirmed' && (
                      <div className="info-message">
                        ℹ️ Payment confirmed. We are preparing for shipment.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 印刷用テンプレート */}
      {selectedOrder && orders.find(o => o.requestNumber === selectedOrder) && (
        <div className="print-only estimate-sheet">
          {(() => {
            const order = orders.find(o => o.requestNumber === selectedOrder);
            return (
              <>
                <div className="estimate-header">
                  <div className="estimate-header-left">
                    <h1>Sales Quotation</h1>
                    <div className="estimate-number">Quote No.: {order.requestNumber}</div>
                    <div className="estimate-date">Issue Date: {getTodayJST()}</div>
                  </div>
                  <div className="estimate-header-right">
                    <h2>{companyInfo.nameEn}</h2>
                    <p>{companyInfo.addressEn}</p>
                    <p>{companyInfo.phoneEn}</p>
                    <p>{companyInfo.email}</p>
                    {order.salesStaffName && <p><strong>Contact Person:</strong> {getEnglishName(order.salesStaffName)}</p>}
                  </div>
                </div>

                <div className="estimate-customer">
                  <h2>Customer Information</h2>
                  <p><strong>Name:</strong> {order.customer.name}</p>
                  <p><strong>Email:</strong> {order.customer.email} &nbsp;&nbsp; <strong>Tel:</strong> {order.customer.phone || 'N/A'}</p>
                  <p><strong>Country:</strong> {order.customer.country || 'N/A'}</p>
                  {order.customer.address && <p><strong>Address:</strong> {order.customer.address}</p>}
                </div>

                <div className="estimate-message">
                  <p>We are pleased to provide the following quotation:</p>
                </div>

                <table className="estimate-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Product Name</th>
                      <th>Color</th>
                      <th>Condition</th>
                      <th>Package</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
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
                        <td>{item.colorLabel || '-'}</td>
                        <td>{item.conditionLabel || '-'}</td>
                        <td>{item.packageTypeLabel || '-'}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.quotedPrice || 0).toLocaleString()}</td>
                        <td>${((item.quotedPrice || 0) * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="estimate-total">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>${calculateTotal(order.items).toLocaleString()}</span>
                  </div>
                  {order.shippingFee && (
                    <div className="total-row">
                      <span>Shipping Fee</span>
                      <span>${order.shippingFee.toLocaleString()}</span>
                    </div>
                  )}
                  {order.deliveryDays && (
                    <div className="total-row">
                      <span>Estimated Delivery</span>
                      <span>{order.deliveryDays} days</span>
                    </div>
                  )}
                  <div className="total-row grand-total">
                    <span>Total Amount</span>
                    <span>${(calculateTotal(order.items) + (order.shippingFee || 0)).toLocaleString()}</span>
                  </div>
                </div>

                {order.notes && (
                  <div className="estimate-notes">
                    <h3>Notes</h3>
                    <p>{order.notes}</p>
                  </div>
                )}

                <div className="estimate-footer">
                  <p>* All prices are in US Dollars (USD)</p>
                  <p>* Payment terms: Wire transfer in advance</p>
                  <p>* Items will be shipped after payment confirmation</p>
                  <p>* Prices are subject to availability and may change</p>
                  <p className="license" style={{marginTop: '15px'}}>{companyInfo.licenseEn}</p>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MyOrders;




