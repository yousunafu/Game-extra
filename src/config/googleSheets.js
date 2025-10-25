// Google Sheets API設定
export const GOOGLE_SHEETS_CONFIG = {
  API_KEY: 'AIzaSyBVbn4zz5Skf-xRpbHyrvCCpbCD4TNZfS4',
  // 実際のeBay販売記録スプレッドシートID
  SPREADSHEET_ID: '1ssSP0OGJwBBM4UiIfQvqnNSZtP8F_GvlSJsrl0Elp9M',
  RANGE: 'orders!A:Z', // ordersシートの全列を取得
  // テスト用のスプレッドシートID（公開されているサンプル）
  TEST_SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  TEST_RANGE: 'Class Data!A2:E'
};

// eBay販売記録の列マッピング（ordersシートの実際の構造に合わせて調整）
export const EBAY_SALES_COLUMNS = {
  RECORD_NUMBER: 0,    // A列: SalesRecordNumber(New) - eBay販売記録番号
  ORDER_ID: 1,         // B列: 注文ID
  ORDER_DATE: 2,       // C列: 注文日時
  BUYER_NAME: 3,       // D列: バイヤー名
  BUYER_EMAIL: 4,      // E列: バイヤーメール
  PRODUCT_NAME: 5,     // F列: 商品名
  PRODUCT_IMAGE: 6,    // G列: 商品画像
  IMAGE_URL: 7,        // H列: 画像URL
  PRODUCT_PAGE: 8,      // I列: 商品ページ
  SKU: 9,              // J列: SKU
  QUANTITY: 10,        // K列: 数量
  PRICE: 11,           // L列: 価格
  CURRENCY: 12,        // M列: 通貨
  SHIPPING_ADDRESS: 13, // N列: 配送先住所
  SHIPPING_STATUS: 14, // O列: 配送状態
  PAYMENT_STATUS: 15,   // P列: 支払い状態
  ACQUISITION_DATE: 16 // Q列: 取得日時
};
