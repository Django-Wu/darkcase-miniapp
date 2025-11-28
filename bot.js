import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN)

// Command /start - sends WebApp button
bot.command('start', async (ctx) => {
  await ctx.reply('Welcome to DarkCase! 🎬\n\nTap the button below to open the app:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open DarkCase',
            web_app: { url: 'https://darkcase.vercel.app' }
          }
        ]
      ]
    }
  })
})

// Command /app - sends WebApp button
bot.command('app', async (ctx) => {
  await ctx.reply('Tap to open the app:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open DarkCase',
            web_app: { url: 'https://darkcase.vercel.app' }
          }
        ]
      ]
    }
  })
})

// Handle errors
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err)
})

// Launch bot
bot.launch().then(() => {
  console.log('🤖 DarkCase Bot is running...')
  console.log('📱 Use /start or /app to open the WebApp')
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

