# 📊 Análise do Fluxo de Pagamento

## ✅ **Fluxo Desejado (Correto para Serviços Presenciais)**

```
1. Cliente solicita serviço
   └─ Status: "open"

2. Profissional envia proposta
   └─ Status: "pending"

3. Cliente aceita proposta
   └─ Status: "accepted"

4. 💰 Cliente PAGA antecipadamente
   └─ Dinheiro fica RETIDO (held/authorized)
   └─ Status pagamento: "authorized" ou "held"
   └─ Status serviço: "paid_waiting_service"

5. Profissional executa o serviço presencial
   └─ Status: "in_progress"

6. Profissional marca como concluído
   └─ Status: "awaiting_confirmation"

7. Cliente confirma a conclusão
   └─ Status: "completed"
   └─ 💸 Dinheiro é LIBERADO/CAPTURADO para o profissional
   └─ Transfer automático via Stripe Connect

8. Sistema pede avaliação ao cliente
```

---

## 🔍 **Fluxo Atual (Como está implementado)**

```
1. Cliente solicita serviço ✅
   └─ Status: "open"

2. Profissional envia proposta ✅
   └─ Status: "pending"

3. Cliente aceita proposta ✅
   └─ Status: "accepted"

4. ❌ Profissional executa serviço SEM GARANTIA

5. Profissional marca como concluído ✅
   └─ Status: "awaiting_confirmation"

6. Cliente confirma conclusão ✅
   └─ Status: "completed"

7. ❌ AQUI que está o pagamento (ERRADO!)
   └─ Cliente paga DEPOIS
   └─ Sem garantia para profissional
   └─ Risco de calote
```

---

## ⚠️ **Problema do Fluxo Atual:**

1. ❌ **Profissional presta serviço sem garantia**
2. ❌ **Cliente pode não pagar depois**
3. ❌ **Sem proteção para nenhuma das partes**

---

## ✅ **Fluxo Correto (Marketplace)**

### Vantagens:

1. ✅ **Cliente paga antecipadamente** → Garante compromisso
2. ✅ **Dinheiro fica retido** → Proteção para ambos
3. ✅ **Profissional tem garantia** → Sabe que vai receber
4. ✅ **Cliente tem garantia** → Só libera se confirmar
5. ✅ **Sistema protege todos** → Disputa resolvida pela plataforma

---

## 🔧 **Como Implementar o Fluxo Correto:**

### 1. Usar `capture_method: 'manual'` no Payment Intent

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(finalAmount * 100),
  currency: 'brl',
  payment_method_types: ['card'],
  capture_method: 'manual',  // ✨ RETENÇÃO! Não captura automaticamente
  application_fee_amount: lifebeeCommission,
  transfer_data: {
    destination: professional.stripeAccountId,
  },
});
```

### 2. Capturar quando cliente confirmar

```typescript
// Quando cliente confirmar conclusão:
await stripe.paymentIntents.capture(paymentIntentId);
```

---

## 📝 **Mudanças Necessárias:**

### Passo 1: Mover Pagamento para DEPOIS de Aceitar Proposta
- Criar botão "Pagar Agora" após aceitar proposta
- Pagamento fica retido (authorized)

### Passo 2: Liberar Pagamento na Confirmação
- Quando cliente confirmar conclusão → capturar payment intent

### Passo 3: Timeout de Segurança
- Se cliente não confirmar em X dias → liberar automaticamente
- Proteger profissional de cliente mal-intencionado

---

## ❓ **Quer implementar o fluxo correto?**

Posso fazer as mudanças para:
1. ✅ Pagamento ANTES do serviço (após aceitar proposta)
2. ✅ Dinheiro RETIDO até confirmação
3. ✅ Liberação AUTOMÁTICA na confirmação
4. ✅ Timeout de segurança

---

**Mas PRIMEIRO, execute a migração SQL da coluna `data` para corrigir o erro atual!**

```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB;
```

**Depois me diga se quer implementar o fluxo de escrow (retenção)?** 🚀

