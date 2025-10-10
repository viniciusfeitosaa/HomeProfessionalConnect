# 🚀 Guia Rápido: Conectar Stripe do Profissional

## ⚠️ Problema Atual:
Cliente tentou pagar R$ 180,00 mas o profissional não tem Stripe Connect configurado.

---

## ✅ Solução em 5 Minutos:

### Passo 1: Descobrir o Profissional
Execute no banco de dados:
```sql
SELECT 
    p.name as profissional,
    u.email,
    p.stripe_account_id
FROM service_offers so
JOIN professionals p ON p.id = so.professional_id
JOIN users u ON u.id = p.user_id
WHERE so.id = 14;
```

Isso vai te mostrar qual profissional precisa conectar.

---

### Passo 2: Login como Profissional
1. **Faça logout** do cliente atual
2. **Login** com o email do profissional que apareceu acima

---

### Passo 3: Ir em Settings
No navegador:
```
http://localhost:5173/settings
```

Ou clique no menu: **⚙️ Configurações**

---

### Passo 4: Você Verá Isto:

```
┌─────────────────────────────────────────────────────┐
│ Configuração de Pagamentos - Stripe                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ⚠️ Configure sua conta para receber pagamentos     │
│                                                     │
│ Você precisa conectar uma conta Stripe para poder  │
│ receber pagamentos dos seus serviços. É rápido,    │
│ seguro e gratuito!                                  │
│                                                     │
│         [ Conectar Stripe ]                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**CLIQUE EM:** `Conectar Stripe`

---

### Passo 5: Preencher Dados no Stripe

Você será redirecionado para o Stripe. Preencha:

#### **Dados Pessoais:**
- ✅ Nome completo
- ✅ CPF (para teste, pode usar qualquer válido)
- ✅ Data de nascimento
- ✅ Endereço completo

#### **Dados Bancários:**
Para teste, você pode usar dados fictícios:
- Banco: Qualquer
- Agência: 0001
- Conta: 12345-6
- Tipo: Conta Corrente

---

### Passo 6: Confirmar

Clique em **"Enviar"** no Stripe.

Você será redirecionado de volta para o LifeBee e verá:

```
┌─────────────────────────────────────────────────────┐
│ ✅ Conta Stripe Conectada e Ativa!                  │
│                                                     │
│ Sua conta está configurada e você pode receber     │
│ pagamentos. Os valores serão depositados            │
│ automaticamente em sua conta.                       │
│                                                     │
│ Status da Conta:                                    │
│ ✓ Informações enviadas                             │
│ ✓ Pode receber pagamentos                          │
│ ✓ Pode fazer saques                                │
│                                                     │
│ [ Abrir Dashboard Stripe ] [ Atualizar Status ]    │
└─────────────────────────────────────────────────────┘
```

---

### Passo 7: Testar Pagamento

1. **Faça logout** do profissional
2. **Login novamente como cliente** (userClient@hotmail.com)
3. **Tente pagar novamente**
4. **Funcionará!** ✅

---

## 🎯 Resultado Esperado:

Quando funcionar, você verá:

```
✅ Payment Intent criado com Connect...
   Conta destino: acct_xxxxx
💰 Valor original: R$ 180.00
💰 LifeBee (5%): R$ 9.00
💰 Profissional (95%): R$ 171.00
✅ Payment Intent criado: pi_xxxxx
```

---

## ⚡ Atalho (Se Tiver Acesso ao Banco):

Se você tem acesso direto ao banco e quer apenas testar, pode:

1. **Criar manualmente** um `stripe_account_id` fake:
```sql
UPDATE professionals 
SET 
  stripe_account_id = 'acct_test_123456789',
  stripe_charges_enabled = true,
  stripe_payouts_enabled = true,
  stripe_onboarding_completed = true,
  stripe_account_status = 'active'
WHERE id = (
  SELECT professional_id FROM service_offers WHERE id = 14
);
```

**⚠️ ATENÇÃO:** Isso é APENAS PARA TESTE! Em produção, o profissional DEVE fazer o onboarding real no Stripe.

---

## 🆘 Troubleshooting:

### Erro: "Link expirou"
- Volte em Settings
- Clique em **"Completar Configuração"**
- Novo link será gerado

### Erro: "Dados inválidos"
- Verifique o CPF
- Verifique a data de nascimento
- Use formato correto de endereço

### Não vê o botão "Conectar Stripe"
- Verifique se está logado como profissional
- Limpe cache do navegador
- Acesse diretamente: `http://localhost:5173/settings`

---

## ✅ Checklist Final:

- [ ] Descobri qual profissional (query SQL)
- [ ] Fiz login como profissional
- [ ] Acessei /settings
- [ ] Vi o card do Stripe
- [ ] Cliquei em "Conectar Stripe"
- [ ] Preenchi dados no Stripe
- [ ] Voltei para LifeBee
- [ ] Vi status "✅ Conectado"
- [ ] Fiz login como cliente
- [ ] Consegui pagar! 🎉

---

**Tempo total:** ~5 minutos  
**Dificuldade:** Fácil  
**Resultado:** Sistema de marketplace profissional funcionando! 🚀

