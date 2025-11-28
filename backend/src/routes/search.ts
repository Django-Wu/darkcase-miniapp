import { Router, Request, Response } from 'express'
import { query } from '../db/index.js'

export const searchRouter = Router()

// GET /api/search - Search cases with filters and sorting
searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string
    const limit = parseInt(req.query.limit as string) || 20
    const country = req.query.country as string | undefined
    const status = req.query.status as string | undefined
    const crimeType = req.query.crimeType as string | undefined
    const yearFrom = req.query.yearFrom ? parseInt(req.query.yearFrom as string) : undefined
    const yearTo = req.query.yearTo ? parseInt(req.query.yearTo as string) : undefined
    const sortBy = (req.query.sortBy as 'date' | 'rating' | 'popularity') || 'rating'
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc'

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.json({ data: [] })
    }

    const searchPattern = `%${searchQuery.trim()}%`
    let sql = `SELECT * FROM cases WHERE (
      title LIKE ? OR
      description LIKE ? OR
      country LIKE ? OR
      JSON_SEARCH(tags, 'one', ?) IS NOT NULL OR
      JSON_SEARCH(crime_type, 'one', ?) IS NOT NULL
    )`
    const params: any[] = [searchPattern, searchPattern, searchPattern, searchQuery.trim(), searchQuery.trim()]

    // Фильтры
    if (country) {
      sql += ' AND country = ?'
      params.push(country)
    }

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    if (crimeType) {
      sql += ' AND JSON_SEARCH(crime_type, "one", ?) IS NOT NULL'
      params.push(crimeType)
    }

    if (yearFrom) {
      sql += ' AND year >= ?'
      params.push(yearFrom)
    }

    if (yearTo) {
      sql += ' AND year <= ?'
      params.push(yearTo)
    }

    // Сортировка
    let orderBy = ''
    switch (sortBy) {
      case 'date':
        orderBy = `created_at ${sortOrder.toUpperCase()}`
        break
      case 'rating':
        orderBy = `rating ${sortOrder.toUpperCase()}`
        break
      case 'popularity':
        // Популярность = рейтинг * количество просмотров (если есть)
        orderBy = `rating ${sortOrder.toUpperCase()}`
        break
      default:
        orderBy = `rating ${sortOrder.toUpperCase()}`
    }

    // Приоритет точного совпадения в заголовке
    sql += ` ORDER BY 
      CASE 
        WHEN title LIKE ? THEN 1
        WHEN description LIKE ? THEN 2
        ELSE 3
      END,
      ${orderBy}
    LIMIT ?`
    params.push(searchPattern, searchPattern, limit)

    const result = await query(sql, params)

    res.json({ data: result.rows })
  } catch (error) {
    console.error('Error searching:', error)
    res.status(500).json({ error: 'Failed to search' })
  }
})

