import axios from 'axios'

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '')

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
)

if (import.meta.env.PROD && API_BASE_URL.includes('localhost')) {
  console.error(
    '[Hisaab] VITE_API_URL is not set on Vercel. Set it to your Render API URL, e.g. https://your-app.onrender.com/api'
  )
}

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message =
        'Cannot reach the server. Check that VITE_API_URL points to your Render backend (with /api).'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => API.post('/users', data),
  confirmRegistration: (data) => API.post('/users/register/confirm', data),
  login: (data) => API.post('/users/login', data),
  logout: () => API.post('/users/logout'),
  requestPasswordVerification: (data) =>
    API.post('/users/password/request-verification', data),
  confirmPasswordChange: (data) => API.post('/users/password/confirm', data),
  requestDeleteVerification: (data) =>
    API.post('/users/delete/request-verification', data),
  confirmAccountDeletion: (data) => API.post('/users/delete/confirm', data),
}

export const expenseAPI = {
  getAll: (params) => API.get('/expenses', { params }),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  getSummary: () => API.get('/expenses/summary'),
  getAnalytics: () => API.get('/expenses/analytics'),
}

export default API
