import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/client'
import { LogIn } from 'lucide-react'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(username, password)
      login(response.token, response.admin)
      navigate('/')
    } catch (err: any) {
      console.error('Login error:', err)
      console.error('Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message,
        code: err.code,
      })
      
      if (err.response) {
        // Сервер ответил с ошибкой
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Ошибка авторизации'
        setError(errorMessage)
      } else if (err.request) {
        // Запрос был отправлен, но ответа не получено
        setError('Не удалось подключиться к серверу. Убедитесь, что Backend запущен на порту 3000')
      } else {
        // Ошибка при настройке запроса
        setError('Ошибка при отправке запроса: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-darkcase-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-darkcase-black border border-darkcase-mediumGray rounded-lg p-8 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-darkcase-crimson/20 rounded-full mb-4">
              <LogIn className="text-darkcase-crimson" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">DarkCase Admin</h1>
            <p className="text-white/60">Войдите в панель управления</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-darkcase-crimson transition-colors"
                placeholder="admin"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-darkcase-darkGray border border-darkcase-mediumGray rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-darkcase-crimson transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-darkcase-crimson hover:bg-darkcase-red text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

