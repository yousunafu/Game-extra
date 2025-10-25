// zaico API中継サーバー
// フロントエンドからzaico APIへの安全な中継

import type { NextApiRequest, NextApiResponse } from 'next';

const ZAICO_API_BASE_URL = 'https://api.zaico.co.jp/v1';
const ZAICO_API_TOKEN = process.env.ZAICO_API_TOKEN; // 環境変数から取得

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== Zaico API Proxy Called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);

  // 環境変数チェック（警告のみ）
  if (!ZAICO_API_TOKEN) {
    console.warn('ZAICO_API_TOKEN is not configured, using client API key only');
  }

  // メソッド制限（GET, POST, PUT, DELETEのみ許可）
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method || '')) {
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
    const clientApiKey = req.headers['x-api-key'] as string;
    const apiKey = clientApiKey || ZAICO_API_TOKEN;

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key is required' 
      });
    }

    // zaico APIにリクエスト
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    // レスポンスを取得
    const text = await response.text();
    console.log('Zaico API レスポンス:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: text.substring(0, 500) // 最初の500文字のみログ出力
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
