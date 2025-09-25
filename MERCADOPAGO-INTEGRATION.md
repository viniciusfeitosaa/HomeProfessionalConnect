# 💳 Sistema de Pagamentos LifeBee - Mercado Pago

## 🎯 **Visão Geral**

O LifeBee agora possui um sistema completo de pagamentos integrado com o Mercado Pago, permitindo transações seguras entre clientes e profissionais com split de comissão automático.

## 🏗️ **Arquitetura do Sistema**

### **Fluxo de Pagamento:**

1. **Cliente aceita proposta** → Sistema cria preferência no Mercado Pago
2. **Cliente efetua pagamento** → Mercado Pago processa (PIX, cartão, boleto)
3. **Webhook confirma pagamento** → Sistema libera serviço para o profissional
4. **Serviço é realizado** → Profissional marca como concluído
5. **Cliente confirma conclusão** → Valor é liberado para o profissional
6. **Split automático** → LifeBee fica com 5%, profissional recebe 95%

### **Componentes Implementados:**

#### **Backend (Node.js + Express)**
- ✅ **Rotas de Pagamento**: `/api/payment/*`
- ✅ **Integração Mercado Pago SDK**: Criação de preferências
- ✅ **Webhooks**: Confirmação automática de pagamentos
- ✅ **Split de Comissão**: 5% LifeBee + 95% Profissional
- ✅ **Tabela `payment_references`**: Rastreamento de pagamentos

#### **Frontend (React + TypeScript)**
- ✅ **PaymentButton**: Componente de pagamento reutilizável
- ✅ **Páginas de Retorno**: Success, Failure, Pending
- ✅ **Integração com UI**: Botões contextuais nas propostas
- ✅ **Feedback Visual**: Estados de loading e confirmação

## 🚀 **Configuração e Deploy**

### **1. Configurar Conta Mercado Pago**

```bash
# Acesse: https://www.mercadopago.com.br/developers/
# Crie uma aplicação e obtenha os tokens
```

### **2. Variáveis de Ambiente**

```bash
# .env
MP_ACCESS_TOKEN=TEST-YOUR-ACCESS-TOKEN-HERE  # Para sandbox
# MP_ACCESS_TOKEN=APP_USR-YOUR-PRODUCTION-TOKEN  # Para produção

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
```

### **3. Banco de Dados**

```bash
# Executar script para criar tabela
cd server
node create-payment-references-table.mjs
```

### **4. Iniciar Serviços**

```bash
# Backend
cd server
npm install mercadopago
npm run dev

# Frontend
cd client
npm run dev
```

## 💡 **Como Usar**

### **Para Clientes:**

1. **Aceitar Proposta** → Aparece botão "Pagar R$ XX,XX"
2. **Clicar em Pagar** → Abre modal com resumo
3. **Ir para Mercado Pago** → Escolher método de pagamento
4. **Concluir Pagamento** → Retorna para LifeBee com confirmação

### **Para Profissionais:**

1. **Receber Notificação** → Pagamento aprovado
2. **Realizar Serviço** → Marcar como concluído
3. **Cliente Confirma** → Valor liberado automaticamente
4. **Receber Pagamento** → 95% do valor na conta MP

## 🔧 **Recursos Técnicos**

### **Métodos de Pagamento Suportados:**
- 💳 **PIX** (instantâneo)
- 💳 **Cartão de Crédito** (até 12x)
- 💳 **Cartão de Débito**
- 🧾 **Boleto Bancário**

### **Segurança:**
- 🔒 **Tokens JWT** para autenticação
- 🔒 **HTTPS obrigatório** em produção
- 🔒 **Validação de webhooks** do Mercado Pago
- 🔒 **Sanitização de dados** em todas as APIs

### **Monitoramento:**
- 📊 **Logs detalhados** de todas as transações
- 📊 **Status tracking** em tempo real
- 📊 **Relatórios** no dashboard do profissional

## 🧪 **Testes**

### **Ambiente Sandbox:**
```bash
# Cartões de Teste
Visa: 4509 9535 6623 3704
Mastercard: 5031 7557 3453 0604
CVV: 123 | Validade: 11/25

# Contas de Teste
Vendedor: TESTUSER123456789
Comprador: TESTUSER987654321
```

### **URLs de Teste:**
- **Sucesso**: `http://localhost:5173/payment/success`
- **Falha**: `http://localhost:5173/payment/failure`
- **Pendente**: `http://localhost:5173/payment/pending`

## 📋 **APIs Implementadas**

### **POST** `/api/payment/create-preference`
Cria preferência de pagamento no Mercado Pago

**Body:**
```json
{
  "serviceOfferId": 123,
  "serviceRequestId": 456
}
```

**Response:**
```json
{
  "success": true,
  "preferenceId": "MP-PREFERENCE-ID",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

### **POST** `/api/payment/webhook`
Recebe notificações do Mercado Pago

### **GET** `/api/payment/status/:preferenceId`
Verifica status de um pagamento

## 🎨 **UI/UX**

### **Estados Visuais:**
- 🟢 **Proposta Aceita** → Botão de pagamento azul
- 🟡 **Pagamento Pendente** → Loading e instruções
- ✅ **Pagamento Aprovado** → Confirmação verde
- ❌ **Pagamento Rejeitado** → Erro vermelho com opções

### **Responsividade:**
- 📱 **Mobile First** design
- 💻 **Desktop** otimizado
- 🎯 **Touch-friendly** buttons

## 🔮 **Próximas Funcionalidades**

- [ ] **Pagamento Parcelado** personalizado
- [ ] **Cashback** para clientes frequentes
- [ ] **Programa de Fidelidade** para profissionais
- [ ] **Relatórios Financeiros** avançados
- [ ] **Integração com PIX** direto (sem Mercado Pago)
- [ ] **Multi-currency** support
- [ ] **Recurring Payments** para serviços mensais

## 🆘 **Suporte e Troubleshooting**

### **Problemas Comuns:**

**1. Pagamento não aparece:**
- Verificar se `MP_ACCESS_TOKEN` está configurado
- Checar logs do servidor para erros de API
- Confirmar se webhook URL está acessível

**2. Webhook não funciona:**
- URL deve ser HTTPS em produção
- Verificar firewall e proxy reverso
- Testar endpoint manualmente

**3. Split não acontece:**
- Confirmar `marketplace_fee` na preferência
- Verificar se conta é de marketplace no MP
- Checar configuração de split no painel MP

### **Logs Importantes:**
```bash
# Backend logs
🔍 Buscando referência de pagamento por preference ID
💳 Criando referência de pagamento
✅ Referência de pagamento criada
🔔 Webhook recebido - Payment ID
```

---

## 🎉 **Sistema Completo e Funcional!**

O LifeBee agora possui um sistema de pagamentos robusto, seguro e escalável, pronto para processar transações reais entre clientes e profissionais com total transparência e segurança! 🚀
