// Простой тест для проверки админ-логина
const axios = require('axios')

const API_URL = 'http://localhost:3000'

async function testLogin() {
  console.log('🧪 Тестирование админ-логина...\n')
  
  // Проверяем health endpoint
  try {
    const health = await axios.get(`${API_URL}/health`)
    console.log('✅ Health check:', health.data)
    console.log('')
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    console.log('   Убедитесь, что Backend запущен на порту 3000\n')
    return
  }

  // Тестируем логин
  const testCases = [
    { username: 'admin', password: 'wrong' },
    { username: 'wrong', password: 'admin123' },
  ]

  // Получаем правильные данные из .env (если доступны)
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminPassword) {
    testCases.push({ username: adminUsername, password: adminPassword })
  } else {
    console.log('⚠️  ADMIN_PASSWORD не установлен в .env')
    console.log('   Используйте: ADMIN_USERNAME=admin ADMIN_PASSWORD=your_password node test-admin-login.js\n')
  }

  for (const testCase of testCases) {
    try {
      console.log(`🔐 Тест: username="${testCase.username}", password="${testCase.password.substring(0, 3)}***"`)
      const response = await axios.post(`${API_URL}/api/admin/auth/login`, testCase)
      console.log('✅ Успех:', response.data)
      console.log('')
    } catch (error) {
      if (error.response) {
        console.log(`❌ Ошибка ${error.response.status}:`, error.response.data)
      } else {
        console.log('❌ Ошибка:', error.message)
      }
      console.log('')
    }
  }
}

testLogin().catch(console.error)

