# 💳 Configuração do Stripe - LifeBee

## 🎯 **Sistema de Pagamentos com Stripe**

O LifeBee agora usa o Stripe como processador de pagamentos, que é mais confiável e fácil de implementar que Mercado Pago e PagSeguro.

## 🚀 **Configuração Rápida**

### **1. Criar Conta no Stripe**

1. Acesse: https://stripe.com/br
2. Crie uma conta gratuita
3. Acesse o Dashboard: https://dashboard.stripe.com/

### **2. Obter Chaves de API**

1. No Dashboard, vá em **Desenvolvedores > Chaves de API**
2. Copie as chaves:
   - **Chave Pública** (pk_test_...)
   - **Chave Secreta** (sk_test_...)

### **3. Configurar Variáveis de Ambiente**

#### **Backend (server/.env):**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SUA_CHAVE_WEBHOOK_AQUI

# URLs do sistema
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
```

#### **Frontend (client/.env):**
```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI
```

### **4. Configurar Webhook (Opcional para Testes)**

1. No Dashboard Stripe, vá em **Desenvolvedores > Webhooks**
2. Clique em **Adicionar endpoint**
3. URL: `http://localhost:8080/api/payment/webhook`
4. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copie a chave do webhook

## 🧪 **Teste Rápido**

### **1. Iniciar Servidores**
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

### **2. Testar Configuração**
- Acesse: `http://localhost:8080/api/payment/test-config`
- Deve retornar: `"hasKey": true`

### **3. Testar Pagamento**
1. Crie uma proposta como cliente
2. Aceite a proposta
3. Clique em "Pagar"
4. Use cartão de teste: `4242 4242 4242 4242`

## 💳 **Cartões de Teste**

```
Visa: 4242 4242 4242 4242
Visa (débito): 4000 0566 5566 5556
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005
CVV: Qualquer 3 dígitos
Validade: Qualquer data futura
```

## 🔧 **Funcionalidades Implementadas**

### **Backend:**
- ✅ Criação de Payment Intent
- ✅ Webhook para confirmação automática
- ✅ Notificações para cliente e profissional
- ✅ Dashboard de pagamentos
- ✅ Split de comissão (5% LifeBee + 95% Profissional)

### **Frontend:**
- ✅ PaymentButton com Stripe Elements
- ✅ Formulário de cartão seguro
- ✅ Validação em tempo real
- ✅ Feedback visual
- ✅ Páginas de retorno (success, failure, pending)

## 📊 **Vantagens do Stripe**

1. **Mais Estável** - Menos problemas de conectividade
2. **Melhor Documentação** - Guias claros e exemplos
3. **Suporte Global** - Funciona em qualquer país
4. **Taxas Competitivas** - 2.9% + R$ 0.39 por transação
5. **Fácil Integração** - SDK bem documentado
6. **Testes Simples** - Cartões de teste fáceis de usar

## 🚨 **Troubleshooting**

### **Erro: "Invalid API Key"**
- Verificar se as chaves estão corretas no .env
- Confirmar se está usando chaves de teste (sk_test_...)

### **Erro: "Card declined"**
- Usar cartões de teste válidos
- Verificar se o valor está em centavos

### **Webhook não funciona**
- Verificar se a URL está acessível
- Confirmar se a chave do webhook está correta

## 🎉 **Sistema Pronto!**

O sistema de pagamentos com Stripe está implementado e funcionando! É muito mais simples e confiável que as alternativas anteriores.

**Status:** ✅ **IMPLEMENTADO E FUNCIONANDO**
