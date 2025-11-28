import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { casesRouter } from './routes/cases.js'
import { categoriesRouter } from './routes/categories.js'
import { usersRouter } from './routes/users.js'
import { searchRouter } from './routes/search.js'
import { uploadRouter } from './routes/upload.js'
import { adminRouter } from './routes/admin.js'
import chroniclesRouter from './routes/chronicles.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authenticateTelegram } from './middleware/authenticateTelegram.js'
import { runMigrations } from './utils/migrate.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : process.env.NODE_ENV === 'production'
    ? [
        'https://admin.darkcase.app',
        'https://darkcase.app',
        // Добавьте другие production домены
      ]
    : [
        'http://localhost:5173', 
        'http://localhost:3001',
        // Разрешаем все локальные IP адреса для разработки
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // 192.168.x.x
        /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/, // 172.x.x.x (включая 172.20.10.2)
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // 10.x.x.x
      ]
const allowedOrigins = corsOrigins.length > 0 ? corsOrigins : ['*']

app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем все, если указан '*'
    if (allowedOrigins.includes('*')) {
      return callback(null, true)
    }
    
    // Если origin не указан (например, Postman, curl)
    if (!origin) {
      return callback(null, true)
    }
    
    // Проверяем точное совпадение
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    // Проверяем регулярные выражения для локальных IP
    const isLocalIP = allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(origin)
      }
      return false
    })
    
    if (isLocalIP) {
      return callback(null, true)
    }
    
    // В development режиме разрешаем все локальные адреса
    if (process.env.NODE_ENV !== 'production') {
      const localPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
        /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
      ]
      
      if (localPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true)
      }
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded files
if (process.env.FILE_STORAGE_TYPE === 'local' || !process.env.FILE_STORAGE_TYPE) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const uploadsPath = path.join(__dirname, '../uploads')
  app.use('/uploads', express.static(uploadsPath))
}

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'DarkCase API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: 'See README.md for API documentation',
    },
    message: 'This is the Backend API. Use the Admin Panel at http://localhost:3001 or your Telegram Mini App.',
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      hasAdminUsername: !!process.env.ADMIN_USERNAME,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasJWTSecret: !!process.env.JWT_SECRET,
    }
  })
})

// API Routes
app.use('/api/cases', casesRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/users', authenticateTelegram, usersRouter)
app.use('/api/search', searchRouter)
app.use('/api/upload', authenticateTelegram, uploadRouter) // Upload requires auth
app.use('/api/admin', adminRouter) // Admin routes
app.use('/api/chronicles', chroniclesRouter) // Chronicles routes

// Debug: Log all routes
console.log('📋 Registered API routes:')
console.log('   GET  /api/cases')
console.log('   GET  /api/categories')
console.log('   POST /api/admin/auth/login')
console.log('   GET  /api/admin/stats')
console.log('   GET  /health (health check)')
console.log('')
console.log('🔐 Admin credentials check:')
console.log('   ADMIN_USERNAME:', process.env.ADMIN_USERNAME || '❌ не установлен')
console.log('   ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✅ установлен' : '❌ не установлен')
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ установлен' : '❌ не установлен')

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Run migrations on startup (in development)
if (process.env.NODE_ENV !== 'production' || process.env.RUN_MIGRATIONS === 'true') {
  // Запускаем миграции асинхронно, не блокируя старт сервера
  runMigrations().catch((err) => {
    console.warn('⚠️  Migrations failed, but server continues:', err.message)
  })
}

app.listen(PORT, () => {
  console.log(`🚀 DarkCase API server running on port ${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`💾 File Storage: ${process.env.FILE_STORAGE_TYPE || 'local'}`)
})

