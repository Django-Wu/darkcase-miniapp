import { Router, Request, Response } from 'express'
import { query } from '../db/index.js'
import { authenticateTelegram } from '../middleware/authenticateTelegram.js'

const router = Router()

// Получить все опубликованные хроники
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
        id, video_url, title, description, likes, comments_count, created_at, case_id, tags, thumbnail, duration
      FROM chronicles 
      WHERE status = 'published' 
      ORDER BY created_at DESC 
      LIMIT 100`
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
    console.error('Error fetching chronicles:', error)
    res.status(500).json({ error: 'Failed to fetch chronicles' })
  }
})

// Получить лайкнутые хроники пользователя
router.get('/liked', authenticateTelegram, async (req: Request, res: Response) => {
  try {
    const telegramUser = (req as any).telegramUser
    if (!telegramUser?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Получаем user_id из таблицы users по telegram_id
    const userResult = await query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramUser.id.toString()]
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

// Лайкнуть хронику
router.post('/:id/like', authenticateTelegram, async (req: Request, res: Response) => {
  try {
    const telegramUser = (req as any).telegramUser
    const chronicleId = req.params.id

    if (!telegramUser?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Получаем user_id из таблицы users по telegram_id
    const userResult = await query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramUser.id.toString()]
    )
    
    if ((userResult.rows as any[]).length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    const userId = (userResult.rows as any[])[0].id

    // Проверяем, не лайкнул ли уже
    const existing = await query(
      'SELECT id FROM chronicle_likes WHERE user_id = ? AND chronicle_id = ?',
      [userId, chronicleId]
    )

    if ((existing.rows as any[]).length === 0) {
      // Добавляем лайк
      await query(
        'INSERT INTO chronicle_likes (user_id, chronicle_id, created_at) VALUES (?, ?, NOW())',
        [userId, chronicleId]
      )

      // Увеличиваем счетчик лайков
      await query(
        'UPDATE chronicles SET likes = likes + 1 WHERE id = ?',
        [chronicleId]
      )
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error liking chronicle:', error)
    res.status(500).json({ error: 'Failed to like chronicle' })
  }
})

// Убрать лайк
router.delete('/:id/like', authenticateTelegram, async (req: Request, res: Response) => {
  try {
    const telegramUser = (req as any).telegramUser
    const chronicleId = req.params.id

    if (!telegramUser?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Получаем user_id из таблицы users по telegram_id
    const userResult = await query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramUser.id.toString()]
    )
    
    if ((userResult.rows as any[]).length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    const userId = (userResult.rows as any[])[0].id

    // Удаляем лайк
    await query(
      'DELETE FROM chronicle_likes WHERE user_id = ? AND chronicle_id = ?',
      [userId, chronicleId]
    )

    // Уменьшаем счетчик лайков
    await query(
      'UPDATE chronicles SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
      [chronicleId]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Error unliking chronicle:', error)
    res.status(500).json({ error: 'Failed to unlike chronicle' })
  }
})

// Получить комментарии к хронике
router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const chronicleId = req.params.id

    const result = await query(
      `SELECT 
        cc.id, cc.chronicle_id, cc.user_id, cc.text, cc.created_at,
        u.first_name, u.username
      FROM chronicle_comments cc
      LEFT JOIN users u ON cc.user_id = u.id
      WHERE cc.chronicle_id = ?
      ORDER BY cc.created_at DESC
      LIMIT 100`,
      [chronicleId]
    )

    const comments = (result.rows as any[]).map((row: any) => ({
      id: row.id,
      chronicleId: row.chronicle_id,
      userId: row.user_id,
      userName: row.first_name || row.username || 'Пользователь',
      userAvatar: undefined,
      text: row.text,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    }))

    res.json({ data: comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Добавить комментарий
router.post('/:id/comments', authenticateTelegram, async (req: Request, res: Response) => {
  try {
    const telegramUser = (req as any).telegramUser
    const chronicleId = req.params.id
    const { text } = req.body

    if (!telegramUser?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Получаем user_id из таблицы users по telegram_id
    const userResult = await query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramUser.id.toString()]
    )
    
    if ((userResult.rows as any[]).length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    const userId = (userResult.rows as any[])[0].id

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Добавляем комментарий
    const result = await query(
      'INSERT INTO chronicle_comments (chronicle_id, user_id, text, created_at) VALUES (?, ?, ?, NOW())',
      [chronicleId, userId, text.trim()]
    )

    const insertId = (result as any).insertId

    // Увеличиваем счетчик комментариев
    await query(
      'UPDATE chronicles SET comments_count = comments_count + 1 WHERE id = ?',
      [chronicleId]
    )

    // Получаем созданный комментарий
    const commentResult = await query(
      `SELECT 
        cc.id, cc.chronicle_id, cc.user_id, cc.text, cc.created_at,
        u.first_name, u.username, u.photo_url
      FROM chronicle_comments cc
      LEFT JOIN users u ON cc.user_id = u.id
      WHERE cc.id = ?`,
      [insertId]
    )

    const comment = (commentResult.rows as any[])[0]
    if (comment) {
      res.json({
        data: {
          id: comment.id,
          chronicleId: comment.chronicle_id,
          userId: comment.user_id,
          userName: comment.first_name || comment.username || 'Пользователь',
          userAvatar: undefined,
          text: comment.text,
          createdAt: comment.created_at?.toISOString() || new Date().toISOString(),
        },
      })
    } else {
      res.status(500).json({ error: 'Failed to create comment' })
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

export default router

