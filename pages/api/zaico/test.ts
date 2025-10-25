// Zaico API テストエンドポイント
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== Zaico API Test Endpoint Called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);

  res.status(200).json({
    message: 'Zaico API proxy is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
