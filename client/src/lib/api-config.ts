// API Configuration for different environments
export const API_CONFIG = {
  // For development (when running locally)
  development: {
    // Use env when available; dev usará proxy do Vite quando getApiUrl() retornar ''
    baseUrl: import.meta.env.VITE_API_URL || '',
  },
  // For production (Netlify frontend + Render backend)
  production: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://lifebee-backend.onrender.com',
  },
}

export const getApiUrl = () => {
  // Em desenvolvimento, usar proxy do Vite (retorna string vazia)
  if (import.meta.env.DEV) return ''
  const env = import.meta.env.MODE || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG]?.baseUrl || API_CONFIG.development.baseUrl
}