import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const authEndpoints = ['/auth/login', '/auth/register']

export function shouldRedirectOnUnauthorized(status?: number, url?: string) {
  if (status !== 401) return false

  const path = (url ?? '').split('?')[0].replace(/\/$/, '')
  return !authEndpoints.some((endpoint) => path.endsWith(endpoint))
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err) => {
    if (shouldRedirectOnUnauthorized(err.response?.status, err.config?.url)) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
