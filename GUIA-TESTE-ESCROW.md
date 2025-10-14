# 🧪 Guia de Teste - Sistema de Escrow

## 🎯 O Que Vamos Testar

O fluxo completo de retenção de pagamento (escrow):
- Cliente paga ANTES do serviço
- Dinheiro fica RETIDO
- Profissional presta serviço com garantia
- Cliente confirma e LIBERA o dinheiro

---

## 📋 Pré-requisitos

- ✅ Servidor rodando (`npm run dev`)
- ✅ Stripe configurado e funcionando
- ✅ Profissional com conta Stripe Connect ativa
- ✅ Cliente e profissional cadastrados

---

## 🧪 Teste Passo a Passo

### 1️⃣ Cliente Solicita Serviço

1. **Login como cliente**
2. **Acesse:** Página inicial
3. **Clique em:** Botão "+" (solicitar serviço)
4. **Preencha:**
   - Categoria: Fisioterapeuta
   - Descrição: "Teste de fluxo escrow"
   - Endereço: Qualquer
   - Data e hora: Qualquer data futura
5. **Envie a solicitação**

**Resultado esperado:**
```
✅ Solicitação criada
Status: "open"
```

---

### 2️⃣ Profissional Envia Proposta

1. **Logout do cliente**
2. **Login como profissional**
3. **Acesse:** Dashboard
4. **Veja a solicitação** na lista
5. **Clique em:** "Enviar Proposta"
6. **Preencha:**
   - Preço: R$ 50,00
   - Tempo estimado: 1 hora
   - Mensagem: "Proposta teste escrow"
7. **Envie a proposta**

**Resultado esperado:**
```
✅ Proposta enviada
Status proposta: "pending"
```

---

### 3️⃣ Cliente Aceita Proposta

1. **Logout do profissional**
2. **Login como cliente**
3. **Acesse:** "Minhas Solicitações"
4. **Veja a proposta** do profissional
5. **Clique em:** "Aceitar Proposta"

**Resultado esperado:**
```
✅ Proposta aceita
Status proposta: "accepted"
Aparece botão: "Pagar Agora"
```

---

### 4️⃣ 💰 Cliente PAGA (ESCROW ATIVA)

1. **Clique em:** "Pagar Agora" ou "Pagar R$ 50,00"
2. **Preencha o cartão de teste:**
   ```
   Número: 4242 4242 4242 4242
   Data: 12/34
   CVC: 123
   ```
3. **Clique em:** "Pagar"

**Resultado esperado:**
```
✅ Pagamento processado
💳 Status: Autorizado (retido)
```

**No console do servidor:**
```
🚀 Criando Payment Intent com Connect (ESCROW - Retenção)...
💰 Pagamento será RETIDO até confirmação do cliente
🔒 Pagamento AUTORIZADO (retido): pi_xxxxx
💰 Valor retido: R$ 50.00
```

**Notificações:**
- 🔔 Cliente: "Pagamento autorizado e está retido 🔒"
- 🔔 Profissional: "Pagamento garantido! ✅"

---

### 5️⃣ Profissional Marca Como Concluído

1. **Logout do cliente**
2. **Login como profissional**
3. **Acesse:** "Propostas"
4. **Encontre o serviço pago**
5. **Clique em:** "Confirmar Conclusão"

**Resultado esperado:**
```
✅ Serviço marcado como concluído
Status: "awaiting_confirmation"
```

**No console do servidor:**
```
✅ Pagamento verificado (status: authorized). Permitindo conclusão.
✅ Serviço marcado como aguardando confirmação do cliente
```

**Notificação:**
- 🔔 Cliente: "Serviço concluído! Por favor confirme 🎉"

---

### 6️⃣ 💸 Cliente Confirma e LIBERA Pagamento

1. **Logout do profissional**
2. **Login como cliente**
3. **Acesse:** "Serviços" ou onde aparecer a notificação
4. **Clique em:** "Confirmar Conclusão do Serviço"

**Resultado esperado:**
```
✅ Serviço confirmado
💸 Pagamento CAPTURADO e LIBERADO
Status: "completed"
```

**No console do servidor:**
```
💰 Buscando pagamento retido para liberar...
💸 Capturando Payment Intent: pi_xxxxx
✅ Pagamento capturado com sucesso!
   Status: succeeded
   💰 Valor liberado: R$ 50.00
✅ Referência de pagamento atualizada para "approved"
```

**Notificações:**
- 🔔 Profissional: "Pagamento liberado! R$ 47,50 💰"
- 🔔 Cliente: Popup de avaliação

---

## ✅ Validações que Serão Testadas

### Validação 1: Profissional não pode concluir sem pagamento
**Teste:**
- Aceitar proposta mas NÃO pagar
- Tentar marcar como concluído

**Resultado esperado:**
```
❌ Erro: "O cliente precisa pagar antes de você marcar como concluído"
```

### Validação 2: Apenas cliente pode confirmar
**Teste:**
- Profissional tenta confirmar conclusão

**Resultado esperado:**
```
❌ Erro: "Apenas clientes podem confirmar"
```

---

## 🔍 O Que Observar

### No Dashboard do Stripe:

1. **Acesse:** https://dashboard.stripe.com/test/payments
2. **Veja o pagamento** criado
3. **Status deve ser:**
   - Primeiro: "Requires capture" (retido)
   - Depois: "Succeeded" (capturado/liberado)

### Nos Logs do Servidor:

```
🚀 Criando Payment Intent (ESCROW)
🔒 Pagamento AUTORIZADO
💸 Capturando Payment Intent
✅ Pagamento capturado
```

### No Banco de Dados:

```sql
-- Ver status do pagamento
SELECT 
  id,
  service_offer_id,
  amount,
  status,
  status_detail,
  external_reference
FROM payment_references
WHERE service_offer_id = SEU_OFFER_ID;
```

**Deve mostrar:**
- Primeiro: `status = 'authorized'`
- Depois: `status = 'approved'`

---

## 🎯 Cenários de Teste

### Cenário 1: Fluxo Normal (Happy Path)
1. ✅ Cliente solicita
2. ✅ Profissional propõe
3. ✅ Cliente aceita
4. ✅ Cliente paga → RETIDO
5. ✅ Profissional conclui
6. ✅ Cliente confirma → LIBERADO

### Cenário 2: Cliente não confirma
1. ✅ Fluxo até passo 5
2. ❌ Cliente NÃO confirma
3. ⏰ (Futuro: timeout libera após 7 dias)

### Cenário 3: Profissional tenta concluir sem pagamento
1. ✅ Cliente aceita proposta
2. ❌ NÃO paga
3. ❌ Profissional tenta concluir → BLOQUEADO

---

## 💰 Valores de Teste

| Ação | Valor Total | LifeBee (5%) | Profissional (95%) |
|------|-------------|--------------|-------------------|
| Cliente paga | R$ 50,00 | R$ 2,50 | R$ 47,50 |
| Cliente paga | R$ 100,00 | R$ 5,00 | R$ 95,00 |
| Cliente paga | R$ 3,00 | R$ 5,00* | R$ 0,00* |

*Mínimo R$ 5,00 por restrição do Stripe Brasil

---

## 📊 Checklist de Teste

- [ ] Cliente solicitou serviço
- [ ] Profissional enviou proposta
- [ ] Cliente aceitou proposta
- [ ] **Cliente PAGOU (dinheiro retido)**
- [ ] Verificou notificação "Pagamento autorizado 🔒"
- [ ] Verificou notificação profissional "Pagamento garantido ✅"
- [ ] Profissional marcou como concluído
- [ ] Tentou marcar sem pagar → ERRO (validação funcionou)
- [ ] Cliente confirmou conclusão
- [ ] **Pagamento foi LIBERADO para profissional**
- [ ] Verificou notificação "Pagamento liberado! 💰"
- [ ] Viu popup de avaliação
- [ ] Verificou no Stripe Dashboard que pagamento foi capturado

---

## 🎉 Resultado Final Esperado

✅ **Cliente protegido** - Só libera se confirmar  
✅ **Profissional protegido** - Tem garantia de pagamento  
✅ **Plataforma protegida** - Taxa garantida no split  
✅ **Marketplace profissional** - Sistema completo de escrow  

---

**Tempo de teste:** ~10 minutos  
**Dificuldade:** Média  
**Resultado:** Sistema de marketplace com escrow funcional! 🚀

