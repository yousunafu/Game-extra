// zaico APIクライアント（セキュア版）
// フロントエンドからは自分のAPIルート経由でzaico APIにアクセス

const ZAICO_API_BASE_URL = '/api/zaico'; // 自分のAPIルート

// zaico API呼び出しの基本関数（セキュア版）
const callZaicoApi = async (endpoint, method = 'GET', data = null) => {
  const url = `${ZAICO_API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const json = (() => { try { return JSON.parse(text); } catch { return null; }})();
    
    if (!response.ok) {
      const msg = json?.message || text || response.statusText;
      throw new Error(`zaico API Error: ${response.status} ${msg}`);
    }
    
    return json;
  } catch (error) {
    console.error('zaico API呼び出しエラー:', error);
    throw error;
  }
};

// 既存のzaicoApi.jsと同じ関数を提供
export const createInventoryInZaico = async (projectItem) => {
  try {
    const zaicoData = convertProjectToZaico(projectItem);
    console.log('=== zaico API送信データ ===');
    console.log('送信するzaicoData:', zaicoData);
    
    const inventoryResult = await callZaicoApi('/inventories', 'POST', zaicoData);
    console.log('在庫データ作成結果:', inventoryResult);
    const createdInventoryId = inventoryResult?.data_id ?? inventoryResult?.id;
    
    if (!createdInventoryId) {
      throw new Error('在庫データの作成に失敗しました（idが取得できません）');
    }
    
    return {
      inventory: inventoryResult,
      purchase: null
    };
  } catch (error) {
    console.error('zaico在庫登録エラー:', error);
    throw error;
  }
};

export const createPurchaseInZaico = async (projectItem) => {
  try {
    console.log('=== zaico入庫データ作成開始 ===');
    console.log('projectItem:', projectItem);
    
    // 在庫データを作成
    const zaicoData = convertProjectToZaico(projectItem);
    console.log('=== zaico在庫データ送信 ===');
    console.log('送信するzaicoData:', zaicoData);
    
    const inventoryResult = await callZaicoApi('/inventories', 'POST', zaicoData);
    console.log('在庫データ作成結果:', inventoryResult);
    const createdInventoryId = inventoryResult?.data_id ?? inventoryResult?.id;
    
    if (!createdInventoryId) {
      throw new Error('在庫データの作成に失敗しました（idが取得できません）');
    }
    
    // 入庫データを作成
    const purchaseData = {
      num: `BUY-${Date.now()}`,
      customer_name: projectItem.customer?.name || '買取顧客',
      status: 'purchased',
      purchase_date: new Date().toISOString().split('T')[0],
      memo: `買取処理: ${projectItem.consoleLabel || projectItem.softwareName}`,
      purchase_items: [
        {
          inventory_id: createdInventoryId,
          quantity: projectItem.quantity.toString(),
          unit_price: projectItem.acquisitionPrice?.toString() || '0',
          estimated_purchase_date: new Date().toISOString().split('T')[0],
          etc: `査定ランク: ${projectItem.assessedRank || ''}${projectItem.accessoriesLabel ? ` | 付属品: ${projectItem.accessoriesLabel}` : ''}`
        }
      ]
    };
    
    console.log('=== zaico入庫データ送信 ===');
    console.log('送信するpurchaseData:', purchaseData);
    
    const purchaseResult = await callZaicoApi('/purchases', 'POST', purchaseData);
    console.log('=== zaico入庫データ作成成功 ===');
    console.log('入庫データ作成結果:', purchaseResult);
    
    return {
      inventory: inventoryResult,
      purchase: purchaseResult
    };
  } catch (error) {
    console.error('zaico入庫登録エラー:', error);
    throw error;
  }
};

export const createOutboundItemInZaico = async (saleData) => {
  try {
    console.log('=== zaico出庫データ作成開始 ===');
    console.log('saleData:', saleData);

    // ローカルストレージの在庫データから対象を特定
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    let targetInventory = null;

    if (saleData.inventoryId) {
      targetInventory = inventoryData.find(inv => inv.id === saleData.inventoryId);
    }
    if (!targetInventory) {
      targetInventory = inventoryData.find(inv =>
        inv.title === saleData.title ||
        inv.consoleLabel === saleData.title ||
        inv.softwareName === saleData.title
      );
    }

    if (!targetInventory || !targetInventory.zaicoId) {
      console.warn('対応する在庫データまたは zaicoId が見つかりません。出庫をスキップします。');
      console.log('saleData.title:', saleData.title);
      return { success: false, message: '対応する在庫データが見つかりません' };
    }

    // zaicoId は number で送る（文字列だと弾かれることがある）
    const zaicoInventoryId = Number(targetInventory.zaicoId);
    if (!Number.isFinite(zaicoInventoryId)) {
      throw new Error(`zaicoId が数値化できません: ${targetInventory.zaicoId}`);
    }

    // Zaico 出庫API（/packing_slips）の要求形に整形
    const packingSlipData = {
      num: saleData.num || `SLIP-${Date.now()}`,
      customer_name: saleData.customerName || saleData.buyerName || '海外バイヤー',
      status: 'completed_delivery',
      delivery_date: new Date().toISOString().slice(0, 10),
      memo: [
        saleData.notes || '',
        saleData.salesChannel ? `販売チャネル: ${saleData.salesChannel}` : '',
        saleData.ebayRecordNumber ? `eBay記録番号: ${saleData.ebayRecordNumber}` : '',
        saleData.assessedRank ? `査定ランク: ${saleData.assessedRank}` : '',
        saleData.handler ? `担当者: ${saleData.handler}` : '',
        saleData.shippingCountry ? `配送先国: ${saleData.shippingCountry}` : '',
        Number.isFinite(Number(saleData.shippingFee)) ? `配送料: ${Number(saleData.shippingFee)}` : ''
      ].filter(Boolean).join(' | '),

      deliveries: [
        {
          inventory_id: zaicoInventoryId,
          quantity: Number(saleData.quantity) || 1,
          unit_price: Number(saleData.salePrice) || 0,
          estimated_delivery_date: saleData.estimatedDeliveryDate || undefined,
          etc: saleData.itemMemo || undefined
        }
      ]
    };

    console.log('=== zaico出庫データ送信 ===');
    console.log('POST /packing_slips');
    console.log('packingSlipData:', packingSlipData);

    const result = await callZaicoApi('/packing_slips', 'POST', packingSlipData);

    console.log('=== zaico出庫登録成功 ===');
    console.log('出庫データ作成結果:', result);

    return result;
  } catch (error) {
    console.error('zaico出庫登録エラー:', error);
    throw error;
  }
};

export const getInventoriesFromZaico = async (page = 1) => {
  try {
    const result = await callZaicoApi(`/inventories?page=${page}`);
    return result;
  } catch (error) {
    console.error('zaico在庫取得エラー:', error);
    throw error;
  }
};

export const getPackingSlipsFromZaico = async (page = 1) => {
  try {
    const result = await callZaicoApi(`/packing_slips?page=${page}`);
    return result;
  } catch (error) {
    console.error('zaico出庫データ取得エラー:', error);
    throw error;
  }
};

// プロジェクトの在庫データをzaico形式に変換
const convertProjectToZaico = (projectItem) => {
  console.log('=== zaico変換前のデータ ===');
  console.log('projectItem:', projectItem);
  console.log('acquisitionPrice:', projectItem.acquisitionPrice);
  console.log('buybackPrice:', projectItem.buybackPrice);
  console.log('acquisitionPrice type:', typeof projectItem.acquisitionPrice);
  console.log('buybackPrice type:', typeof projectItem.buybackPrice);

  const zaicoData = {
    title: projectItem.consoleLabel || projectItem.softwareName || 'ゲーム商品',
    quantity: '0', // 在庫は0で作成し、入庫データで数量を設定
    category: 'ゲーム機',
    state: projectItem.assessedRank || 'S',
    place: 'ZAICO倉庫',
    optional_attributes: [
      { name: '仕入単価', value: projectItem.acquisitionPrice?.toString() || '0' },
      { name: '買取単価', value: projectItem.buybackPrice?.toString() || '0' },
      { name: '状態', value: projectItem.conditionLabel || 'S（極美品・未使用に近い）' },
      { name: '付属品', value: projectItem.accessoriesLabel || 'なし' },
      { name: '顧客名', value: projectItem.customer?.name || '買取顧客' }
    ],
    etc: projectItem.notes || ''
  };
  
  console.log('=== zaico変換後のデータ ===');
  console.log('zaicoData:', zaicoData);
  console.log('optional_attributes:', zaicoData.optional_attributes);
  console.log('仕入単価:', zaicoData.optional_attributes.find(attr => attr.name === '仕入単価')?.value);
  
  return zaicoData;
};

// 同期ログ機能
export const logSyncActivity = (action, status, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    status,
    details
  };
  
  const existingLogs = JSON.parse(localStorage.getItem('zaicoSyncLogs') || '[]');
  existingLogs.push(logEntry);
  
  // 最新100件のみ保持
  if (existingLogs.length > 100) {
    existingLogs.splice(0, existingLogs.length - 100);
  }
  
  localStorage.setItem('zaicoSyncLogs', JSON.stringify(existingLogs));
  console.log('zaico同期ログ:', logEntry);
};

export default {
  createInventoryInZaico,
  createPurchaseInZaico,
  createOutboundItemInZaico,
  getInventoriesFromZaico,
  getPackingSlipsFromZaico,
  logSyncActivity
};


