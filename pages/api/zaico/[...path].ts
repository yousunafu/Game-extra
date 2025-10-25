// zaico API中継サーバー
// フロントエンドからzaico APIへの安全な中継

import type { NextApiRequest, NextApiResponse } from 'next';

const ZAICO_API_BASE_URL = 'https://web.zaico.co.jp/api/v1';
const ZAICO_API_TOKEN = process.env.ZAICO_API_TOKEN; // 環境変数から取得

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 環境変数チェック
  if (!ZAICO_API_TOKEN) {
    return res.status(500).json({ 
      error: 'ZAICO_API_TOKEN is not configured' 
    });
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

    // zaico APIにリクエスト
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${ZAICO_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    // レスポンスを取得
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    // ステータスコードとレスポンスを返す
    res.status(response.status).json(json || { message: text });

  } catch (error) {
    console.error('zaico API中継エラー:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
