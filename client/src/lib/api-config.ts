// API Configuration for different environments
export const API_CONFIG = {
  // For development (when running locally)
  development: {
    // Use env when available; fallback to production API to avoid fixed ports
    baseUrl: import.meta.env.VITE_API_URL || 'https://lifebee-backend.onrender.com',
  },
  // For production (Netlify frontend + Render backend)
  production: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://lifebee-backend.onrender.com',
  },
}

export const getApiUrl = () => {
  const env = import.meta.env.MODE || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG]?.baseUrl || API_CONFIG.development.baseUrl
}