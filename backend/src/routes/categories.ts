import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { query } from '../db/index.js'

export const categoriesRouter = Router()

// Validation schema
const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  orderIndex: z.number().int().optional(),
})

// GET /api/categories - Get all categories with cases
categoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        c.*,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', cases.id,
              'title', cases.title,
              'poster', cases.poster,
              'rating', cases.rating,
              'year', cases.year,
              'status', cases.status
            )
          ),
          JSON_ARRAY()
        ) as cases
      FROM categories c
      LEFT JOIN category_cases cc ON c.id = cc.category_id
      LEFT JOIN cases ON cc.case_id = cases.id
      GROUP BY c.id
      ORDER BY c.order_index
    `)

    res.json({ data: result.rows })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/categories/:id - Get category by ID
categoriesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await query(`
      SELECT 
        c.*,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', cases.id,
              'title', cases.title,
              'poster', cases.poster,
              'rating', cases.rating,
              'year', cases.year,
              'status', cases.status
            )
          ),
          JSON_ARRAY()
        ) as cases
      FROM categories c
      LEFT JOIN category_cases cc ON c.id = cc.category_id
      LEFT JOIN cases ON cc.case_id = cases.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({ data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

// POST /api/categories - Create category (admin only)
categoriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = categorySchema.parse(req.body)

    await query(
      'INSERT INTO categories (id, name, order_index) VALUES (?, ?, ?)',
      [validatedData.id, validatedData.name, validatedData.orderIndex || 0]
    )

    // Get created category
    const result = await query('SELECT * FROM categories WHERE id = ?', [validatedData.id])

    res.status(201).json({ data: result.rows[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT /api/categories/:id - Update category (admin only)
categoriesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validatedData = categorySchema.partial().parse(req.body)

    const updates: string[] = []
    const values: any[] = []

    if (validatedData.name) {
      updates.push('name = ?')
      values.push(validatedData.name)
    }
    if (validatedData.orderIndex !== undefined) {
      updates.push('order_index = ?')
      values.push(validatedData.orderIndex)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    values.push(id)
    const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`

    await query(sql, values)

    // Get updated category
    const result = await query('SELECT * FROM categories WHERE id = ?', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({ data: result.rows[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating category:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// DELETE /api/categories/:id - Delete category (admin only)
categoriesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Check if exists
    const checkResult = await query('SELECT id FROM categories WHERE id = ?', [id])
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    await query('DELETE FROM categories WHERE id = ?', [id])

    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})
