# 🚀 Plano de Migração - Stripe Connect

## 📋 Visão Geral

Este documento serve como guia completo para migração do sistema de pagamentos atual para Stripe Connect, garantindo que nenhuma etapa seja esquecida.

**Tempo Estimado Total:** 2-3 dias  
**Complexidade:** Média  
**Impacto:** Alto (melhora compliance e automação)  

---

## 🎯 Objetivos da Migração

- [ ] Implementar split automático de pagamentos
- [ ] Profissionais receberem direto em suas contas
- [ ] Eliminar necessidade de transferências manuais
- [ ] Garantir compliance legal e financeiro
- [ ] Manter compatibilidade com sistema atual durante transição

---

## 📊 Status Geral

```
[ ] Fase 1: Preparação (2-3 horas)
[ ] Fase 2: Backend - Database (1 hora)
[ ] Fase 3: Backend - API Stripe Connect (3-4 horas)
[ ] Fase 4: Frontend - Onboarding (2-3 horas)
[ ] Fase 5: Frontend - UI Updates (1-2 horas)
[ ] Fase 6: Testes (2-3 horas)
[ ] Fase 7: Deploy e Monitoramento (1 hora)
[ ] Fase 8: Migração de Profissionais Existentes (variável)
```

---

## 📅 FASE 1: PREPARAÇÃO (2-3 horas)

### 1.1 Configuração no Stripe Dashboard
- [ ] **Acessar Dashboard Stripe**
  - URL: https://dashboard.stripe.com/
  - Login com sua conta LifeBee
  
- [ ] **Ativar Stripe Connect**
  - Ir em **Connect** no menu lateral
  - Clicar em **Get Started**
  - Escolher tipo: **Express** (recomendado)
  - Preencher informações da plataforma LifeBee
  
- [ ] **Configurar Branding**
  - Logo da LifeBee
  - Cores da marca
  - Informações de contato
  
- [ ] **Obter Client ID do Connect**
  - Ir em **Connect > Settings**
  - Copiar **Client ID** (ca_xxx)
  - Guardar para variáveis de ambiente

**✅ Checkpoint:** Stripe Connect ativado e configurado

---

### 1.2 Documentação e Backup
- [ ] **Fazer backup completo do banco de dados**
  ```bash
  pg_dump $DATABASE_URL > backup_pre_stripe_connect_$(date +%Y%m%d).sql
  ```

- [ ] **Criar branch Git dedicada**
  ```bash
  git checkout -b feature/stripe-connect-integration
  git push -u origin feature/stripe-connect-integration
  ```

- [ ] **Documentar estado atual**
  - Listar todos os profissionais ativos
  - Verificar pagamentos pendentes
  - Listar transações em andamento

**✅ Checkpoint:** Backups criados e branch isolada

---

### 1.3 Variáveis de Ambiente
- [ ] **Adicionar novas variáveis no `.env`**
  
  **Backend (server/.env):**
  ```bash
  # Stripe Connect - ADICIONAR
  STRIPE_CONNECT_CLIENT_ID=ca_xxx...
  STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx...
  
  # Manter existentes
  STRIPE_SECRET_KEY=sk_test_xxx...
  STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
  FRONTEND_URL=http://localhost:5173
  BACKEND_URL=http://localhost:8080
  ```

- [ ] **Verificar variáveis em produção (Render/Netlify)**
  - Preparar para adicionar depois
  - Não adicionar ainda (só após testes)

**✅ Checkpoint:** Variáveis de ambiente configuradas

---

## 💾 FASE 2: BACKEND - DATABASE (1 hora)

### 2.1 Criar Migration SQL
- [ ] **Criar arquivo de migration**
  ```bash
  # Criar arquivo
  touch migrations/0012_add_stripe_connect_fields.sql
  ```

- [ ] **Adicionar colunas na tabela `professionals`**
  
  Arquivo: `migrations/0012_add_stripe_connect_fields.sql`
  ```sql
  -- Adicionar campos Stripe Connect à tabela professionals
  ALTER TABLE professionals 
  ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'not_connected',
  ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_connected_at TIMESTAMP NULL;

  -- Criar índice para busca rápida
  CREATE INDEX IF NOT EXISTS idx_professionals_stripe_account 
  ON professionals(stripe_account_id);

  -- Criar índice para status
  CREATE INDEX IF NOT EXISTS idx_professionals_stripe_status 
  ON professionals(stripe_account_status);

  -- Comentários para documentação
  COMMENT ON COLUMN professionals.stripe_account_id IS 'ID da conta Stripe Connect do profissional';
  COMMENT ON COLUMN professionals.stripe_account_status IS 'Status da conta: not_connected, pending, active, restricted';
  COMMENT ON COLUMN professionals.stripe_onboarding_completed IS 'Se profissional completou onboarding';
  COMMENT ON COLUMN professionals.stripe_details_submitted IS 'Se detalhes foram enviados ao Stripe';
  COMMENT ON COLUMN professionals.stripe_charges_enabled IS 'Se pode receber pagamentos';
  COMMENT ON COLUMN professionals.stripe_payouts_enabled IS 'Se pode fazer saques';
  ```

- [ ] **Rodar migration localmente**
  ```bash
  psql $DATABASE_URL -f migrations/0012_add_stripe_connect_fields.sql
  ```

- [ ] **Verificar se colunas foram criadas**
  ```bash
  psql $DATABASE_URL -c "\d professionals"
  ```

**✅ Checkpoint:** Tabela `professionals` atualizada com campos Stripe Connect

---

### 2.2 Atualizar Schema TypeScript
- [ ] **Editar `shared/schema.ts`**
  
  Localizar interface `Professional` e adicionar:
  ```typescript
  export interface Professional {
    // ... campos existentes ...
    
    // Stripe Connect - ADICIONAR
    stripeAccountId?: string | null;
    stripeAccountStatus?: 'not_connected' | 'pending' | 'active' | 'restricted';
    stripeOnboardingCompleted?: boolean;
    stripeDetailsSubmitted?: boolean;
    stripeChargesEnabled?: boolean;
    stripePayoutsEnabled?: boolean;
    stripeConnectedAt?: Date | null;
  }
  ```

- [ ] **Compilar TypeScript**
  ```bash
  npm run build
  ```

- [ ] **Verificar se não há erros de tipo**

**✅ Checkpoint:** Schema TypeScript atualizado

---

### 2.3 Atualizar Storage Functions
- [ ] **Editar `server/storage.ts`**
  
  **Adicionar funções para Stripe Connect:**
  ```typescript
  // ADICIONAR após as funções existentes de Professional
  
  /**
   * Atualiza dados Stripe Connect de um profissional
   */
  async updateProfessionalStripeAccount(
    professionalId: number,
    data: {
      stripeAccountId?: string;
      stripeAccountStatus?: string;
      stripeOnboardingCompleted?: boolean;
      stripeDetailsSubmitted?: boolean;
      stripeChargesEnabled?: boolean;
      stripePayoutsEnabled?: boolean;
      stripeConnectedAt?: Date;
    }
  ): Promise<Professional> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCounter = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Converter camelCase para snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateFields.push(`${snakeKey} = $${paramCounter}`);
        updateValues.push(value);
        paramCounter++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    updateValues.push(professionalId);

    const query = `
      UPDATE professionals 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await this.db.query(query, updateValues);
    return result.rows[0];
  }

  /**
   * Busca profissional por Stripe Account ID
   */
  async getProfessionalByStripeAccountId(stripeAccountId: string): Promise<Professional | null> {
    const result = await this.db.query(
      'SELECT * FROM professionals WHERE stripe_account_id = $1',
      [stripeAccountId]
    );
    return result.rows[0] || null;
  }

  /**
   * Lista profissionais que precisam conectar Stripe
   */
  async getProfessionalsWithoutStripeConnect(): Promise<Professional[]> {
    const result = await this.db.query(`
      SELECT * FROM professionals 
      WHERE stripe_account_id IS NULL 
      OR stripe_onboarding_completed = FALSE
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  /**
   * Verifica se profissional pode receber pagamentos
   */
  async canProfessionalReceivePayments(professionalId: number): Promise<boolean> {
    const result = await this.db.query(
      `SELECT stripe_charges_enabled 
       FROM professionals 
       WHERE id = $1`,
      [professionalId]
    );
    return result.rows[0]?.stripe_charges_enabled === true;
  }
  ```

- [ ] **Compilar e verificar**
  ```bash
  npm run build
  ```

**✅ Checkpoint:** Storage atualizado com funções Stripe Connect

---

## 🔧 FASE 3: BACKEND - API STRIPE CONNECT (3-4 horas)

### 3.1 Criar Rotas de Onboarding
- [ ] **Editar `server/routes-simple.ts`**
  
  **Adicionar após as rotas de mensagens, antes das rotas de pagamento:**
  ```typescript
  // ==================== STRIPE CONNECT ROUTES ====================
  
  /**
   * 1. Criar conta Stripe Connect para profissional
   */
  app.post('/api/stripe/connect/create-account', authenticateToken, async (req, res) => {
    try {
      console.log('🔷 Criando conta Stripe Connect...');
      const user = req.user;

      // Verificar se é profissional
      if (user.userType !== 'provider') {
        return res.status(403).json({ error: 'Apenas profissionais podem conectar Stripe' });
      }

      // Buscar dados do profissional
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      // Verificar se já tem conta Connect
      if (professional.stripeAccountId && professional.stripeOnboardingCompleted) {
        return res.status(400).json({ 
          error: 'Você já tem uma conta Stripe conectada',
          accountId: professional.stripeAccountId,
        });
      }

      // Criar conta Stripe Connect
      console.log('📝 Criando conta Express para:', user.email);
      const account = await stripe.accounts.create({
        type: 'express',
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
          platform: 'lifebee',
        },
      });

      console.log('✅ Conta criada:', account.id);

      // Salvar no banco
      await storage.updateProfessionalStripeAccount(professional.id, {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
        stripeOnboardingCompleted: false,
      });

      // Criar link de onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=refresh`,
        return_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=success`,
        type: 'account_onboarding',
      });

      console.log('✅ Link de onboarding criado');

      res.json({
        success: true,
        accountId: account.id,
        onboardingUrl: accountLink.url,
      });
    } catch (error) {
      console.error('❌ Erro ao criar conta Connect:', error);
      res.status(500).json({ 
        error: 'Erro ao criar conta Stripe Connect',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * 2. Verificar status da conta Stripe Connect
   */
  app.get('/api/stripe/connect/account-status', authenticateToken, async (req, res) => {
    try {
      const user = req.user;

      if (user.userType !== 'provider') {
        return res.status(403).json({ error: 'Apenas profissionais' });
      }

      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      // Se não tem conta Connect
      if (!professional.stripeAccountId) {
        return res.json({
          connected: false,
          needsOnboarding: true,
        });
      }

      // Buscar dados da conta no Stripe
      const account = await stripe.accounts.retrieve(professional.stripeAccountId);

      console.log('📊 Status da conta:', {
        id: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      });

      // Atualizar dados locais
      await storage.updateProfessionalStripeAccount(professional.id, {
        stripeDetailsSubmitted: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingCompleted: account.details_submitted,
        stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
      });

      res.json({
        connected: true,
        accountId: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        needsOnboarding: !account.details_submitted,
      });
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      res.status(500).json({ error: 'Erro ao verificar status da conta' });
    }
  });

  /**
   * 3. Criar novo link de onboarding (se expirou)
   */
  app.post('/api/stripe/connect/refresh-onboarding', authenticateToken, async (req, res) => {
    try {
      const user = req.user;

      if (user.userType !== 'provider') {
        return res.status(403).json({ error: 'Apenas profissionais' });
      }

      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional || !professional.stripeAccountId) {
        return res.status(404).json({ error: 'Conta Stripe não encontrada' });
      }

      // Criar novo link
      const accountLink = await stripe.accountLinks.create({
        account: professional.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=refresh`,
        return_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=success`,
        type: 'account_onboarding',
      });

      res.json({
        success: true,
        onboardingUrl: accountLink.url,
      });
    } catch (error) {
      console.error('❌ Erro ao criar link:', error);
      res.status(500).json({ error: 'Erro ao criar link de onboarding' });
    }
  });

  /**
   * 4. Criar dashboard link (para profissional acessar dashboard Stripe)
   */
  app.post('/api/stripe/connect/dashboard-link', authenticateToken, async (req, res) => {
    try {
      const user = req.user;

      if (user.userType !== 'provider') {
        return res.status(403).json({ error: 'Apenas profissionais' });
      }

      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional || !professional.stripeAccountId) {
        return res.status(404).json({ error: 'Conta Stripe não encontrada' });
      }

      // Criar login link
      const loginLink = await stripe.accounts.createLoginLink(professional.stripeAccountId);

      res.json({
        success: true,
        dashboardUrl: loginLink.url,
      });
    } catch (error) {
      console.error('❌ Erro ao criar dashboard link:', error);
      res.status(500).json({ error: 'Erro ao criar link do dashboard' });
    }
  });
  ```

**✅ Checkpoint:** Rotas de onboarding criadas

---

### 3.2 Atualizar Rota de Payment Intent
- [ ] **Editar rota `/api/payment/create-intent` em `server/routes-simple.ts`**
  
  **Substituir a função existente por:**
  ```typescript
  app.post('/api/payment/create-intent', authenticateToken, async (req, res) => {
    try {
      console.log('🔷 Criando Payment Intent com Stripe Connect...');
      console.log('👤 User from token:', req.user);
      const { serviceOfferId } = req.body;

      if (!serviceOfferId) {
        return res.status(400).json({ error: 'serviceOfferId é obrigatório' });
      }

      // Busca dados necessários (código existente mantido)
      console.log(`🔍 Buscando proposta ID: ${serviceOfferId}`);
      const serviceOffer = await storage.getServiceOfferById(serviceOfferId);
      
      if (!serviceOffer) {
        return res.status(404).json({ error: 'Oferta de serviço não encontrada' });
      }

      const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: 'Solicitação de serviço não encontrada' });
      }

      const professional = await storage.getProfessionalById(serviceOffer.professionalId);
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      // ✨ NOVO: Verificar se profissional tem Stripe Connect configurado
      if (!professional.stripeAccountId) {
        console.log('⚠️ Profissional não tem conta Stripe Connect');
        return res.status(400).json({ 
          error: 'Profissional precisa conectar sua conta Stripe primeiro',
          errorCode: 'STRIPE_NOT_CONNECTED',
          needsStripeSetup: true,
        });
      }

      if (!professional.stripeChargesEnabled) {
        console.log('⚠️ Profissional não pode receber pagamentos ainda');
        return res.status(400).json({ 
          error: 'Profissional ainda não completou configuração do Stripe',
          errorCode: 'STRIPE_NOT_ENABLED',
          needsStripeSetup: true,
        });
      }

      // Cálculos (código existente mantido)
      const rawPrice = serviceOffer.finalPrice || serviceOffer.proposedPrice;
      if (!rawPrice || isNaN(parseFloat(rawPrice))) {
        return res.status(400).json({ error: 'Preço inválido na oferta de serviço' });
      }

      const amount = parseFloat(rawPrice);
      const minimumAmount = 5.00;
      const finalAmount = Math.max(amount, minimumAmount);
      
      // ✨ Calcular taxa LifeBee (5%)
      const lifebeeCommissionPercent = 0.05;
      const lifebeeCommission = Math.round(finalAmount * 100 * lifebeeCommissionPercent); // em centavos
      const professionalAmount = Math.round(finalAmount * 100) - lifebeeCommission;

      console.log('💰 Valores:');
      console.log(`   Total: R$ ${finalAmount.toFixed(2)}`);
      console.log(`   LifeBee (5%): R$ ${(lifebeeCommission / 100).toFixed(2)}`);
      console.log(`   Profissional (95%): R$ ${(professionalAmount / 100).toFixed(2)}`);

      if (!stripe) {
        return res.status(503).json({ 
          error: 'Stripe não configurado',
          message: 'Configure STRIPE_SECRET_KEY para habilitar pagamentos'
        });
      }

      // ✨ NOVO: Criar Payment Intent com Stripe Connect
      console.log(`🚀 Criando Payment Intent com Connect...`);
      console.log(`   Conta destino: ${professional.stripeAccountId}`);
      
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
          lifebeeCommission: (lifebeeCommission / 100).toFixed(2),
          professionalAmount: (professionalAmount / 100).toFixed(2),
        },
      });

      console.log('✅ Payment Intent criado:', paymentIntent.id);

      // Salvar referência (código existente mantido)
      const paymentReference = await storage.createPaymentReference({
        serviceRequestId: serviceOffer.serviceRequestId,
        serviceOfferId: serviceOffer.id,
        clientId: serviceRequest.clientId,
        professionalId: serviceOffer.professionalId,
        amount: finalAmount.toFixed(2),
        preferenceId: paymentIntent.id,
        status: 'pending',
        externalReference: paymentIntent.id,
      });

      console.log('✅ Payment criado com sucesso!');

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentReferenceId: paymentReference.id,
      });
    } catch (error) {
      console.error('❌ Erro ao criar Payment Intent:', error);
      res.status(500).json({ 
        error: 'Erro ao criar pagamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
  ```

**✅ Checkpoint:** Payment Intent atualizado para Stripe Connect

---

### 3.3 Atualizar Webhook
- [ ] **Editar webhook em `server/routes-simple.ts`**
  
  **A lógica do webhook continua a mesma! Apenas adicionar logs:**
  ```typescript
  case 'payment_intent.succeeded':
    const paymentIntent = event.data.object;
    console.log('✅ Pagamento aprovado com Stripe Connect:', paymentIntent.id);
    console.log('💰 Split realizado:');
    console.log(`   - LifeBee: R$ ${paymentIntent.metadata.lifebeeCommission}`);
    console.log(`   - Profissional: R$ ${paymentIntent.metadata.professionalAmount}`);
    
    // Resto do código continua igual...
  ```

**✅ Checkpoint:** Webhook atualizado

---

### 3.4 Testar Backend
- [ ] **Iniciar servidor**
  ```bash
  cd server
  npm run dev
  ```

- [ ] **Testar rotas com curl/Postman**
  ```bash
  # 1. Verificar status (sem token, deve dar erro)
  curl http://localhost:8080/api/stripe/connect/account-status
  
  # 2. Criar conta (precisa de token de profissional)
  # Use o token do Postman ou do navegador
  ```

- [ ] **Verificar logs no console**
  - Mensagens claras de debug
  - Sem erros de TypeScript
  - Stripe respondendo corretamente

**✅ Checkpoint:** Backend funcionando

---

## 🎨 FASE 4: FRONTEND - ONBOARDING (2-3 horas)

### 4.1 Criar Componente de Stripe Connect
- [ ] **Criar `client/src/components/stripe-connect-setup.tsx`**
  ```typescript
  import { useState, useEffect } from "react";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";

  interface StripeConnectStatus {
    connected: boolean;
    needsOnboarding: boolean;
    accountId?: string;
    detailsSubmitted?: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  }

  export function StripeConnectSetup() {
    const [status, setStatus] = useState<StripeConnectStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Verificar status ao carregar
    useEffect(() => {
      checkStatus();
      
      // Verificar query params (retorno do Stripe)
      const params = new URLSearchParams(window.location.search);
      if (params.get('stripe_setup') === 'success') {
        setTimeout(() => checkStatus(), 2000);
      }
    }, []);

    const checkStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/stripe/connect/account-status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao verificar status');
        }

        const data = await response.json();
        setStatus(data);
      } catch (err) {
        console.error('Erro ao verificar status:', err);
        setError('Erro ao carregar informações do Stripe');
      } finally {
        setLoading(false);
      }
    };

    const startOnboarding = async () => {
      try {
        setActionLoading(true);
        setError(null);

        const response = await fetch('/api/stripe/connect/create-account', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao conectar Stripe');
        }

        const data = await response.json();
        
        // Redirecionar para onboarding do Stripe
        window.location.href = data.onboardingUrl;
      } catch (err) {
        console.error('Erro ao iniciar onboarding:', err);
        setError(err instanceof Error ? err.message : 'Erro ao conectar Stripe');
        setActionLoading(false);
      }
    };

    const refreshOnboarding = async () => {
      try {
        setActionLoading(true);
        setError(null);

        const response = await fetch('/api/stripe/connect/refresh-onboarding', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao criar novo link');
        }

        const data = await response.json();
        window.location.href = data.onboardingUrl;
      } catch (err) {
        console.error('Erro ao refresh:', err);
        setError('Erro ao criar novo link de configuração');
        setActionLoading(false);
      }
    };

    const openDashboard = async () => {
      try {
        setActionLoading(true);

        const response = await fetch('/api/stripe/connect/dashboard-link', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao abrir dashboard');
        }

        const data = await response.json();
        window.open(data.dashboardUrl, '_blank');
      } catch (err) {
        console.error('Erro ao abrir dashboard:', err);
        setError('Erro ao abrir dashboard do Stripe');
      } finally {
        setActionLoading(false);
      }
    };

    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Configuração de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Pagamentos - Stripe</CardTitle>
          <CardDescription>
            Conecte sua conta Stripe para receber pagamentos automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Não conectado */}
          {!status?.connected && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Configure sua conta para receber pagamentos</strong>
                <p className="text-sm mt-2">
                  Você precisa conectar uma conta Stripe para poder receber pagamentos 
                  dos seus serviços. É rápido, seguro e gratuito!
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Conectado mas precisa completar onboarding */}
          {status?.connected && status?.needsOnboarding && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Complete sua configuração</strong>
                <p className="text-sm mt-2">
                  Você começou a configuração mas ainda precisa completar algumas informações.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Totalmente configurado */}
          {status?.connected && !status?.needsOnboarding && status?.chargesEnabled && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ Conta Stripe Conectada e Ativa!</strong>
                <p className="text-sm mt-2">
                  Sua conta está configurada e você pode receber pagamentos. 
                  Os valores serão depositados automaticamente em sua conta.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Status detalhado */}
          {status?.connected && (
            <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
              <h4 className="font-medium mb-3">Status da Conta:</h4>
              
              <div className="flex items-center gap-2 text-sm">
                {status.detailsSubmitted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Informações enviadas</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {status.chargesEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Pode receber pagamentos</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {status.payoutsEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Pode fazer saques</span>
              </div>

              {status.accountId && (
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                  ID da conta: {status.accountId}
                </div>
              )}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!status?.connected && (
              <Button 
                onClick={startOnboarding} 
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  'Conectar Stripe'
                )}
              </Button>
            )}

            {status?.connected && status?.needsOnboarding && (
              <Button 
                onClick={refreshOnboarding} 
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Completar Configuração'
                )}
              </Button>
            )}

            {status?.connected && status?.chargesEnabled && (
              <Button 
                onClick={openDashboard} 
                disabled={actionLoading}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Dashboard Stripe
              </Button>
            )}

            <Button 
              onClick={checkStatus} 
              disabled={loading}
              variant="outline"
            >
              Atualizar Status
            </Button>
          </div>

          {/* Informações adicionais */}
          <div className="text-xs text-gray-500 pt-4 border-t space-y-1">
            <p>• Seus dados são protegidos pelo Stripe</p>
            <p>• Não cobramos taxas adicionais pela conexão</p>
            <p>• Você pode desconectar a qualquer momento</p>
            <p>• Os pagamentos são depositados automaticamente</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  ```

**✅ Checkpoint:** Componente criado

---

### 4.2 Adicionar em Settings/Profile
- [ ] **Editar `client/src/pages/provider-settings.tsx` (ou similar)**
  
  Se não existir página de settings, adicionar em `provider-profile.tsx`:
  ```typescript
  import { StripeConnectSetup } from "@/components/stripe-connect-setup";

  // Dentro do componente, adicionar seção:
  <div className="space-y-6">
    {/* Seções existentes... */}
    
    {/* Nova seção Stripe Connect */}
    <StripeConnectSetup />
  </div>
  ```

**✅ Checkpoint:** Componente integrado

---

## 🎨 FASE 5: FRONTEND - UI UPDATES (1-2 horas)

### 5.1 Atualizar PaymentButton
- [ ] **Editar `client/src/components/payment-button.tsx`**
  
  **Adicionar tratamento de erro quando profissional não tem Stripe:**
  ```typescript
  // Na função createPaymentIntent:
  try {
    const response = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ serviceOfferId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // ✨ NOVO: Tratar erro de Stripe não configurado
      if (errorData.errorCode === 'STRIPE_NOT_CONNECTED' || 
          errorData.errorCode === 'STRIPE_NOT_ENABLED') {
        toast({
          title: "Profissional precisa configurar Stripe",
          description: "O profissional ainda não conectou sua conta Stripe. Por favor, aguarde enquanto ele completa a configuração.",
          variant: "destructive",
        });
        return null;
      }
      
      throw new Error(errorData.error || 'Erro ao criar pagamento');
    }

    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    // ... resto do código
  }
  ```

**✅ Checkpoint:** PaymentButton atualizado

---

### 5.2 Adicionar Avisos no Dashboard
- [ ] **Editar `client/src/pages/provider-dashboard.tsx`**
  
  **Adicionar aviso se Stripe não configurado:**
  ```typescript
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { AlertTriangle } from "lucide-react";
  import { Link } from "wouter";

  // No início do componente:
  const [stripeConnected, setStripeConnected] = useState(true);

  useEffect(() => {
    // Verificar status Stripe
    fetch('/api/stripe/connect/account-status', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setStripeConnected(data.connected && data.chargesEnabled);
      })
      .catch(err => console.error('Erro ao verificar Stripe:', err));
  }, []);

  // No JSX, antes do conteúdo principal:
  {!stripeConnected && (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>⚠️ Configure sua conta Stripe para receber pagamentos</strong>
        <p className="text-sm mt-1">
          Você não poderá receber pagamentos até conectar sua conta Stripe.{' '}
          <Link href="/settings" className="underline font-medium">
            Configurar agora
          </Link>
        </p>
      </AlertDescription>
    </Alert>
  )}
  ```

**✅ Checkpoint:** Avisos adicionados

---

## 🧪 FASE 6: TESTES (2-3 horas)

### 6.1 Teste Local - Onboarding
- [ ] **Preparar ambiente de teste**
  ```bash
  # Terminal 1: Backend
  cd server
  npm run dev

  # Terminal 2: Frontend
  cd client
  npm run dev
  ```

- [ ] **Criar conta de profissional de teste**
  - Registrar novo profissional
  - Fazer login
  
- [ ] **Testar fluxo de onboarding**
  - [ ] Ir em Settings/Perfil
  - [ ] Ver componente Stripe Connect
  - [ ] Clicar em "Conectar Stripe"
  - [ ] Ser redirecionado para Stripe
  - [ ] Completar formulário no Stripe:
    - Nome completo
    - CPF (use CPF válido de teste)
    - Data de nascimento
    - Endereço
    - Dados bancários (pode ser fake para teste)
  - [ ] Clicar em "Enviar"
  - [ ] Ser redirecionado de volta para LifeBee
  - [ ] Ver status "✅ Conectado"

- [ ] **Verificar no banco de dados**
  ```sql
  SELECT id, name, stripe_account_id, stripe_account_status, 
         stripe_charges_enabled, stripe_payouts_enabled
  FROM professionals 
  WHERE stripe_account_id IS NOT NULL;
  ```

- [ ] **Verificar no Stripe Dashboard**
  - Acessar https://dashboard.stripe.com/connect/accounts
  - Ver conta do profissional criada
  - Status: Active

**✅ Checkpoint:** Onboarding funcionando

---

### 6.2 Teste Local - Pagamento
- [ ] **Criar proposta como profissional conectado**
  - Login como profissional (com Stripe configurado)
  - Criar proposta para um serviço
  - Valor: R$ 10,00 (para teste)

- [ ] **Aceitar proposta como cliente**
  - Login como cliente
  - Aceitar a proposta

- [ ] **Realizar pagamento**
  - [ ] Clicar em "Pagar"
  - [ ] Ver formulário de cartão
  - [ ] Usar cartão de teste: `4242 4242 4242 4242`
  - [ ] Validade: 12/34
  - [ ] CVV: 123
  - [ ] Clicar em "Pagar"
  - [ ] Ver sucesso

- [ ] **Verificar split no Stripe Dashboard**
  - Ir em https://dashboard.stripe.com/payments
  - Ver pagamento de R$ 10,00
  - Clicar no pagamento
  - Ver "Application Fee: R$ 0,50" (5%)
  - Ver "Transfer: R$ 9,50" para conta do profissional

- [ ] **Verificar notificações**
  - Profissional deve receber notificação de pagamento
  - Cliente deve ver serviço como pago

- [ ] **Verificar no banco**
  ```sql
  SELECT * FROM service_offers WHERE id = [ID_DA_PROPOSTA];
  SELECT * FROM payment_references WHERE service_offer_id = [ID_DA_PROPOSTA];
  ```

**✅ Checkpoint:** Pagamento com split funcionando!

---

### 6.3 Testes de Erro
- [ ] **Teste: Profissional sem Stripe tenta receber pagamento**
  - Criar profissional sem Stripe
  - Cliente tenta pagar
  - Deve ver erro claro
  
- [ ] **Teste: Profissional com Stripe incompleto**
  - Iniciar onboarding mas não completar
  - Cliente tenta pagar
  - Deve ver erro

- [ ] **Teste: Link de onboarding expirado**
  - Deixar link expirar (expira em 1 hora)
  - Clicar em "Refresh Onboarding"
  - Deve criar novo link

- [ ] **Teste: Pagamento abaixo do mínimo**
  - Criar proposta de R$ 1,00
  - Sistema deve ajustar para R$ 5,00

**✅ Checkpoint:** Todos os testes passando

---

## 🚀 FASE 7: DEPLOY E MONITORAMENTO (1 hora)

### 7.1 Preparar para Produção
- [ ] **Atualizar variáveis no Render**
  - Ir em Render Dashboard
  - Adicionar variáveis:
    ```
    STRIPE_CONNECT_CLIENT_ID=ca_xxx...
    STRIPE_SECRET_KEY=sk_live_xxx... (usar chave LIVE)
    STRIPE_PUBLISHABLE_KEY=pk_live_xxx... (usar chave LIVE)
    ```

- [ ] **Rodar migration em produção**
  ```bash
  # Conectar ao banco de produção
  psql $PRODUCTION_DATABASE_URL -f migrations/0012_add_stripe_connect_fields.sql
  ```

- [ ] **Merge branch e deploy**
  ```bash
  git add .
  git commit -m "feat: Implementar Stripe Connect para split automático de pagamentos"
  git push origin feature/stripe-connect-integration
  
  # Criar Pull Request no GitHub
  # Revisar código
  # Merge para main
  ```

**✅ Checkpoint:** Deploy realizado

---

### 7.2 Configurar Webhooks em Produção
- [ ] **Criar webhook no Stripe Dashboard**
  - URL: `https://seu-dominio.com/api/payment/webhook`
  - Eventos: 
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
    - `account.updated`
  - Copiar signing secret

- [ ] **Atualizar variável no Render**
  ```
  STRIPE_WEBHOOK_SECRET=whsec_xxx...
  ```

- [ ] **Testar webhook**
  - Fazer pagamento de teste em produção
  - Verificar logs no Render
  - Confirmar que webhook foi recebido

**✅ Checkpoint:** Webhooks funcionando em produção

---

### 7.3 Monitoramento
- [ ] **Configurar alertas no Stripe Dashboard**
  - Ir em Settings > Notifications
  - Ativar alertas para:
    - Pagamentos com erro
    - Disputas
    - Problemas com contas Connect

- [ ] **Criar dashboard de monitoramento**
  - Quantos profissionais conectados
  - Quantos pendentes
  - Total de pagamentos processados
  - Total de comissões

**✅ Checkpoint:** Monitoramento ativo

---

## 👥 FASE 8: MIGRAÇÃO DE PROFISSIONAIS EXISTENTES (variável)

### 8.1 Comunicação
- [ ] **Criar email para profissionais**
  ```
  Assunto: 🎉 Novidade! Receba pagamentos automaticamente

  Olá [Nome],

  Temos uma ótima notícia! Agora você pode receber seus pagamentos 
  automaticamente através do Stripe.

  O que mudou:
  - Pagamentos caem direto na sua conta
  - Sem necessidade de esperar repasses
  - Mais rápido e seguro
  - Dashboard para acompanhar ganhos

  O que você precisa fazer:
  1. Acessar seu perfil no LifeBee
  2. Ir em "Configurações de Pagamento"
  3. Clicar em "Conectar Stripe"
  4. Preencher seus dados (leva 5 minutos)

  Após conectar, você já pode receber pagamentos automaticamente!

  Qualquer dúvida, estamos à disposição.

  Equipe LifeBee
  ```

- [ ] **Adicionar banner no app**
  - Banner no topo para profissionais não conectados
  - "Configure o Stripe e receba pagamentos automáticos!"

**✅ Checkpoint:** Comunicação enviada

---

### 8.2 Suporte
- [ ] **Preparar FAQ**
  - Por que preciso conectar Stripe?
  - É seguro?
  - Quanto custa?
  - Quanto tempo leva?
  - E se eu já recebi pagamentos?

- [ ] **Preparar equipe**
  - Treinar suporte sobre Stripe Connect
  - Ter respostas prontas para dúvidas comuns

**✅ Checkpoint:** Suporte preparado

---

### 8.3 Acompanhamento
- [ ] **Monitorar adoção**
  ```sql
  -- Profissionais conectados
  SELECT COUNT(*) as conectados
  FROM professionals 
  WHERE stripe_charges_enabled = true;

  -- Profissionais pendentes
  SELECT COUNT(*) as pendentes
  FROM professionals 
  WHERE stripe_account_id IS NULL;

  -- Taxa de conversão
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN stripe_charges_enabled THEN 1 ELSE 0 END) as conectados,
    ROUND(100.0 * SUM(CASE WHEN stripe_charges_enabled THEN 1 ELSE 0 END) / COUNT(*), 2) as percentual
  FROM professionals;
  ```

- [ ] **Fazer follow-up**
  - Após 3 dias: email lembrando
  - Após 7 dias: mensagem no app
  - Após 14 dias: contato direto

**✅ Checkpoint:** Migração em andamento

---

## ✅ CHECKLIST FINAL

### Pré-Deploy
- [ ] Todos os testes locais passando
- [ ] Migration rodada com sucesso
- [ ] Código revisado
- [ ] Sem erros de lint/TypeScript
- [ ] Documentação atualizada
- [ ] Backup do banco realizado

### Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Migration rodada em produção
- [ ] Deploy realizado sem erros
- [ ] Webhooks configurados
- [ ] Primeiro teste em produção OK

### Pós-Deploy
- [ ] Profissionais notificados
- [ ] Suporte preparado
- [ ] Monitoramento ativo
- [ ] Primeiras conversões acontecendo
- [ ] Nenhum erro crítico reportado

---

## 🚨 ROLLBACK PLAN

Se algo der muito errado, aqui está como reverter:

### Reverter Código
```bash
git revert HEAD
git push origin main
```

### Reverter Database (apenas se necessário!)
```sql
-- ATENÇÃO: Só fazer se realmente necessário!
ALTER TABLE professionals 
DROP COLUMN IF EXISTS stripe_account_id,
DROP COLUMN IF EXISTS stripe_account_status,
DROP COLUMN IF EXISTS stripe_onboarding_completed,
DROP COLUMN IF EXISTS stripe_details_submitted,
DROP COLUMN IF EXISTS stripe_charges_enabled,
DROP COLUMN IF EXISTS stripe_payouts_enabled,
DROP COLUMN IF EXISTS stripe_connected_at;
```

### Desativar Rotas Temporariamente
```typescript
// No início de cada rota Stripe Connect, adicionar:
return res.status(503).json({ error: 'Stripe Connect temporariamente desativado' });
```

---

## 📊 MÉTRICAS DE SUCESSO

Após 30 dias da migração, avaliar:

- [ ] **Adoção:** Pelo menos 70% dos profissionais conectados
- [ ] **Pagamentos:** 100% dos pagamentos usando Stripe Connect
- [ ] **Erros:** Menos de 1% de falha em pagamentos
- [ ] **Suporte:** Menos de 5 tickets sobre Stripe por semana
- [ ] **Satisfação:** NPS positivo sobre novo sistema

---

## 📝 NOTAS E OBSERVAÇÕES

Use este espaço para anotar problemas encontrados, soluções, ou ideias:

```
Data: ___/___/___
Fase: ___________
Nota: 





```

---

## 🎉 CONCLUSÃO

Quando todas as fases estiverem completas, você terá:

✅ Sistema PSP profissional  
✅ Split automático de pagamentos  
✅ Compliance legal garantido  
✅ Profissionais recebendo automaticamente  
✅ Redução de 90% no trabalho operacional  
✅ Escalabilidade infinita  

**Parabéns! 🚀**

---

## 📞 RECURSOS DE SUPORTE

- **Documentação Stripe Connect:** https://stripe.com/docs/connect
- **Suporte Stripe:** https://support.stripe.com/
- **Stripe Status:** https://status.stripe.com/
- **Documentação LifeBee:** `SISTEMA-PSP-STRIPE-COMPLETO.md`

---

**Última atualização:** 2025-01-XX  
**Versão:** 1.0  
**Status:** 🟡 Em Progresso / 🟢 Completo

