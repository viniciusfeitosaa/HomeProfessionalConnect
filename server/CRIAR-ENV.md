# 🔧 Como Criar o Arquivo .env

## Passo a Passo

### 1. Criar o arquivo

Dentro da pasta `server/`, crie um arquivo chamado `.env` (com o ponto na frente)

### 2. Copiar este conteúdo

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_COLE_SUA_CHAVE_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_COLE_SUA_CHAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_test

# URLs do sistema
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lifebee

# Session
SESSION_SECRET=lifebee-secret-key-2024

# Environment
NODE_ENV=development
PORT=8080
```

### 3. Obter suas chaves do Stripe

1. **Acesse:** https://dashboard.stripe.com/test/apikeys
2. **Copie a Secret key** (sk_test_...)
3. **Copie a Publishable key** (pk_test_...)

### 4. Colar no arquivo .env

Substitua:
- `sk_test_COLE_SUA_CHAVE_AQUI` pela sua Secret Key
- `pk_test_COLE_SUA_CHAVE_AQUI` pela sua Publishable Key

### 5. Salvar e reiniciar

1. Salve o arquivo `.env`
2. Pare o servidor (Ctrl+C)
3. Inicie novamente: `npm run dev`

### 6. Verificar

Você deve ver no console:
```
✅ Stripe inicializado com sucesso
```

---

**Importante:** O arquivo `.env` não deve ser commitado no Git!

