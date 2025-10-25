import { GOOGLE_SHEETS_CONFIG, EBAY_SALES_COLUMNS } from '../config/googleSheets';

/**
 * Google Sheets API接続テスト
 * @returns {Promise<boolean>} - 接続成功の場合true
 */
export const testGoogleSheetsConnection = async () => {
  try {
    console.log('=== Google Sheets API接続テスト開始 ===');
    
    // テスト用のスプレッドシートで接続を確認
    const testData = await fetchGoogleSheetsData(
      GOOGLE_SHEETS_CONFIG.TEST_SPREADSHEET_ID,
      GOOGLE_SHEETS_CONFIG.TEST_RANGE
    );
    
    console.log('✅ Google Sheets API接続テスト成功');
    console.log('テストデータ件数:', testData.length);
    return true;
    
  } catch (error) {
    console.error('❌ Google Sheets API接続テスト失敗:', error);
    return false;
  }
};

/**
 * Google Sheets APIからデータを取得
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {string} range - データ範囲
 * @returns {Promise<Array>} - データの配列
 */
export const fetchGoogleSheetsData = async (spreadsheetId, range) => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
    
    console.log('=== Google Sheets API呼び出し ===');
    console.log('スプレッドシートID:', spreadsheetId);
    console.log('範囲:', range);
    console.log('APIキー:', GOOGLE_SHEETS_CONFIG.API_KEY ? '設定済み' : '未設定');
    console.log('URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API レスポンス詳細:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      
      if (response.status === 404) {
        throw new Error(`スプレッドシートが見つかりません。ID: ${spreadsheetId} を確認してください。`);
      } else if (response.status === 403) {
        throw new Error(`APIキーが無効またはアクセス権限がありません。APIキーを確認してください。`);
      } else {
        throw new Error(`Google Sheets API エラー: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log('Google Sheets API レスポンス:', data);
    
    return data.values || [];
  } catch (error) {
    console.error('Google Sheets API エラー:', error);
    throw error;
  }
};

/**
 * eBay販売記録を検索
 * @param {string} recordNumber - eBay販売記録番号
 * @returns {Promise<Object|null>} - 販売記録データまたはnull
 */
export const searchEbaySalesRecord = async (recordNumber) => {
  try {
    console.log('=== eBay販売記録検索開始 ===');
    console.log('検索対象:', recordNumber);
    
    // まず接続テストを実行
    const isConnected = await testGoogleSheetsConnection();
    if (!isConnected) {
      throw new Error('Google Sheets APIに接続できません。APIキーまたはスプレッドシートIDを確認してください。');
    }
    
    // Google Sheetsからデータを取得
    const data = await fetchGoogleSheetsData(
      GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
      GOOGLE_SHEETS_CONFIG.RANGE
    );
    
    console.log('取得したデータ件数:', data.length);
    
    // データが空の場合は警告
    if (data.length === 0) {
      console.warn('スプレッドシートにデータがありません');
      return null;
    }
    
    // ヘッダー行をスキップ（1行目）
    const dataRows = data.slice(1);
    
    // 指定された記録番号を検索（SalesRecordNumber(New)列から検索）
    const matchingRecord = dataRows.find(row => {
      const recordNum = row[EBAY_SALES_COLUMNS.RECORD_NUMBER];
      console.log('検索対象行の記録番号:', recordNum, '型:', typeof recordNum);
      return recordNum && recordNum.toString().trim() === recordNumber.toString().trim();
    });
    
    if (!matchingRecord) {
      console.log('該当する販売記録が見つかりません');
      return null;
    }
    
    // 販売記録データを構築（ordersシートの実際の構造に合わせて調整）
    const salesRecord = {
      recordNumber: matchingRecord[EBAY_SALES_COLUMNS.RECORD_NUMBER],
      orderId: matchingRecord[EBAY_SALES_COLUMNS.ORDER_ID] || '',
      orderDate: matchingRecord[EBAY_SALES_COLUMNS.ORDER_DATE] || '',
      buyerName: matchingRecord[EBAY_SALES_COLUMNS.BUYER_NAME] || '',
      buyerEmail: matchingRecord[EBAY_SALES_COLUMNS.BUYER_EMAIL] || '',
      productName: matchingRecord[EBAY_SALES_COLUMNS.PRODUCT_NAME] || '',
      productImage: matchingRecord[EBAY_SALES_COLUMNS.PRODUCT_IMAGE] || '',
      imageUrl: matchingRecord[EBAY_SALES_COLUMNS.IMAGE_URL] || '',
      productPage: matchingRecord[EBAY_SALES_COLUMNS.PRODUCT_PAGE] || '',
      sku: matchingRecord[EBAY_SALES_COLUMNS.SKU] || '',
      quantity: parseInt(matchingRecord[EBAY_SALES_COLUMNS.QUANTITY]) || 1,
      price: parseFloat(matchingRecord[EBAY_SALES_COLUMNS.PRICE]) || 0,
      currency: matchingRecord[EBAY_SALES_COLUMNS.CURRENCY] || 'USD',
      shippingAddress: matchingRecord[EBAY_SALES_COLUMNS.SHIPPING_ADDRESS] || '',
      shippingStatus: matchingRecord[EBAY_SALES_COLUMNS.SHIPPING_STATUS] || '',
      paymentStatus: matchingRecord[EBAY_SALES_COLUMNS.PAYMENT_STATUS] || '',
      acquisitionDate: matchingRecord[EBAY_SALES_COLUMNS.ACQUISITION_DATE] || '',
      // 販売フォーム用の互換性フィールド
      customerName: matchingRecord[EBAY_SALES_COLUMNS.BUYER_NAME] || '',
      soldPrice: parseFloat(matchingRecord[EBAY_SALES_COLUMNS.PRICE]) || 0,
      saleDate: matchingRecord[EBAY_SALES_COLUMNS.ORDER_DATE] || ''
    };
    
    console.log('見つかった販売記録:', salesRecord);
    return salesRecord;
    
  } catch (error) {
    console.error('eBay販売記録検索エラー:', error);
    throw error;
  }
};

/**
 * 複数のeBay販売記録を検索
 * @param {Array<string>} recordNumbers - eBay販売記録番号の配列
 * @returns {Promise<Array>} - 販売記録データの配列
 */
export const searchMultipleEbaySalesRecords = async (recordNumbers) => {
  try {
    console.log('=== 複数eBay販売記録検索開始 ===');
    console.log('検索対象:', recordNumbers);
    
    const results = [];
    
    for (const recordNumber of recordNumbers) {
      try {
        const record = await searchEbaySalesRecord(recordNumber);
        if (record) {
          results.push(record);
        }
      } catch (error) {
        console.error(`記録番号 ${recordNumber} の検索エラー:`, error);
      }
    }
    
    console.log('検索結果:', results.length, '件');
    return results;
    
  } catch (error) {
    console.error('複数eBay販売記録検索エラー:', error);
    throw error;
  }
};
