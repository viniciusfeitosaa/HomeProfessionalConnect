// Servidor Express completo para Render
const express = require('express');
const path = require('path');
const cors = require('cors');

console.log('🚀 === SERVIDOR RENDER INICIADO ===');
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);
console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL ? 'Presente' : 'Ausente');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'Presente' : 'Ausente');
console.log('🔑 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente');
console.log('🔑 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente');

const app = express();

// CORS middleware
app.use(cors({
  origin: [
    'https://lifebee.netlify.app',
    'https://lifebee.com.br',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));

app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de teste
app.get('/api/test', (req, res) => {
  console.log('✅ Rota /api/test acessada');
  res.json({
    message: 'Servidor Render funcionando!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente',
    jwtSecret: process.env.JWT_SECRET ? 'Presente' : 'Ausente',
    databaseUrl: process.env.DATABASE_URL ? 'Presente' : 'Ausente'
  });
});

// Rota de teste para auth
app.get('/api/auth/test', (req, res) => {
  console.log('✅ Rota /api/auth/test acessada');
  res.json({
    message: 'Rotas de autenticação funcionando',
    googleAuthUrl: '/api/auth/google',
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente'
  });
});

// Rota Google OAuth - FUNCIONAL
app.get('/api/auth/google', (req, res) => {
  console.log('✅ Rota /api/auth/google acessada');
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ Variáveis Google OAuth não configuradas');
    return res.status(500).json({
      error: 'Google OAuth não configurado',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente'
    });
  }
  
  // Redirecionamento real do Google OAuth
  const redirectUrl = `https://accounts.google.com/o/oauth2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent('https://lifebee-backend.onrender.com/api/auth/google/callback')}&` +
    `scope=${encodeURIComponent('profile email')}&` +
    `response_type=code&` +
    `access_type=online`;
  
  console.log('🔄 Redirecionando para Google OAuth:', redirectUrl);
  res.redirect(redirectUrl);
});

// Callback do Google OAuth
app.get('/api/auth/google/callback', (req, res) => {
  console.log('✅ Callback Google OAuth recebido');
  console.log('🔍 Query params:', req.query);
  
  // Por enquanto, apenas retornar sucesso
  res.json({
    message: 'Google OAuth callback funcionando',
    code: req.query.code ? 'Presente' : 'Ausente',
    state: req.query.state
  });
});

// Rota para profissionais (mock data para teste)
app.get('/api/professionals', (req, res) => {
  console.log('✅ Rota /api/professionals acessada');
  res.json([
    {
      id: 1,
      name: 'João Silva',
      profession: 'Encanador',
      rating: 4.8,
      imageUrl: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=JS',
      description: 'Encanador experiente com 10 anos de experiência'
    },
    {
      id: 2,
      name: 'Maria Santos',
      profession: 'Eletricista',
      rating: 4.9,
      imageUrl: 'https://via.placeholder.com/150/DC2626/FFFFFF?text=MS',
      description: 'Eletricista certificada e confiável'
    }
  ]);
});

// Middleware 404
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.originalUrl,
    availableRoutes: [
      '/api/test',
      '/api/auth/test',
      '/api/auth/google',
      '/api/auth/google/callback',
      '/api/professionals',
      '/uploads/*'
    ]
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`🌐 URL: https://lifebee-backend.onrender.com`);
  console.log(`✅ Servidor pronto para receber requisições`);
  console.log(`📁 Uploads disponíveis em: /uploads`);
});
