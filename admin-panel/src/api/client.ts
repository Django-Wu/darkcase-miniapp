import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Определяем URL API
// В development используем прокси через Vite, в production - переменную окружения
const getApiUrl = () => {
  // Если указана переменная окружения, используем её (для production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // В development используем относительный путь (проксируется через Vite)
  if (import.meta.env.DEV) {
    return '' // Пустой строкой, чтобы использовать прокси Vite
  }
  
  // В production по умолчанию используем API сервер
  // Замените на ваш production API URL
  return import.meta.env.PROD 
    ? 'https://api.darkcase.app' // Замените на ваш production API URL
    : 'http://localhost:3000'
}

const API_URL = getApiUrl()

console.log('🔧 API URL:', API_URL || '(using Vite proxy)')

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Логируем ошибку для отладки
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.error('❌ Backend недоступен. Убедитесь, что Backend запущен на http://localhost:3000')
    }
    
    if (error.response?.status === 401) {
      // Не разлогиниваем на странице логина
      if (!window.location.pathname.includes('/login')) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API методы
export const authAPI = {
  login: async (username: string, password: string) => {
    console.log('🔐 Attempting login for:', username)
    console.log('📡 API URL:', apiClient.defaults.baseURL || '(relative)')
    console.log('📡 Full endpoint:', (apiClient.defaults.baseURL || '') + '/api/admin/auth/login')
    
    try {
      const response = await apiClient.post('/api/admin/auth/login', {
        username,
        password,
      })
      console.log('✅ Login successful')
      return response.data
    } catch (error: any) {
      console.error('❌ Login failed:', error)
      console.error('   Status:', error.response?.status)
      console.error('   Data:', error.response?.data)
      console.error('   URL:', error.config?.url)
      throw error
    }
  },
}

export const casesAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/api/cases', { params })
    return response.data
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/cases/${id}`)
    return response.data
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/cases', data)
    return response.data
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/cases/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/cases/${id}`)
    return response.data
  },
}

export const categoriesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/categories')
    return response.data
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/categories', data)
    return response.data
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/categories/${id}`, data)
    return response.data
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/categories/${id}`)
    return response.data
  },
}

export const uploadAPI = {
  uploadPoster: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/upload/poster', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  uploadBackdrop: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/upload/backdrop', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  uploadVideo: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export const statsAPI = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/admin/stats')
    return response.data
  },
}

export const chroniclesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/admin/chronicles')
    return response.data?.data || []
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/admin/chronicles/${id}`)
    return response.data
  },
  create: async (data: FormData) => {
    const response = await apiClient.post('/api/admin/chronicles', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  update: async (id: string, data: FormData) => {
    const response = await apiClient.put(`/api/admin/chronicles/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/admin/chronicles/${id}`)
    return response.data
  },
  updateStatus: async (id: string, status: 'draft' | 'published') => {
    const response = await apiClient.patch(`/api/admin/chronicles/${id}/status`, { status })
    return response.data
  },
}

