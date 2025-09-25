require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');

const app = express();

// Configurar Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurada. Defina no .env antes de executar este script.');
}

const stripe = new Stripe(stripeKey);

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rota de teste
app.get('/api/payment/test-config', (req, res) => {
  console.log('🧪 Testando configuração do Stripe...');
  
  res.json({
    success: true,
    config: {
      hasKey: !!process.env.STRIPE_SECRET_KEY,
      keyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      backendUrl: process.env.BACKEND_URL || 'http://localhost:8080',
    },
    message: 'Configuração verificada com sucesso'
  });
});

// Rota para criar Payment Intent
app.post('/api/payment/create-intent', async (req, res) => {
  try {
    console.log('🔍 Criando Payment Intent de teste...');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // R$ 1.00 em centavos
      currency: 'brl',
      metadata: {
        test: 'true'
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('❌ Erro ao criar Payment Intent:', error);
    res.status(500).json({
      error: 'Erro ao criar Payment Intent',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
  console.log(`🔑 Stripe configurado: ${!!process.env.STRIPE_SECRET_KEY}`);
});