import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: true, // Позволяет доступ из сети (0.0.0.0)
    open: true, // Автоматически открывает браузер
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Важно: не переписываем origin для CORS
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Сохраняем оригинальный host для CORS
            if (req.headers.host) {
              proxyReq.setHeader('X-Forwarded-Host', req.headers.host)
            }
          })
        },
      },
    },
  },
})

