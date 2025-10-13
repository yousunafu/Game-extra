// 販売分析用のモックデータを投入するスクリプト

export const insertMockAnalyticsData = () => {
  // ========================================
  // 1. 販売記録（salesLedger）- バイヤー分析・商品分析用
  // ========================================
  const mockSalesLedger = [
    {
      id: 'SALE-2024-001',
      type: 'sales',
      requestNumber: 'REQ-2024-001',
      soldDate: '2024-01-15T10:30:00Z',
      salesStaffName: '佐藤 花子（Sato Hanako）',
      customer: {
        name: 'Tokyo Games Inc.',
        email: 'info@tokyogames.jp',
        country: 'Japan'
      },
      items: [
        {
          inventoryId: 'INV-001',
          product: 'Sony PlayStation 5',
          rank: 'S',
          quantity: 3,
          acquisitionPrice: 35000,
          totalAcquisitionCost: 105000,
          salesPrice: 52000,
          totalSalesAmount: 156000,
          profit: 17000,
          totalProfit: 51000,
          source: { type: 'customer', name: '山田太郎' }
        },
        {
          inventoryId: 'INV-002',
          product: 'Nintendo Switch OLED',
          rank: 'A',
          quantity: 5,
          acquisitionPrice: 28000,
          totalAcquisitionCost: 140000,
          salesPrice: 38000,
          totalSalesAmount: 190000,
          profit: 10000,
          totalProfit: 50000,
          source: { type: 'customer', name: '鈴木花子' }
        }
      ],
      summary: {
        totalAcquisitionCost: 245000,
        totalSalesAmount: 346000,
        totalProfit: 101000
      }
    },
    {
      id: 'SALE-2024-002',
      type: 'sales',
      requestNumber: 'REQ-2024-002',
      soldDate: '2024-02-20T14:15:00Z',
      salesStaffName: '鈴木 一郎（Suzuki Ichiro）',
      customer: {
        name: 'Global Gaming Ltd.',
        email: 'orders@globalgaming.com',
        country: 'USA'
      },
      items: [
        {
          inventoryId: 'INV-003',
          product: 'Sony PlayStation 5',
          rank: 'A',
          quantity: 4,
          acquisitionPrice: 33000,
          totalAcquisitionCost: 132000,
          salesPrice: 48000,
          totalSalesAmount: 192000,
          profit: 15000,
          totalProfit: 60000,
          source: { type: 'supplier', name: '駿河屋' }
        },
        {
          inventoryId: 'INV-004',
          product: 'Microsoft Xbox Series X',
          rank: 'S',
          quantity: 2,
          acquisitionPrice: 38000,
          totalAcquisitionCost: 76000,
          salesPrice: 55000,
          totalSalesAmount: 110000,
          profit: 17000,
          totalProfit: 34000,
          source: { type: 'customer', name: '田中健太' }
        }
      ],
      summary: {
        totalAcquisitionCost: 208000,
        totalSalesAmount: 302000,
        totalProfit: 94000
      }
    },
    {
      id: 'SALE-2024-003',
      type: 'sales',
      requestNumber: 'REQ-2024-003',
      soldDate: '2024-03-10T09:45:00Z',
      salesStaffName: '田中 美咲（Tanaka Misaki）',
      customer: {
        name: 'Tokyo Games Inc.',
        email: 'info@tokyogames.jp',
        country: 'Japan'
      },
      items: [
        {
          inventoryId: 'INV-005',
          product: 'Nintendo Switch',
          rank: 'B',
          quantity: 8,
          acquisitionPrice: 22000,
          totalAcquisitionCost: 176000,
          salesPrice: 30000,
          totalSalesAmount: 240000,
          profit: 8000,
          totalProfit: 64000,
          source: { type: 'customer', name: '佐藤一郎' }
        }
      ],
      summary: {
        totalAcquisitionCost: 176000,
        totalSalesAmount: 240000,
        totalProfit: 64000
      }
    },
    {
      id: 'SALE-2024-004',
      type: 'sales',
      requestNumber: 'REQ-2024-004',
      soldDate: '2024-04-05T11:20:00Z',
      salesStaffName: '高橋 健太（Takahashi Kenta）',
      customer: {
        name: 'NY Game Collectors',
        email: 'sales@nygamecollectors.com',
        country: 'USA'
      },
      items: [
        {
          inventoryId: 'INV-006',
          product: 'Sony PlayStation 4 Pro',
          rank: 'A',
          quantity: 6,
          acquisitionPrice: 25000,
          totalAcquisitionCost: 150000,
          salesPrice: 35000,
          totalSalesAmount: 210000,
          profit: 10000,
          totalProfit: 60000,
          source: { type: 'supplier', name: 'ブックオフ' }
        },
        {
          inventoryId: 'INV-007',
          product: 'Nintendo Switch Lite',
          rank: 'S',
          quantity: 10,
          acquisitionPrice: 18000,
          totalAcquisitionCost: 180000,
          salesPrice: 25000,
          totalSalesAmount: 250000,
          profit: 7000,
          totalProfit: 70000,
          source: { type: 'customer', name: '高橋美咲' }
        }
      ],
      summary: {
        totalAcquisitionCost: 330000,
        totalSalesAmount: 460000,
        totalProfit: 130000
      }
    },
    {
      id: 'SALE-2024-005',
      type: 'sales',
      requestNumber: 'REQ-2024-005',
      soldDate: '2024-05-12T16:30:00Z',
      salesStaffName: '佐藤 花子（Sato Hanako）',
      customer: {
        name: 'Global Gaming Ltd.',
        email: 'orders@globalgaming.com',
        country: 'USA'
      },
      items: [
        {
          inventoryId: 'INV-008',
          product: 'Sony PlayStation 5',
          rank: 'S',
          quantity: 5,
          acquisitionPrice: 36000,
          totalAcquisitionCost: 180000,
          salesPrice: 53000,
          totalSalesAmount: 265000,
          profit: 17000,
          totalProfit: 85000,
          source: { type: 'customer', name: '山田太郎' }
        },
        {
          inventoryId: 'INV-009',
          product: 'Nintendo Switch OLED',
          rank: 'S',
          quantity: 3,
          acquisitionPrice: 30000,
          totalAcquisitionCost: 90000,
          salesPrice: 40000,
          totalSalesAmount: 120000,
          profit: 10000,
          totalProfit: 30000,
          source: { type: 'customer', name: '鈴木花子' }
        }
      ],
      summary: {
        totalAcquisitionCost: 270000,
        totalSalesAmount: 385000,
        totalProfit: 115000
      }
    },
    {
      id: 'SALE-2024-006',
      type: 'sales',
      requestNumber: 'REQ-2024-006',
      soldDate: '2024-06-18T13:00:00Z',
      salesStaffName: '鈴木 一郎（Suzuki Ichiro）',
      customer: {
        name: 'London Vintage Games',
        email: 'orders@londonvintage.co.uk',
        country: 'UK'
      },
      items: [
        {
          inventoryId: 'INV-010',
          product: 'Microsoft Xbox Series X',
          rank: 'A',
          quantity: 4,
          acquisitionPrice: 35000,
          totalAcquisitionCost: 140000,
          salesPrice: 50000,
          totalSalesAmount: 200000,
          profit: 15000,
          totalProfit: 60000,
          source: { type: 'supplier', name: '駿河屋' }
        }
      ],
      summary: {
        totalAcquisitionCost: 140000,
        totalSalesAmount: 200000,
        totalProfit: 60000
      }
    },
    {
      id: 'SALE-2024-007',
      type: 'sales',
      requestNumber: 'REQ-2024-007',
      soldDate: '2024-07-22T10:15:00Z',
      salesStaffName: '田中 美咲（Tanaka Misaki）',
      customer: {
        name: 'Tokyo Games Inc.',
        email: 'info@tokyogames.jp',
        country: 'Japan'
      },
      items: [
        {
          inventoryId: 'INV-011',
          product: 'Nintendo Switch',
          rank: 'A',
          quantity: 7,
          acquisitionPrice: 24000,
          totalAcquisitionCost: 168000,
          salesPrice: 32000,
          totalSalesAmount: 224000,
          profit: 8000,
          totalProfit: 56000,
          source: { type: 'customer', name: '佐藤一郎' }
        },
        {
          inventoryId: 'INV-012',
          product: 'Sony PlayStation 4 Pro',
          rank: 'B',
          quantity: 5,
          acquisitionPrice: 23000,
          totalAcquisitionCost: 115000,
          salesPrice: 32000,
          totalSalesAmount: 160000,
          profit: 9000,
          totalProfit: 45000,
          source: { type: 'supplier', name: 'ハードオフ' }
        }
      ],
      summary: {
        totalAcquisitionCost: 283000,
        totalSalesAmount: 384000,
        totalProfit: 101000
      }
    },
    {
      id: 'SALE-2024-008',
      type: 'sales',
      requestNumber: 'REQ-2024-008',
      soldDate: '2024-08-08T14:45:00Z',
      salesStaffName: '高橋 健太（Takahashi Kenta）',
      customer: {
        name: 'NY Game Collectors',
        email: 'sales@nygamecollectors.com',
        country: 'USA'
      },
      items: [
        {
          inventoryId: 'INV-013',
          product: 'Sony PlayStation 5',
          rank: 'A',
          quantity: 6,
          acquisitionPrice: 34000,
          totalAcquisitionCost: 204000,
          salesPrice: 49000,
          totalSalesAmount: 294000,
          profit: 15000,
          totalProfit: 90000,
          source: { type: 'customer', name: '田中健太' }
        }
      ],
      summary: {
        totalAcquisitionCost: 204000,
        totalSalesAmount: 294000,
        totalProfit: 90000
      }
    },
    {
      id: 'SALE-2024-009',
      type: 'sales',
      requestNumber: 'REQ-2024-009',
      soldDate: '2024-09-15T11:30:00Z',
      salesStaffName: '鈴木 一郎（Suzuki Ichiro）',
      customer: {
        name: 'Global Gaming Ltd.',
        email: 'orders@globalgaming.com',
        country: 'USA'
      },
      items: [
        {
          inventoryId: 'INV-014',
          product: 'Nintendo Switch OLED',
          rank: 'A',
          quantity: 4,
          acquisitionPrice: 29000,
          totalAcquisitionCost: 116000,
          salesPrice: 39000,
          totalSalesAmount: 156000,
          profit: 10000,
          totalProfit: 40000,
          source: { type: 'customer', name: '鈴木花子' }
        },
        {
          inventoryId: 'INV-015',
          product: 'Microsoft Xbox Series S',
          rank: 'S',
          quantity: 8,
          acquisitionPrice: 26000,
          totalAcquisitionCost: 208000,
          salesPrice: 35000,
          totalSalesAmount: 280000,
          profit: 9000,
          totalProfit: 72000,
          source: { type: 'customer', name: '高橋美咲' }
        }
      ],
      summary: {
        totalAcquisitionCost: 324000,
        totalSalesAmount: 436000,
        totalProfit: 112000
      }
    },
    {
      id: 'SALE-2024-010',
      type: 'sales',
      requestNumber: 'REQ-2024-010',
      soldDate: '2024-10-01T09:00:00Z',
      salesStaffName: '鈴木 一郎（Suzuki Ichiro）',
      customer: {
        name: 'London Vintage Games',
        email: 'orders@londonvintage.co.uk',
        country: 'UK'
      },
      items: [
        {
          inventoryId: 'INV-016',
          product: 'Sony PlayStation 5',
          rank: 'S',
          quantity: 2,
          acquisitionPrice: 37000,
          totalAcquisitionCost: 74000,
          salesPrice: 54000,
          totalSalesAmount: 108000,
          profit: 17000,
          totalProfit: 34000,
          source: { type: 'customer', name: '山田太郎' }
        },
        {
          inventoryId: 'INV-017',
          product: 'Nintendo Switch',
          rank: 'A',
          quantity: 6,
          acquisitionPrice: 25000,
          totalAcquisitionCost: 150000,
          salesPrice: 33000,
          totalSalesAmount: 198000,
          profit: 8000,
          totalProfit: 48000,
          source: { type: 'customer', name: '佐藤一郎' }
        }
      ],
      summary: {
        totalAcquisitionCost: 224000,
        totalSalesAmount: 306000,
        totalProfit: 82000
      }
    }
  ];

  // ========================================
  // 2. 買取申込（allApplications）- セラー分析用
  // ========================================
  const mockApplications = [
    {
      applicationNumber: 'APP-2024-001',
      date: '2024-01-10T10:00:00Z',
      assessedBy: '佐藤 花子',
      customer: {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '090-1234-5678',
        birthDate: '1985-03-15',
        occupation: '会社員',
        postalCode: '160-0022',
        address: '東京都新宿区新宿1-2-3'
      },
      items: [
        {
          id: 'item-1',
          productType: 'console',
          manufacturer: 'sony',
          manufacturerLabel: 'Sony',
          console: 'ps5',
          consoleLabel: 'PlayStation 5',
          color: 'ホワイト',
          quantity: 2,
          condition: 'excellent',
          accessories: 'complete',
          assessedRank: 'S',
          estimatedPrice: 35000
        },
        {
          id: 'item-2',
          productType: 'console',
          manufacturer: 'sony',
          manufacturerLabel: 'Sony',
          console: 'ps5',
          consoleLabel: 'PlayStation 5',
          color: 'ホワイト',
          quantity: 1,
          condition: 'good',
          accessories: 'complete',
          assessedRank: 'A',
          estimatedPrice: 33000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 103000
    },
    {
      applicationNumber: 'APP-2024-002',
      date: '2024-01-25T14:30:00Z',
      assessedBy: '鈴木 一郎',
      customer: {
        name: '鈴木花子',
        email: 'suzuki@example.com',
        phone: '090-2345-6789',
        birthDate: '1990-07-20',
        occupation: '自営業',
        postalCode: '150-0001',
        address: '東京都渋谷区渋谷2-3-4'
      },
      items: [
        {
          id: 'item-3',
          productType: 'console',
          manufacturer: 'nintendo',
          manufacturerLabel: 'Nintendo',
          console: 'switch_oled',
          consoleLabel: 'Switch OLED',
          color: 'ホワイト',
          quantity: 5,
          condition: 'good',
          accessories: 'complete',
          assessedRank: 'A',
          estimatedPrice: 28000
        },
        {
          id: 'item-4',
          productType: 'console',
          manufacturer: 'nintendo',
          manufacturerLabel: 'Nintendo',
          console: 'switch_oled',
          consoleLabel: 'Switch OLED',
          color: 'ネオン',
          quantity: 3,
          condition: 'excellent',
          accessories: 'complete',
          assessedRank: 'S',
          estimatedPrice: 30000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 230000
    },
    {
      applicationNumber: 'APP-2024-003',
      date: '2024-02-14T11:15:00Z',
      assessedBy: '田中 美咲',
      customer: {
        name: '田中健太',
        email: 'tanaka@example.com',
        phone: '090-3456-7890',
        birthDate: '1988-11-05',
        occupation: '会社員',
        postalCode: '220-0001',
        address: '神奈川県横浜市西区1-2-3'
      },
      items: [
        {
          id: 'item-5',
          productType: 'console',
          manufacturer: 'microsoft',
          manufacturerLabel: 'Microsoft',
          console: 'xbox_series_x',
          consoleLabel: 'Xbox Series X',
          color: 'ブラック',
          quantity: 2,
          condition: 'excellent',
          accessories: 'complete',
          assessedRank: 'S',
          estimatedPrice: 38000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 76000
    },
    {
      applicationNumber: 'APP-2024-004',
      date: '2024-03-05T09:30:00Z',
      assessedBy: '高橋 健太',
      customer: {
        name: '佐藤一郎',
        email: 'sato@example.com',
        phone: '090-4567-8901',
        birthDate: '1982-05-18',
        occupation: '公務員',
        postalCode: '530-0001',
        address: '大阪府大阪市北区1-2-3'
      },
      items: [
        {
          id: 'item-6',
          productType: 'console',
          manufacturer: 'nintendo',
          manufacturerLabel: 'Nintendo',
          console: 'switch',
          consoleLabel: 'Switch',
          color: 'グレー',
          quantity: 8,
          condition: 'fair',
          accessories: 'complete',
          assessedRank: 'B',
          estimatedPrice: 22000
        },
        {
          id: 'item-7',
          productType: 'console',
          manufacturer: 'nintendo',
          manufacturerLabel: 'Nintendo',
          console: 'switch',
          consoleLabel: 'Switch',
          color: 'ネオン',
          quantity: 7,
          condition: 'good',
          accessories: 'complete',
          assessedRank: 'A',
          estimatedPrice: 24000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 344000
    },
    {
      applicationNumber: 'APP-2024-005',
      date: '2024-04-02T15:45:00Z',
      assessedBy: '佐藤 花子',
      customer: {
        name: '高橋美咲',
        email: 'takahashi@example.com',
        phone: '090-5678-9012',
        birthDate: '1995-09-30',
        occupation: '会社員',
        postalCode: '450-0001',
        address: '愛知県名古屋市中村区1-2-3'
      },
      items: [
        {
          id: 'item-8',
          productType: 'console',
          manufacturer: 'nintendo',
          manufacturerLabel: 'Nintendo',
          console: 'switch_lite',
          consoleLabel: 'Switch Lite',
          color: 'グレー',
          quantity: 10,
          condition: 'excellent',
          accessories: 'box_only',
          assessedRank: 'S',
          estimatedPrice: 18000
        },
        {
          id: 'item-9',
          productType: 'console',
          manufacturer: 'microsoft',
          manufacturerLabel: 'Microsoft',
          console: 'xbox_series_s',
          consoleLabel: 'Xbox Series S',
          color: 'ホワイト',
          quantity: 8,
          condition: 'excellent',
          accessories: 'complete',
          assessedRank: 'S',
          estimatedPrice: 26000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 388000
    },
    {
      applicationNumber: 'APP-2024-006',
      date: '2024-05-10T13:20:00Z',
      assessedBy: '鈴木 一郎',
      customer: {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '090-1234-5678',
        birthDate: '1985-03-15',
        occupation: '会社員',
        postalCode: '160-0022',
        address: '東京都新宿区新宿1-2-3'
      },
      items: [
        {
          id: 'item-10',
          productType: 'console',
          manufacturer: 'sony',
          manufacturerLabel: 'Sony',
          console: 'ps5',
          consoleLabel: 'PlayStation 5',
          color: 'ホワイト',
          quantity: 5,
          condition: 'excellent',
          accessories: 'complete',
          assessedRank: 'S',
          estimatedPrice: 36000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 180000
    },
    {
      applicationNumber: 'APP-2024-007',
      date: '2024-06-20T10:00:00Z',
      assessedBy: '田中 美咲',
      customer: {
        name: '鈴木花子',
        email: 'suzuki@example.com',
        phone: '090-2345-6789',
        birthDate: '1990-07-20',
        occupation: '自営業',
        postalCode: '150-0001',
        address: '東京都渋谷区渋谷2-3-4'
      },
      items: [
        {
          id: 'item-11',
          productType: 'console',
          manufacturer: 'nintendo',
          manufacturerLabel: 'Nintendo',
          console: 'switch_oled',
          consoleLabel: 'Switch OLED',
          color: 'ホワイト',
          quantity: 4,
          condition: 'good',
          accessories: 'complete',
          assessedRank: 'A',
          estimatedPrice: 29000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 116000
    },
    {
      applicationNumber: 'APP-2024-008',
      date: '2024-08-01T14:30:00Z',
      assessedBy: '高橋 健太',
      customer: {
        name: '田中健太',
        email: 'tanaka@example.com',
        phone: '090-3456-7890',
        birthDate: '1988-11-05',
        occupation: '会社員',
        postalCode: '220-0001',
        address: '神奈川県横浜市西区1-2-3'
      },
      items: [
        {
          id: 'item-12',
          productType: 'console',
          manufacturer: 'sony',
          manufacturerLabel: 'Sony',
          console: 'ps5',
          consoleLabel: 'PlayStation 5',
          color: 'ホワイト',
          quantity: 6,
          condition: 'good',
          accessories: 'complete',
          assessedRank: 'A',
          estimatedPrice: 34000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 204000
    },
    {
      applicationNumber: 'APP-2024-009',
      date: '2024-09-10T11:00:00Z',
      assessedBy: '佐藤 花子',
      customer: {
        name: '佐藤一郎',
        email: 'sato@example.com',
        phone: '090-4567-8901',
        birthDate: '1982-05-18',
        occupation: '公務員',
        postalCode: '530-0001',
        address: '大阪府大阪市北区1-2-3'
      },
      items: [
        {
          id: 'item-13',
          productType: 'console',
          manufacturer: 'nintendo',
          manufacturerLabel: 'Nintendo',
          console: 'switch',
          consoleLabel: 'Switch',
          color: 'グレー',
          quantity: 6,
          condition: 'good',
          accessories: 'complete',
          assessedRank: 'A',
          estimatedPrice: 25000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 150000
    },
    {
      applicationNumber: 'APP-2024-010',
      date: '2024-10-05T15:15:00Z',
      assessedBy: '鈴木 一郎',
      customer: {
        name: '山田太郎',
        email: 'yamada@example.com',
        phone: '090-1234-5678',
        birthDate: '1985-03-15',
        occupation: '会社員',
        postalCode: '160-0022',
        address: '東京都新宿区新宿1-2-3'
      },
      items: [
        {
          id: 'item-14',
          productType: 'console',
          manufacturer: 'sony',
          manufacturerLabel: 'Sony',
          console: 'ps5',
          consoleLabel: 'PlayStation 5',
          color: 'ホワイト',
          quantity: 2,
          condition: 'excellent',
          accessories: 'complete',
          assessedRank: 'S',
          estimatedPrice: 37000
        }
      ],
      status: 'in_inventory',
      totalEstimate: 74000
    }
  ];

  // localStorageに保存
  localStorage.setItem('salesLedger', JSON.stringify(mockSalesLedger));
  localStorage.setItem('allApplications', JSON.stringify(mockApplications));

  console.log('✅ モックデータを投入しました！');
  console.log('📊 販売記録:', mockSalesLedger.length, '件');
  console.log('📤 買取申込:', mockApplications.length, '件');
  console.log('');
  console.log('👥 セラー（買取顧客）:');
  console.log('  - 山田太郎（3回買取）');
  console.log('  - 鈴木花子（2回買取）');
  console.log('  - 田中健太（2回買取）');
  console.log('  - 佐藤一郎（2回買取）');
  console.log('  - 高橋美咲（1回買取）');
  console.log('');
  console.log('📥 バイヤー（購入顧客）:');
  console.log('  - Tokyo Games Inc.（3回購入、日本）');
  console.log('  - Global Gaming Ltd.（3回購入、USA）');
  console.log('  - NY Game Collectors（2回購入、USA）');
  console.log('  - London Vintage Games（2回購入、UK）');
  console.log('');
  console.log('📦 主な商品:');
  console.log('  - Sony PlayStation 5（最も人気）');
  console.log('  - Nintendo Switch OLED');
  console.log('  - Nintendo Switch');
  console.log('  - Microsoft Xbox Series X/S');
  console.log('  - Sony PlayStation 4 Pro');
  console.log('');
  console.log('💰 総販売額: ¥3,313,000');
  console.log('💰 総利益: ¥949,000');
  console.log('📈 平均利益率: 28.6%');

  return {
    success: true,
    salesCount: mockSalesLedger.length,
    applicationsCount: mockApplications.length
  };
};

