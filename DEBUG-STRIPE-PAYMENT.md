# 🔍 Debug - Erro no Stripe Payment Element

## ❌ Erro Atual

```
stripe.js:1 Unhandled payment Element loaderror {error: {…}}
```

## 🧪 Passos para Debug

### 1️⃣ Abrir Console do Navegador (F12)

Quando clicar em "Pagar" e o erro aparecer, verifique:

**a) Expanda o objeto `{error: {…}}` e me envie:**
- `error.message`
- `error.code`
- `error.type`

**b) Procure por erros vermelhos adicionais**

### 2️⃣ Verificar Network Tab

1. **Abra:** DevTools → Aba "Network"
2. **Clique em:** "Pagar"
3. **Procure pela requisição:** `create-intent`
4. **Me envie:**
   - Status Code
   - Response (clique na requisição → Response)

### 3️⃣ Verificar se o clientSecret está sendo gerado

No console do navegador, após clicar em "Pagar", digite:

```javascript
// Ver o clientSecret
sessionStorage.getItem('lastClientSecret')
```

---

## 🔧 Possíveis Causas

### Causa 1: Conta Stripe não aceita PIX (apenas cartão)

**Solução:** Desabilitar PIX temporariamente no código

### Causa 2: Webhook endpoint não configurado

**Solução:** Stripe precisa de webhook configurado

### Causa 3: Chave publicável não corresponde à conta

**Solução:** Verificar se a chave pk_test_ é da mesma conta que sk_test_

### Causa 4: Restrições da conta de teste

**Solução:** Verificar dashboard do Stripe se tem avisos

---

## 📝 Me envie:

1. **Erro completo** do console (expanda o objeto {error: {…}})
2. **Response** da requisição `create-intent` (aba Network)
3. **Logs do servidor** quando cria o Payment Intent

Com essas informações, posso identificar o problema exato!

