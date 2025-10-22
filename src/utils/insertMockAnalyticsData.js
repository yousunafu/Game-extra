// 販売分析用のモックデータを投入するスクリプト

export const insertMockAnalyticsData = () => {
  // ========================================
  // 1. 販売記録（salesLedger）- バイヤー分析・商品分析用
  // ========================================
  const mockSalesLedger = [];

  // ========================================
  // 2. 買取申込（allApplications）- セラー分析用
  // ========================================
  const mockApplications = [];

  // localStorageに保存
  localStorage.setItem('salesLedger', JSON.stringify(mockSalesLedger));
  localStorage.setItem('allApplications', JSON.stringify(mockApplications));

  console.log('✅ データを初期化しました');
  console.log('📊 販売記録:', mockSalesLedger.length, '件');
  console.log('📤 買取申込:', mockApplications.length, '件');

  return {
    success: true,
    salesCount: mockSalesLedger.length,
    applicationsCount: mockApplications.length
  };
};