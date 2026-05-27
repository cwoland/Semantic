import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry  = true
      isRefreshing     = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
          { refreshToken }
        )

        localStorage.setItem('accessToken',  data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        api.defaults.headers.Authorization = `Bearer ${data.accessToken}`
        processQueue(null, data.accessToken)

        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/auth'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    if (import.meta.env.DEV) {
      console.warn('[API Error]', err.config?.url, err.message)
    }
    return Promise.reject(err)
  }
)

export default api