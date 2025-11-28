import { query } from '../db/index.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runMigrations() {
  try {
    // Проверяем доступность БД
    await query('SELECT 1')
    console.log('📦 Database is available, running migrations...')
  } catch (error) {
    console.warn('⚠️  Database is not available. Migrations skipped.')
    console.warn('   To enable database features, ensure MySQL is running and DB credentials are set in .env')
    return // Выходим без ошибки, если БД недоступна
  }

  try {
    const migrationsPath = path.join(__dirname, '../db/migrations')
    const files = await fs.readdir(migrationsPath)
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort()

    console.log(`Found ${sqlFiles.length} migration files`)

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsPath, file)
      const sql = await fs.readFile(filePath, 'utf-8')
      
      console.log(`Running migration: ${file}`)
      // Разбиваем SQL на отдельные запросы (MySQL не поддерживает множественные запросы в одном execute)
      const statements = sql.split(';').filter(s => s.trim().length > 0)
      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement.trim() + ';')
        }
      }
      console.log(`✅ Migration ${file} completed`)
    }

    console.log('✅ All migrations completed')
  } catch (error) {
    console.error('❌ Migration error:', error)
    // Не бросаем ошибку, чтобы сервер мог запуститься без БД
    console.warn('⚠️  Server will continue without database. Some features may be unavailable.')
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

