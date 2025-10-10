# 🏦 Sistema PSP com Stripe - Guia Completo

## 📋 Índice
1. [O que é um PSP e como funciona](#o-que-é-um-psp)
2. [Implementação Atual](#implementação-atual)
3. [Limitações da Implementação Atual](#limitações-da-implementação-atual)
4. [Stripe Connect - Solução Profissional](#stripe-connect)
5. [Como Migrar para Stripe Connect](#como-migrar)
6. [Comparação: Implementação Atual vs. Stripe Connect](#comparação)

---

## 🎯 O que é um PSP e como funciona

Um **PSP (Payment Service Provider)** é uma plataforma que faz a intermediação de pagamentos entre compradores e vendedores, cobrando uma taxa sobre as transações.

### Fluxo típico:
```
Cliente → [Plataforma PSP] → Profissional
    R$ 100,00 → R$ 5,00 (taxa) → R$ 95,00
```

### Responsabilidades de um PSP:
- ✅ Processar pagamentos com segurança
- ✅ Reter comissões automaticamente
- ✅ Distribuir valores aos profissionais
- ✅ Gerenciar disputas e chargebacks
- ✅ Cumprir regulamentações financeiras

---

## 📊 Implementação Atual

### ✅ O que está funcionando:

#### 1. **Cálculo de Comissão**
```typescript
// server/routes-simple.ts (linha 625-626)
const lifebeeCommission = finalAmount * 0.05; // 5% de comissão
const professionalAmount = finalAmount - lifebeeCommission;
```

#### 2. **Payment Intent com Metadata**
```typescript
// server/routes-simple.ts (linha 642-654)
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(finalAmount * 100),
  currency: 'brl',
  payment_method_types: ['card'],
  metadata: {
    serviceOfferId: serviceOffer.id.toString(),
    serviceRequestId: serviceOffer.serviceRequestId.toString(),
    clientId: serviceRequest.clientId.toString(),
    professionalId: serviceOffer.professionalId.toString(),
    lifebeeCommission: lifebeeCommission.toFixed(2),      // ✅ Registrado
    professionalAmount: professionalAmount.toFixed(2),    // ✅ Registrado
  },
});
```

#### 3. **Webhook para Confirmação**
```typescript
// server/routes-simple.ts (linha 353-396)
case 'payment_intent.succeeded':
  const paymentIntent = event.data.object;
  // Atualiza status do serviço
  await storage.updateServiceOfferStatus(parseInt(serviceOfferId), 'completed');
  // Cria notificação para o profissional
  await storage.createNotification({
    userId: parseInt(professionalId),
    type: 'payment_received',
    title: 'Pagamento Recebido! 💰',
    message: `Seu pagamento de R$ ${(paymentIntent.amount / 100).toFixed(2)} foi aprovado.`,
  });
```

### ⚠️ Pontos de Atenção:

1. **O dinheiro vai todo para a conta LifeBee**
   - Cliente paga R$ 100,00
   - Todo o valor vai para a conta Stripe da LifeBee
   - Sistema apenas "registra" que R$ 95,00 é do profissional

2. **Transferência manual necessária**
   - LifeBee precisa transferir manualmente R$ 95,00 para o profissional
   - Não há automação no repasse
   - Profissional não recebe automaticamente

3. **Compliance e regulamentação**
   - LifeBee está mantendo dinheiro de terceiros
   - Pode precisar de licença de instituição de pagamento
   - Riscos legais e fiscais

---

## 🚨 Limitações da Implementação Atual

### ❌ Problemas Técnicos:

1. **Sem Split Automático**
   - Valor total vai para LifeBee
   - Requer processo manual de repasse
   - Alto custo operacional

2. **Sem Gestão de Saldo**
   - Não há tracking de quanto cada profissional tem a receber
   - Dificulta conciliação financeira
   - Propenso a erros humanos

3. **Sem Proteção contra Chargebacks**
   - Se cliente pedir estorno, LifeBee perde todo o valor
   - Mesmo se já repassou ao profissional
   - Risco financeiro alto

### ⚖️ Problemas Legais:

1. **Regulamentação Financeira**
   - Manter dinheiro de terceiros requer licença
   - LifeBee não é uma instituição financeira
   - Pode ter problemas com Banco Central

2. **Responsabilidade Fiscal**
   - LifeBee precisa emitir nota fiscal de todo o valor?
   - Como declarar valores que são do profissional?
   - Complexidade tributária alta

3. **Disputas e Estornos**
   - Quem é responsável por estornos?
   - Como lidar com disputas cliente-profissional?
   - Sem proteção do Stripe

---

## 🎉 Stripe Connect - Solução Profissional

O **Stripe Connect** é a solução oficial do Stripe para marketplaces e plataformas que conectam compradores e vendedores.

### 🌟 Vantagens:

#### 1. **Split Automático de Pagamento**
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000,  // R$ 100,00
  currency: 'brl',
  application_fee_amount: 500,  // R$ 5,00 (5%) vai para LifeBee
  transfer_data: {
    destination: professionalStripeAccountId,  // R$ 95,00 vai direto para profissional
  },
});
```

**Como funciona:**
```
Cliente paga R$ 100,00
    ↓
Stripe divide automaticamente:
    → R$ 5,00 para conta LifeBee
    → R$ 95,00 para conta do Profissional
```

#### 2. **Profissionais têm suas próprias contas Stripe**
- Cada profissional cria uma conta Stripe Connect
- Dinheiro vai direto para conta deles
- LifeBee não mantém dinheiro de terceiros
- Conforme a lei!

#### 3. **Proteção contra Chargebacks**
- Se cliente pedir estorno, Stripe gerencia
- Pode reverter do profissional automaticamente
- LifeBee não perde dinheiro

#### 4. **Compliance Automático**
- Stripe gerencia KYC (Know Your Customer)
- Stripe lida com regulamentações
- Stripe emite documentos fiscais
- LifeBee só cobra a comissão

#### 5. **Dashboard para Profissionais**
- Profissionais acessam dashboard Stripe
- Veem seus ganhos em tempo real
- Fazem saques quando quiserem
- Transparência total

---

## 🛠️ Como Migrar para Stripe Connect

### Passo 1: Criar Conta Stripe Connect

1. Acesse o Dashboard Stripe: https://dashboard.stripe.com/
2. Vá em **Connect** no menu lateral
3. Clique em **Get Started**
4. Escolha o tipo de integração:
   - **Standard** (recomendado para LifeBee)
   - **Express** (mais controle da LifeBee)
   - **Custom** (controle total)

### Passo 2: Atualizar Backend

#### 2.1. Criar endpoint para conectar profissionais

```typescript
// server/routes-simple.ts
app.post('/api/stripe/connect/create-account', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const professional = await storage.getProfessionalByUserId(user.id);
    
    if (!professional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // Criar conta Connect para o profissional
    const account = await stripe.accounts.create({
      type: 'express',  // ou 'standard'
      country: 'BR',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        professionalId: professional.id.toString(),
        userId: user.id.toString(),
      },
    });

    // Salvar stripeAccountId no banco
    await storage.updateProfessional(professional.id, {
      stripeAccountId: account.id,
    });

    // Criar link para profissional completar cadastro
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=failed`,
      return_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=success`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('❌ Erro ao criar conta Connect:', error);
    res.status(500).json({ error: 'Erro ao criar conta Connect' });
  }
});
```

#### 2.2. Atualizar criação de Payment Intent

```typescript
// server/routes-simple.ts
app.post('/api/payment/create-intent', authenticateToken, async (req, res) => {
  try {
    const { serviceOfferId } = req.body;
    
    // Buscar dados (mesmo código atual)
    const serviceOffer = await storage.getServiceOfferById(serviceOfferId);
    const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
    const professional = await storage.getProfessionalById(serviceOffer.professionalId);
    
    // Verificar se profissional tem conta Connect
    if (!professional.stripeAccountId) {
      return res.status(400).json({ 
        error: 'Profissional precisa conectar sua conta Stripe primeiro',
        needsStripeSetup: true,
      });
    }
    
    const amount = parseFloat(serviceOffer.finalPrice || serviceOffer.proposedPrice);
    const finalAmount = Math.max(amount, 5.00);
    
    // Calcular taxa LifeBee (5%)
    const lifebeeCommission = Math.round(finalAmount * 100 * 0.05); // em centavos
    
    // ✨ Criar Payment Intent com split automático
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: 'brl',
      payment_method_types: ['card'],
      application_fee_amount: lifebeeCommission,  // ✨ Taxa LifeBee
      transfer_data: {
        destination: professional.stripeAccountId,  // ✨ Profissional recebe direto
      },
      metadata: {
        serviceOfferId: serviceOffer.id.toString(),
        serviceRequestId: serviceOffer.serviceRequestId.toString(),
        clientId: serviceRequest.clientId.toString(),
        professionalId: serviceOffer.professionalId.toString(),
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('❌ Erro ao criar Payment Intent:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});
```

#### 2.3. Webhook já funciona! (não precisa mudar muito)

```typescript
// server/routes-simple.ts
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  // ... (código de verificação atual)
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // ✅ Dinheiro já foi dividido automaticamente pelo Stripe!
      // ✅ R$ 5,00 já está na conta LifeBee
      // ✅ R$ 95,00 já está na conta do Profissional
      
      // Apenas atualizar status no banco
      await storage.updateServiceOfferStatus(parseInt(serviceOfferId), 'completed');
      await storage.updateServiceRequestStatus(serviceRequest.id, 'completed');
      
      // Notificar profissional
      await storage.createNotification({
        userId: parseInt(professionalId),
        type: 'payment_received',
        title: 'Pagamento Recebido! 💰',
        message: `Você recebeu R$ ${professionalAmount} pelo serviço. O dinheiro já está em sua conta Stripe!`,
      });
      break;
  }
});
```

### Passo 3: Atualizar Banco de Dados

```sql
-- migrations/add_stripe_account_id.sql
ALTER TABLE professionals 
ADD COLUMN stripe_account_id VARCHAR(255) NULL,
ADD COLUMN stripe_onboarding_completed BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_professionals_stripe_account 
ON professionals(stripe_account_id);
```

### Passo 4: Atualizar Frontend

#### 4.1. Adicionar botão "Conectar Stripe" para profissionais

```typescript
// client/src/pages/provider-settings.tsx
import { Button } from "@/components/ui/button";

function ProviderSettings() {
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectStripe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para página de onboarding do Stripe
        window.location.href = data.onboardingUrl;
      }
    } catch (error) {
      console.error('Erro ao conectar Stripe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Configurações de Pagamento</h2>
      
      {!stripeAccountId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">⚠️ Configure sua conta Stripe</h3>
          <p className="text-sm text-gray-700 mb-4">
            Para receber pagamentos, você precisa conectar sua conta Stripe.
            É rápido, seguro e gratuito!
          </p>
          <Button onClick={connectStripe} disabled={loading}>
            {loading ? 'Conectando...' : 'Conectar Stripe'}
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">✅ Conta Stripe Conectada</h3>
          <p className="text-sm text-gray-700">
            Sua conta está ativa e pronta para receber pagamentos!
          </p>
        </div>
      )}
    </div>
  );
}
```

### Passo 5: Testar

1. **Como Profissional:**
   - Fazer login como profissional
   - Ir em Configurações
   - Clicar em "Conectar Stripe"
   - Completar cadastro no Stripe
   - Voltar para plataforma

2. **Como Cliente:**
   - Fazer login como cliente
   - Aceitar uma proposta do profissional
   - Pagar com cartão de teste
   - Verificar se pagamento foi aprovado

3. **Verificar no Dashboard Stripe:**
   - Acessar https://dashboard.stripe.com/
   - Ir em "Connect > Accounts"
   - Ver conta do profissional criada
   - Ir em "Payments"
   - Ver pagamento com split (R$ 5,00 para você, R$ 95,00 para profissional)

---

## 📊 Comparação: Implementação Atual vs. Stripe Connect

| Aspecto | Implementação Atual | Stripe Connect |
|---------|---------------------|----------------|
| **Split de pagamento** | ❌ Manual | ✅ Automático |
| **Dinheiro de terceiros** | ❌ LifeBee mantém | ✅ Vai direto para profissional |
| **Compliance legal** | ⚠️ Requer licença | ✅ Stripe gerencia |
| **Chargebacks** | ❌ LifeBee assume risco | ✅ Distribuído automaticamente |
| **Repasse ao profissional** | ❌ Manual | ✅ Instantâneo |
| **Dashboard profissional** | ❌ Não existe | ✅ Stripe Dashboard |
| **Transparência** | ⚠️ Limitada | ✅ Total |
| **Custo operacional** | 🟡 Alto (manual) | 🟢 Baixo (automático) |
| **Escalabilidade** | ❌ Difícil | ✅ Ilimitada |
| **Complexidade técnica** | 🟢 Simples | 🟡 Média |

---

## 💰 Custos do Stripe Connect

### Stripe cobra:
- **2.9% + R$ 0.39** por transação com cartão (igual a implementação normal)
- **0.25%** adicional para Connect (muito baixo!)

### Exemplo com R$ 100,00:
```
Valor do serviço: R$ 100,00
Taxa Stripe (2.9%): R$ 2,90
Taxa fixa Stripe: R$ 0,39
Taxa Connect (0.25%): R$ 0,25
─────────────────────────────
Total taxas Stripe: R$ 3,54

Valor líquido: R$ 96,46
Comissão LifeBee (5%): R$ 5,00
Profissional recebe: R$ 91,46
```

**Nota:** A comissão LifeBee de 5% pode ser calculada sobre o valor bruto (antes das taxas Stripe) ou sobre o valor líquido (depois das taxas). Isso é uma decisão de negócio.

### Opção 1: Comissão sobre valor bruto (mais simples)
```typescript
// Cliente paga R$ 100,00
const amount = 10000; // centavos
const lifebeeCommission = Math.round(amount * 0.05); // R$ 5,00 (500 centavos)

const paymentIntent = await stripe.paymentIntents.create({
  amount: amount, // R$ 100,00
  application_fee_amount: lifebeeCommission, // R$ 5,00 vai para LifeBee
  // Profissional recebe: R$ 100,00 - R$ 3,54 (Stripe) - R$ 5,00 (LifeBee) = R$ 91,46
});
```

### Opção 2: Profissional recebe exato (LifeBee paga taxas Stripe)
```typescript
// Profissional deve receber R$ 95,00 (95% de R$ 100,00)
const professionalAmount = 9500; // R$ 95,00 em centavos
const lifebeeCommission = 500; // R$ 5,00
const stripeFees = 354; // R$ 3,54 estimado

const totalAmount = professionalAmount + lifebeeCommission + stripeFees; // R$ 98,54
// Cliente paga R$ 98,54, profissional recebe exato R$ 95,00, LifeBee fica com R$ 1,46
```

**Recomendação:** Opção 1 é mais simples e transparente.

---

## 🎯 Próximos Passos Recomendados

### Curto Prazo (1-2 semanas):
1. ✅ Implementar Stripe Connect
2. ✅ Adicionar onboarding de profissionais
3. ✅ Testar com profissionais reais
4. ✅ Documentar processo para profissionais

### Médio Prazo (1 mês):
1. 📊 Adicionar dashboard de ganhos para profissionais
2. 💳 Implementar saques automáticos
3. 📧 Notificações de pagamento recebido
4. 🔍 Sistema de tracking de comissões

### Longo Prazo (3 meses):
1. 🌟 Adicionar PIX via Stripe
2. 💰 Implementar programa de cashback
3. 📈 Analytics avançado de pagamentos
4. 🔐 Sistema anti-fraude customizado

---

## 📚 Recursos e Documentação

### Stripe Connect:
- **Documentação Oficial:** https://stripe.com/docs/connect
- **Guia de Início:** https://stripe.com/docs/connect/enable-payment-acceptance-guide
- **Best Practices:** https://stripe.com/docs/connect/best-practices
- **API Reference:** https://stripe.com/docs/api/accounts

### Vídeos e Tutoriais:
- **Stripe Connect Overview:** https://www.youtube.com/watch?v=NNYqjJnc7KM
- **Building a Marketplace:** https://www.youtube.com/watch?v=6CFiSN5kNh8

### Comunidade:
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/stripe-connect
- **Discord Stripe:** https://discord.gg/stripe

---

## ❓ FAQ - Perguntas Frequentes

### 1. A implementação atual está errada?
**R:** Não está "errada", mas não é a forma recomendada para um marketplace. Funciona para MVP, mas tem limitações legais e operacionais.

### 2. Posso usar a implementação atual em produção?
**R:** Tecnicamente sim, mas você terá que:
- Fazer repasses manuais aos profissionais
- Gerenciar compliance financeiro
- Lidar com chargebacks manualmente
- Possivelmente obter licença de instituição de pagamento

### 3. Stripe Connect é muito mais caro?
**R:** Não! A taxa adicional é de apenas 0.25%. Para um pagamento de R$ 100,00, são apenas R$ 0,25 a mais.

### 4. É difícil implementar Stripe Connect?
**R:** Não! O código acima mostra que são poucas mudanças. A maioria do código atual pode ser reaproveitado.

### 5. Profissionais precisam ter conta no Stripe?
**R:** Sim, mas é muito simples. O Stripe Connect facilita o onboarding. O profissional só precisa fornecer:
- Nome completo
- CPF
- Dados bancários
- E-mail

O processo leva menos de 5 minutos.

### 6. Como funciona a aprovação do profissional?
**R:** O Stripe faz a verificação KYC automaticamente. Se aprovado, o profissional já pode receber pagamentos. Se houver algum problema, o Stripe notifica.

### 7. Posso mudar a taxa de comissão depois?
**R:** Sim! A taxa é configurada em cada Payment Intent. Você pode ter taxas diferentes para diferentes serviços ou profissionais.

### 8. E se um profissional quiser sair da plataforma?
**R:** O profissional pode desconectar sua conta Stripe a qualquer momento. Os pagamentos pendentes ainda serão processados.

---

## 🎉 Conclusão

### Status Atual:
- ✅ **Implementação básica funcionando**
- ⚠️ **Split manual de pagamentos**
- ⚠️ **Riscos legais e operacionais**

### Recomendação:
- 🚀 **Migrar para Stripe Connect o quanto antes**
- ✅ **Benefícios superam largamente o esforço**
- 💰 **Custo adicional é mínimo (0.25%)**
- ⚖️ **Compliance e legalidade garantidos**

### Esforço estimado de migração:
- **Backend:** 4-6 horas
- **Frontend:** 2-3 horas
- **Testes:** 2-3 horas
- **Total:** ~1-2 dias de trabalho

**Vale muito a pena! 🎉**

---

## 📞 Suporte

Se tiver dúvidas sobre a implementação, consulte:
1. Esta documentação
2. Documentação oficial do Stripe
3. Exemplos de código no GitHub
4. Suporte do Stripe (responde rápido!)

**Boa sorte com a implementação! 🚀**

