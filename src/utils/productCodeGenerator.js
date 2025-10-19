// 商品コード自動生成ユーティリティ

// メーカーコード（1文字）
const MANUFACTURER_CODES = {
  'nintendo': 'N',
  'sony': 'S',
  'microsoft': 'M',
  'other': 'O'
};

// 機種ごとの商品番号（2桁）
// 番号体系：各メーカーで世代・カテゴリごとにグループ化
const CONSOLE_CODES = {
  // 任天堂（N）
  // 00番台: Switch系（最新世代）
  'switch': '01',
  'switch-oled': '02',
  'switch-lite': '03',
  // 10番台: Wii系
  'wii-u': '11',
  'wii': '12',
  // 20番台: 3DS/DS系
  'new-3ds': '21',
  '3ds': '22',
  'dsi': '23',
  'ds-lite': '24',
  'ds': '25',
  // 30番台: レトロ据え置き
  'gamecube': '31',
  'n64': '32',
  'sfc': '33',
  'fc': '34',
  // 40番台: レトロ携帯
  'gba': '41',
  'gbc': '42',
  'gb': '43',
  
  // Sony（S）
  // 00番台: PS5系（最新世代）
  'ps5': '01',
  'ps5-digital': '02',
  // 10番台: PS4系
  'ps4-pro': '11',
  'ps4': '12',
  // 20番台: PS3/PS2/PS1
  'ps3': '21',
  'ps2': '22',
  'ps1': '23',
  // 30番台: 携帯機
  'ps-vita': '31',
  'psp': '32',
  'psp-go': '33',
  
  // Microsoft（M）
  // 00番台: Xbox Series系（最新世代）
  'xbox-series-x': '01',
  'xbox-series-s': '02',
  // 10番台: Xbox One系
  'xbox-one-x': '11',
  'xbox-one-s': '12',
  'xbox-one': '13',
  // 20番台: Xbox 360/初代Xbox
  'xbox-360': '21',
  'xbox': '22',
  
  // その他（O）
  // 00番台: セガ系
  'dreamcast': '01',
  'saturn': '02',
  // 10番台: その他レトロ
  'neogeo': '11',
  'wonderswan': '12',
  'pc-engine': '13',
  'other-manual': '99'
};

/**
 * 機種コードを生成
 * @param {string} manufacturer - メーカーコード（nintendo, sony, microsoft, other）
 * @param {string} console - 機種コード
 * @param {string} productType - 商品タイプ（'console' or 'software'）
 * @returns {string} - 機種コード（例: 本体=N01, ソフト=NS）
 */
export const generateProductCode = (manufacturer, console, productType = 'console') => {
  const manufacturerCode = MANUFACTURER_CODES[manufacturer] || 'O';
  
  // ソフトの場合はメーカーコード + S
  if (productType === 'software') {
    return `${manufacturerCode}S`;
  }
  
  // カスタム機種の場合、codeNumberがある可能性がある
  // getAllConsolesから機種情報を取得
  try {
    const { getAllConsoles } = require('./productMaster');
    const allConsoles = getAllConsoles();
    const consoleInfo = allConsoles[manufacturer]?.find(c => c.value === console);
    
    if (consoleInfo?.codeNumber) {
      return `${manufacturerCode}${consoleInfo.codeNumber}`;
    }
  } catch (e) {
    // productMaster.jsが読み込めない場合は従来通り
  }
  
  // 本体の場合はメーカーコード + 2桁の機種番号
  const consoleCode = CONSOLE_CODES[console] || '99';
  return `${manufacturerCode}${consoleCode}`;
};

/**
 * 顧客名から短縮コードを生成
 * @param {string} customerName - 顧客名
 * @returns {string} - 短縮コード（カタカナの場合は最初の2文字、漢字の場合は読みの推測）
 */
export const generateCustomerCode = (customerName) => {
  if (!customerName) return 'GUEST';
  
  // スペースを削除
  const name = customerName.replace(/\s+/g, '');
  
  // カタカナの場合
  if (/^[ァ-ヶー]+/.test(name)) {
    return name.substring(0, Math.min(4, name.length)).toUpperCase();
  }
  
  // ひらがなの場合
  if (/^[ぁ-ん]+/.test(name)) {
    // ひらがなをカタカナに変換
    const katakana = name.replace(/[\u3041-\u3096]/g, (match) => {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
    return katakana.substring(0, Math.min(4, katakana.length)).toUpperCase();
  }
  
  // アルファベットの場合
  if (/^[a-zA-Z]+/.test(name)) {
    return name.substring(0, Math.min(6, name.length)).toUpperCase();
  }
  
  // 漢字の場合は、姓の最初の2文字を使用（簡易版）
  return name.substring(0, Math.min(2, name.length));
};

/**
 * 日付コードを生成（YYYYMMDD形式）
 * @param {Date} date - 日付オブジェクト（省略時は現在日時）
 * @returns {string} - 8桁の日付コード（例: 20241017）
 */
export const generateDateCode = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 完全な管理番号を生成
 * @param {string} customerName - 顧客名
 * @param {string} manufacturer - メーカーコード
 * @param {string} console - 機種コード
 * @param {number} sequenceNumber - 連番（1から開始）
 * @param {string} productType - 商品タイプ（'console' or 'software'）
 * @param {Date} date - 日付（省略時は現在日時）
 * @returns {string} - 管理番号（例: 本体=ヤマダ_N01_20241017_01、ソフト=ヤマダ_NS_20241017_02）
 */
export const generateManagementNumber = (customerName, manufacturer, console, sequenceNumber = 1, productType = 'console', date = new Date()) => {
  const customerCode = generateCustomerCode(customerName);
  const productCode = generateProductCode(manufacturer, console, productType);
  const dateCode = generateDateCode(date);
  const seqCode = String(sequenceNumber).padStart(2, '0');
  
  return `${customerCode}_${productCode}_${dateCode}_${seqCode}`;
};

/**
 * 管理番号から情報を抽出
 * @param {string} managementNumber - 管理番号
 * @returns {object} - 抽出した情報
 */
export const parseManagementNumber = (managementNumber) => {
  const parts = managementNumber.split('_');
  
  if (parts.length !== 4) {
    return null;
  }
  
  return {
    customerCode: parts[0],
    productCode: parts[1],
    dateCode: parts[2],
    sequenceNumber: parts[3]
  };
};

