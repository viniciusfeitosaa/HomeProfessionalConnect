// API Configuration for different environments
export const API_CONFIG = {
  // For development (when running locally)
  development: {
    baseUrl: 'http://localhost:5000',
  },
  // For production (Netlify frontend + Render backend)
  production: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://lifebee-backend.onrender.com',
  },
}

export const getApiUrl = () => {
  // Force localhost for development
  if (import.meta.env.DEV) {
    return 'http://localhost:5000'
  }
  
  const env = import.meta.env.MODE || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG]?.baseUrl || API_CONFIG.development.baseUrl
}