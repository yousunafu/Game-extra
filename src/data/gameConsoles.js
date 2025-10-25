// ゲーム機のマスターデータ（新しい順）

export const manufacturers = [
  { value: 'nintendo', label: '任天堂' },
  { value: 'sony', label: 'SONY' },
  { value: 'microsoft', label: 'マイクロソフト' },
  { value: 'other', label: 'その他' }
];

export const gameConsoles = {
  nintendo: [
    { value: 'switch', label: 'Nintendo Switch', year: 2017, country: 'China' },
    { value: 'switch-lite', label: 'Nintendo Switch Lite', year: 2019, country: 'China' },
    { value: 'switch-oled', label: 'Nintendo Switch（有機ELモデル）', year: 2021, country: 'China' },
    { value: 'wii-u', label: 'Wii U', year: 2012, country: 'China' },
    { value: 'wii', label: 'Wii', year: 2006, country: 'China' },
    { value: 'new-3ds', label: 'Newニンテンドー3DS', year: 2014, country: 'China' },
    { value: '3ds', label: 'ニンテンドー3DS', year: 2011, country: 'China' },
    { value: 'dsi', label: 'ニンテンドーDSi', year: 2008, country: 'China' },
    { value: 'ds-lite', label: 'ニンテンドーDS Lite', year: 2006, country: 'China' },
    { value: 'ds', label: 'ニンテンドーDS', year: 2004, country: 'China' },
    { value: 'gamecube', label: 'ゲームキューブ', year: 2001, country: 'China' },
    { value: 'gba', label: 'ゲームボーイアドバンス（SPを含む）', year: 2001, country: 'China' },
    { value: 'gbc', label: 'ゲームボーイカラー', year: 1998, country: 'China' },
    { value: 'n64', label: 'NINTENDO64', year: 1996, country: 'Japan' },
    { value: 'sfc', label: 'スーパーファミコン', year: 1990, country: 'Japan' },
    { value: 'gb', label: 'ゲームボーイ', year: 1989, country: 'Japan' },
    { value: 'fc', label: 'ファミリーコンピュータ', year: 1983, country: 'Japan' },
    { value: 'other-manual', label: 'その他（手入力）', year: 0, country: 'China' }
  ],
  sony: [
    { value: 'ps5', label: 'PlayStation 5', year: 2020, country: 'China' },
    { value: 'ps5-digital', label: 'PlayStation 5 デジタル・エディション', year: 2020, country: 'China' },
    { value: 'ps4-pro', label: 'PlayStation 4 Pro', year: 2016, country: 'China' },
    { value: 'ps4', label: 'PlayStation 4', year: 2013, country: 'China' },
    { value: 'ps-vita', label: 'PlayStation Vita (1000/2000)', year: 2011, country: 'China' },
    { value: 'ps3', label: 'PlayStation 3', year: 2006, country: 'China' },
    { value: 'psp-go', label: 'PSP go', year: 2009, country: 'China' },
    { value: 'psp', label: 'PSP (1000~3000)', year: 2004, country: 'China' },
    { value: 'ps2', label: 'PlayStation 2', year: 2000, country: 'China' },
    { value: 'ps1', label: 'PlayStation', year: 1994, country: 'Japan' },
    { value: 'other-manual', label: 'その他（手入力）', year: 0, country: 'China' }
  ],
  microsoft: [
    { value: 'xbox-series-x', label: 'Xbox Series X', year: 2020, country: 'China' },
    { value: 'xbox-series-s', label: 'Xbox Series S', year: 2020, country: 'China' },
    { value: 'xbox-one-x', label: 'Xbox One X', year: 2017, country: 'China' },
    { value: 'xbox-one-s', label: 'Xbox One S', year: 2016, country: 'China' },
    { value: 'xbox-one', label: 'Xbox One', year: 2013, country: 'China' },
    { value: 'xbox-360', label: 'Xbox 360', year: 2005, country: 'China' },
    { value: 'xbox', label: 'Xbox', year: 2002, country: 'China' },
    { value: 'other-manual', label: 'その他（手入力）', year: 0, country: 'China' }
  ],
  other: [
    { value: 'dreamcast', label: 'ドリームキャスト', year: 1998, country: 'China' },
    { value: 'wonderswan', label: 'ワンダースワン', year: 1999, country: 'China' },
    { value: 'saturn', label: 'セガサターン', year: 1994, country: 'Japan' },
    { value: 'neogeo', label: 'ネオジオ', year: 1990, country: 'Japan' },
    { value: 'pc-engine', label: 'PCエンジン', year: 1987, country: 'Japan' },
    { value: 'other-manual', label: 'その他（手入力）', year: 0, country: 'China' }
  ]
};

export const colors = [
  'ホワイト',
  'ブラック',
  'ブルー',
  'レッド',
  'グレー',
  'ピンク',
  'イエロー',
  'グリーン',
  'パープル',
  'オレンジ',
  'ターコイズ',
  'コーラル',
  'ネオンブルー',
  'ネオンレッド',
  'その他'
];

export const conditions = [
  { value: 'S', label: 'S（極美品・未使用に近い）' },
  { value: 'A', label: 'A（美品・目立つ傷なし）' },
  { value: 'B', label: 'B（使用感あり・通常使用可）' },
  { value: 'C', label: 'C（傷・汚れあり・動作に問題なし）' }
];

export const accessories = [
  { value: 'complete', label: '完備（箱・説明書・充電器等すべてあり）' },
  { value: 'no-box', label: '箱なし' },
  { value: 'no-manual', label: '説明書なし' },
  { value: 'partial', label: '付属品一部なし' },
  { value: 'body-only', label: '本体のみ' }
];





