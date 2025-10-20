// 価格計算ユーティリティ

/**
 * 基準価格を取得
 * @param {string} productCode - 機種コード（N01など）
 * @param {string} rank - ランク（S, A, B, C）
 * @returns {number} - 基準価格
 */
export const getBasePrice = (productCode, rank) => {
  const basePrices = JSON.parse(localStorage.getItem('basePrices') || '{}');
  return basePrices[productCode]?.[rank] || 0;
};

/**
 * 基準価格を設定
 * @param {string} productCode - 機種コード
 * @param {string} rank - ランク
 * @param {number} price - 価格
 */
export const setBasePrice = (productCode, rank, price) => {
  const basePrices = JSON.parse(localStorage.getItem('basePrices') || '{}');
  
  if (!basePrices[productCode]) {
    basePrices[productCode] = {};
  }
  
  basePrices[productCode][rank] = parseInt(price) || 0;
  localStorage.setItem('basePrices', JSON.stringify(basePrices));
};

/**
 * 機種の全ランク基準価格を設定
 * @param {string} productCode - 機種コード
 * @param {object} prices - { S: 28000, A: 25000, B: 20000, C: 15000 }
 */
export const setAllBasePrice = (productCode, prices) => {
  const basePrices = JSON.parse(localStorage.getItem('basePrices') || '{}');
  basePrices[productCode] = prices;
  localStorage.setItem('basePrices', JSON.stringify(basePrices));
};

/**
 * 全ての基準価格を取得
 */
export const getAllBasePrices = () => {
  return JSON.parse(localStorage.getItem('basePrices') || '{}');
};

/**
 * バイヤー別価格調整を取得
 * @param {string} buyerEmail - バイヤーのメール
 * @param {string} productCode - 機種コード
 * @returns {object|null} - 調整設定
 */
export const getBuyerAdjustment = (buyerEmail, productCode) => {
  const adjustments = JSON.parse(localStorage.getItem('buyerPriceAdjustments') || '{}');
  return adjustments[buyerEmail]?.[productCode] || null;
};

/**
 * バイヤー別価格調整を設定
 * @param {string} buyerEmail - バイヤーのメール
 * @param {string} productCode - 機種コード
 * @param {object} adjustment - { type: 'percentage'|'fixed', value: number, rank: 'all'|'S'|'A'|'B'|'C' }
 */
export const setBuyerAdjustment = (buyerEmail, productCode, adjustment) => {
  const adjustments = JSON.parse(localStorage.getItem('buyerPriceAdjustments') || '{}');
  
  if (!adjustments[buyerEmail]) {
    adjustments[buyerEmail] = {};
  }
  
  adjustments[buyerEmail][productCode] = adjustment;
  localStorage.setItem('buyerPriceAdjustments', JSON.stringify(adjustments));
};

/**
 * バイヤー別価格調整を削除
 * @param {string} buyerEmail - バイヤーのメール
 * @param {string} productCode - 機種コード
 */
export const deleteBuyerAdjustment = (buyerEmail, productCode) => {
  const adjustments = JSON.parse(localStorage.getItem('buyerPriceAdjustments') || '{}');
  
  if (adjustments[buyerEmail]?.[productCode]) {
    delete adjustments[buyerEmail][productCode];
    
    // バイヤーの調整が空になったら削除
    if (Object.keys(adjustments[buyerEmail]).length === 0) {
      delete adjustments[buyerEmail];
    }
    
    localStorage.setItem('buyerPriceAdjustments', JSON.stringify(adjustments));
  }
};

/**
 * 特定バイヤーの全ての調整を取得
 * @param {string} buyerEmail - バイヤーのメール
 * @returns {object} - 調整設定オブジェクト
 */
export const getAllBuyerAdjustments = (buyerEmail) => {
  const adjustments = JSON.parse(localStorage.getItem('buyerPriceAdjustments') || '{}');
  return adjustments[buyerEmail] || {};
};

/**
 * バイヤー別の販売価格を計算
 * @param {string} productCode - 機種コード（N01など）
 * @param {string} rank - ランク（S, A, B, C）
 * @param {string} buyerEmail - バイヤーのメール
 * @returns {object} - { basePrice, adjustment, finalPrice, adjustmentDetails }
 */
export const calculateBuyerPrice = (productCode, rank, buyerEmail) => {
  // 1. 基準価格を取得
  const basePrice = getBasePrice(productCode, rank);
  
  if (basePrice === 0) {
    return {
      basePrice: 0,
      adjustment: null,
      finalPrice: 0,
      adjustmentDetails: '基準価格未設定'
    };
  }
  
  // 2. バイヤー別調整を取得
  const adjustment = getBuyerAdjustment(buyerEmail, productCode);
  
  if (!adjustment) {
    return {
      basePrice: basePrice,
      adjustment: null,
      finalPrice: basePrice,
      adjustmentDetails: '調整なし'
    };
  }
  
  // 3. ランク指定があれば適用
  if (adjustment.rank !== 'all' && adjustment.rank !== rank) {
    return {
      basePrice: basePrice,
      adjustment: adjustment,
      finalPrice: basePrice,
      adjustmentDetails: `調整対象外（${adjustment.rank}ランクのみ適用）`
    };
  }
  
  // 4. 調整を適用
  let finalPrice;
  let adjustmentDetails;
  
  if (adjustment.type === 'percentage') {
    finalPrice = Math.round(basePrice * (1 + adjustment.value / 100));
    adjustmentDetails = `${adjustment.value > 0 ? '+' : ''}${adjustment.value}%`;
  } else {
    finalPrice = basePrice + adjustment.value;
    adjustmentDetails = `${adjustment.value > 0 ? '+' : ''}¥${adjustment.value.toLocaleString()}`;
  }
  
  return {
    basePrice: basePrice,
    adjustment: adjustment,
    finalPrice: finalPrice,
    adjustmentDetails: adjustmentDetails
  };
};

/**
 * 全バイヤーのリストを取得
 * @returns {array} - バイヤーの配列
 */
export const getAllBuyers = () => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  return users.filter(u => u.role === 'overseas_customer');
};

// ========== 買取価格管理（お客様向け） ==========

/**
 * 買取基準価格を取得
 * @param {string} productCode - 機種コード（N01など）
 * @param {string} rank - ランク（S, A, B, C）
 * @returns {number} - 買取基準価格
 */
export const getBuybackBasePrice = (productCode, rank) => {
  const buybackBasePrices = JSON.parse(localStorage.getItem('buybackBasePrices') || '{}');
  return buybackBasePrices[productCode]?.[rank] || 0;
};

/**
 * 機種の全ランク買取基準価格を設定
 * @param {string} productCode - 機種コード
 * @param {object} prices - { S: 18000, A: 15000, B: 12000, C: 8000 }
 */
export const setAllBuybackBasePrice = (productCode, prices) => {
  const buybackBasePrices = JSON.parse(localStorage.getItem('buybackBasePrices') || '{}');
  buybackBasePrices[productCode] = prices;
  localStorage.setItem('buybackBasePrices', JSON.stringify(buybackBasePrices));
};

/**
 * 全ての買取基準価格を取得
 */
export const getAllBuybackBasePrices = () => {
  return JSON.parse(localStorage.getItem('buybackBasePrices') || '{}');
};

/**
 * お客様別買取価格調整を取得
 * @param {string} customerEmail - お客様のメール
 * @param {string} productCode - 機種コード
 * @returns {object|null} - 調整設定
 */
export const getCustomerAdjustment = (customerEmail, productCode) => {
  const adjustments = JSON.parse(localStorage.getItem('customerPriceAdjustments') || '{}');
  return adjustments[customerEmail]?.[productCode] || null;
};

/**
 * お客様別買取価格調整を設定
 * @param {string} customerEmail - お客様のメール
 * @param {string} productCode - 機種コード
 * @param {object} adjustment - { type: 'percentage'|'fixed', value: number, rank: 'all'|'S'|'A'|'B'|'C' }
 */
export const setCustomerAdjustment = (customerEmail, productCode, adjustment) => {
  const adjustments = JSON.parse(localStorage.getItem('customerPriceAdjustments') || '{}');
  
  if (!adjustments[customerEmail]) {
    adjustments[customerEmail] = {};
  }
  
  adjustments[customerEmail][productCode] = adjustment;
  localStorage.setItem('customerPriceAdjustments', JSON.stringify(adjustments));
};

/**
 * お客様別買取価格調整を削除
 * @param {string} customerEmail - お客様のメール
 * @param {string} productCode - 機種コード
 */
export const deleteCustomerAdjustment = (customerEmail, productCode) => {
  const adjustments = JSON.parse(localStorage.getItem('customerPriceAdjustments') || '{}');
  
  if (adjustments[customerEmail]?.[productCode]) {
    delete adjustments[customerEmail][productCode];
    
    // お客様の調整が空になったら削除
    if (Object.keys(adjustments[customerEmail]).length === 0) {
      delete adjustments[customerEmail];
    }
    
    localStorage.setItem('customerPriceAdjustments', JSON.stringify(adjustments));
  }
};

/**
 * 特定お客様の全ての調整を取得
 * @param {string} customerEmail - お客様のメール
 * @returns {object} - 調整設定オブジェクト
 */
export const getAllCustomerAdjustments = (customerEmail) => {
  const adjustments = JSON.parse(localStorage.getItem('customerPriceAdjustments') || '{}');
  return adjustments[customerEmail] || {};
};

/**
 * お客様別の買取価格を計算
 * @param {string} productCode - 機種コード（N01など）
 * @param {string} rank - ランク（S, A, B, C）
 * @param {string} customerEmail - お客様のメール
 * @returns {object} - { basePrice, adjustment, finalPrice, adjustmentDetails }
 */
export const calculateCustomerPrice = (productCode, rank, customerEmail) => {
  // 1. 買取基準価格を取得
  const basePrice = getBuybackBasePrice(productCode, rank);
  
  if (basePrice === 0) {
    return {
      basePrice: 0,
      adjustment: null,
      finalPrice: 0,
      adjustmentDetails: '基準価格未設定'
    };
  }
  
  // 2. お客様別調整を取得
  const adjustment = getCustomerAdjustment(customerEmail, productCode);
  
  if (!adjustment) {
    return {
      basePrice: basePrice,
      adjustment: null,
      finalPrice: basePrice,
      adjustmentDetails: '調整なし'
    };
  }
  
  // 3. ランク指定があれば適用
  if (adjustment.rank !== 'all' && adjustment.rank !== rank) {
    return {
      basePrice: basePrice,
      adjustment: adjustment,
      finalPrice: basePrice,
      adjustmentDetails: `調整対象外（${adjustment.rank}ランクのみ適用）`
    };
  }
  
  // 4. 調整を適用
  let finalPrice;
  let adjustmentDetails;
  
  if (adjustment.type === 'percentage') {
    finalPrice = Math.round(basePrice * (1 + adjustment.value / 100));
    adjustmentDetails = `${adjustment.value > 0 ? '+' : ''}${adjustment.value}%`;
  } else {
    finalPrice = basePrice + adjustment.value;
    adjustmentDetails = `${adjustment.value > 0 ? '+' : ''}¥${adjustment.value.toLocaleString()}`;
  }
  
  return {
    basePrice: basePrice,
    adjustment: adjustment,
    finalPrice: finalPrice,
    adjustmentDetails: adjustmentDetails
  };
};

/**
 * 全お客様（買取希望者）のリストを取得
 * @returns {array} - お客様の配列
 */
export const getAllCustomers = () => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  return users.filter(u => u.role === 'customer');
};

