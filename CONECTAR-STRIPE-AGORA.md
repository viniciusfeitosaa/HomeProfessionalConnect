# ⚡ Conectar Stripe do Profissional - AGORA!

## 🎯 Objetivo: Fazer o pagamento funcionar

Você está vendo este erro:
```
⚠️ Profissional não tem conta Stripe Connect
```

Vamos resolver em **5 minutos**! 🚀

---

## 📋 Passo a Passo:

### **1️⃣ Descobrir qual profissional precisa conectar**

O erro acontece quando o profissional da **proposta ID 14** não tem Stripe.

Rode esta query no seu banco para ver qual é:

```sql
SELECT 
    p.id,
    p.name as profissional,
    u.email,
    u.id as user_id
FROM service_offers so
JOIN professionals p ON p.id = so.professional_id
JOIN users u ON u.id = p.user_id
WHERE so.id = 14;
```

**Anote o EMAIL deste profissional!** 📧

---

### **2️⃣ Fazer Logout do Cliente**

No navegador:
1. Sair da conta do cliente atual
2. Ou abra uma aba anônima

---

### **3️⃣ Login como Profissional**

1. Acesse: `http://localhost:5173/login`
2. Entre com o **EMAIL do profissional** que você anotou
3. Use a senha dele

---

### **4️⃣ Ir em Settings**

No menu do profissional, clique em:
- **⚙️ Configurações** 
- Ou acesse direto: `http://localhost:5173/settings`

---

### **5️⃣ Você Verá Este Card:**

```
┌─────────────────────────────────────────┐
│ Configuração de Pagamentos - Stripe    │
├─────────────────────────────────────────┤
│ ⚠️ Configure sua conta para receber     │
│    pagamentos                            │
│                                          │
│ [ Conectar Stripe ]                      │
└─────────────────────────────────────────┘
```

**CLIQUE EM:** `Conectar Stripe` 🔵

---

### **6️⃣ Será Redirecionado para o Stripe**

Você verá um formulário do Stripe. Preencha:

#### **Dados Pessoais:**
- Nome completo: Qualquer nome
- CPF: Use um válido (pode ser gerador online)
- Data de nascimento: Qualquer data válida
- Endereço: Qualquer endereço válido

#### **Dados Bancários (Para teste):**
- Banco: Qualquer
- Agência: 0001
- Conta: 12345-6
- Tipo: Conta Corrente

⚠️ **Importante:** Como está em modo teste (sk_test), pode usar dados fictícios!

---

### **7️⃣ Confirmar no Stripe**

Clique em **"Enviar"** ou **"Submit"**

---

### **8️⃣ Voltar para o LifeBee**

Você será redirecionado automaticamente e verá:

```
┌─────────────────────────────────────────┐
│ ✅ Conta Stripe Conectada e Ativa!      │
│                                          │
│ Status da Conta:                         │
│ ✓ Informações enviadas                  │
│ ✓ Pode receber pagamentos               │
│ ✓ Pode fazer saques                     │
└─────────────────────────────────────────┘
```

**SUCESSO!** ✅

---

### **9️⃣ Testar Pagamento**

1. **Faça logout** do profissional
2. **Login novamente como cliente**
3. **Tente pagar** a proposta de R$ 180,00
4. **VAI FUNCIONAR!** 🎉

Você verá no log:
```
🚀 Criando Payment Intent com Connect...
   Conta destino: acct_xxxxx
💰 LifeBee (5%): R$ 9.00
💰 Profissional (95%): R$ 171.00
✅ Payment Intent criado!
```

---

## 🚨 Se não souber a senha do profissional:

### **Opção A: Reset de senha**
Use a funcionalidade de "Esqueci minha senha"

### **Opção B: Criar novo profissional**
1. Crie uma nova conta como profissional
2. Crie uma nova proposta
3. Aceite como cliente
4. Configure Stripe
5. Teste pagamento

### **Opção C: Atualizar senha direto no banco**
```sql
-- Senha: "teste123"
UPDATE users 
SET password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtoGrBugT2m3fZsG3AhKXz3fxe.C'
WHERE email = 'EMAIL_DO_PROFISSIONAL';
```

---

## ✅ Checklist:

- [ ] Descobri qual profissional (query SQL)
- [ ] Fiz logout do cliente
- [ ] Login como profissional
- [ ] Acessei /settings
- [ ] Vi o card "Conectar Stripe"
- [ ] Cliquei no botão
- [ ] Preenchi dados no Stripe
- [ ] Voltei para LifeBee
- [ ] Vi status "✅ Conectado"
- [ ] Logout do profissional
- [ ] Login como cliente
- [ ] Tentei pagar
- [ ] FUNCIONOU! 🎉

---

## 🎯 Resultado Final:

Depois disso, quando cliente pagar R$ 180,00:

```
Cliente paga: R$ 180,00
        ↓
Stripe divide automaticamente:
  → R$ 9,00 para LifeBee (5%)
  → R$ 171,00 para Profissional (95%)
        ↓
✅ Dinheiro cai nas contas certas!
```

---

## 💡 Dica:

Depois de conectar o primeiro profissional, você pode usar ele para todos os testes!

Ou criar mais profissionais e conectar cada um conforme necessário.

---

**Tempo total:** ~5 minutos  
**Dificuldade:** Fácil  
**Resultado:** Sistema de marketplace profissional funcionando! 🚀

---

## 🆘 Precisa de Ajuda?

Se tiver qualquer problema:
1. Verifique se está em modo teste (sk_test no Stripe)
2. Verifique se o email está correto
3. Limpe cache do navegador
4. Reinicie o servidor

**Agora é só seguir os passos! Você consegue!** 💪

