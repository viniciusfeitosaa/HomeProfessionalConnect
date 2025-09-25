# 🚨 Solução Rápida - Erro 500 no Pagamento

## 🔍 **Problema Identificado**

O erro "Erro ao criar preferência de pagamento" indica que há um problema na comunicação com o Mercado Pago.

## ⚡ **Solução Rápida**

### **Passo 1: Verificar Configuração**

1. **Crie o arquivo `.env` no servidor:**
   ```bash
   cd server
   touch .env
   ```

2. **Adicione a configuração do Mercado Pago:**
   ```bash
   # Copie o conteúdo do arquivo MERCADOPAGO-CONFIG-EXAMPLE.txt
   # para o arquivo server/.env
   ```

3. **Configure seu token do Mercado Pago:**
   - Acesse: https://www.mercadopago.com.br/developers/
   - Faça login
   - Crie uma aplicação
   - Copie o Access Token (TEST-...)
   - Cole no arquivo .env

### **Passo 2: Testar Configuração**

1. **Reinicie o servidor:**
   ```bash
   cd server
   npm run dev
   ```

2. **Teste a configuração:**
   - Acesse: `http://localhost:8080/api/payment/test-config`
   - Deve retornar: `"hasToken": true`

3. **Teste criação simples:**
   - Use o endpoint: `POST /api/payment/test-simple`
   - Deve criar uma preferência de teste

### **Passo 3: Verificar Logs**

Observe os logs do servidor quando clicar em "Pagar":

**Logs esperados:**
```
🔍 Iniciando criação de preferência de pagamento
📝 Request body: { serviceOfferId: 123 }
🔑 Token configurado: SIM
🔑 Token length: 73
🔍 Buscando oferta de serviço ID: 123
✅ Oferta encontrada: { id: 123, price: "1.00" }
```

## 🔧 **Alternativas se o Mercado Pago não funcionar**

### **Opção 1: Usar Token de Teste Público**

Se não conseguir configurar seu próprio token, use este token de teste:

```bash
# Adicione no .env:
MERCADOPAGO_ACCESS_TOKEN=TEST-1923177717890465-082109-8f2125345d1601bce3a067b6eb1258c1-810345213
```

### **Opção 2: Implementar Pagamento Simulado**

Se o Mercado Pago continuar com problemas, posso implementar um sistema de pagamento simulado para desenvolvimento:

```javascript
// Sistema de pagamento simulado
app.post('/api/payment/create-preference', authenticateToken, async (req, res) => {
  // Simular criação de preferência
  const mockPreference = {
    id: `MP-PREF-${Date.now()}`,
    init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock',
    sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock'
  };
  
  res.json({
    success: true,
    preferenceId: mockPreference.id,
    initPoint: mockPreference.init_point,
    sandboxInitPoint: mockPreference.sandbox_init_point
  });
});
```

### **Opção 3: Integrar com Stripe**

Stripe é mais estável e tem melhor documentação:

```bash
npm install stripe
```

## 🧪 **Teste Rápido**

1. **Execute o servidor:**
   ```bash
   cd server
   npm run dev
   ```

2. **Teste a configuração:**
   ```bash
   curl http://localhost:8080/api/payment/test-config
   ```

3. **Se retornar `"hasToken": false`, configure o token**
4. **Se retornar `"hasToken": true`, teste o pagamento**

## 📞 **Próximos Passos**

1. **Configure o token do Mercado Pago**
2. **Teste os endpoints de diagnóstico**
3. **Me informe os logs que aparecem**
4. **Se necessário, implemento uma alternativa**

---

## 🎯 **Status**

- ✅ Logs detalhados implementados
- ✅ Endpoints de diagnóstico criados
- ✅ Validações melhoradas
- 🔧 **Aguardando configuração do token**

**Configure o token do Mercado Pago e me informe o resultado!** 🚀
