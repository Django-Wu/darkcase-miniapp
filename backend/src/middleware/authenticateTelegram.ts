import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

interface TelegramInitData {
  user?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
  }
  auth_date: number
  hash: string
}

interface AuthenticatedRequest extends Request {
  telegramUser?: TelegramInitData['user']
}

export const authenticateTelegram = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const initData = req.headers['x-telegram-init-data'] as string

  if (!initData) {
    return res.status(401).json({ error: 'Telegram init data required' })
  }

  try {
    // Parse init data
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')

    // Verify hash
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN || '')
      .digest()

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Invalid Telegram init data' })
    }

    // Check auth_date (should be within 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0')
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - authDate > 86400) {
      return res.status(401).json({ error: 'Telegram init data expired' })
    }

    // Parse user data
    const userStr = params.get('user')
    if (userStr) {
      req.telegramUser = JSON.parse(userStr)
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Telegram init data format' })
  }
}

