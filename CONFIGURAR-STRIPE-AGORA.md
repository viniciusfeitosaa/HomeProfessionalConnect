# 🔑 Configurar Stripe - URGENTE

## ❌ Erro Atual

```
POST /api/stripe/connect/create-account 503
{"error":"Stripe não configurado","message":"Configure STRIPE_SECRET_KEY"}
```

## 🎯 Problema

O arquivo `.env` com as chaves do Stripe não existe no servidor!

## ✅ Solução - Passo a Passo

### 1️⃣ Obter suas Chaves do Stripe

1. **Acesse:** https://dashboard.stripe.com/test/apikeys
2. **Faça login** na sua conta Stripe
3. **Copie as chaves de TESTE:**
   - 🔑 **Secret key** (começa com `sk_test_...`)
   - 🔑 **Publishable key** (começa com `pk_test_...`)

⚠️ **Use TESTE (test) não PRODUÇÃO (live)!**

### 2️⃣ Criar o arquivo `.env`

Crie um arquivo chamado `.env` dentro da pasta `server/` com o seguinte conteúdo:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_AQUI
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

### 3️⃣ Substituir as Chaves

No arquivo `.env`, substitua:
- `sk_test_SUA_CHAVE_AQUI` → Sua Secret Key do Stripe
- `pk_test_SUA_CHAVE_AQUI` → Sua Publishable Key do Stripe

### 4️⃣ Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Depois iniciar novamente:
npm run dev
```

### 5️⃣ Verificar se Funcionou

Você deve ver no console do servidor:

```
🔧 Inicializando Stripe...
🔑 STRIPE_SECRET_KEY presente: Sim
🔑 STRIPE_SECRET_KEY início: sk_test_51...
✅ Stripe inicializado com sucesso
```

## 🚨 Importante

1. ⚠️ **NUNCA** commite o arquivo `.env` no Git
2. ⚠️ Use chaves de **TESTE** (sk_test), não de produção
3. ⚠️ Mantenha as chaves em **segredo**

## 📝 Checklist

- [ ] Acessei dashboard.stripe.com/test/apikeys
- [ ] Copiei a Secret Key (sk_test_...)
- [ ] Copiei a Publishable Key (pk_test_...)
- [ ] Criei o arquivo `server/.env`
- [ ] Colei as chaves no arquivo
- [ ] Reiniciei o servidor
- [ ] Vi a mensagem "✅ Stripe inicializado com sucesso"
- [ ] Testei clicar em "Conectar Stripe" novamente

## 🆘 Não tem conta Stripe?

### Criar conta Stripe (GRÁTIS):

1. **Acesse:** https://dashboard.stripe.com/register
2. **Preencha seus dados**
3. **Confirme o email**
4. **Vá para:** https://dashboard.stripe.com/test/apikeys
5. **Copie as chaves de teste**

**Tempo:** ~5 minutos  
**Custo:** R$ 0,00 (grátis)

---

**Após configurar, teste novamente!** 🚀

