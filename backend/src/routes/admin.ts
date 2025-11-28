import { Router, Request, Response } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { query } from '../db/index.js'
import { adminAuth } from '../middleware/adminAuth.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

export const adminRouter = Router()

// Настройка multer для загрузки файлов
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '../uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
})

// Admin login schema
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// POST /api/admin/auth/login - Admin login
adminRouter.post('/auth/login', async (req: Request, res: Response) => {
  console.log('🔐 Admin login attempt:', { username: req.body?.username })
  try {
    const { username, password } = loginSchema.parse(req.body)
    console.log('✅ Login data validated')

    // Получаем данные из .env
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD

    // Проверяем, что пароль установлен
    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD не установлен в .env файле!')
      return res.status(500).json({ 
        error: 'Server configuration error: ADMIN_PASSWORD not set',
        message: 'Пароль администратора не настроен. Проверьте файл .env'
      })
    }

    console.log('🔍 Checking credentials:', { 
      providedUsername: username, 
      expectedUsername: adminUsername,
      passwordMatch: password === adminPassword 
    })

    if (username !== adminUsername) {
      console.log('❌ Invalid username')
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' })
    }

    // Проверка пароля
    const isValidPassword = password === adminPassword

    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' })
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('❌ JWT_SECRET не установлен в .env файле!')
      return res.status(500).json({ 
        error: 'Server configuration error: JWT_SECRET not set',
        message: 'JWT секрет не настроен. Проверьте файл .env'
      })
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string
    const token = jwt.sign(
      { adminId: username, type: 'admin' },
      secret,
      { expiresIn } as SignOptions
    )

    console.log('✅ Login successful for:', username)
    res.json({
      token,
      admin: {
        id: username,
        username,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error during admin login:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// GET /api/admin/stats - Dashboard statistics
adminRouter.get('/stats', adminAuth, async (req: Request, res: Response) => {
  try {
    // Проверяем доступность БД
    try {
      await query('SELECT 1')
    } catch (dbError) {
      // Если БД недоступна, возвращаем mock данные
      return res.json({
        totalCases: 0,
        totalUsers: 0,
        totalViews: 0,
        recentCases: [],
        viewsByDay: [],
      })
    }

    // Get total cases
    const casesResult = await query('SELECT COUNT(*) as count FROM cases')
    const totalCases = parseInt(casesResult.rows[0].count)

    // Get total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users')
    const totalUsers = parseInt(usersResult.rows[0].count)

    // Get total views (from watch history)
    const viewsResult = await query('SELECT COUNT(*) as count FROM user_history')
    const totalViews = parseInt(viewsResult.rows[0].count)

    // Get recent cases
    const recentCasesResult = await query(
      'SELECT id, title, created_at FROM cases ORDER BY created_at DESC LIMIT 5'
    )

    // Get views by day (last 7 days)
    const viewsByDayResult = await query(
      `SELECT 
        DATE(last_watched) as date,
        COUNT(*) as views
       FROM user_history
       WHERE last_watched >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(last_watched)
       ORDER BY date ASC`
    )

    res.json({
      totalCases,
      totalUsers,
      totalViews,
      recentCases: recentCasesResult.rows,
      viewsByDay: viewsByDayResult.rows.map((row: any) => ({
        date: new Date(row.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        views: parseInt(row.views),
      })),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Возвращаем пустые данные вместо ошибки
    res.json({
      totalCases: 0,
      totalUsers: 0,
      totalViews: 0,
      recentCases: [],
      viewsByDay: [],
    })
  }
})

// Chronicles Admin Routes
// GET /api/admin/chronicles - Получить все хроники
adminRouter.get('/chronicles', adminAuth, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
        id, video_url, title, description, likes, comments_count, created_at, updated_at, case_id, tags, thumbnail, duration, status
      FROM chronicles 
      ORDER BY created_at DESC`
    )

    const chronicles = (result.rows as any[]).map((row: any) => ({
      id: row.id,
      videoUrl: row.video_url,
      title: row.title,
      description: row.description,
      likes: row.likes || 0,
      comments: row.comments_count || 0,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
      caseId: row.case_id || undefined,
      tags: row.tags ? JSON.parse(row.tags) : [],
      thumbnail: row.thumbnail || undefined,
      duration: row.duration || undefined,
      status: row.status || 'draft',
    }))

    res.json({ data: chronicles })
  } catch (error) {
    console.error('Error fetching chronicles:', error)
    res.status(500).json({ error: 'Failed to fetch chronicles' })
  }
})

// GET /api/admin/chronicles/:id - Получить хронику по ID
adminRouter.get('/chronicles/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await query(
      `SELECT 
        id, video_url, title, description, likes, comments_count, created_at, updated_at, case_id, tags, thumbnail, duration, status
      FROM chronicles 
      WHERE id = ?`,
      [id]
    )

    const rows = result.rows as any[]
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Chronicle not found' })
    }

    const row = rows[0]
    const chronicle = {
      id: row.id,
      videoUrl: row.video_url,
      title: row.title,
      description: row.description,
      likes: row.likes || 0,
      comments: row.comments_count || 0,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
      caseId: row.case_id || undefined,
      tags: row.tags ? JSON.parse(row.tags) : [],
      thumbnail: row.thumbnail || undefined,
      duration: row.duration || undefined,
      status: row.status || 'draft',
    }

    res.json({ data: chronicle })
  } catch (error) {
    console.error('Error fetching chronicle:', error)
    res.status(500).json({ error: 'Failed to fetch chronicle' })
  }
})

// POST /api/admin/chronicles - Создать хронику
adminRouter.post('/chronicles', adminAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl, caseId, thumbnail, tags, status, duration } = req.body

    if (!title || !description || !videoUrl) {
      return res.status(400).json({ error: 'Title, description, and videoUrl are required' })
    }

    const id = uuidv4()
    const tagsJson = tags ? JSON.stringify(JSON.parse(tags)) : JSON.stringify([])

    await query(
      `INSERT INTO chronicles (id, video_url, title, description, case_id, thumbnail, tags, status, duration, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, videoUrl, title, description, caseId || null, thumbnail || null, tagsJson, status || 'draft', duration ? parseInt(duration) : null]
    )

    res.json({ data: { id, title, description, videoUrl } })
  } catch (error) {
    console.error('Error creating chronicle:', error)
    res.status(500).json({ error: 'Failed to create chronicle' })
  }
})

// PUT /api/admin/chronicles/:id - Обновить хронику
adminRouter.put('/chronicles/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, videoUrl, caseId, thumbnail, tags, status, duration } = req.body

    const updates: string[] = []
    const values: any[] = []

    if (title) {
      updates.push('title = ?')
      values.push(title)
    }
    if (description) {
      updates.push('description = ?')
      values.push(description)
    }
    if (videoUrl) {
      updates.push('video_url = ?')
      values.push(videoUrl)
    }
    if (caseId !== undefined) {
      updates.push('case_id = ?')
      values.push(caseId || null)
    }
    if (thumbnail !== undefined) {
      updates.push('thumbnail = ?')
      values.push(thumbnail || null)
    }
    if (tags) {
      updates.push('tags = ?')
      values.push(JSON.stringify(JSON.parse(tags)))
    }
    if (status) {
      updates.push('status = ?')
      values.push(status)
    }
    if (duration) {
      updates.push('duration = ?')
      values.push(parseInt(duration))
    }

    updates.push('updated_at = NOW()')
    values.push(id)

    if (updates.length === 1) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    await query(
      `UPDATE chronicles SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating chronicle:', error)
    res.status(500).json({ error: 'Failed to update chronicle' })
  }
})

// PATCH /api/admin/chronicles/:id/status - Изменить статус
adminRouter.patch('/chronicles/:id/status', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    await query(
      'UPDATE chronicles SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating chronicle status:', error)
    res.status(500).json({ error: 'Failed to update chronicle status' })
  }
})

// DELETE /api/admin/chronicles/:id - Удалить хронику
adminRouter.delete('/chronicles/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await query('DELETE FROM chronicles WHERE id = ?', [id])

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting chronicle:', error)
    res.status(500).json({ error: 'Failed to delete chronicle' })
  }
})

