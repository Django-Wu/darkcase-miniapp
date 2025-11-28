import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { query } from '../db/index.js'

export const casesRouter = Router()

// Validation schemas
const caseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  country: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  duration: z.string(),
  crimeType: z.array(z.string()),
  tags: z.array(z.string()),
  status: z.enum(['Solved', 'Unsolved', 'Cold Case']),
  victims: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(10),
  poster: z.string().url().optional(),
  backdrop: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  timeline: z.array(z.object({
    date: z.string(),
    event: z.string(),
  })).optional(),
  facts: z.array(z.string()).optional(),
})

// GET /api/cases - Get all cases with pagination and filters
casesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit

    const country = req.query.country as string | undefined
    const status = req.query.status as string | undefined
    const crimeType = req.query.crimeType as string | undefined
    const search = req.query.search as string | undefined

    let sql = 'SELECT * FROM cases WHERE 1=1'
    const params: any[] = []

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

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await query(sql, params)
    const countResult = await query('SELECT COUNT(*) as count FROM cases')

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching cases:', error)
    res.status(500).json({ error: 'Failed to fetch cases' })
  }
})

// GET /api/cases/featured - Get featured case
casesRouter.get('/featured', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM cases ORDER BY rating DESC, created_at DESC LIMIT 1'
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No featured case found' })
    }

    res.json({ data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching featured case:', error)
    res.status(500).json({ error: 'Failed to fetch featured case' })
  }
})

// GET /api/cases/:id - Get case by ID
casesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM cases WHERE id = ?', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' })
    }

    res.json({ data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching case:', error)
    res.status(500).json({ error: 'Failed to fetch case' })
  }
})

// GET /api/cases/:id/similar - Get similar cases
casesRouter.get('/:id/similar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Get current case
    const caseResult = await query('SELECT * FROM cases WHERE id = ?', [id])
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' })
    }

    const currentCase = caseResult.rows[0]
    const crimeType = Array.isArray(currentCase.crime_type) 
      ? currentCase.crime_type[0] 
      : JSON.parse(currentCase.crime_type || '[]')[0] || ''

    // Find similar cases (same country or crime type)
    const result = await query(
      `SELECT * FROM cases 
       WHERE id != ? 
       AND (country = ? OR JSON_SEARCH(crime_type, "one", ?) IS NOT NULL)
       ORDER BY rating DESC 
       LIMIT 6`,
      [id, currentCase.country, crimeType]
    )

    res.json({ data: result.rows })
  } catch (error) {
    console.error('Error fetching similar cases:', error)
    res.status(500).json({ error: 'Failed to fetch similar cases' })
  }
})

// POST /api/cases - Create new case (admin only)
casesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = caseSchema.parse(req.body)

    await query(
      `INSERT INTO cases (
        id, title, description, country, year, duration, 
        crime_type, tags, status, victims, rating, 
        poster, backdrop, video_url, timeline, facts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.title.toLowerCase().replace(/\s+/g, '-').substring(0, 50) || `case-${Date.now()}`,
        validatedData.title,
        validatedData.description,
        validatedData.country,
        validatedData.year,
        validatedData.duration,
        JSON.stringify(validatedData.crimeType),
        JSON.stringify(validatedData.tags),
        validatedData.status,
        validatedData.victims || null,
        validatedData.rating,
        validatedData.poster || null,
        validatedData.backdrop || null,
        validatedData.videoUrl || null,
        validatedData.timeline ? JSON.stringify(validatedData.timeline) : null,
        validatedData.facts ? JSON.stringify(validatedData.facts) : null,
      ]
    )

    // Get created case
    const result = await query('SELECT * FROM cases WHERE id = ?', [
      validatedData.title.toLowerCase().replace(/\s+/g, '-').substring(0, 50) || `case-${Date.now()}`
    ])

    res.status(201).json({ data: result.rows[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating case:', error)
    res.status(500).json({ error: 'Failed to create case' })
  }
})

// PUT /api/cases/:id - Update case (admin only)
casesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validatedData = caseSchema.partial().parse(req.body)

    const updates: string[] = []
    const values: any[] = []

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'crimeType' ? 'crime_type' : 
                     key === 'videoUrl' ? 'video_url' : key
        updates.push(`${dbKey} = ?`)
        if (key === 'timeline' && Array.isArray(value)) {
          values.push(JSON.stringify(value))
        } else if (key === 'crimeType' && Array.isArray(value)) {
          values.push(JSON.stringify(value))
        } else if (key === 'tags' && Array.isArray(value)) {
          values.push(JSON.stringify(value))
        } else if (key === 'facts' && Array.isArray(value)) {
          values.push(JSON.stringify(value))
        } else {
          values.push(value)
        }
      }
    })

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    updates.push('updated_at = NOW()')
    values.push(id)
    const sql = `UPDATE cases SET ${updates.join(', ')} WHERE id = ?`

    await query(sql, values)

    // Get updated case
    const result = await query('SELECT * FROM cases WHERE id = ?', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' })
    }

    res.json({ data: result.rows[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating case:', error)
    res.status(500).json({ error: 'Failed to update case' })
  }
})

// DELETE /api/cases/:id - Delete case (admin only)
casesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Check if exists
    const checkResult = await query('SELECT id FROM cases WHERE id = ?', [id])
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' })
    }

    await query('DELETE FROM cases WHERE id = ?', [id])

    res.json({ message: 'Case deleted successfully' })
  } catch (error) {
    console.error('Error deleting case:', error)
    res.status(500).json({ error: 'Failed to delete case' })
  }
})
