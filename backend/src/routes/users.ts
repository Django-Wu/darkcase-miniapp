import { Router, Request, Response } from 'express'
import { query } from '../db/index.js'

interface AuthenticatedRequest extends Request {
  telegramUser?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    is_premium?: boolean
  }
}

export const usersRouter = Router()

// GET /api/users/me - Get current user
usersRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userId = req.telegramUser.id.toString()

    // Get or create user
    let result = await query('SELECT * FROM users WHERE telegram_id = ?', [userId])

    if (result.rows.length === 0) {
      // Create new user
      await query(
        `INSERT INTO users (id, telegram_id, first_name, last_name, username, is_premium)
         VALUES (UUID(), ?, ?, ?, ?, ?)`,
        [
          userId,
          req.telegramUser.first_name,
          req.telegramUser.last_name || null,
          req.telegramUser.username || null,
          req.telegramUser.is_premium || false,
        ]
      )
      // Get created user
      result = await query('SELECT * FROM users WHERE telegram_id = ?', [userId])
    }

    res.json({ data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// GET /api/users/me/favorites - Get user favorites
usersRouter.get('/me/favorites', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user ID from database
    const userResult = await query('SELECT id FROM users WHERE telegram_id = ?', [
      req.telegramUser.id.toString()
    ])
    
    if (userResult.rows.length === 0) {
      return res.json({ data: [] })
    }

    const userId = userResult.rows[0].id

    const result = await query(
      `SELECT c.* FROM cases c
       INNER JOIN user_favorites uf ON c.id = uf.case_id
       WHERE uf.user_id = ?
       ORDER BY uf.created_at DESC`,
      [userId]
    )

    res.json({ data: result.rows })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    res.status(500).json({ error: 'Failed to fetch favorites' })
  }
})

// POST /api/users/me/favorites - Add to favorites
usersRouter.post('/me/favorites', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user ID from database
    const userResult = await query('SELECT id FROM users WHERE telegram_id = ?', [
      req.telegramUser.id.toString()
    ])
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userId = userResult.rows[0].id
    const { caseId } = req.body

    if (!caseId) {
      return res.status(400).json({ error: 'caseId is required' })
    }

    // Check if already favorited
    const existing = await query(
      'SELECT * FROM user_favorites WHERE user_id = ? AND case_id = ?',
      [userId, caseId]
    )

    if (existing.rows.length > 0) {
      return res.json({ data: { message: 'Already in favorites' } })
    }

    await query(
      'INSERT INTO user_favorites (user_id, case_id) VALUES (?, ?)',
      [userId, caseId]
    )

    res.status(201).json({ data: { message: 'Added to favorites' } })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    res.status(500).json({ error: 'Failed to add to favorites' })
  }
})

// DELETE /api/users/me/favorites/:caseId - Remove from favorites
usersRouter.delete('/me/favorites/:caseId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user ID from database
    const userResult = await query('SELECT id FROM users WHERE telegram_id = ?', [
      req.telegramUser.id.toString()
    ])
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userId = userResult.rows[0].id
    const { caseId } = req.params

    await query(
      'DELETE FROM user_favorites WHERE user_id = ? AND case_id = ?',
      [userId, caseId]
    )

    res.json({ data: { message: 'Removed from favorites' } })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    res.status(500).json({ error: 'Failed to remove from favorites' })
  }
})

// GET /api/users/me/recommendations - Get recommendations based on watch history
usersRouter.get('/me/recommendations', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user ID from database
    const userResult = await query('SELECT id FROM users WHERE telegram_id = ?', [
      req.telegramUser.id.toString()
    ])
    
    if (userResult.rows.length === 0) {
      // Если нет пользователя, возвращаем популярные кейсы
      const popularResult = await query(
        'SELECT * FROM cases ORDER BY rating DESC, created_at DESC LIMIT 20'
      )
      return res.json({ data: popularResult.rows })
    }

    const userId = userResult.rows[0].id
    
    // Получаем историю просмотра пользователя
    const historyResult = await query(
      `SELECT case_id, progress, last_watched FROM user_history WHERE user_id = ? ORDER BY last_watched DESC LIMIT 50`,
      [userId]
    )

    if (historyResult.rows.length === 0) {
      // Если нет истории, возвращаем популярные кейсы
      const popularResult = await query(
        'SELECT * FROM cases ORDER BY rating DESC, created_at DESC LIMIT 20'
      )
      return res.json({ data: popularResult.rows })
    }

    const watchedCaseIds = historyResult.rows.map((row: any) => row.case_id)
    
    // Получаем просмотренные кейсы для анализа предпочтений
    if (watchedCaseIds.length === 0) {
      const popularResult = await query(
        'SELECT * FROM cases ORDER BY rating DESC, created_at DESC LIMIT 20'
      )
      return res.json({ data: popularResult.rows })
    }

    const watchedCasesResult = await query(
      `SELECT * FROM cases WHERE id IN (${watchedCaseIds.map(() => '?').join(',')})`,
      watchedCaseIds
    )

    const watchedCases = watchedCasesResult.rows
    
    // Анализируем предпочтения
    const preferences = {
      countries: new Map<string, number>(),
      crimeTypes: new Map<string, number>(),
      tags: new Map<string, number>(),
    }

    watchedCases.forEach((caseItem: any, index: number) => {
      const weight = watchedCases.length - index
      const historyItem = historyResult.rows.find((r: any) => r.case_id === caseItem.id)
      const progress = historyItem?.progress || 0
      const progressWeight = progress > 50 ? 1.5 : progress > 20 ? 1.2 : 1.0

      if (caseItem.country) {
        const current = preferences.countries.get(caseItem.country) || 0
        preferences.countries.set(caseItem.country, current + weight * progressWeight)
      }

      try {
        const crimeTypes = typeof caseItem.crime_type === 'string' 
          ? JSON.parse(caseItem.crime_type) 
          : caseItem.crime_type || []
        crimeTypes.forEach((type: string) => {
          const current = preferences.crimeTypes.get(type) || 0
          preferences.crimeTypes.set(type, current + weight * progressWeight)
        })
      } catch (e) {
        // Игнорируем ошибки парсинга
      }

      try {
        const tags = typeof caseItem.tags === 'string' 
          ? JSON.parse(caseItem.tags) 
          : caseItem.tags || []
        tags.forEach((tag: string) => {
          const current = preferences.tags.get(tag) || 0
          preferences.tags.set(tag, current + weight * progressWeight)
        })
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    })

    // Получаем все кейсы кроме просмотренных
    const allCasesResult = await query(
      `SELECT * FROM cases WHERE id NOT IN (${watchedCaseIds.map(() => '?').join(',')}) ORDER BY rating DESC`,
      watchedCaseIds
    )

    // Вычисляем релевантность
    const recommendations = allCasesResult.rows
      .map((caseItem: any) => {
        let score = 0

        if (caseItem.country && preferences.countries.has(caseItem.country)) {
          score += (preferences.countries.get(caseItem.country) || 0) * 2
        }

        try {
          const crimeTypes = typeof caseItem.crime_type === 'string' 
            ? JSON.parse(caseItem.crime_type) 
            : caseItem.crime_type || []
          crimeTypes.forEach((type: string) => {
            if (preferences.crimeTypes.has(type)) {
              score += (preferences.crimeTypes.get(type) || 0) * 3
            }
          })
        } catch (e) {
          // Игнорируем ошибки
        }

        try {
          const tags = typeof caseItem.tags === 'string' 
            ? JSON.parse(caseItem.tags) 
            : caseItem.tags || []
          tags.forEach((tag: string) => {
            if (preferences.tags.has(tag)) {
              score += (preferences.tags.get(tag) || 0) * 1.5
            }
          })
        } catch (e) {
          // Игнорируем ошибки
        }

        score += (caseItem.rating || 0) * 0.5

        return { ...caseItem, _score: score }
      })
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20)
      .map((item: any) => {
        const { _score, ...caseData } = item
        return caseData
      })

    res.json({ data: recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// GET /api/users/me/history - Get watch history
usersRouter.get('/me/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user ID from database
    const userResult = await query('SELECT id FROM users WHERE telegram_id = ?', [
      req.telegramUser.id.toString()
    ])
    
    if (userResult.rows.length === 0) {
      return res.json({ data: [] })
    }

    const userId = userResult.rows[0].id

    const result = await query(
      `SELECT 
        c.*,
        uh.progress,
        uh.last_watched
       FROM cases c
       INNER JOIN user_history uh ON c.id = uh.case_id
       WHERE uh.user_id = ?
       ORDER BY uh.last_watched DESC
       LIMIT 50`,
      [userId]
    )

    res.json({ data: result.rows })
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// POST /api/users/me/history - Update watch history
usersRouter.post('/me/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user ID from database
    const userResult = await query('SELECT id FROM users WHERE telegram_id = ?', [
      req.telegramUser.id.toString()
    ])
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userId = userResult.rows[0].id
    const { caseId, progress } = req.body

    if (!caseId || typeof progress !== 'number') {
      return res.status(400).json({ error: 'caseId and progress are required' })
    }

    await query(
      `INSERT INTO user_history (user_id, case_id, progress, last_watched)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE progress = ?, last_watched = NOW()`,
      [userId, caseId, Math.max(0, Math.min(100, progress)), Math.max(0, Math.min(100, progress))]
    )

    res.json({ data: { message: 'History updated' } })
  } catch (error) {
    console.error('Error updating history:', error)
    res.status(500).json({ error: 'Failed to update history' })
  }
})

// GET /api/users/me/chronicles/liked - Получить лайкнутые хроники пользователя
usersRouter.get('/me/chronicles/liked', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.telegramUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Получаем user_id из таблицы users по telegram_id
    const userResult = await query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [req.telegramUser.id.toString()]
    )
    
    if ((userResult.rows as any[]).length === 0) {
      return res.json({ data: [] })
    }
    
    const userId = (userResult.rows as any[])[0].id

    const result = await query(
      `SELECT c.id, c.video_url, c.title, c.description, c.likes, c.comments_count, c.created_at, c.case_id, c.tags, c.thumbnail, c.duration
      FROM chronicles c
      INNER JOIN chronicle_likes cl ON c.id = cl.chronicle_id
      WHERE cl.user_id = ? AND c.status = 'published'
      ORDER BY cl.created_at DESC`,
      [userId]
    )

    const chronicles = (result.rows as any[]).map((row: any) => ({
      id: row.id,
      videoUrl: row.video_url,
      title: row.title,
      description: row.description,
      likes: row.likes || 0,
      comments: row.comments_count || 0,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      caseId: row.case_id || undefined,
      tags: row.tags ? JSON.parse(row.tags) : [],
      thumbnail: row.thumbnail || undefined,
      duration: row.duration || undefined,
    }))

    res.json({ data: chronicles })
  } catch (error) {
    console.error('Error fetching liked chronicles:', error)
    res.status(500).json({ error: 'Failed to fetch liked chronicles' })
  }
})
