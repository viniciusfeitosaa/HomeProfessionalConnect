// API Configuration for different environments
export const API_CONFIG = {
  // For development (when running locally)
  development: {
    baseUrl: 'http://localhost:5000',
  },
  // For production (Netlify frontend + Replit backend)
  production: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://your-replit-app.replit.app',
  },
}

export const getApiUrl = () => {
  const env = import.meta.env.MODE || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG]?.baseUrl || API_CONFIG.development.baseUrl
}