# 🔧 Modo Dev - Testar sem Stripe Connect

## ⚡ Solução Rápida para Testes

Se você quer testar o fluxo de pagamento **SEM** precisar configurar Stripe Connect para cada profissional, use o **Modo Dev**.

---

## 🚀 Como Ativar:

### Passo 1: Adicionar Variável de Ambiente

Adicione no seu arquivo `.env` (na raiz do projeto):

```bash
SKIP_STRIPE_VALIDATION=true
```

### Passo 2: Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente:
npm run dev
```

### Passo 3: Testar Pagamento

Agora você pode testar pagamentos normalmente, mesmo que o profissional não tenha Stripe Connect configurado!

---

## ⚠️ O Que Acontece no Modo Dev:

### ✅ Com SKIP_STRIPE_VALIDATION=true:
- ✅ Pagamentos funcionam sem Stripe Connect
- ⚠️ **TODO o dinheiro vai para SUA conta Stripe principal** (não há split)
- ✅ Você pode testar o fluxo completo
- ✅ Ideal para desenvolvimento e testes

### ❌ Sem SKIP_STRIPE_VALIDATION (produção):
- ✅ Sistema exige Stripe Connect do profissional
- ✅ Split automático funciona (5% / 95%)
- ✅ Dinheiro vai direto para profissional
- ✅ Seguro e conforme a lei

---

## 📊 Logs que Você Verá:

### Com Modo Dev Ativo:
```
🔧 MODO DEV: Validação de Stripe Connect desabilitada
🔧 Criando Payment Intent SEM Connect (modo dev)...
   ⚠️ TODO o valor vai para a conta principal
💰 Valor original: R$ 180.00
💰 Valor final: R$ 180.00
✅ Payment Intent criado: pi_xxxxx
```

### Com Validação Normal:
```
🚀 Criando Payment Intent com Connect...
   Conta destino: acct_xxxxx
💰 LifeBee (5%): R$ 9.00
💰 Profissional (95%): R$ 171.00
✅ Payment Intent criado: pi_xxxxx
```

---

## 🎯 Quando Usar Cada Modo:

### 🔧 Modo Dev (`SKIP_STRIPE_VALIDATION=true`):
- ✅ Desenvolvimento local
- ✅ Testes de integração
- ✅ Demos para clientes
- ✅ Testar fluxo de pagamento
- ❌ **NUNCA em produção!**

### 🔒 Modo Produção (`SKIP_STRIPE_VALIDATION=false` ou não definido):
- ✅ Ambiente de produção
- ✅ Staging
- ✅ Quando profissionais estão recebendo dinheiro real
- ✅ Para garantir compliance legal

---

## 📝 Exemplo Completo:

### 1. Testar Localmente (Modo Dev):

**arquivo: `.env`**
```bash
SKIP_STRIPE_VALIDATION=true
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Resultado:**
- ✅ Pagamentos funcionam sem Stripe Connect
- ✅ Teste rápido do fluxo

### 2. Deploy em Produção (Modo Normal):

**No Render/Netlify (variáveis de ambiente):**
```bash
# NÃO adicionar SKIP_STRIPE_VALIDATION
# Ou definir como false:
SKIP_STRIPE_VALIDATION=false

STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

**Resultado:**
- ✅ Sistema exige Stripe Connect
- ✅ Split automático funciona
- ✅ Seguro e legal

---

## ⚡ Ativar/Desativar Rapidamente:

### Ativar Modo Dev:
```bash
echo "SKIP_STRIPE_VALIDATION=true" >> .env
# Reiniciar servidor
```

### Desativar Modo Dev:
```bash
# Remover ou comentar a linha no .env:
# SKIP_STRIPE_VALIDATION=true

# Ou mudar para false:
SKIP_STRIPE_VALIDATION=false

# Reiniciar servidor
```

---

## 🆘 Troubleshooting:

### Ainda dá erro 400 "Profissional precisa conectar Stripe":
- ✅ Verificar se adicionou `SKIP_STRIPE_VALIDATION=true` no `.env`
- ✅ Verificar se reiniciou o servidor
- ✅ Verificar se o `.env` está na raiz do projeto
- ✅ Verificar se não tem espaços: `SKIP_STRIPE_VALIDATION=true` (sem espaços)

### Modo dev não funciona em produção:
- ✅ Isso é proposital! Por segurança
- ✅ Em produção, profissionais DEVEM ter Stripe Connect
- ✅ Assim o split funciona corretamente

---

## ✅ Checklist Rápido:

**Para testar agora:**

- [ ] Adicionar `SKIP_STRIPE_VALIDATION=true` no `.env`
- [ ] Reiniciar servidor
- [ ] Tentar pagamento como cliente
- [ ] Ver log: `🔧 MODO DEV: Validação de Stripe Connect desabilitada`
- [ ] Pagamento funciona! ✅

**Para deploy em produção:**

- [ ] Remover `SKIP_STRIPE_VALIDATION` do `.env` produção
- [ ] Profissionais configurarem Stripe Connect
- [ ] Testar com profissional real
- [ ] Ver log: `🚀 Criando Payment Intent com Connect...`
- [ ] Split funcionando! ✅

---

## 📌 Importante:

> **⚠️ O modo dev existe APENAS para facilitar testes locais.**  
> **Em produção, SEMPRE use Stripe Connect para split correto e compliance legal!**

---

**Tempo para ativar:** 30 segundos  
**Dificuldade:** Muito fácil  
**Resultado:** Testes de pagamento sem friction! 🚀

