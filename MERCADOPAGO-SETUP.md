# 🔧 Configuração do Mercado Pago - LifeBee

## 🚨 **Problema Identificado**

O erro 500 ao criar preferência de pagamento pode ter várias causas. Vamos diagnosticar e corrigir:

## 📋 **Checklist de Diagnóstico**

### **1. Verificar Configuração do Token**

```bash
# Verificar se o token está configurado
echo $MERCADOPAGO_ACCESS_TOKEN

# Ou verificar no arquivo .env
cat .env | grep MERCADOPAGO
```

### **2. Testar Configuração**

Acesse: `http://localhost:8080/api/payment/test-config`

Deve retornar:
```json
{
  "success": true,
  "config": {
    "hasToken": true,
    "tokenLength": 73,
    "frontendUrl": "http://localhost:5173",
    "backendUrl": "http://localhost:8080"
  }
}
```

### **3. Verificar Logs do Servidor**

Execute o servidor e observe os logs:
```bash
cd server
npm run dev
```

## 🔧 **Soluções Possíveis**

### **Solução 1: Configurar Token do Mercado Pago**

1. **Acesse o Mercado Pago:**
   - Vá para: https://www.mercadopago.com.br/developers/
   - Faça login na sua conta

2. **Crie uma Aplicação:**
   - Clique em "Criar aplicação"
   - Preencha os dados da aplicação
   - Copie o **Access Token** (TEST-...)

3. **Configure no .env:**
   ```bash
   # Adicione no arquivo .env do servidor
   MERCADOPAGO_ACCESS_TOKEN=TEST-SEU-TOKEN-AQUI
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:8080
   ```

### **Solução 2: Verificar Dados da Oferta**

O erro pode estar nos dados da oferta de serviço. Verifique:

1. **Se a oferta existe:**
   ```sql
   SELECT * FROM service_offers WHERE id = [ID_DA_OFERTA];
   ```

2. **Se tem preço válido:**
   ```sql
   SELECT id, proposed_price, final_price FROM service_offers WHERE id = [ID_DA_OFERTA];
   ```

### **Solução 3: Testar com Dados Simples**

Crie um endpoint de teste simples:

```javascript
// Adicione no routes.ts para testar
app.post('/api/payment/test-simple', async (req, res) => {
  try {
    const preferenceData = {
      items: [
        {
          id: "test-1",
          title: "Teste de Pagamento",
          description: "Pagamento de teste",
          quantity: 1,
          unit_price: 10.00,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: 'Cliente Teste',
        email: 'test@test.com'
      },
      back_urls: {
        success: 'http://localhost:5173/payment/success',
        failure: 'http://localhost:5173/payment/failure',
        pending: 'http://localhost:5173/payment/pending'
      }
    };

    const result = await mercadopreference.create({ body: preferenceData });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## 🧪 **Teste Passo a Passo**

### **Passo 1: Verificar Configuração**
```bash
curl http://localhost:8080/api/payment/test-config
```

### **Passo 2: Testar Criação Simples**
```bash
curl -X POST http://localhost:8080/api/payment/test-simple
```

### **Passo 3: Verificar Logs**
Observe os logs do servidor para identificar onde está falhando.

## 🔍 **Logs Esperados**

Quando funcionando, deve aparecer:
```
🔍 Iniciando criação de preferência de pagamento
📝 Request body: { serviceOfferId: 123 }
🔑 Token configurado: SIM
🔍 Buscando oferta de serviço ID: 123
✅ Oferta encontrada: { id: 123, price: "100.00" }
🔍 Buscando solicitação de serviço ID: 456
✅ Solicitação encontrada: { id: 456, title: "Fisioterapia" }
🔍 Buscando profissional ID: 789
✅ Profissional encontrado: { id: 789, name: "João Silva" }
💰 Preço bruto: 100.00 Tipo: string
💰 Valores calculados: { amount: 100, lifebeeCommission: 5, professionalAmount: 95 }
📋 Dados da preferência: { ... }
💳 Criando preferência no Mercado Pago...
✅ Preferência criada com sucesso: { id: "MP-PREFERENCE-ID" }
```

## 🚨 **Erros Comuns**

### **Erro: "Invalid access token"**
- Token não configurado ou inválido
- Verificar se é token de TESTE (TEST-...)

### **Erro: "Invalid item price"**
- Preço inválido ou nulo
- Verificar dados da oferta no banco

### **Erro: "Invalid payer email"**
- Email do pagador inválido
- Usar email válido no teste

### **Erro: "Invalid back_urls"**
- URLs de retorno inválidas
- Verificar se as URLs estão acessíveis

## 📞 **Suporte**

Se o problema persistir:

1. **Verificar logs completos** do servidor
2. **Testar com dados mínimos** primeiro
3. **Verificar documentação** do Mercado Pago
4. **Contatar suporte** do Mercado Pago se necessário

---

## 🎯 **Próximos Passos**

Após resolver o erro 500:

1. ✅ Testar criação de preferência
2. ✅ Testar webhook de confirmação
3. ✅ Testar fluxo completo de pagamento
4. ✅ Implementar em produção

**Status:** 🔧 **EM DIAGNÓSTICO**
