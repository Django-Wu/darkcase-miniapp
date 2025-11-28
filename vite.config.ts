import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer (only in build mode)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // PWA plugin with Service Worker
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'], // Иконки можно добавить позже
      manifest: {
        name: 'DarkCase - True Crime Cases',
        short_name: 'DarkCase',
        description: 'Платформа для просмотра документальных фильмов о реальных преступлениях',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          // Иконки опциональны - можно добавить позже
          // См. public/ICONS_README.md для инструкций
        ],
        shortcuts: [
          {
            name: 'Главная',
            short_name: 'Главная',
            description: 'Открыть главную страницу',
            url: '/',
          },
          {
            name: 'Поиск',
            short_name: 'Поиск',
            description: 'Поиск кейсов',
            url: '/search',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Кэширование API запросов (Network First с fallback на кэш)
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 часа
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          // Кэширование изображений (Cache First)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 дней
              },
            },
          },
          // Кэширование видео (Cache First для небольших файлов)
          {
            urlPattern: /\.(?:mp4|webm|ogg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 дней
              },
              rangeRequests: true, // Поддержка range requests для видео
            },
          },
          // Кэширование внешних ресурсов (Google Fonts, etc.)
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 год
              },
            },
          },
          // Кэширование Telegram WebApp script
          {
            urlPattern: /^https:\/\/telegram\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'telegram-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 дней
              },
            },
          },
        ],
        // Обработка офлайн страницы
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api\/.*/], // Не использовать fallback для API
      },
      devOptions: {
        enabled: false, // Отключаем в dev режиме для избежания проблем с HMR
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Оптимизация bundle size
    target: 'es2015',
    minify: 'esbuild', // Быстрее чем terser
    cssMinify: true,
    sourcemap: false, // Отключаем sourcemaps в production для уменьшения размера
    rollupOptions: {
      output: {
        // Стратегия разделения chunks
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-window'],
          // Store chunk
          'store': ['./src/store/useAppStore'],
        },
        // Оптимизация имен файлов
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Увеличиваем лимит предупреждений для больших bundle
    chunkSizeWarningLimit: 1000,
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
    exclude: ['react-window'], // Исключаем из предварительной оптимизации
  },
})

