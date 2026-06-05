import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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