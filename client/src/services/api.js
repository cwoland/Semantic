import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '',
    timeout: 8000,
})

api.interceptors.response.use(
    res => res,
    err => {
        if (import.meta.env.DEV) {
            console.warn('[API Error]', err.config?.url, err.message)
        }
        return Promise.reject(err)
    }
)

export default api