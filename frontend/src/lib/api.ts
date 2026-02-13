import axios from 'axios'

// In production (same domain), use relative path. In development, use full URL or env var
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // In production, API is on same domain, so use relative path
  if (import.meta.env.PROD) {
    return '/api'
  }
  // Development fallback
  return 'http://localhost:8000/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
})

export default api
