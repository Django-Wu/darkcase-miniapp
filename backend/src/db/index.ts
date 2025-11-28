import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Создаем connection pool для MySQL
export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'darkcase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

// Обертка для совместимости с PostgreSQL синтаксисом
export const query = async (sql: string, params?: any[]): Promise<{ rows: any[] }> => {
  try {
    // Заменяем PostgreSQL параметры $1, $2 на MySQL ?
    let mysqlSql = sql
    if (params && params.length > 0) {
      // Заменяем $1, $2, $3... на ?
      mysqlSql = sql.replace(/\$(\d+)/g, '?')
    }

    const [rows] = await db.execute(mysqlSql, params || [])
    return { rows: rows as any[] }
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Test connection (не блокируем запуск, если БД недоступна)
query('SELECT 1')
  .then(() => console.log('✅ MySQL Database connected'))
  .catch((err: Error) => {
    console.warn('⚠️  Database connection failed:', err.message)
    console.warn('   Server will continue, but database features will be unavailable.')
    console.warn('   To enable database: ensure MySQL is running and DB credentials are set in .env')
  })

// Экспортируем query как основной метод
export default { query }
