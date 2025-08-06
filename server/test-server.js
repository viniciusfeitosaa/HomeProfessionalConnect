const express = require('express');
const app = express();

console.log('🚀 Servidor de teste iniciado');

// Middleware básico
app.use(express.json());

// Rota de teste simples
app.get('/api/test', (req, res) => {
  console.log('✅ Rota /api/test acessada');
  res.json({ 
    message: 'Servidor de teste funcionando!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente'
  });
});

// Rota de teste para Google OAuth
app.get('/api/auth/test', (req, res) => {
  console.log('✅ Rota /api/auth/test acessada');
  res.json({
    message: 'Rotas de autenticação funcionando',
    googleAuthUrl: '/api/auth/google',
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente'
  });
});

// Rota simulada do Google OAuth
app.get('/api/auth/google', (req, res) => {
  console.log('✅ Rota /api/auth/google acessada');
  res.json({
    message: 'Google OAuth route funcionando',
    status: 'success'
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Rota 404 para todas as outras rotas
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor de teste rodando na porta ${port}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente'}`);
  console.log(`🔑 GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente'}`);
}); 