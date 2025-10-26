import React, { useState, useEffect } from 'react';
import { manufacturers, colors, gameConsoles } from '../data/gameConsoles';
import { getAllConsoles } from '../utils/productMaster';
import { generateProductCode } from '../utils/productCodeGenerator';
import { calculateBuyerPrice } from '../utils/priceCalculator';
import { createOutboundItemInZaico, logSyncActivity } from '../utils/zaicoApi';
import './Sales.css';

// 担当者リスト（Rating.jsxと同じ）
const staffMembers = [
  '佐藤 花子（Sato Hanako）',
  '鈴木 一郎（Suzuki Ichiro）',
  '田中 美咲（Tanaka Misaki）',
  '高橋 健太（Takahashi Kenta）'
];

// 担当者名から英語名を抽出
const getEnglishName = (fullName) => {
  if (!fullName) return '';
  const match = fullName.match(/（(.+?)）/);
  return match ? match[1] : fullName;
};

// 担当者名から日本語名を抽出
const getJapaneseName = (fullName) => {
  if (!fullName) return '';
  const match = fullName.match(/^(.+?)（/);
  return match ? match[1] : fullName;
};

const Sales = () => {
  const [viewMode, setViewMode] = useState('selection'); // 'selection', 'pending', 'completed', 'detail'
  const [previousViewMode, setPreviousViewMode] = useState(null);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState(null);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showShippingInfo, setShowShippingInfo] = useState(true);
  const [salesStaffName, setSalesStaffName] = useState(''); // 販売担当者

  // 送料と配送期間の一時入力値（見積もり中のリアルタイム表示用）
  const [tempShippingFee, setTempShippingFee] = useState(0);
  const [tempDeliveryDays, setTempDeliveryDays] = useState('');
  
  // 在庫選択機能
  const [showInventorySelection, setShowInventorySelection] = useState(false);
  const [selectedInventories, setSelectedInventories] = useState({}); // { itemId: [{ invId, quantity }] }
  
  // 管理番号モーダル
  const [showManagementNumberModal, setShowManagementNumberModal] = useState(false);
  const [currentManagementNumbers, setCurrentManagementNumbers] = useState([]);
  const [currentItemInfo, setCurrentItemInfo] = useState(null);
  
  // 価格計算情報の表示
  const [priceCalculations, setPriceCalculations] = useState({}); // { itemId: { basePrice, adjustment, finalPrice } }

  // 為替レート（USD to JPY）
  const EXCHANGE_RATE = 150; // $1 = ¥150

  // 日本時間の今日の日付を取得
  const getTodayJST = () => {
    const now = new Date();
    const jstOffset = 9 * 60;
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    return jstTime.toISOString().split('T')[0];
  };

  // JPYをUSDに変換
  const convertToUSD = (jpy) => {
    return Math.round(jpy / EXCHANGE_RATE * 100) / 100; // 小数点2桁
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

  // localStorageからリクエストデータを取得
  const loadRequests = () => {
    const storedRequests = localStorage.getItem('salesRequests');
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    } else {
      setRequests([]);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ページがアクティブになった時にデータを再読み込み
  useEffect(() => {
    const handleFocus = () => {
      loadRequests();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'salesRequests') {
        loadRequests();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    // 定期的にデータを更新（5秒ごと）
    const intervalId = setInterval(() => {
      loadRequests();
    }, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const currentReq = selectedRequestNumber ? requests.find(r => r.requestNumber === selectedRequestNumber) : null;

  // 選択中のリクエストが変わったら、送料と配送期間を初期化
  useEffect(() => {
    if (currentReq) {
      setTempShippingFee(currentReq.shippingFee || 0);
      setTempDeliveryDays(currentReq.deliveryDays || '');
      // 担当者名を設定（既にある場合）
      if (currentReq.salesStaffName) {
        setSalesStaffName(currentReq.salesStaffName);
      } else {
        setSalesStaffName('');
      }
      
      // 在庫選択をリセット（新しいリクエスト用）
      setSelectedInventories({});
      
      // 見積もり中（pending）の場合は価格を自動計算
      if (currentReq.status === 'pending') {
        calculateAllPrices();
      }
    }
  }, [selectedRequestNumber]); // currentReq?.requestNumberを削除

  // 基準価格の変更を監視して価格を再計算
  useEffect(() => {
    if (currentReq && currentReq.status === 'pending') {
      const handleStorageChange = (e) => {
        // 基準価格関連のキーの変更のみを監視
        if (e.key === 'basePrices' || e.key === 'buyerAdjustments') {
          console.log('基準価格が変更されました:', e.key);
          // 手動入力された価格は保護して再計算
          calculateAllPrices();
        }
      };

      // localStorageの変更を監視
      window.addEventListener('storage', handleStorageChange);

      const handleBasePriceUpdate = (event) => {
        console.log('基準価格が更新されました:', event.detail);
        calculateAllPricesWithOverride(); // 強制更新で価格を再計算
      };
      window.addEventListener('basePriceUpdated', handleBasePriceUpdate);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('basePriceUpdated', handleBasePriceUpdate);
      };
    }
  }, [currentReq?.requestNumber, currentReq?.status]); // requestNumberを追加してより厳密に

  // 在庫から利用可能数を取得
  const getAvailableStock = (item) => {
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    return inventoryData.filter(inv => 
      inv.console === item.console && 
      (!item.color || inv.color === item.color)
    ).reduce((sum, inv) => sum + (inv.quantity || 0), 0);
  };

  // 商品に対応する在庫リストを取得（ランク別）
  const getInventoryListForItem = (item) => {
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    return inventoryData.filter(inv => 
      inv.console === item.console && 
      (!item.color || inv.color === item.color) &&
      (item.productType === 'software' ? inv.softwareName === item.softwareName : true) &&
      inv.quantity > 0
    ).sort((a, b) => {
      // ランク順 > 価格順（安い順）
      const rankOrder = { 'S': 1, 'A': 2, 'B': 3, 'C': 4 };
      if (rankOrder[a.assessedRank] !== rankOrder[b.assessedRank]) {
        return rankOrder[a.assessedRank] - rankOrder[b.assessedRank];
      }
      return (a.acquisitionPrice || a.buybackPrice) - (b.acquisitionPrice || b.buybackPrice);
    });
  };

  // 選択した在庫の合計仕入れ額を計算
  const calculateAcquisitionCost = (itemId) => {
    if (!selectedInventories[itemId]) return 0;
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    
    return selectedInventories[itemId].reduce((sum, sel) => {
      const inv = inventoryData.find(i => i.id === sel.invId);
      if (inv) {
        const price = inv.acquisitionPrice || inv.buybackPrice || 0;
        return sum + (price * sel.quantity);
      }
      return sum;
    }, 0);
  };

  // 選択した在庫の合計数量
  const getSelectedQuantity = (itemId) => {
    if (!selectedInventories[itemId]) return 0;
    return selectedInventories[itemId].reduce((sum, sel) => sum + sel.quantity, 0);
  };

  // 管理番号を表示
  const handleShowManagementNumbers = (inv, selectedQuantity, itemInfo) => {
    if (!inv.managementNumbers || inv.managementNumbers.length === 0) {
      alert('この在庫には管理番号が登録されていません');
      return;
    }
    
    // 選択された数量分の管理番号を取得
    const numbers = inv.managementNumbers.slice(0, selectedQuantity);
    setCurrentManagementNumbers(numbers);
    setCurrentItemInfo({
      ...itemInfo,
      selectedQuantity: selectedQuantity,
      totalStock: inv.quantity,
      rank: inv.assessedRank
    });
    setShowManagementNumberModal(true);
  };

  // 在庫選択を追加
  const handleSelectInventory = (itemId, invId, quantity, requestedQuantity) => {
    // 現在の選択状況を取得
    const current = selectedInventories[itemId] || [];
    const existingIndex = current.findIndex(s => s.invId === invId);
    
    // 新しい合計数量を計算
    let newTotal = 0;
    if (quantity === 0) {
      // 削除する場合
      newTotal = current
        .filter(s => s.invId !== invId)
        .reduce((sum, s) => sum + s.quantity, 0);
    } else if (existingIndex !== -1) {
      // 更新する場合
      newTotal = current.reduce((sum, s) => 
        s.invId === invId ? sum + quantity : sum + s.quantity, 0);
    } else {
      // 新規追加する場合
      newTotal = current.reduce((sum, s) => sum + s.quantity, 0) + quantity;
    }
    
    // リクエスト数量を超えていないかチェック
    if (newTotal > requestedQuantity) {
      alert(`⚠️ 選択数量がリクエスト数量を超えています。\n\nリクエスト: ${requestedQuantity}台\n選択しようとした合計: ${newTotal}台\n\nリクエスト数量以下で選択してください。`);
      return;
    }
    
    setSelectedInventories(prev => {
      const current = prev[itemId] || [];
      const existingIndex = current.findIndex(s => s.invId === invId);
      
      if (quantity === 0) {
        // 数量0なら削除
        return {
          ...prev,
          [itemId]: current.filter(s => s.invId !== invId)
        };
      }
      
      if (existingIndex !== -1) {
        // 既存を更新
        const updated = [...current];
        updated[existingIndex] = { invId, quantity };
        return {
          ...prev,
          [itemId]: updated
        };
      } else {
        // 新規追加
        return {
          ...prev,
          [itemId]: [...current, { invId, quantity }]
        };
      }
    });
  };

  // ステータス更新
  const updateStatus = (newStatus) => {
    const updatedRequests = requests.map(req => 
      req.requestNumber === selectedRequestNumber 
        ? { ...req, status: newStatus }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));
  };

  // 商品の見積もり価格/在庫数を更新
  const handleItemUpdate = (itemId, field, value) => {
    const updatedRequests = requests.map(req => {
      if (req.requestNumber === selectedRequestNumber) {
        return {
          ...req,
          items: req.items.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  [field]: value,
                  // 価格入力時はタイムスタンプを追加
                  ...(field === 'quotedPrice' ? { lastPriceUpdate: new Date().toISOString() } : {})
                }
              : item
          )
        };
      }
      return req;
    });
    setRequests(updatedRequests);
    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));
  };

  // 商品の価格を自動計算（バイヤー別価格調整適用）
  const calculateItemPrice = (item, buyerEmail) => {
    // 在庫から該当商品を探してランクを取得
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    const matchingInventory = inventoryData.find(inv => 
      inv.console === item.console &&
      (!item.color || inv.color === item.color)
    );
    
    if (!matchingInventory) {
      return null; // 在庫なし
    }
    
    const rank = matchingInventory.assessedRank || 'A';
    const productCode = generateProductCode(item.manufacturer, item.console, item.productType);
    
    return calculateBuyerPrice(productCode, rank, buyerEmail);
  };

  // 全商品の価格を一括計算
  const calculateAllPrices = (forceUpdate = false) => {
    if (!currentReq || !currentReq.customer) return;
    
    const calculations = {};
    const updatedItems = currentReq.items.map(item => {
      const calc = calculateItemPrice(item, currentReq.customer.email);
      
      if (calc && calc.finalPrice > 0) {
        calculations[item.id] = calc;
        // 手動入力された価格の保護を強化
        const hasManualPrice = item.quotedPrice && item.quotedPrice > 0;
        const isRecentlyUpdated = item.lastPriceUpdate && 
          (Date.now() - new Date(item.lastPriceUpdate).getTime()) < 5000; // 5秒以内の更新
        
        // 強制更新または価格が未設定の場合のみ自動設定
        if (forceUpdate || (!hasManualPrice && !isRecentlyUpdated)) {
          return { 
            ...item, 
            quotedPrice: calc.finalPrice,
            lastPriceUpdate: new Date().toISOString()
          };
        }
      }
      
      return item;
    });
    
    setPriceCalculations(calculations);
    
    // リクエストを更新
    const updatedRequests = requests.map(req => 
      req.requestNumber === selectedRequestNumber
        ? { ...req, items: updatedItems }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));
  };

  // 基準価格更新時の強制価格再計算（手動入力された価格も更新）
  const calculateAllPricesWithOverride = () => {
    if (!currentReq || !currentReq.customer) return;
    
    const calculations = {};
    const updatedItems = currentReq.items.map(item => {
      const calc = calculateItemPrice(item, currentReq.customer.email);
      
      if (calc && calc.finalPrice > 0) {
        calculations[item.id] = calc;
        // 基準価格が更新された場合は、手動入力された価格も更新
        return { ...item, quotedPrice: calc.finalPrice };
      }
      
      return item;
    });
    
    setPriceCalculations(calculations);
    
    // リクエストを更新
    const updatedRequests = requests.map(req => 
      req.requestNumber === selectedRequestNumber
        ? { ...req, items: updatedItems }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));
  };

  // 見積もり確定
  const handleConfirmQuote = () => {
    // 全商品に価格が入力されているかチェック
    const allPriced = currentReq.items.every(item => item.quotedPrice && item.quotedPrice > 0);
    if (!allPriced) {
      alert('全ての商品に販売単価を入力してください');
      return;
    }

    // 送料と配送期間をチェック
    if (!tempShippingFee || tempShippingFee <= 0) {
      alert('送料を入力してください');
      return;
    }
    
    if (!tempDeliveryDays || tempDeliveryDays.trim() === '') {
      alert('配送期間を入力してください');
      return;
    }

    // 担当者名のチェック
    if (!salesStaffName) {
      alert('販売担当者を選択してください');
      return;
    }

    const confirmAction = window.confirm('見積もりを確定してお客様に送信しますか？');
    if (!confirmAction) return;

    // 送料と配送期間と担当者名を保存
    const updatedRequests = requests.map(req => 
      req.requestNumber === selectedRequestNumber
        ? {
            ...req,
            shippingFee: tempShippingFee,
            deliveryDays: tempDeliveryDays,
            salesStaffName: salesStaffName,
            status: 'quoted'
          }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));
    
    alert('見積もりを送信しました。');
  };

  // 発送完了処理（在庫減算 + 古物台帳記録）
  const handleCompleteSale = async (shippedDate, trackingNumber) => {
    // 在庫選択のチェック
    const mismatches = [];
    currentReq.items.forEach(item => {
      const selectedQty = getSelectedQuantity(item.id);
      if (selectedQty !== item.quantity) {
        const productName = item.productType === 'software' 
          ? item.softwareName 
          : `${item.manufacturerLabel} ${item.consoleLabel}`;
        mismatches.push(`${productName}: リクエスト${item.quantity}台 / 選択${selectedQty}台`);
      }
    });
    
    if (mismatches.length > 0) {
      alert(`⚠️ 在庫選択数量がリクエストと一致していません：\n\n${mismatches.join('\n')}\n\nすべての商品について、リクエスト数量と同じ数量の在庫を選択してください。`);
      return;
    }
    
    const confirmAction = window.confirm('発送完了にしますか？\n在庫が減算され、古物台帳に記録されます。\nこの操作は取り消せません。');
    if (!confirmAction) return;

    // 在庫データを取得（減算前）
    const inventoryData = JSON.parse(localStorage.getItem('inventory') || '[]');
    
    // zaico連携処理（在庫減算前に行う）
    try {
      for (const item of currentReq.items) {
        const selectedInvs = selectedInventories[item.id] || [];
        const salesPricePerUnit = item.quotedPrice;
        
        for (const sel of selectedInvs) {
          const inv = inventoryData.find(inv => inv.id === sel.invId);
          if (inv) {
            const zaicoSaleData = {
              title: inv.title || inv.consoleLabel || inv.softwareName || 'ゲーム商品',
              inventoryId: inv.id,
              quantity: sel.quantity,
              salePrice: salesPricePerUnit,
              customerName: currentReq.customer.name,
              buyerName: currentReq.customer.name,
              salesChannel: '海外販売',
              shippingCountry: currentReq.customer.country || '海外',
              shippingFee: currentReq.shippingFee || 0,
              notes: `海外販売: ${currentReq.requestNumber} | 査定ランク: ${inv.assessedRank || ''} | 担当者: ${currentReq.salesStaffName || ''}`
            };
            
            console.log('=== 出庫処理デバッグ情報 ===');
            console.log('zaicoSaleData:', zaicoSaleData);
            console.log('在庫データ:', inv);
            console.log('zaicoId:', inv.zaicoId);
            
            await createOutboundItemInZaico(zaicoSaleData);
            
            logSyncActivity('overseas_sale_create', 'success', {
              requestNumber: currentReq.requestNumber,
              itemId: inv.id,
              customerName: currentReq.customer.name,
              soldPrice: salesPricePerUnit,
              quantity: sel.quantity,
              method: 'overseas_outbound_with_customer_and_price'
            });
          }
        }
      }
      
      console.log('zaico海外販売出庫データ作成成功');
    } catch (error) {
      logSyncActivity('overseas_sale_create', 'error', {
        requestNumber: currentReq.requestNumber,
        error: error.message
      });
      console.error('zaico海外販売出庫データ作成エラー:', error);
    }
    
    // 在庫から減算
    const salesLedger = JSON.parse(localStorage.getItem('salesLedger') || '[]');
    
    const salesRecord = {
      id: `SALE-${Date.now()}`,
      type: 'sales',
      requestNumber: currentReq.requestNumber,
      soldDate: new Date().toISOString(),
      customer: currentReq.customer,
      items: [],
      summary: {
        totalAcquisitionCost: 0,
        totalSalesAmount: 0,
        totalProfit: 0
      }
    };

    // 各商品の在庫減算と台帳記録
    currentReq.items.forEach(item => {
      const selectedInvs = selectedInventories[item.id] || [];
      const salesPricePerUnit = item.quotedPrice; // quotedPriceは既に円
      
      selectedInvs.forEach(sel => {
        const invIndex = inventoryData.findIndex(inv => inv.id === sel.invId);
        if (invIndex !== -1) {
          const inv = inventoryData[invIndex];
          const acquisitionPrice = inv.acquisitionPrice || inv.buybackPrice || 0;
          const totalAcquisitionCost = acquisitionPrice * sel.quantity;
          const totalSalesAmount = salesPricePerUnit * sel.quantity;
          const totalProfit = totalSalesAmount - totalAcquisitionCost;

          // 台帳に記録
          salesRecord.items.push({
            inventoryId: inv.id,
            product: item.productType === 'software' 
              ? `${item.softwareName} (${item.consoleLabel})` 
              : `${item.consoleLabel}${item.colorLabel ? ' - ' + item.colorLabel : ''}`,
            rank: inv.assessedRank,
            quantity: sel.quantity,
            acquisitionPrice: acquisitionPrice,
            totalAcquisitionCost: totalAcquisitionCost,
            salesPrice: salesPricePerUnit,
            totalSalesAmount: totalSalesAmount,
            profit: salesPricePerUnit - acquisitionPrice,
            totalProfit: totalProfit,
            source: inv.sourceType === 'customer' 
              ? { type: 'customer', name: inv.customer?.name || '不明', applicationNumber: inv.applicationNumber }
              : { type: 'supplier', name: inv.supplier?.name || '不明', invoiceNumber: inv.supplier?.invoiceNumber || '' }
          });

          // サマリーに加算
          salesRecord.summary.totalAcquisitionCost += totalAcquisitionCost;
          salesRecord.summary.totalSalesAmount += totalSalesAmount;
          salesRecord.summary.totalProfit += totalProfit;

          // salesHistoryに販売記録を追加（買取記録を生成するため）
          const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
          salesHistory.push({
            id: `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            inventoryItemId: inv.id,
            productType: inv.productType,
            manufacturer: inv.manufacturer,
            manufacturerLabel: inv.manufacturerLabel,
            console: inv.console,
            consoleLabel: inv.consoleLabel,
            color: inv.color,
            colorLabel: inv.colorLabel,
            softwareName: inv.softwareName,
            assessedRank: inv.assessedRank,
            quantity: sel.quantity,
            acquisitionPrice: acquisitionPrice,
            soldPrice: salesPricePerUnit,
            profit: salesPricePerUnit - acquisitionPrice,
            salesChannel: 'overseas',
            soldTo: currentReq.customer.name,
            soldAt: new Date().toISOString(),
            managementNumbers: (inv.managementNumbers || []).slice(0, sel.quantity),
            // 買取記録を生成するための情報
            buybackInfo: {
              applicationNumber: inv.applicationNumber,
              buybackPrice: acquisitionPrice,
              buybackDate: inv.registeredDate,
              customer: inv.customer || null
            }
          });
          localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
          
          // 在庫を減算
          const beforeQuantity = inventoryData[invIndex].quantity;
          inventoryData[invIndex].quantity -= sel.quantity;
          
          // 在庫変更履歴を記録
          const inventoryHistory = JSON.parse(localStorage.getItem('inventoryHistory') || '[]');
          inventoryHistory.push({
            itemId: inv.id,
            type: 'sale',
            change: -sel.quantity,
            beforeQuantity: beforeQuantity,
            afterQuantity: inventoryData[invIndex].quantity,
            date: new Date().toISOString(),
            performedBy: currentReq.salesStaffName || 'スタッフ',
            reason: `販売処理（${currentReq.requestNumber}）`,
            relatedTransaction: {
              type: 'sales',
              requestNumber: currentReq.requestNumber,
              customer: currentReq.customer.name
            }
          });
          localStorage.setItem('inventoryHistory', JSON.stringify(inventoryHistory));
        }
      });
    });

    // 在庫0の商品を削除
    const filteredInventory = inventoryData.filter(inv => inv.quantity > 0);
    localStorage.setItem('inventory', JSON.stringify(filteredInventory));

    // 古物台帳に記録
    salesLedger.push(salesRecord);
    localStorage.setItem('salesLedger', JSON.stringify(salesLedger));

    // リクエストに選択した在庫情報を保存
    const updatedRequests = requests.map(req =>
      req.requestNumber === selectedRequestNumber
        ? {
            ...req,
            status: 'shipped',
            shippedDate: shippedDate,
            trackingNumber: trackingNumber,
            selectedInventories: selectedInventories,
            salesRecordId: salesRecord.id
          }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('salesRequests', JSON.stringify(updatedRequests));

    // zaico連携処理は在庫減算前に実行済み

    alert(`発送完了しました。\n在庫を更新し、古物台帳に記録しました。\n\n利益: ¥${salesRecord.summary.totalProfit.toLocaleString()}`);
    setShowInventorySelection(false);
  };

  // 見積書印刷
  const handlePrint = () => {
    if (!currentReq || !currentReq.items || currentReq.items.length === 0) {
      alert('印刷する商品がありません');
      return;
    }
    
    // 見積もり中の場合、送料チェック
    if (currentReq.status === 'pending' && (!tempShippingFee || tempShippingFee <= 0)) {
      alert('送料を入力してから印刷してください');
      return;
    }
    
    // 見積書のみを印刷するためのスタイルを一時的に適用
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @media print {
        .invoice-sheet { display: none !important; }
        .estimate-sheet { display: block !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(printStyle);
    
    // 見積書を表示
    const estimateElement = document.querySelector('.estimate-sheet');
    if (estimateElement) {
      estimateElement.style.display = 'block';
    }
    
    // インボイスを非表示
    const invoiceElement = document.querySelector('.invoice-sheet');
    if (invoiceElement) {
      invoiceElement.style.display = 'none';
    }
    
    window.print();
    
    // 印刷後、スタイルを削除
    document.head.removeChild(printStyle);
    if (invoiceElement) {
      invoiceElement.style.display = 'none';
    }
    if (estimateElement) {
      estimateElement.style.display = 'none';
    }
  };

  // インボイス印刷
  const handlePrintInvoice = () => {
    if (!currentReq || !currentReq.items || currentReq.items.length === 0) {
      alert('印刷する商品がありません');
      return;
    }
    
    // インボイス印刷用のスタイルを一時的に適用
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @media print {
        .estimate-sheet { display: none !important; }
        .invoice-sheet { display: block !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(printStyle);
    
    // インボイス印刷用のクラスを追加
    const invoiceElement = document.querySelector('.invoice-sheet');
    if (invoiceElement) {
      invoiceElement.style.display = 'block';
    }
    
    window.print();
    
    // 印刷後、スタイルを削除
    document.head.removeChild(printStyle);
    if (invoiceElement) {
      invoiceElement.style.display = 'none';
    }
  };

  // 印刷用の送料・配送期間取得
  const getPrintShippingFee = () => {
    return currentReq.status === 'pending' ? tempShippingFee : (currentReq.shippingFee || 0);
  };

  const getPrintDeliveryDays = () => {
    return currentReq.status === 'pending' ? tempDeliveryDays : (currentReq.deliveryDays || '');
  };

  // 合計金額計算
  const calculateTotal = () => {
    if (!currentReq || !currentReq.items) return 0;
    return currentReq.items.reduce((sum, item) => {
      return sum + (item.quotedPrice || 0) * item.quantity;
    }, 0);
  };

  // 商品の原産国を取得
  const getCountryOfOrigin = (item) => {
    if (item.productType === 'software') {
      // ソフトウェアの場合は親機種の原産国を取得
      const consoleData = Object.values(gameConsoles).flat().find(console => 
        console.value === item.console
      );
      return consoleData?.country || 'China';
    } else {
      // ハードウェアの場合は直接取得
      const consoleData = Object.values(gameConsoles).flat().find(console => 
        console.value === item.console
      );
      return consoleData?.country || 'China';
    }
  };

  // インボイス印刷用の発送情報を取得
  const getInvoiceShippingInfo = () => {
    // 発送完了済みの場合は保存された値を使用
    if (currentReq.shippedDate && currentReq.trackingNumber) {
      return {
        shippedDate: currentReq.shippedDate,
        trackingNumber: currentReq.trackingNumber
      };
    }
    
    // 発送完了前の場合は入力フィールドから取得
    const dateElement = document.getElementById('shippedDate');
    const trackingElement = document.getElementById('trackingNumber');
    
    return {
      shippedDate: dateElement?.value || getTodayJST(),
      trackingNumber: trackingElement?.value || ''
    };
  };

  // 総重量を計算
  const calculateTotalWeight = () => {
    if (!currentReq || !currentReq.items) return 0;
    return currentReq.items.reduce((sum, item) => {
      return sum + (item.weight || 0);
    }, 0);
  };

  // リストに戻る
  const handleBackToList = () => {
    setViewMode(previousViewMode || 'selection');
    setSelectedRequestNumber(null);
    setPreviousViewMode(null);
  };

  // カードクリックで詳細表示
  const handleCardClick = (requestNumber, from) => {
    setSelectedRequestNumber(requestNumber);
    setPreviousViewMode(from);
    setViewMode('detail');
  };

  // ステータスに応じたフィルタリング
  const getFilteredRequests = () => {
    let filtered = requests;

    if (viewMode === 'pending') {
      // 進行中の取引（shipped以外）
      filtered = requests.filter(req => req.status !== 'shipped');
    } else if (viewMode === 'completed') {
      // 完了した取引（shipped）
      filtered = requests.filter(req => req.status === 'shipped');
    } else if (viewMode === 'detail') {
      // 詳細画面では、前の画面に応じてフィルタリング
      if (previousViewMode === 'pending') {
        filtered = requests.filter(req => req.status !== 'shipped');
      } else if (previousViewMode === 'completed') {
        filtered = requests.filter(req => req.status === 'shipped');
      }
    }

    // ステータスフィルター（詳細画面から来た場合のみ）
    if (statusFilter !== 'all' && (viewMode === 'pending' || (viewMode === 'detail' && previousViewMode === 'pending'))) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // ステータスラベル
  const getStatusLabel = (status) => {
    const labels = {
      pending: '見積もり待ち',
      quoted: '見積もり送信済',
      approved: '承認済',
      payment_confirmed: '入金確認済',
      shipped: '発送完了'
    };
    return labels[status] || status;
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      pending: '⏳',
      quoted: '📋',
      approved: '✅',
      payment_confirmed: '💳',
      shipped: '📦'
    };
    return emojis[status] || '📄';
  };

  // === 選択画面 ===
  if (viewMode === 'selection') {
    const pendingCount = requests.filter(r => r.status !== 'shipped').length;
    const completedCount = requests.filter(r => r.status === 'shipped').length;

    return (
      <div className="sales-container">
        <h1>販売管理</h1>
        <p className="subtitle">海外顧客からのリクエストを管理します</p>

        <div className="selection-screen">
          <button 
            className="selection-btn pending-btn"
            onClick={() => setViewMode('pending')}
          >
            <div className="btn-icon">🔄</div>
            <div className="btn-title">進行中のリクエスト</div>
            <div className="btn-description">見積もり作成・対応中の取引</div>
            {pendingCount > 0 && <div className="btn-count">{pendingCount}件</div>}
          </button>

          <button 
            className="selection-btn completed-btn"
            onClick={() => setViewMode('completed')}
          >
            <div className="btn-icon">✅</div>
            <div className="btn-title">完了した取引</div>
            <div className="btn-description">発送完了済みの取引履歴</div>
            {completedCount > 0 && <div className="btn-count">{completedCount}件</div>}
          </button>
        </div>
      </div>
    );
  }

  // === 一覧画面（進行中） ===
  if (viewMode === 'pending') {
    const filteredRequests = getFilteredRequests();

    return (
      <div className="sales-container">
        <div className="list-header">
          <h1>🔄 進行中のリクエスト</h1>
          <button className="back-btn" onClick={() => setViewMode('selection')}>
            ← 戻る
          </button>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p>進行中のリクエストはありません</p>
          </div>
        ) : (
          <div className="request-list">
            {filteredRequests.map((req, index) => {
              return (
                <div 
                  key={req.requestNumber} 
                  className="request-card"
                  onClick={() => handleCardClick(req.requestNumber, 'pending')}
                >
                  <div className="card-header-row">
                    <div className="card-req-number">リクエスト番号: {req.requestNumber}</div>
                    <div className="card-status">
                      {getStatusEmoji(req.status)} {getStatusLabel(req.status)}
                    </div>
                  </div>
                  <div className="card-customer">
                    👤 {req.customer.name} ({req.customer.country || 'Japan'})
                  </div>
                  <div className="card-items">
                    📦 {req.items.length}商品・合計{req.items.reduce((sum, i) => sum + i.quantity, 0)}点
                  </div>
                  <div className="card-date">
                    📅 {new Date(req.date).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // === 一覧画面（完了） ===
  if (viewMode === 'completed') {
    const filteredRequests = getFilteredRequests();

    return (
      <div className="sales-container">
        <div className="list-header">
          <h1>✅ 完了した取引</h1>
          <button className="back-btn" onClick={() => setViewMode('selection')}>
            ← 戻る
          </button>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p>完了した取引はありません</p>
          </div>
        ) : (
          <div className="request-list">
            {filteredRequests.map((req, index) => {
              const total = req.items.reduce((sum, i) => sum + (i.quotedPrice || 0) * i.quantity, 0);
              return (
                <div 
                  key={req.requestNumber} 
                  className="request-card completed-card"
                  onClick={() => handleCardClick(req.requestNumber, 'completed')}
                >
                  <div className="card-header-row">
                    <div className="card-req-number">リクエスト番号: {req.requestNumber}</div>
                  </div>
                  <div className="card-customer">
                    👤 {req.customer.name} ({req.customer.country || 'Japan'})
                  </div>
                  <div className="card-items">
                    📦 {req.items.length}商品・合計{req.items.reduce((sum, i) => sum + i.quantity, 0)}点
                  </div>
                  <div className="card-total">
                    💰 合計: ${convertToUSD(total).toFixed(2)}
                  </div>
                  <div className="card-date">
                    📅 {new Date(req.date).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // === 詳細画面 ===
  if (viewMode === 'detail' && currentReq) {
    const showLeftPanel = previousViewMode === 'pending';

    return (
      <div className="sales-container">
        <div className="detail-header">
          <h1>📋 リクエスト詳細</h1>
          <button className="back-btn-right" onClick={handleBackToList}>
            一覧に戻る →
          </button>
        </div>

        <div className={showLeftPanel ? 'sales-detail-layout' : 'sales-detail-only-layout'}>
          {/* 左パネル（進行中の場合のみ） */}
          {showLeftPanel && (
            <div className="sales-left-panel">
              <div className="sales-filter-card">
                <h3>🔍 ステータスフィルター</h3>
                <div className="sales-filter-buttons">
                  <button 
                    className={statusFilter === 'all' ? 'active' : ''}
                    onClick={() => setStatusFilter('all')}
                  >
                    全て表示
                  </button>
                  <button 
                    className={statusFilter === 'pending' ? 'active' : ''}
                    onClick={() => setStatusFilter('pending')}
                  >
                    見積もり待ち
                  </button>
                  <button 
                    className={statusFilter === 'quoted' ? 'active' : ''}
                    onClick={() => setStatusFilter('quoted')}
                  >
                    見積もり送信済
                  </button>
                  <button 
                    className={statusFilter === 'approved' ? 'active' : ''}
                    onClick={() => setStatusFilter('approved')}
                  >
                    承認済
                  </button>
                  <button 
                    className={statusFilter === 'payment_confirmed' ? 'active' : ''}
                    onClick={() => setStatusFilter('payment_confirmed')}
                  >
                    入金確認済
                  </button>
                </div>
              </div>

              <div className="sales-request-list-panel">
                <h3>📋 リクエスト一覧</h3>
                <div className="sales-mini-request-list">
                  {getFilteredRequests().map((req, idx) => {
                    return (
                      <div 
                        key={req.requestNumber}
                        className={`sales-mini-request-card ${req.requestNumber === selectedRequestNumber ? 'active' : ''}`}
                        onClick={() => setSelectedRequestNumber(req.requestNumber)}
                      >
                        <div className="sales-mini-req-number">{req.requestNumber}</div>
                        <div className="sales-mini-req-customer">{req.customer.name}</div>
                        <div className="sales-mini-req-status">
                          {getStatusEmoji(req.status)} {getStatusLabel(req.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 右パネル（詳細） */}
          <div className={showLeftPanel ? 'sales-right-panel' : 'sales-detail-panel-full'}>
            {/* 進捗バー */}
            <div className="sales-progress-bar-section">
              <h3>📊 販売進捗状況</h3>
              <div className="sales-progress-steps">
                <div className={`sales-progress-step ${['pending', 'quoted', 'approved', 'payment_confirmed', 'shipped'].includes(currentReq.status) ? 'completed' : 'pending'}`}>
                  <div className="sales-step-circle">1</div>
                  <span className="sales-step-label">リクエスト受付</span>
                </div>
                <div className={`sales-progress-line ${['quoted', 'approved', 'payment_confirmed', 'shipped'].includes(currentReq.status) ? 'completed' : 'pending'}`}></div>
                <div className={`sales-progress-step ${['quoted', 'approved', 'payment_confirmed', 'shipped'].includes(currentReq.status) ? 'completed' : currentReq.status === 'pending' ? 'current' : 'pending'}`}>
                  <div className="sales-step-circle">2</div>
                  <span className="sales-step-label">見積もり作成</span>
                </div>
                <div className={`sales-progress-line ${['approved', 'payment_confirmed', 'shipped'].includes(currentReq.status) ? 'completed' : 'pending'}`}></div>
                <div className={`sales-progress-step ${['approved', 'payment_confirmed', 'shipped'].includes(currentReq.status) ? 'completed' : currentReq.status === 'quoted' ? 'current' : 'pending'}`}>
                  <div className="sales-step-circle">3</div>
                  <span className="sales-step-label">顧客承認</span>
                </div>
                <div className={`sales-progress-line ${['payment_confirmed', 'shipped'].includes(currentReq.status) ? 'completed' : 'pending'}`}></div>
                <div className={`sales-progress-step ${['payment_confirmed', 'shipped'].includes(currentReq.status) ? 'completed' : currentReq.status === 'approved' ? 'current' : 'pending'}`}>
                  <div className="sales-step-circle">4</div>
                  <span className="sales-step-label">入金確認</span>
                </div>
                <div className={`sales-progress-line ${currentReq.status === 'shipped' ? 'completed' : 'pending'}`}></div>
                <div className={`sales-progress-step ${currentReq.status === 'shipped' ? 'completed' : currentReq.status === 'payment_confirmed' ? 'current' : 'pending'}`}>
                  <div className="sales-step-circle">5</div>
                  <span className="sales-step-label">発送完了</span>
                </div>
              </div>
            </div>

            {/* リクエスト情報とお客様情報をコンパクトに */}
            <div className="sales-compact-info-section">
              <div className="sales-compact-info-left">
                <h3>📋 リクエスト情報</h3>
                <p><strong>リクエスト番号:</strong> {currentReq.requestNumber}</p>
                <p><strong>日時:</strong> {new Date(currentReq.date).toLocaleString('ja-JP')}</p>
                <p><strong>ステータス:</strong> <span className="sales-status-badge" data-status={currentReq.status}>
                  {getStatusEmoji(currentReq.status)} {getStatusLabel(currentReq.status)}
                </span></p>
              </div>
              <div className="sales-compact-info-right">
                <h3>👤 お客様情報</h3>
                <p><strong>{currentReq.customer.name}</strong> 様</p>
                <p>📧 {currentReq.customer.email}</p>
                {currentReq.customer.phone && <p>📞 {currentReq.customer.phone}</p>}
                <p>🌏 {currentReq.customer.country || 'Japan'}</p>
              </div>
            </div>

            {/* 商品リスト */}
            <div className="sales-detail-section">
              <h2>📦 リクエスト商品・見積もり</h2>
              <div className="sales-rating-table-wrapper">
                <table className="sales-rating-table">
                  <thead>
                    <tr>
                      <th>タイプ</th>
                      <th>メーカー・機種</th>
                      <th>カラー</th>
                      <th>ソフト名</th>
                      <th>状態</th>
                      <th>付属品</th>
                      <th>希望数</th>
                      <th>在庫数</th>
                      <th>販売単価（JPY）</th>
                      <th>小計（JPY）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReq.items.map(item => {
                      const stock = getAvailableStock(item);
                      return (
                        <tr key={item.id}>
                          <td>{item.productTypeLabel || item.productType}</td>
                          <td>
                            {item.productType === 'software' ? (
                              <>
                                <strong>{item.softwareName}</strong>
                                <br />
                                <small style={{color: '#95a5a6'}}>{item.manufacturerLabel} - {item.consoleLabel}</small>
                              </>
                            ) : (
                              `${item.manufacturerLabel} - ${item.consoleLabel}`
                            )}
                          </td>
                          <td>{item.colorLabel || '-'}</td>
                          <td>{item.softwareName || '-'}</td>
                          <td>{item.conditionLabel || '-'}</td>
                          <td>{item.packageTypeLabel || '-'}</td>
                          <td>{item.quantity}</td>
                          <td>
                            <span className={stock >= item.quantity ? 'sales-stock-ok' : 'sales-stock-low'}>
                              {stock}
                            </span>
                          </td>
                          <td>
                            {currentReq.status === 'pending' ? (
                              <div className="price-input-with-calc">
                              <input
                                type="number"
                                value={item.quotedPrice || ''}
                                onChange={(e) => handleItemUpdate(item.id, 'quotedPrice', parseInt(e.target.value) || 0)}
                                className="sales-price-input"
                                  step="100"
                                placeholder="0"
                              />
                                {priceCalculations[item.id] && (
                                  <div className="price-calc-info">
                                    <small style={{color: '#7f8c8d'}}>
                                      基準: ¥{priceCalculations[item.id].basePrice.toLocaleString()}
                                    </small>
                                    {priceCalculations[item.id].adjustment && (
                                      <small style={{color: '#f39c12', fontWeight: 'bold'}}>
                                        調整: {priceCalculations[item.id].adjustmentDetails}
                                      </small>
                                    )}
                                  </div>
                                )}
                                <small style={{display: 'block', color: '#7f8c8d', marginTop: '4px'}}>
                                  {item.quotedPrice ? `($${convertToUSD(item.quotedPrice).toFixed(2)})` : ''}
                                </small>
                              </div>
                            ) : (
                              <div>
                                ¥{(item.quotedPrice || 0).toLocaleString()}
                                <small style={{display: 'block', color: '#7f8c8d', marginTop: '4px'}}>
                                  (${convertToUSD(item.quotedPrice || 0).toFixed(2)})
                                </small>
                              </div>
                            )}
                          </td>
                          <td className="sales-subtotal">
                            <div>
                              ¥{((item.quotedPrice || 0) * item.quantity).toLocaleString()}
                              <small style={{display: 'block', color: '#7f8c8d', marginTop: '4px'}}>
                                (${convertToUSD((item.quotedPrice || 0) * item.quantity).toFixed(2)})
                              </small>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 在庫選択セクション（入金確認済みの場合） */}
              {currentReq.status === 'payment_confirmed' && (
                <div className="inventory-selection-section">
                  <h2>📦 発送する在庫を選択</h2>
                  <p className="section-note">各商品に対応する在庫を選択してください。在庫はランク・仕入れ価格別に表示されます。</p>
                  
                  {currentReq.items.map(item => {
                    const inventoryList = getInventoryListForItem(item);
                    const selectedQty = getSelectedQuantity(item.id);
                    const needed = item.quantity;
                    const isComplete = selectedQty === needed;
                    const isOverSelected = selectedQty > needed;

                    return (
                      <div key={item.id} className="inventory-item-selection">
                        <div className="selection-header">
                          <h3>
                            {item.productType === 'software' 
                              ? `${item.softwareName} (${item.consoleLabel})` 
                              : `${item.consoleLabel}${item.colorLabel ? ' - ' + item.colorLabel : ''}`
                            }
                          </h3>
                          <div className="selection-progress">
                            <span className={isComplete ? 'complete' : isOverSelected ? 'over-selected' : 'incomplete'}>
                              選択済み: {selectedQty} / {needed}台 {isComplete && '✅'} {isOverSelected && '⚠️ 超過'}
                            </span>
                          </div>
                          <div className="weight-input-section">
                            <label>重量 (kg):</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="重量を入力 (例: 0.5)"
                              value={item.weight || ''}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // 数字と小数点のみ許可
                                if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                                  handleItemUpdate(item.id, 'weight', inputValue);
                                }
                              }}
                              className="weight-input"
                            />
                          </div>
                        </div>

                        {inventoryList.length === 0 ? (
                          <div className="no-inventory-warning">
                            ⚠️ この商品の在庫がありません
                          </div>
                        ) : (
                          <div className="inventory-list">
                            {inventoryList.map(inv => {
                              const currentSelection = selectedInventories[item.id]?.find(s => s.invId === inv.id);
                              const selectedFromThis = currentSelection?.quantity || 0;
                              const price = inv.acquisitionPrice || inv.buybackPrice || 0;
                              const sourceName = inv.sourceType === 'customer' 
                                ? inv.customer?.name || '不明'
                                : inv.supplier?.name || '不明';

                              return (
                                <div key={inv.id} className="inventory-row-compact">
                                  <div className="inventory-info-compact">
                                    <span className={`rank-badge rank-${inv.assessedRank.toLowerCase()}`}>
                                      {inv.assessedRank}
                                    </span>
                                    <span className="inventory-source">
                                      {inv.sourceType === 'customer' ? '👤' : '🏢'} {sourceName}
                                    </span>
                                    <span className="inventory-price">¥{price.toLocaleString()}/台</span>
                                    <span className="inventory-stock">在庫:{inv.quantity}台</span>
                                    {inv.registeredDate && (
                                      <span className="inventory-date">
                                        仕入日:{new Date(inv.registeredDate).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <div className="inventory-select-compact">
                                    <input
                                      type="number"
                                      min="0"
                                      max={inv.quantity}
                                      value={selectedFromThis}
                                      onChange={(e) => handleSelectInventory(item.id, inv.id, parseInt(e.target.value) || 0, item.quantity)}
                                      className="quantity-input-compact"
                                      placeholder="0"
                                    />
                                    <span>/ {inv.quantity}台</span>
                                    {selectedFromThis > 0 && (
                                      <button
                                        className="btn-show-management-numbers-compact"
                                        onClick={() => handleShowManagementNumbers(inv, selectedFromThis, {
                                          productName: item.productType === 'software' 
                                            ? `${item.softwareName} (${item.consoleLabel})` 
                                            : `${item.consoleLabel}${item.colorLabel ? ' - ' + item.colorLabel : ''}`,
                                          sourceName: inv.sourceType === 'customer' 
                                            ? inv.customer?.name || '不明'
                                            : inv.supplier?.name || '不明'
                                        })}
                                      >
                                        🏷️
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 利益計算表示 */}
                        {selectedQty > 0 && (
                          <div className="profit-display">
                            <div className="profit-row">
                              <span>販売価格:</span>
                              <span>¥{(item.quotedPrice * selectedQty).toLocaleString()}</span>
                            </div>
                            <div className="profit-row cost-item">
                              <span>送料（按分）:</span>
                              <span className="cost-value">
                                - ¥{Math.round((currentReq.shippingFee || 0) * (selectedQty / currentReq.items.reduce((sum, i) => sum + (getSelectedQuantity(i.id) || 0), 0))).toLocaleString()}
                              </span>
                            </div>
                            <div className="profit-row cost-item">
                              <span>仕入れ合計:</span>
                              <span className="cost-value">- ¥{calculateAcquisitionCost(item.id).toLocaleString()}</span>
                            </div>
                            <div className="profit-row profit-total">
                              <span>粗利益:</span>
                              <span className="profit-amount">
                                ¥{(
                                  (item.quotedPrice * selectedQty) - 
                                  Math.round((currentReq.shippingFee || 0) * (selectedQty / (currentReq.items.reduce((sum, i) => sum + (getSelectedQuantity(i.id) || 0), 0) || 1))) - 
                                  calculateAcquisitionCost(item.id)
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 備考 */}
              {currentReq.notes && (
                <div className="sales-detail-section">
                  <h2>📝 備考</h2>
                  <div className="sales-notes-display">{currentReq.notes}</div>
                </div>
              )}

              {/* 送料と配送期間の入力欄 */}
              {currentReq.status === 'pending' && (
                <>
                <div className="price-auto-calc-section">
                  <button className="btn-auto-calc-price" onClick={calculateAllPrices}>
                    💰 バイヤー別価格を一括計算
                  </button>
                  <small className="auto-calc-hint">
                    基準価格とバイヤー別調整を適用して、全商品の価格を自動計算します
                  </small>
                </div>
                
                <div className="sales-shipping-quote-section">
                  <div className="sales-quote-row">
                    <div className="sales-quote-item">
                      <label htmlFor="shippingFee">📦 送料（JPY）*</label>
                      <input
                        type="number"
                        id="shippingFee"
                        className="sales-shipping-input"
                        value={tempShippingFee || ''}
                        onChange={(e) => setTempShippingFee(parseInt(e.target.value) || 0)}
                        step="100"
                        placeholder="7500"
                      />
                      <small style={{color: '#7f8c8d', marginTop: '5px', display: 'block'}}>
                        ${convertToUSD(tempShippingFee || 0).toFixed(2)} / 参考: 小型 ¥4500-7500, 大型 ¥12000-22500
                      </small>
                    </div>
                    <div className="sales-quote-item">
                      <label htmlFor="deliveryDays">📅 配送期間 *</label>
                      <input
                        type="text"
                        id="deliveryDays"
                        className="sales-shipping-input"
                        value={tempDeliveryDays}
                        onChange={(e) => setTempDeliveryDays(e.target.value)}
                        placeholder="7-10"
                      />
                      <small style={{color: '#7f8c8d', marginTop: '5px', display: 'block'}}>
                        例: 7-10, 10-14（日数）
                      </small>
                    </div>
                  </div>
                </div>
                </>
              )}

              {/* 合計カード（小計 + 送料 = 合計）- 入金確認済み時は非表示 */}
              {currentReq.status !== 'payment_confirmed' && (
              <div className="sales-total-card">
                <div className="sales-total-row">
                  <span className="sales-total-label">小計</span>
                  <span className="sales-total-value">
                    ¥{calculateTotal().toLocaleString()}
                    <small style={{display: 'block', fontSize: '0.85em', color: '#7f8c8d', marginTop: '4px'}}>
                      (${convertToUSD(calculateTotal()).toFixed(2)})
                    </small>
                  </span>
                </div>
                
                {/* 送料表示（見積もり中は入力値、確定後は保存値） */}
                {((currentReq.status === 'pending' && tempShippingFee > 0) || (currentReq.status !== 'pending' && currentReq.shippingFee)) && (
                  <div className="sales-total-row">
                    <span className="sales-total-label">送料</span>
                    <span className="sales-total-value">
                      ¥{(currentReq.status === 'pending' ? tempShippingFee : currentReq.shippingFee).toLocaleString()}
                      <small style={{display: 'block', fontSize: '0.85em', color: '#7f8c8d', marginTop: '4px'}}>
                        (${convertToUSD(currentReq.status === 'pending' ? tempShippingFee : currentReq.shippingFee).toFixed(2)})
                      </small>
                    </span>
                  </div>
                )}
                
                {/* 配送期間表示 */}
                {((currentReq.status === 'pending' && tempDeliveryDays) || (currentReq.status !== 'pending' && currentReq.deliveryDays)) && (
                  <div className="sales-total-row">
                    <span className="sales-total-label">配送期間</span>
                    <span className="sales-total-value">
                      {currentReq.status === 'pending' ? tempDeliveryDays : currentReq.deliveryDays} 日
                    </span>
                  </div>
                )}
                
                {/* 合計金額 */}
                <div className="sales-total-row sales-grand-total">
                  <span className="sales-total-label">合計金額</span>
                  <span className="sales-total-value">
                    ¥{(calculateTotal() + (currentReq.status === 'pending' ? tempShippingFee : (currentReq.shippingFee || 0))).toLocaleString()}
                    <small style={{display: 'block', fontSize: '0.85em', color: '#7f8c8d', marginTop: '4px'}}>
                      (${convertToUSD(calculateTotal() + (currentReq.status === 'pending' ? tempShippingFee : (currentReq.shippingFee || 0))).toFixed(2)})
                    </small>
                  </span>
                </div>
              </div>
              )}
            </div>

            {currentReq.status === 'shipped' && (
              <div className="sales-completed-message">
                <p>✅ 販売処理が完了しました。見積書を印刷できます。</p>
              </div>
            )}

            {/* 販売担当者選択 */}
            {currentReq.status === 'pending' && (
              <div className="sales-staff-selection-section">
                <label htmlFor="sales-staff-select">👤 販売担当者 *</label>
                <select
                  id="sales-staff-select"
                  value={salesStaffName}
                  onChange={(e) => setSalesStaffName(e.target.value)}
                  className="sales-staff-select"
                >
                  <option value="">選択してください</option>
                  {staffMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 担当者表示（見積もり送信後） */}
            {currentReq.salesStaffName && currentReq.status !== 'pending' && (
              <div className="sales-staff-display">
                <span className="staff-label">👤 販売担当者:</span>
                <span className="staff-name">{getJapaneseName(currentReq.salesStaffName)}</span>
              </div>
            )}

            {/* アクションボタン */}
            <div className="sales-action-buttons">
              {currentReq.status === 'pending' && (
                <>
                  <button className="sales-print-button" onClick={handlePrint}>🖨️ 見積書印刷</button>
                  <button className="sales-confirm-button" onClick={handleConfirmQuote}>
                    ✅ 見積もりを確定
                  </button>
                </>
              )}
              
              {currentReq.status === 'quoted' && (
                <>
                  <button className="sales-print-button" onClick={handlePrint}>🖨️ 見積書印刷</button>
                  <button className="sales-waiting-button" disabled>
                    ⏳ お客様の承認待ち
                  </button>
                </>
              )}
              
              {currentReq.status === 'approved' && (
                <>
                  <button className="sales-print-button" onClick={handlePrint}>🖨️ 見積書印刷</button>
                  <button className="sales-confirm-button" onClick={() => {
                    if (!window.confirm('入金確認を記録しますか？')) return;
                    updateStatus('payment_confirmed');
                    setShowShippingInfo(true);
                    alert('入金確認済みに更新しました。発送準備を行ってください。');
                  }}>
                    💳 入金確認
                  </button>
                </>
              )}
              
              
            </div>

            {/* 発送情報（一番下に独立配置） */}
            {['payment_confirmed', 'shipped'].includes(currentReq.status) && (
              <div className="sales-detail-section sales-shipping-section-bottom">
                <div className="sales-collapsible-header" onClick={() => setShowShippingInfo(!showShippingInfo)}>
                  <h2>📦 発送情報</h2>
                  <span className="sales-collapse-icon">{showShippingInfo ? '▼' : '▶'}</span>
                </div>
                
                {showShippingInfo && (
                  <div className="sales-shipping-layout">
                    <div className="sales-shipping-info-left">
                      <p><strong>発送先住所:</strong> {currentReq.shippingAddress || '確認中'}</p>
                      <p><strong>発送方法:</strong> {currentReq.shippingMethod || 'EMS'}</p>
                      {currentReq.trackingNumber && (
                        <p><strong>✅ 追跡番号:</strong> {currentReq.trackingNumber}</p>
                      )}
                      {currentReq.shippedDate && (
                        <p><strong>✅ 発送日:</strong> {currentReq.shippedDate}</p>
                      )}
                    </div>

                    <div className="sales-shipping-actions">
                      {currentReq.status === 'payment_confirmed' && (
                        <>
                          <div className="sales-shipping-inputs-row" style={{ marginLeft: '-30px', maxWidth: '90%' }}>
                            <div className="sales-form-group">
                              <label>📅 発送日</label>
                              <input
                                type="date"
                                id="shippedDate"
                                defaultValue={getTodayJST()}
                              />
                            </div>
                            <div className="sales-form-group" style={{ flex: '1.8' }}>
                              <label>🏷️ 追跡番号</label>
                              <input
                                type="text"
                                id="trackingNumber"
                                placeholder="追跡番号を入力"
                                style={{ minWidth: '200px', maxWidth: '280px' }}
                              />
                            </div>
                          </div>
                          <div className="sales-shipping-buttons" style={{ marginTop: '20px', justifyContent: 'flex-start', marginLeft: '-30px' }}>
                            <button className="sales-action-btn sales-btn-secondary" onClick={handlePrintInvoice}>
                              📄 インボイス印刷
                            </button>
                            <button onClick={() => {
                              const date = document.getElementById('shippedDate').value;
                              const tracking = document.getElementById('trackingNumber').value;
                              
                              // 在庫選択チェック
                              const allSelected = currentReq.items.every(item => {
                                const selected = getSelectedQuantity(item.id);
                                return selected === item.quantity;
                              });

                              if (!allSelected) {
                                alert('全ての商品の在庫を選択してから発送完了にしてください');
                                return;
                              }

                              handleCompleteSale(date, tracking);
                            }} className="sales-action-btn sales-btn-primary">
                              📦 発送完了にする
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 管理番号表示モーダル */}
        {showManagementNumberModal && (
          <div className="modal-overlay" onClick={() => setShowManagementNumberModal(false)}>
            <div className="management-number-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🏷️ 出荷される管理番号</h2>
                <button className="modal-close-btn" onClick={() => setShowManagementNumberModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                {currentItemInfo && (
                  <div className="modal-item-info">
                    <p><strong>商品名:</strong> {currentItemInfo.productName}</p>
                    <p><strong>仕入れ元:</strong> {currentItemInfo.sourceName}</p>
                    <p><strong>ランク:</strong> <span className={`rank-badge rank-${currentItemInfo.rank.toLowerCase()}`}>{currentItemInfo.rank}</span></p>
                    <p><strong>出荷数:</strong> {currentItemInfo.selectedQuantity}個（在庫: {currentItemInfo.totalStock}個）</p>
                  </div>
                )}
                
                <div className="management-numbers-list-modal">
                  <h3>管理番号一覧 ({currentManagementNumbers.length}個)</h3>
                  {currentManagementNumbers.length > 0 ? (
                    <div className="management-numbers-grid-modal">
                      {currentManagementNumbers.map((number, idx) => (
                        <div key={idx} className="management-number-item-modal">
                          <span className="number-index-modal">{idx + 1}.</span>
                          <span className="number-value-modal">{number}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-numbers">管理番号が登録されていません</p>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-close-modal" onClick={() => setShowManagementNumberModal(false)}>
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 印刷用テンプレート */}
        <div className="print-only estimate-sheet">
          <div className="estimate-header">
            <div className="estimate-left">
              <h1 className="estimate-title">Sales Quotation</h1>
              <div className="estimate-meta">
                <p>Quote No.: {currentReq.requestNumber}</p>
                <p>Issue Date: {getTodayJST()}</p>
              </div>
            </div>
            <div className="company-info-right">
              <h2>{companyInfo.nameEn}</h2>
              <p>{companyInfo.addressEn}</p>
              <p>{companyInfo.phoneEn}</p>
              <p>{companyInfo.email}</p>
              <p className="license">{companyInfo.licenseEn}</p>
              {(currentReq.salesStaffName || salesStaffName) && (
                <p><strong>Contact Person:</strong> {getEnglishName(currentReq.salesStaffName || salesStaffName)}</p>
              )}
            </div>
          </div>

          <div className="customer-section">
            <h3>Customer Information</h3>
            <div className="customer-details">
              <p><strong>{currentReq.customer.name}</strong></p>
              <p>Email: {currentReq.customer.email} &nbsp;&nbsp; Tel: {currentReq.customer.phone || 'N/A'}</p>
              {currentReq.customer.country && <p>Country: {currentReq.customer.country}</p>}
            </div>
          </div>

          <table className="estimate-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Color</th>
                <th>Condition</th>
                <th>Package</th>
                <th>Qty</th>
                <th>Unit Price (USD)</th>
                <th>Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              {currentReq.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {item.productType === 'software' 
                      ? `${item.softwareName} (${item.consoleLabel})` 
                      : `${item.manufacturerLabel} ${item.consoleLabel}`
                    }
                  </td>
                  <td>{item.colorLabel || '-'}</td>
                  <td>{item.conditionLabel || '-'}</td>
                  <td>{item.packageTypeLabel || '-'}</td>
                  <td className="center">{item.quantity}</td>
                  <td className="right">${convertToUSD(item.quotedPrice || 0).toFixed(2)}</td>
                  <td className="right">${convertToUSD((item.quotedPrice || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="estimate-total">
            <div className="total-row">
              <span className="total-label-print">Subtotal</span>
              <span className="total-amount-print">${convertToUSD(calculateTotal()).toFixed(2)}</span>
            </div>
            {getPrintShippingFee() > 0 && (
              <div className="total-row">
                <span className="total-label-print">Shipping Fee</span>
                <span className="total-amount-print">${convertToUSD(getPrintShippingFee()).toFixed(2)}</span>
              </div>
            )}
            {getPrintDeliveryDays() && (
              <div className="total-row">
                <span className="total-label-print">Estimated Delivery</span>
                <span className="total-amount-print">{getPrintDeliveryDays()} days</span>
              </div>
            )}
            <div className="total-row" style={{borderTop: '2px solid #333', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.2em'}}>
              <span className="total-label-print">Total Amount</span>
              <span className="total-amount-print">${convertToUSD(calculateTotal() + getPrintShippingFee()).toFixed(2)}</span>
            </div>
          </div>

          {currentReq.notes && (
            <div className="estimate-notes">
              <h4>Notes</h4>
              <p>{currentReq.notes}</p>
            </div>
          )}

          <div className="estimate-notes" style={{marginTop: '20px'}}>
            <p style={{fontSize: '0.9em'}}>
              * All prices are in US Dollars (USD)<br/>
              * Payment terms: Wire transfer in advance<br/>
              * Items will be shipped after payment confirmation
            </p>
          </div>
        </div>

        {/* インボイス印刷用テンプレート */}
        <div className="print-only invoice-sheet" style={{display: 'none'}}>
          <div className="invoice-header">
            <div className="invoice-left">
              <h1 className="invoice-title">INVOICE</h1>
              <div className="invoice-meta">
                <p>Invoice No.: {currentReq.requestNumber}</p>
                <p>Invoice Date: {getTodayJST()}</p>
                <p>Payment Status: <strong>Paid</strong></p>
              </div>
            </div>
            <div className="company-info-right">
              <h2>{companyInfo.nameEn}</h2>
              <p>{companyInfo.addressEn}</p>
              <p>{companyInfo.phoneEn}</p>
              <p>{companyInfo.email}</p>
              <p className="license">{companyInfo.licenseEn}</p>
              {(currentReq.salesStaffName || salesStaffName) && (
                <p><strong>Contact Person:</strong> {getEnglishName(currentReq.salesStaffName || salesStaffName)}</p>
              )}
            </div>
          </div>

          <div className="customer-section">
            <h3>Customer Information</h3>
            <div className="customer-details">
              <p><strong>{currentReq.customer.name}</strong></p>
              <p>Email: {currentReq.customer.email} &nbsp;&nbsp; Tel: {currentReq.customer.phone || 'N/A'}</p>
              {currentReq.customer.country && <p>Country: {currentReq.customer.country}</p>}
            </div>
          </div>

          <div className="shipping-section">
            <h3>Shipping Information</h3>
            <div className="shipping-details">
              {(() => {
                const shippingInfo = getInvoiceShippingInfo();
                return (
                  <p>
                    <strong>Shipping Method:</strong> EMS &nbsp;&nbsp;
                    <strong>Shipping Date:</strong> {shippingInfo.shippedDate}
                    {shippingInfo.trackingNumber && (
                      <> &nbsp;&nbsp; <strong>Tracking Number:</strong> {shippingInfo.trackingNumber}</>
                    )}
                  </p>
                );
              })()}
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Country</th>
                <th>Weight (kg)</th>
                <th>Qty</th>
                <th>Unit Price (USD)</th>
                <th>Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              {currentReq.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {item.productType === 'software' 
                      ? `${item.softwareName} (${item.consoleLabel})` 
                      : `${item.manufacturerLabel} ${item.consoleLabel}`
                    }
                  </td>
                  <td className="center">{getCountryOfOrigin(item)}</td>
                  <td className="center">{item.weight || 0}</td>
                  <td className="center">{item.quantity}</td>
                  <td className="right">${convertToUSD(item.quotedPrice || 0).toFixed(2)}</td>
                  <td className="right">${convertToUSD((item.quotedPrice || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-total">
            <div className="total-row">
              <span className="total-label-print">Subtotal</span>
              <span className="total-amount-print">${convertToUSD(calculateTotal()).toFixed(2)}</span>
            </div>
            {getPrintShippingFee() > 0 && (
              <div className="total-row">
                <span className="total-label-print">Shipping Fee</span>
                <span className="total-amount-print">${convertToUSD(getPrintShippingFee()).toFixed(2)}</span>
              </div>
            )}
            <div className="total-row">
              <span className="total-label-print">Total Weight</span>
              <span className="total-amount-print">{calculateTotalWeight()}kg</span>
            </div>
            <div className="total-row" style={{borderTop: '2px solid #333', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.2em'}}>
              <span className="total-label-print">Total Amount</span>
              <span className="total-amount-print">${convertToUSD(calculateTotal() + getPrintShippingFee()).toFixed(2)}</span>
            </div>
          </div>

          <div className="invoice-notes" style={{marginTop: '20px'}}>
            <p style={{fontSize: '0.9em'}}>
              * Thank you for your business
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-container">
      <h1>販売管理</h1>
      <p>データを読み込んでいます...</p>
    </div>
  );
};

export default Sales;
