// Vercel Functions for Zaico API proxy
const ZAICO_API_BASE_URL = 'https://api.zaico.co.jp/v1';

export default async function handler(req, res) {
  console.log('=== Zaico API Proxy Called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);

  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // メソッド制限
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  try {
    // パスを構築
    const { path } = req.query;
    const endpoint = Array.isArray(path) ? path.join('/') : path || '';
    const url = `${ZAICO_API_BASE_URL}/${endpoint}`;

    // クエリパラメータを追加
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value) {
        queryParams.append(key, String(value));
      }
    });
    
    const fullUrl = queryParams.toString() 
      ? `${url}?${queryParams.toString()}` 
      : url;

    // フロントエンドから送信されたAPIキーを取得
    const clientApiKey = req.headers['x-api-key'];
    
    if (!clientApiKey) {
      return res.status(401).json({ 
        error: 'API key is required' 
      });
    }

    console.log('Calling Zaico API:', fullUrl);
    console.log('Using API key:', clientApiKey ? 'provided' : 'missing');

    // zaico APIにリクエスト
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${clientApiKey}`,
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    // レスポンスを取得
    const text = await response.text();
    console.log('Zaico API Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: text.substring(0, 500)
    });

    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError);
      console.error('レスポンス内容:', text);
      return res.status(500).json({ 
        error: 'JSON parse error',
        message: text,
        status: response.status
      });
    }

    // ステータスコードとレスポンスを返す
    res.status(response.status).json(json);

  } catch (error) {
    console.error('zaico API中継エラー:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
