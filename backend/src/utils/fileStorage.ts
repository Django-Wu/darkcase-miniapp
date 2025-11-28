import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface FileStorageConfig {
  type: 'local' | 's3' | 'r2'
  localPath?: string
  s3Bucket?: string
  s3Region?: string
  cdnUrl?: string
}

class FileStorage {
  private config: FileStorageConfig
  private uploadPath: string

  constructor(config: FileStorageConfig) {
    this.config = config
    this.uploadPath = config.localPath || path.join(__dirname, '../../uploads')
    this.ensureDirectories()
  }

  private async ensureDirectories() {
    if (this.config.type === 'local') {
      const dirs = ['posters', 'backdrops', 'videos']
      for (const dir of dirs) {
        const fullPath = path.join(this.uploadPath, dir)
        try {
          await fs.mkdir(fullPath, { recursive: true })
        } catch (error) {
          console.error(`Error creating directory ${fullPath}:`, error)
        }
      }
    }
  }

  async saveFile(
    file: Express.Multer.File,
    type: 'poster' | 'backdrop' | 'video'
  ): Promise<string> {
    if (this.config.type === 'local') {
      return this.saveLocal(file, type)
    } else if (this.config.type === 's3' || this.config.type === 'r2') {
      // TODO: Implement S3/R2 upload
      throw new Error('S3/R2 storage not implemented yet')
    }
    throw new Error('Invalid storage type')
  }

  private async saveLocal(
    file: Express.Multer.File,
    type: 'poster' | 'backdrop' | 'video'
  ): Promise<string> {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const filePath = path.join(this.uploadPath, type, filename)

    await fs.writeFile(filePath, file.buffer)

    // Return URL
    if (this.config.cdnUrl) {
      return `${this.config.cdnUrl}/${type}/${filename}`
    }
    return `/uploads/${type}/${filename}`
  }

  async deleteFile(url: string): Promise<void> {
    if (this.config.type === 'local') {
      const filename = path.basename(url)
      const type = url.includes('/posters/') ? 'posters' : 
                   url.includes('/backdrops/') ? 'backdrops' : 
                   url.includes('/videos/') ? 'videos' : null
      
      if (type) {
        const filePath = path.join(this.uploadPath, type, filename)
        try {
          await fs.unlink(filePath)
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error)
        }
      }
    }
  }

  getPublicUrl(relativePath: string): string {
    if (this.config.cdnUrl) {
      return `${this.config.cdnUrl}/${relativePath}`
    }
    return `/uploads/${relativePath}`
  }
}

// Initialize file storage
const storageConfig: FileStorageConfig = {
  type: (process.env.FILE_STORAGE_TYPE as 'local' | 's3' | 'r2') || 'local',
  localPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
  cdnUrl: process.env.CDN_URL,
  s3Bucket: process.env.S3_BUCKET,
  s3Region: process.env.S3_REGION,
}

export const fileStorage = new FileStorage(storageConfig)

