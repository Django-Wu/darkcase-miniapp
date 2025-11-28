import { Router, Request, Response } from 'express'
import multer from 'multer'
import { fileStorage } from '../utils/fileStorage.js'

export const uploadRouter = Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedMimes = {
      'poster': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      'backdrop': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      'video': ['video/mp4', 'video/webm', 'video/ogg'],
    }

    const type = req.path.includes('poster') ? 'poster' :
                 req.path.includes('backdrop') ? 'backdrop' :
                 req.path.includes('video') ? 'video' : null

    if (!type) {
      return cb(new Error('Invalid upload type'))
    }

    if (allowedMimes[type].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedMimes[type].join(', ')}`))
    }
  },
})

// POST /api/upload/poster - Upload poster image
uploadRouter.post('/poster', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const url = await fileStorage.saveFile(req.file, 'poster')

    res.json({
      success: true,
      url,
      message: 'Poster uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading poster:', error)
    res.status(500).json({ error: 'Failed to upload poster' })
  }
})

// POST /api/upload/backdrop - Upload backdrop image
uploadRouter.post('/backdrop', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const url = await fileStorage.saveFile(req.file, 'backdrop')

    res.json({
      success: true,
      url,
      message: 'Backdrop uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading backdrop:', error)
    res.status(500).json({ error: 'Failed to upload backdrop' })
  }
})

// POST /api/upload/video - Upload video file
uploadRouter.post('/video', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const url = await fileStorage.saveFile(req.file, 'video')

    res.json({
      success: true,
      url,
      message: 'Video uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    res.status(500).json({ error: 'Failed to upload video' })
  }
})

