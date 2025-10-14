# ✅ Solução Completa - Erro 503 Stripe

## 🐛 Erro que Você Está Vendo

```
POST /api/stripe/connect/create-account 503
{"error":"Stripe não configurado","message":"Configure STRIPE_SECRET_KEY"}
```

## 🎯 Causa do Problema

O servidor **não encontrou** o arquivo `.env` com as chaves do Stripe!

O código em `server/routes-simple.ts` (linha 16) verifica:
```typescript
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
  console.log(`✅ Stripe inicializado com sucesso`);
} else {
  console.log(`⚠️ Stripe desabilitado - configure STRIPE_SECRET_KEY`);
}
```

## 🔧 Solução Completa

### Opção A: Se Você JÁ TEM Conta Stripe

#### 1️⃣ Obter Suas Chaves

1. **Acesse:** https://dashboard.stripe.com/test/apikeys
2. **Faça login** na sua conta
3. **Veja a tabela "Chaves de API padrão"**
4. **Copie:**
   - 🔑 **Chave secreta** (clique em "Revelar chave de teste")
   - 🔑 **Chave publicável**

Exemplo de como ficará:
```
Secret key:      sk_test_51Abc...xyz (começa com sk_test_)
Publishable key: pk_test_51Abc...xyz (começa com pk_test_)
```

#### 2️⃣ Criar o Arquivo `.env`

Na pasta `server/`, crie um arquivo chamado `.env` (com ponto na frente):

**Caminho completo:** `C:\LifeBee\HomeProfessionalConnect\server\.env`

#### 3️⃣ Conteúdo do Arquivo `.env`

Cole este conteúdo e **substitua as chaves**:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_COLE_SUA_CHAVE_SECRETA_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_COLE_SUA_CHAVE_PUBLICAVEL_AQUI
STRIPE_WEBHOOK_SECRET=whsec_test

# URLs do sistema
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

# Database (ajuste se necessário)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lifebee

# Session
SESSION_SECRET=lifebee-secret-key-2024

# Environment
NODE_ENV=development
PORT=8080
```

#### 4️⃣ Exemplo Real (com chaves fictícias)

```env
STRIPE_SECRET_KEY=sk_test_51AbcDefGhiJklMnoPqrStUvWxYz1234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51AbcDefGhiJklMnoPqrStUvWxYz1234567890
STRIPE_WEBHOOK_SECRET=whsec_test
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lifebee
SESSION_SECRET=lifebee-secret-key-2024
NODE_ENV=development
PORT=8080
```

#### 5️⃣ Salvar e Reiniciar

1. **Salve o arquivo** `.env`
2. **Pare o servidor** (Ctrl+C no terminal)
3. **Inicie novamente:** `npm run dev`

#### 6️⃣ Verificar se Funcionou

No console do servidor, você deve ver:

✅ **SUCESSO:**
```
🔧 Inicializando Stripe...
🔑 STRIPE_SECRET_KEY presente: Sim
🔑 STRIPE_SECRET_KEY início: sk_test_51...
✅ Stripe inicializado com sucesso
```

❌ **AINDA COM ERRO:**
```
🔧 Inicializando Stripe...
🔑 STRIPE_SECRET_KEY presente: Não
⚠️ Stripe desabilitado - configure STRIPE_SECRET_KEY
```

---

### Opção B: Se Você NÃO TEM Conta Stripe

#### 1️⃣ Criar Conta Stripe (Grátis)

1. **Acesse:** https://dashboard.stripe.com/register
2. **Preencha:**
   - Email
   - Nome completo
   - Senha
   - País: Brasil
3. **Confirme seu email**
4. **Pule as etapas de ativação** (pode fazer depois)

#### 2️⃣ Acessar Chaves de Teste

1. **Acesse:** https://dashboard.stripe.com/test/apikeys
2. **No topo da página**, certifique-se que está em "Modo de teste" (toggle)
3. **Copie as chaves de teste** (sk_test_ e pk_test_)

#### 3️⃣ Seguir Passos 2-6 da Opção A

Continue a partir do passo 2 da Opção A acima.

---

## 🧪 Testar se Funcionou

### 1. Verificar Console do Servidor

Após reiniciar, procure por:
```
✅ Stripe inicializado com sucesso
```

### 2. Testar Conexão Stripe

1. **Faça login como profissional**
2. **Acesse:** http://localhost:5173/provider-settings
3. **Clique em:** "Conectar Stripe"
4. **Deve abrir** o formulário do Stripe (não mais erro 503)

### 3. Logs Esperados

No console do servidor:
```
🔧 Criando conta Stripe Connect...
👤 Dados do usuário: { id: 20, userType: 'provider', ... }
✅ Conta criada: acct_xxxxx
✅ Link de onboarding criado
```

---

## ❓ Troubleshooting

### Problema: Ainda vejo erro 503

**Solução:**
1. Verifique se o arquivo `.env` está em `server/.env` (não na raiz)
2. Verifique se não tem espaços nas chaves
3. Certifique-se que salvou o arquivo
4. Reinicie o servidor completamente

### Problema: "Invalid API Key provided"

**Solução:**
1. Verifique se copiou a chave completa
2. Use chave de **TESTE** (sk_test_), não de produção
3. Revele a chave novamente no dashboard do Stripe

### Problema: Arquivo .env não está sendo lido

**Solução:**
Verifique se o servidor está usando `dotenv`:
```typescript
// No início do server/index.ts ou similar
import dotenv from 'dotenv';
dotenv.config();
```

---

## 📝 Checklist Final

- [ ] Tenho conta no Stripe
- [ ] Copiei a Secret Key (sk_test_...)
- [ ] Copiei a Publishable Key (pk_test_...)
- [ ] Criei o arquivo `server/.env`
- [ ] Colei o conteúdo no arquivo
- [ ] Substituí as chaves pelas minhas
- [ ] Salvei o arquivo
- [ ] Reiniciei o servidor
- [ ] Vi "✅ Stripe inicializado com sucesso" no console
- [ ] Testei clicar em "Conectar Stripe" novamente
- [ ] Funciona! 🎉

---

## 🚨 Segurança

⚠️ **IMPORTANTE:**
1. **NUNCA** commite o arquivo `.env` no Git
2. **NUNCA** compartilhe suas chaves secretas
3. Use chaves de **TESTE** em desenvolvimento
4. Use chaves de **PRODUÇÃO** apenas em produção

O arquivo `.gitignore` já está configurado para ignorar `.env`

---

## 📚 Documentos Criados

- ✅ `CONFIGURAR-STRIPE-AGORA.md` - Guia rápido
- ✅ `server/CRIAR-ENV.md` - Como criar o .env
- ✅ `SOLUCAO-ERRO-503-STRIPE.md` - Este guia completo

---

**Tempo estimado:** 5-10 minutos  
**Custo:** R$ 0,00 (grátis)  
**Dificuldade:** Fácil

**Agora é só seguir os passos e vai funcionar!** 🚀

