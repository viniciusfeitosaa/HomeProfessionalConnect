// Servidor CommonJS para Render - Garantido funcionar
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('🚀 === SERVIDOR RENDER INICIADO ===');
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);
console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL ? 'Presente' : 'Ausente');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'Presente' : 'Ausente');
console.log('🔑 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente');
console.log('🔑 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://lifebee.netlify.app',
    'https://lifebee.com.br',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://lifebee.netlify.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
      '/api/auth/google/callback'
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
});
