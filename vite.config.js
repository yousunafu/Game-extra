import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api/zaico': {
        target: 'https://api.zaico.co.jp/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zaico/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // リクエストヘッダーからAPIキーを取得して設定
            const apiKey = req.headers['x-api-key'];
            if (apiKey) {
              proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
            }
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Accept', 'application/json');
          });
        }
      }
    }
  },
  build: {
    sourcemap: true
  }
})