import express from 'express';
import { registerRoutes } from './routes.js';

const app = express();

app.use(express.json());

// Registrar rotas
registerRoutes(app).then(server => {
  console.log('✅ Rotas registradas com sucesso!');
  console.log('📋 Rotas disponíveis:');
  
  // Listar todas as rotas registradas
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      routes.push(`${methods.join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods);
          routes.push(`${methods.join(',').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });
  
  routes.forEach(route => console.log(`  ${route}`));
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro ao registrar rotas:', error);
  process.exit(1);
}); 