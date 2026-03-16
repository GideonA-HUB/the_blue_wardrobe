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

// Function to get CSRF token
const getCSRFToken = () => {
  const name = 'csrftoken'
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Enable cookies for session management
})

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken()
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  return config
})

// Function to fetch CSRF token
export const fetchCSRFToken = async () => {
  try {
    const response = await api.get('/csrf-token/')
    return response.data.csrfToken
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error)
    return null
  }
}

export default api
