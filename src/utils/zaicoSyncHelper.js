// Zaico同期ヘルパー関数
import { getInventoriesFromZaico, logSyncActivity } from './zaicoApi';

// 既存在庫をZaicoと同期
export const syncExistingInventoryWithZaico = async () => {
  try {
    console.log('=== 既存在庫同期開始 ===');
    
    // プロジェクトの在庫データを取得
    const projectInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    console.log('プロジェクト在庫数:', projectInventory.length);
    
    // Zaicoの在庫データを取得
    const zaicoInventory = await getInventoriesFromZaico();
    console.log('Zaico在庫数:', zaicoInventory.length);
    
    let syncCount = 0;
    
    // プロジェクト在庫をループしてzaicoIdを設定
    for (const projectItem of projectInventory) {
      if (projectItem.zaicoId) {
        console.log(`既にzaicoIdが設定済み: ${projectItem.title}`);
        continue;
      }
      
      // Zaico在庫とマッチング
      const matchingZaicoItem = zaicoInventory.find(zaicoItem => 
        zaicoItem.title === projectItem.title ||
        zaicoItem.title === projectItem.consoleLabel ||
        zaicoItem.title === projectItem.softwareName
      );
      
      if (matchingZaicoItem) {
        // zaicoIdを設定
        projectItem.zaicoId = matchingZaicoItem.id;
        syncCount++;
        console.log(`zaicoIdを設定: ${projectItem.title} -> ${matchingZaicoItem.id}`);
      }
    }
    
    // 更新された在庫データを保存
    localStorage.setItem('inventory', JSON.stringify(projectInventory));
    
    console.log(`同期完了: ${syncCount}件のzaicoIdを設定`);
    return { success: true, syncCount };
    
  } catch (error) {
    console.error('既存在庫同期エラー:', error);
    return { success: false, error: error.message };
  }
};

// 在庫データのzaicoId状況を確認
export const checkInventoryZaicoIds = () => {
  const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
  
  const total = inventoryData.length;
  const withZaicoId = inventoryData.filter(item => item.zaicoId).length;
  const withoutZaicoId = total - withZaicoId;
  
  return {
    total,
    withZaicoId,
    withoutZaicoId
  };
};

// Zaico側の在庫データをプロジェクト側に同期
export const syncZaicoToProject = async () => {
  try {
    console.log('=== Zaico → プロジェクト同期開始 ===');
    
    // zaicoの在庫データを取得
    const zaicoInventory = await getInventoriesFromZaico();
    console.log('zaico在庫数:', zaicoInventory.length);
    
    // プロジェクトの既存在庫データを取得
    const existingProjectInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    console.log('プロジェクト既存在庫数:', existingProjectInventory.length);
    
    let syncCount = 0;
    const newProjectInventory = [...existingProjectInventory];
    
    // zaicoの在庫データをループ
    for (const zaicoItem of zaicoInventory) {
      // 既にプロジェクト側に存在するかチェック
      const existingItem = newProjectInventory.find(projectItem => 
        projectItem.zaicoId === zaicoItem.id
      );
      
      if (existingItem) {
        console.log(`既に存在: ${zaicoItem.title} (zaicoId: ${zaicoItem.id})`);
        continue;
      }
      
      // Zaicoの仕入単価を取得（optional_attributesから）
      let zaicoPurchasePrice = 0;
      console.log(`=== ${zaicoItem.title} の仕入単価取得 ===`);
      console.log('optional_attributes:', zaicoItem.optional_attributes);
      
      if (zaicoItem.optional_attributes && Array.isArray(zaicoItem.optional_attributes)) {
        const priceAttribute = zaicoItem.optional_attributes.find(attr => 
          attr.name === '仕入単価' || attr.name === 'purchase_price' || attr.name === '仕入価格'
        );
        console.log('priceAttribute:', priceAttribute);
        
        if (priceAttribute && priceAttribute.value) {
          zaicoPurchasePrice = parseFloat(priceAttribute.value) || 0;
          console.log(`仕入単価を取得: ¥${zaicoPurchasePrice.toLocaleString()}`);
        } else {
          console.log('仕入単価の属性が見つかりません');
        }
      } else {
        console.log('optional_attributesが存在しません');
      }
      
      // プロジェクト形式の在庫データを作成
      const projectItem = {
        id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        zaicoId: zaicoItem.id,
        title: zaicoItem.title,
        consoleLabel: zaicoItem.title,
        softwareName: zaicoItem.title,
        quantity: parseInt(zaicoItem.quantity) || 0,
        sourceType: 'zaico_import',
        importDate: new Date().toISOString(),
        category: zaicoItem.category || 'ゲーム機',
        manufacturer: zaicoItem.manufacturer || '不明',
        condition: zaicoItem.state || 'S',
        location: zaicoItem.place || 'ZAICO倉庫',
        assessedRank: '未評価', // デフォルト値を設定
        status: 'in_stock', // デフォルトステータス
        buybackPrice: zaicoPurchasePrice, // Zaicoの仕入単価を買取単価に反映
        acquisitionPrice: zaicoPurchasePrice, // 仕入価格も同じ値に設定
        registeredDate: new Date().toISOString(), // 登録日
        zaicoOriginalDate: zaicoItem.created_at || zaicoItem.updated_at, // Zaicoでの元の登録日
        colorLabel: '', // 色ラベル
        // Zaico同期商品の管理番号を設定
        managementNumbers: [`ZAICO-${zaicoItem.id}`],
        notes: `Zaicoから同期: ${zaicoItem.memo || ''}${zaicoPurchasePrice > 0 ? ` | 仕入単価: ¥${zaicoPurchasePrice.toLocaleString()}` : ''}`,
        createdAt: new Date().toISOString()
      };
      
      newProjectInventory.push(projectItem);
      syncCount++;
      console.log(`新規追加: ${zaicoItem.title} (zaicoId: ${zaicoItem.id})${zaicoPurchasePrice > 0 ? ` | 仕入単価: ¥${zaicoPurchasePrice.toLocaleString()}` : ' | 仕入単価なし'}`);
    }
    
    // Zaicoで削除された商品をプロジェクトからも削除
    const zaicoIds = zaicoInventory.map(item => item.id);
    const originalCount = newProjectInventory.length;
    
    // Zaicoに存在しない商品をフィルタリング
    const filteredInventory = newProjectInventory.filter(item => {
      // Zaico同期商品（zaicoIdがある）のみチェック
      if (item.zaicoId && !zaicoIds.includes(item.zaicoId)) {
        console.log(`Zaicoで削除された商品を削除: ${item.title} (zaicoId: ${item.zaicoId})`);
        return false;
      }
      return true;
    });
    
    const deletedCount = originalCount - filteredInventory.length;
    
    // 更新された在庫データを保存
    localStorage.setItem('inventory', JSON.stringify(filteredInventory));
    
    console.log(`同期完了: ${syncCount}件の在庫データを追加, ${deletedCount}件の在庫データを削除`);
    
    return { 
      success: true, 
      syncCount, 
      deletedCount,
      totalCount: filteredInventory.length 
    };
    
  } catch (error) {
    console.error('Zaico → プロジェクト同期エラー:', error);
    
    return { success: false, error: error.message };
  }
};
