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
        target: 'https://web.zaico.co.jp/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zaico/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Zaico APIトークンを注入
            proxyReq.setHeader('Authorization', 'Bearer HjqREprLiqeb83fsDahXGKSb3w3M9TCR');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
        }
      }
    }
  },
  build: {
    sourcemap: true
  }
})