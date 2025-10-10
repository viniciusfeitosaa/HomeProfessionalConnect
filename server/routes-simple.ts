
import type { Express } from "express";
import express from "express";
import { storage } from "./storage.js";
import { authenticateToken, generateToken, verifyPassword, hashPassword } from "./auth.js";
import { Request, Response } from "express";
import Stripe from 'stripe';

// Configure Stripe
console.log(`🔧 Inicializando Stripe...`);
console.log(`🔑 STRIPE_SECRET_KEY presente: ${process.env.STRIPE_SECRET_KEY ? 'Sim' : 'Não'}`);
console.log(`🔑 STRIPE_SECRET_KEY início: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`);

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
  console.log(`✅ Stripe inicializado com sucesso`);
} else {
  console.log(`⚠️ Stripe desabilitado - configure STRIPE_SECRET_KEY para habilitar pagamentos`);
}

export function setupRoutes(app: Express, redisClient: any) {
  app.get('/api/payment/config', (req, res) => {
    try {
      const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLIC_KEY;

      if (!publishableKey) {
        console.error('❌ STRIPE_PUBLISHABLE_KEY não configurada');
        return res.status(500).json({
          error: 'Chave pública do Stripe não configurada. Defina STRIPE_PUBLISHABLE_KEY nas variáveis de ambiente.'
        });
      }

      res.json({
        publishableKey,
      });
    } catch (error) {
      console.error('❌ Erro ao obter configuração do Stripe:', error);
      res.status(500).json({ error: 'Erro interno ao obter configuração do Stripe' });
    }
  });
  
  // ==================== STRIPE TEST ROUTE ====================
  app.get('/api/payment/test-stripe', async (req, res) => {
    try {
      console.log(`🧪 Testando Stripe...`);
      
      if (!stripe) {
        return res.status(503).json({ 
          error: 'Stripe não configurado',
          message: 'Configure STRIPE_SECRET_KEY para habilitar pagamentos'
        });
      }

      // Teste simples: criar um Payment Intent de R$ 5,00
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, // R$ 5,00 em centavos
        currency: 'brl',
        payment_method_types: ['card', 'boleto'],
        metadata: {
          test: 'true'
        },
      });
      
      console.log(`✅ Payment Intent criado: ${paymentIntent.id}`);
      
      res.json({
        success: true,
        message: 'Stripe funcionando corretamente',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error) {
      console.error(`❌ Erro no teste do Stripe:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      });
    }
  });

  // ==================== MESSAGING ROUTES ====================
  app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      console.log('🔍 GET /api/messages - Usuário autenticado:', user.id, user.userType);

      const conversations = await storage.getConversationsByUser(user.id);
      console.log('📋 Conversas encontradas:', conversations.length);

      const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
        const lastMessage = await storage.getLastMessageByConversation(conv.id);
        const unreadCount = await storage.getUnreadMessageCount(conv.id, user.id);

        if (user.userType === 'provider') {
          const client = await storage.getUser(conv.clientId);
          return {
            id: conv.id,
            clientId: conv.clientId,
            clientName: client?.name || 'Cliente',
            clientAvatar: client?.profileImage || '',
            professionalId: conv.professionalId,
            professionalName: user.name || 'Profissional',
            professionalAvatar: user.profileImage || '',
            specialization: '',
            lastMessage: lastMessage?.content || 'Nenhuma mensagem',
            lastMessageTime: lastMessage?.timestamp || conv.createdAt,
            unreadCount,
            isOnline: Math.random() > 0.5,
            rating: 5.0,
            location: client && (client as any).city ? (client as any).city : '',
            messages: await storage.getMessagesByConversation(conv.id)
          };
        }

        // O professionalId na tabela conversations é o userId, não o id da tabela professionals
        const professional = await storage.getProfessionalByUserId(conv.professionalId);

        return {
          id: conv.id,
          clientId: conv.clientId,
          professionalId: conv.professionalId,
          professionalName: professional?.name || 'Profissional',
          professionalAvatar: professional?.imageUrl ? storage['getFullImageUrl']?.(professional.imageUrl) ?? professional.imageUrl : '',
          specialization: professional?.specialization || '',
          lastMessage: lastMessage?.content || 'Nenhuma mensagem',
          lastMessageTime: lastMessage?.timestamp || conv.createdAt,
          unreadCount,
          isOnline: Math.random() > 0.5,
          rating: Number(professional?.rating) || 5.0,
          location: professional?.location || '',
          messages: await storage.getMessagesByConversation(conv.id)
        };
      }));

      res.json(enrichedConversations);
    } catch (error) {
      console.error('❌ Erro ao buscar conversas:', error);
      res.status(500).json({ message: 'Erro interno ao buscar conversas' });
    }
  });

  app.get('/api/messages/:conversationId', authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = req.user;

      const conversation = await storage.getMessagesByConversation(parseInt(conversationId));

      if (!conversation) {
        return res.status(404).json({ message: 'Conversa não encontrada' });
      }

      // Marcar mensagens como lidas (se houver lógica no storage)
      try {
        await storage.markMessagesAsRead?.(parseInt(conversationId), user.id);
      } catch (err) {
        console.warn('⚠️ Não foi possível marcar mensagens como lidas:', err);
      }

      res.json(conversation);
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens da conversa:', error);
      res.status(500).json({ message: 'Erro interno ao buscar mensagens' });
    }
  });

  app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { recipientId, content, type, conversationId } = req.body;

      if (!recipientId || !content || !conversationId) {
        return res.status(400).json({ message: 'Destinatário, conversa e conteúdo são obrigatórios' });
      }

      const conversations = await storage.getConversationsByUser(user.id);
      const isParticipant = conversations.some(conv => conv.id === conversationId);

      if (!isParticipant) {
        const isDeletedByUser = await storage.isConversationDeletedByUser?.(conversationId, user.id);
        if (isDeletedByUser) {
          await storage.restoreConversation?.(conversationId, user.id);
        } else {
          return res.status(403).json({ message: 'Acesso negado à conversa' });
        }
      }

      const isDeletedByRecipient = await storage.isConversationDeletedByUser?.(conversationId, recipientId);
      if (isDeletedByRecipient) {
        await storage.restoreConversation?.(conversationId, recipientId);
      }

      const message = await storage.createMessage({
        conversationId,
        senderId: user.id,
        recipientId,
        content,
        type: type || 'text',
        isRead: false
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      res.status(500).json({ message: 'Erro interno ao enviar mensagem' });
    }
  });

  app.post('/api/messages/start-conversation', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { professionalId, message } = req.body;

      console.log('🔍 Iniciando conversa:', {
        userId: user.id,
        professionalId,
        message: message?.substring(0, 50)
      });

      // O professionalId que vem das propostas é na verdade o userId do profissional
      const professional = await storage.getProfessionalByUserId(professionalId);
      
      console.log('👤 Profissional encontrado:', professional ? {
        id: professional.id,
        userId: professional.userId,
        name: professional.name
      } : 'null');
      
      if (!professional) {
        console.warn('⚠️ Profissional não encontrado para userId:', professionalId);
        return res.status(404).json({ message: 'Profissional não encontrado' });
      }

      const existingConversation = await storage.getConversation(user.id, professionalId);

      let conversationId: number;

      if (existingConversation) {
        const isDeletedByUser = await storage.isConversationDeletedByUser?.(existingConversation.id, user.id);
        if (isDeletedByUser) {
          await storage.restoreConversation?.(existingConversation.id, user.id);
        }

        const isDeletedByProfessional = await storage.isConversationDeletedByUser?.(existingConversation.id, professionalId);
        if (isDeletedByProfessional) {
          await storage.restoreConversation?.(existingConversation.id, professionalId);
        }

        conversationId = existingConversation.id;
      } else {
        const conversation = await storage.createConversation({
          clientId: user.id,
          professionalId,
        });
        conversationId = conversation.id;
      }

      const newMessage = await storage.createMessage({
        conversationId,
        senderId: user.id,
        recipientId: professionalId,
        content: message || 'Olá! Gostaria de conversar sobre seus serviços.',
        type: 'text',
        isRead: false
      });

      res.status(201).json({ conversationId, message: newMessage });
    } catch (error) {
      console.error('❌ Erro ao iniciar conversa:', error);
      res.status(500).json({ message: 'Erro interno ao iniciar conversa' });
    }
  });

  app.delete('/api/messages/conversation/:conversationId', authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = req.user;

      await storage.deleteConversation?.(parseInt(conversationId), user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Erro ao excluir conversa:', error);
      res.status(500).json({ message: 'Erro interno ao excluir conversa' });
    }
  });

  // ==================== DATABASE TEST ROUTE ====================
  app.get('/api/payment/test-db', async (req, res) => {
    try {
      console.log(`🧪 Testando banco de dados...`);
      
      // Teste: buscar propostas para um cliente específico
      const offers = await storage.getServiceOffersForClient(21); // ID do cliente teste
      console.log(`📋 Total de propostas encontradas: ${offers.length}`);
      
      if (offers.length > 0) {
        const firstOffer = offers[0];
        console.log(`📋 Primeira proposta:`, {
          id: firstOffer.id,
          proposedPrice: firstOffer.proposedPrice,
          finalPrice: firstOffer.finalPrice,
          status: firstOffer.status
        });
      }
      
      res.json({
        success: true,
        message: 'Banco de dados funcionando',
        totalOffers: offers.length,
        firstOffer: offers.length > 0 ? offers[0] : null
      });
    } catch (error) {
      console.error(`❌ Erro no teste do banco:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error
      });
    }
  });

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

      if (!stripe) {
        return res.status(503).json({ 
          error: 'Stripe não configurado',
          message: 'Configure STRIPE_SECRET_KEY para habilitar Stripe Connect'
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

      if (!stripe) {
        return res.status(503).json({ 
          error: 'Stripe não configurado'
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

      if (!stripe) {
        return res.status(503).json({ 
          error: 'Stripe não configurado'
        });
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

      if (!stripe) {
        return res.status(503).json({ 
          error: 'Stripe não configurado'
        });
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

  // ==================== STRIPE WEBHOOK ====================
  app.post('/api/payment/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (!stripe) {
      return res.status(503).json({ 
        error: 'Stripe não configurado',
        message: 'Configure STRIPE_SECRET_KEY para habilitar webhooks'
      });
    }

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('🔔 Webhook recebido:', event.type);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('✅ Pagamento aprovado:', paymentIntent.id);
        
        try {
          // Atualizar status do serviço para pago
          const serviceOfferId = paymentIntent.metadata.serviceOfferId;
          const professionalId = paymentIntent.metadata.professionalId;
          const clientId = paymentIntent.metadata.clientId;
          
          if (serviceOfferId) {
            // Buscar dados da proposta para obter o serviceRequestId
            const serviceOffer = await storage.getServiceOfferById(parseInt(serviceOfferId));
            if (!serviceOffer) {
              console.log('❌ Proposta não encontrada:', serviceOfferId);
              return res.status(404).json({ error: 'Proposta não encontrada' });
            }

            // Buscar dados do serviço
            const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
            if (!serviceRequest) {
              console.log('❌ Serviço não encontrado:', serviceOffer.serviceRequestId);
              return res.status(404).json({ error: 'Serviço não encontrado' });
            }

            // Atualizar status da proposta para concluída (pagamento realizado)
            await storage.updateServiceOfferStatus(parseInt(serviceOfferId), 'completed');
            console.log('✅ Proposta marcada como concluída');

            // Atualizar status do serviço para concluído se ainda não estiver
            if (serviceRequest.status !== 'completed') {
              await storage.updateServiceRequestStatus(serviceRequest.id, 'completed');
              console.log('✅ Serviço marcado como concluído automaticamente');
            }
            
            // Criar notificação para o profissional
            await storage.createNotification({
              userId: parseInt(professionalId),
              type: 'payment_received',
              title: 'Pagamento Recebido! 💰',
              message: `Seu pagamento de R$ ${(paymentIntent.amount / 100).toFixed(2)} foi aprovado. O serviço está concluído!`,
            });
            
            // Criar notificação para o cliente
            await storage.createNotification({
              userId: parseInt(clientId),
              type: 'payment_success',
              title: 'Serviço Concluído! ✅',
              message: 'Seu pagamento foi processado com sucesso. O serviço está concluído e o profissional foi notificado.',
            });
            
            console.log('✅ Status atualizado e notificações enviadas');
          }
        } catch (error) {
          console.error('❌ Erro ao processar pagamento aprovado:', error);
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Pagamento falhou:', failedPayment.id);
        
        try {
          const serviceOfferId = failedPayment.metadata.serviceOfferId;
          const clientId = failedPayment.metadata.clientId;
          
          if (serviceOfferId && clientId) {
            // Criar notificação de falha para o cliente
            await storage.createNotification({
              userId: parseInt(clientId),
              type: 'payment_failed',
              title: 'Pagamento Falhou ❌',
              message: 'Não foi possível processar seu pagamento. Tente novamente.',
            });
          }
        } catch (error) {
          console.error('❌ Erro ao processar pagamento falhado:', error);
        }
        break;
        
      default:
        console.log(`🔔 Evento não tratado: ${event.type}`);
    }

    res.json({received: true});
  });

  // ==================== UPDATE PAYMENT STATUS ROUTE ====================
  app.post('/api/payment/update-status', authenticateToken, async (req, res) => {
    try {
      console.log('🔄 Atualizando status do pagamento...');
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      console.log('👤 User from token:', req.user);
      
      const { serviceOfferId, paymentIntentId, amount } = req.body;
      
      if (!serviceOfferId) {
        return res.status(400).json({ error: 'serviceOfferId é obrigatório' });
      }

      // Buscar a proposta
      console.log(`🔍 Buscando proposta ID: ${serviceOfferId}`);
      const serviceOffer = await storage.getServiceOfferById(parseInt(serviceOfferId));
      console.log(`📋 Proposta encontrada:`, serviceOffer ? 'Sim' : 'Não');
      
      if (!serviceOffer) {
        console.log('❌ Proposta não encontrada');
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }

      // Buscar dados relacionados
      console.log(`🔍 Buscando service request ID: ${serviceOffer.serviceRequestId}`);
      const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
      console.log(`📋 Service request encontrado:`, serviceRequest ? 'Sim' : 'Não');
      
      console.log(`🔍 Buscando professional ID: ${serviceOffer.professionalId}`);
      const professional = await storage.getProfessionalById(serviceOffer.professionalId);
      console.log(`📋 Professional encontrado:`, professional ? 'Sim' : 'Não');
      
      if (!serviceRequest || !professional) {
        console.log('❌ Dados relacionados não encontrados');
        return res.status(404).json({ error: 'Dados relacionados não encontrados' });
      }

      // Atualizar status para concluída
      await storage.updateServiceOfferStatus(parseInt(serviceOfferId), 'completed');
      console.log('✅ Status atualizado para concluída');

      if (serviceRequest.status !== 'completed') {
        await storage.updateServiceRequestStatus(serviceRequest.id, 'completed');
        console.log('✅ Solicitação de serviço marcada como concluída');
      }

      // Criar notificação para o profissional
      console.log(`🔔 Criando notificação para profissional ID: ${serviceOffer.professionalId}`);
      await storage.createNotification({
        userId: serviceOffer.professionalId,
        type: 'payment_received',
        title: 'Pagamento Recebido! 💰',
        message: `Seu pagamento de R$ ${(amount / 100).toFixed(2)} foi aprovado. O serviço está concluído!`,
      });
      console.log('✅ Notificação enviada para o profissional');

      // Criar notificação para o cliente
      console.log(`🔔 Criando notificação para cliente ID: ${serviceRequest.clientId}`);
      await storage.createNotification({
        userId: serviceRequest.clientId,
        type: 'payment_success',
        title: 'Serviço Concluído! ✅',
        message: 'Seu pagamento foi processado com sucesso. O serviço está concluído e o profissional foi notificado.',
      });
      console.log('✅ Notificação enviada para o cliente');

      console.log('✅ Processo concluído com sucesso');
      res.json({
        success: true,
        message: 'Status atualizado e notificações enviadas',
        serviceOfferId: parseInt(serviceOfferId),
        status: 'completed'
      });

    } catch (error: any) {
      console.error('❌ Erro ao atualizar status do pagamento:', error);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // ==================== PAYMENT STATUS ROUTE ====================
  app.get('/api/payment/status/:serviceOfferId', authenticateToken, async (req, res) => {
    try {
      const { serviceOfferId } = req.params;
      
      const serviceOffer = await storage.getServiceOfferById(parseInt(serviceOfferId));
      if (!serviceOffer) {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }
      
      res.json({
        serviceOfferId: serviceOffer.id,
        status: serviceOffer.status,
        isPaid: serviceOffer.status === 'completed'
      });
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // ==================== STRIPE PAYMENT ROUTES ====================

  // Criar Payment Intent para uma proposta aceita
  app.post('/api/payment/create-intent', authenticateToken, async (req, res) => {
    try {
      console.log('🔍 Iniciando criação de Payment Intent');
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      console.log('👤 User from token:', req.user);
      const { serviceOfferId } = req.body;

      if (!serviceOfferId) {
        return res.status(400).json({ error: 'serviceOfferId é obrigatório' });
      }

      // Busca dados necessários
      console.log(`🔍 Buscando proposta ID: ${serviceOfferId}`);
      const serviceOffer = await storage.getServiceOfferById(serviceOfferId);
      console.log(`📋 Proposta encontrada:`, serviceOffer ? 'Sim' : 'Não');
      if (serviceOffer) {
        console.log(`📋 Dados da proposta:`, {
          id: serviceOffer.id,
          proposedPrice: serviceOffer.proposedPrice,
          finalPrice: serviceOffer.finalPrice,
          status: serviceOffer.status
        });
      }
      
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

      const rawPrice = serviceOffer.finalPrice || serviceOffer.proposedPrice;
      if (!rawPrice || isNaN(parseFloat(rawPrice))) {
        return res.status(400).json({ error: 'Preço inválido na oferta de serviço' });
      }

      const amount = parseFloat(rawPrice);
      
      // Stripe Brasil: valor mínimo é R$ 5,00
      const minimumAmount = 5.00;
      const finalAmount = Math.max(amount, minimumAmount);
      
      // ✨ Calcular taxa LifeBee (5%) em centavos
      const lifebeeCommissionPercent = 0.05;
      const lifebeeCommission = Math.round(finalAmount * 100 * lifebeeCommissionPercent); // em centavos
      const professionalAmount = Math.round(finalAmount * 100) - lifebeeCommission;

      console.log(`💰 Valor original: R$ ${amount.toFixed(2)}`);
      console.log(`💰 Valor final (mínimo R$ 5,00): R$ ${finalAmount.toFixed(2)}`);
      console.log(`💰 LifeBee (5%): R$ ${(lifebeeCommission / 100).toFixed(2)}`);
      console.log(`💰 Profissional (95%): R$ ${(professionalAmount / 100).toFixed(2)}`);
      console.log(`🔑 Stripe Secret Key presente: ${process.env.STRIPE_SECRET_KEY ? 'Sim' : 'Não'}`);

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
        application_fee_amount: lifebeeCommission,  // ✨ Taxa LifeBee (5%)
        transfer_data: {
          destination: professional.stripeAccountId,  // ✨ Profissional recebe direto (95%)
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

      // Salva referência do pagamento no banco
      const paymentReference = await storage.createPaymentReference({
        serviceRequestId: serviceOffer.serviceRequestId,
        serviceOfferId: serviceOffer.id,
        clientId: serviceRequest.clientId,
        professionalId: serviceOffer.professionalId,
        amount: amount.toFixed(2),
        preferenceId: paymentIntent.id, // Using Payment Intent ID as preferenceId
        status: 'pending',
        externalReference: paymentIntent.id,
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentReferenceId: paymentReference.id,
      });

    } catch (error: any) {
      console.error('❌ Erro ao criar Payment Intent:', error);
      res.status(500).json({
        error: 'Erro ao criar Payment Intent',
        details: error.message,
      });
    }
  });


  // Rota de teste para verificar configuração
  app.get('/api/payment/test-config', (req, res) => {
    res.json({
      success: true,
      config: {
        hasKey: !!process.env.STRIPE_SECRET_KEY,
        keyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        backendUrl: process.env.BACKEND_URL || 'http://localhost:8080',
      },
      message: 'Configuração verificada com sucesso'
    });
  });

  // ==================== SERVICE ROUTES ====================

  // Profissional marca serviço como concluído
  app.post('/api/service/:id/complete', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const serviceRequestId = parseInt(req.params.id);

      console.log('🔷 Profissional marcando serviço como concluído:', {
        userId: user.id,
        userType: user.userType,
        serviceRequestId
      });

      // Verificar se é profissional
      if (user.userType !== 'provider') {
        return res.status(403).json({ error: 'Apenas profissionais podem marcar serviços como concluídos' });
      }

      // Buscar serviço
      const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Buscar profissional
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      // Verificar se o profissional está associado a uma proposta aceita deste serviço
      const offers = await storage.getServiceOffersByRequest(serviceRequestId);
      const acceptedOffer = offers.find(
        offer => offer.professionalId === professional.id && offer.status === 'accepted'
      );

      if (!acceptedOffer) {
        return res.status(403).json({ 
          error: 'Você não tem permissão para marcar este serviço como concluído' 
        });
      }

      // Atualizar status do serviço para "awaiting_confirmation"
      await storage.updateServiceRequestStatus(serviceRequestId, 'awaiting_confirmation');

      console.log('✅ Serviço marcado como aguardando confirmação do cliente');

      // Criar notificação para o cliente
      await storage.createNotification({
        userId: serviceRequest.clientId,
        type: 'service_completed',
        title: 'Serviço Concluído! 🎉',
        message: `O profissional ${professional.name} marcou o serviço "${serviceRequest.title}" como concluído. Por favor, confirme a conclusão.`,
      });

      res.json({ 
        success: true,
        message: 'Serviço marcado como concluído. Aguardando confirmação do cliente.' 
      });

    } catch (error: any) {
      console.error('❌ Erro ao marcar serviço como concluído:', error);
      res.status(500).json({ error: 'Erro ao marcar serviço como concluído' });
    }
  });

  // Cliente confirma conclusão do serviço
  app.post('/api/service/:id/confirm', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const serviceRequestId = parseInt(req.params.id);

      console.log('🔷 Cliente confirmando conclusão do serviço:', {
        userId: user.id,
        userType: user.userType,
        serviceRequestId
      });

      // Verificar se é cliente
      if (user.userType !== 'client') {
        return res.status(403).json({ error: 'Apenas clientes podem confirmar conclusão de serviços' });
      }

      // Buscar serviço
      const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Verificar se o cliente é o dono do serviço
      if (serviceRequest.clientId !== user.id) {
        return res.status(403).json({ error: 'Você não tem permissão para confirmar este serviço' });
      }

      // Verificar se o serviço está aguardando confirmação
      if (serviceRequest.status !== 'awaiting_confirmation') {
        return res.status(400).json({ 
          error: 'Este serviço não está aguardando confirmação',
          currentStatus: serviceRequest.status 
        });
      }

      // Buscar a proposta aceita
      const offers = await storage.getServiceOffersByRequest(serviceRequestId);
      const acceptedOffer = offers.find(offer => offer.status === 'accepted');

      if (!acceptedOffer) {
        return res.status(404).json({ error: 'Proposta aceita não encontrada' });
      }

      // Buscar profissional
      const professional = await storage.getProfessionalById(acceptedOffer.professionalId);
      if (!professional) {
        return res.status(404).json({ error: 'Profissional não encontrado' });
      }

      // Atualizar status do serviço para "completed"
      await storage.updateServiceRequestStatus(serviceRequestId, 'completed');

      // Atualizar status da proposta para "completed"
      await storage.updateServiceOfferStatus(acceptedOffer.id, 'completed');

      console.log('✅ Serviço confirmado como concluído pelo cliente');

      // Criar notificação para o profissional
      await storage.createNotification({
        userId: professional.userId,
        type: 'service_confirmed',
        title: 'Serviço Confirmado! ✅',
        message: `O cliente confirmou a conclusão do serviço "${serviceRequest.title}". O pagamento será liberado.`,
      });

      // Verificar se já existe avaliação
      const existingReview = await storage.getServiceReviewByServiceRequest(serviceRequestId);

      res.json({ 
        success: true,
        message: 'Serviço confirmado como concluído.',
        requiresReview: !existingReview // Indica se precisa avaliar
      });

    } catch (error: any) {
      console.error('❌ Erro ao confirmar conclusão do serviço:', error);
      res.status(500).json({ error: 'Erro ao confirmar conclusão do serviço' });
    }
  });

  // Get service requests for client
  app.get('/api/service-requests/client', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.userType !== 'client') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const serviceRequests = await storage.getServiceRequestsByClient(user.id);
      res.json(serviceRequests);
    } catch (error: any) {
      console.error('❌ Erro ao buscar solicitações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get service offers for client
  app.get('/api/service-offers/client', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.userType !== 'client') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const serviceOffers = await storage.getServiceOffersForClient(user.id);
      res.json(serviceOffers);
    } catch (error: any) {
      console.error('❌ Erro ao buscar propostas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get current user
  app.get('/api/user', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const fullUser = await storage.getUser(user.id);
      
      if (!fullUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json(fullUser);
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROFESSIONAL ROUTES ====================

  // Get all professionals
  app.get('/api/professionals', async (req, res) => {
    try {
      const professionals = await storage.getAllProfessionals();
      res.json(professionals);
    } catch (error: any) {
      console.error('❌ Erro ao buscar profissionais:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get professional by ID
  app.get('/api/professionals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const professional = await storage.getProfessional(parseInt(id));
      if (!professional) {
        return res.status(404).json({ message: 'Profissional não encontrado' });
      }
      res.json(professional);
    } catch (error: any) {
      console.error('❌ Erro ao buscar profissional:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get all proposals by professional
  app.get('/api/professionals/:id/proposals', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const professionalUserId = parseInt(req.params.id);
      
      if (isNaN(professionalUserId)) {
        return res.status(400).json({ message: "ID do profissional inválido" });
      }
      
      // Verificar se o usuário está acessando suas próprias propostas
      if (user.userType !== 'provider' || user.id !== professionalUserId) {
        return res.status(403).json({ message: "Acesso negado às propostas" });
      }
      
      // Buscar o profissional pelo userId
      const professional = await storage.getProfessionalByUserId(professionalUserId);
      if (!professional) {
        return res.status(404).json({ message: "Profissional não encontrado" });
      }
      
      console.log('📋 Buscando propostas para professional.id:', professional.id);
      
      // Buscar todas as propostas do profissional com detalhes dos serviços
      const proposals = await storage.getProposalsByProfessional(professional.id);
      
      console.log('✅ Propostas encontradas:', proposals.length);
      
      res.json(proposals);
    } catch (error: any) {
      console.error('❌ Erro ao buscar propostas do profissional:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== SERVICE REQUEST ROUTES ====================

  // Create service request
  app.post('/api/service-requests', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.userType !== 'client') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Converter scheduledDate de string para Date se necessário
      const requestData = { ...req.body };
      if (requestData.scheduledDate && typeof requestData.scheduledDate === 'string') {
        // Combinar data e hora se existirem
        if (requestData.scheduledTime) {
          requestData.scheduledDate = new Date(`${requestData.scheduledDate}T${requestData.scheduledTime}`);
        } else {
          requestData.scheduledDate = new Date(requestData.scheduledDate);
        }
      }

      const serviceRequest = await storage.createServiceRequest({
        ...requestData,
        clientId: user.id
      });
      
      // Criar notificação para o cliente (não crítico - não bloquear se falhar)
      try {
        console.log('📢 Tentando criar notificação:', {
          type: 'success',
          title: 'Solicitação Criada',
          userId: user.id
        });
        
        await storage.createNotification({
          type: 'success',
          title: 'Solicitação Criada',
          message: `Sua solicitação de ${requestData.serviceType} foi criada com sucesso`,
          userId: user.id,
          actionUrl: '/my-requests'
        });
        
        console.log('✅ Notificação criada com sucesso');
      } catch (notificationError: any) {
        // Log do erro mas não bloqueia a criação do serviço
        console.error('⚠️ Erro ao criar notificação (não crítico):', notificationError.message);
        console.error('Stack:', notificationError.stack);
      }
      
      res.json({ success: true, message: 'Solicitação criada com sucesso', data: serviceRequest });
    } catch (error: any) {
      console.error('❌ Erro ao criar solicitação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get service requests by professional
  app.get('/api/service-requests/professional', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.userType !== 'professional') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Get professional by user ID
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: 'Profissional não encontrado' });
      }

      // Get proposals by professional
      const proposals = await storage.getProposalsByProfessional(professional.id);
      res.json(proposals);
    } catch (error: any) {
      console.error('❌ Erro ao buscar solicitações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== SERVICE OFFER ROUTES ====================

  // Create service offer
  app.post('/api/service-offers', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.userType !== 'professional') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Get professional by user ID
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: 'Profissional não encontrado' });
      }

      const serviceOffer = await storage.createServiceOffer({
        ...req.body,
        professionalId: professional.id
      });

      // Buscar a solicitação para obter o cliente
      const serviceRequest = await storage.getServiceRequestById(req.body.serviceRequestId);
      
      // Criar notificação para o cliente
      if (serviceRequest) {
        await storage.createNotification({
          type: 'info',
          title: 'Nova Proposta Recebida',
          message: `Você recebeu uma nova proposta para ${serviceRequest.serviceType}`,
          userId: serviceRequest.clientId,
          actionUrl: '/service-offer'
        });
      }
      
      res.json({ success: true, message: 'Proposta criada com sucesso', data: serviceOffer });
    } catch (error: any) {
      console.error('❌ Erro ao criar proposta:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get service offers by professional
  app.get('/api/service-offers/professional', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.userType !== 'professional') {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Get professional by user ID
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: 'Profissional não encontrado' });
      }

      // Get proposals by professional
      const proposals = await storage.getProposalsByProfessional(professional.id);
      res.json(proposals);
    } catch (error: any) {
      console.error('❌ Erro ao buscar propostas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Accept service offer
  app.post('/api/service-offers/:id/accept', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as any;
      
      // Usar método completo que faz todas as validações
      const result = await storage.acceptServiceOffer(parseInt(id), user.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || 'Erro ao aceitar proposta' });
      }
      
      // Buscar a oferta para pegar o professionalId
      const offer = await storage.getServiceOfferById(parseInt(id));
      
      // Tentar criar notificações, mas não falhar se houver erro
      if (offer) {
        try {
          await storage.createNotification({
            type: 'success',
            title: 'Proposta Aceita',
            message: `Sua proposta foi aceita pelo cliente`,
            userId: offer.professionalId,
            actionUrl: '/provider-dashboard'
          });

          await storage.createNotification({
            type: 'success',
            title: 'Proposta Aceita',
            message: `Você aceitou a proposta do profissional`,
            userId: user.id,
            actionUrl: '/my-requests'
          });
        } catch (notifError) {
          console.error('⚠️ Erro ao criar notificações (não crítico):', notifError);
        }
      }
      
      res.json({ success: true, message: 'Proposta aceita com sucesso' });
    } catch (error: any) {
      console.error('❌ Erro ao aceitar proposta:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Reject service offer
  app.put('/api/service-offers/:id/reject', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as any;
      
      // Usar método completo que faz todas as validações
      const result = await storage.rejectServiceOffer(parseInt(id), user.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || 'Erro ao rejeitar proposta' });
      }
      
      // Buscar a oferta para pegar o professionalId
      const offer = await storage.getServiceOfferById(parseInt(id));
      
      // Tentar criar notificações, mas não falhar se houver erro
      if (offer) {
        try {
          await storage.createNotification({
            type: 'info',
            title: 'Proposta Rejeitada',
            message: `Sua proposta foi rejeitada pelo cliente`,
            userId: offer.professionalId,
            actionUrl: '/provider-dashboard'
          });
        } catch (notifError) {
          console.error('⚠️ Erro ao criar notificações (não crítico):', notifError);
        }
      }
      
      res.json({ success: true, message: 'Proposta rejeitada com sucesso' });
    } catch (error: any) {
      console.error('❌ Erro ao rejeitar proposta:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== NOTIFICATION ROUTES ====================

  // Get notifications
  app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const notifications = await storage.getNotificationsByUser(user.id);
      res.json(notifications);
    } catch (error: any) {
      console.error('❌ Erro ao buscar notificações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Mark notification as read
  app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(parseInt(id));
      res.json({ success: true, message: 'Notificação marcada como lida' });
    } catch (error: any) {
      console.error('❌ Erro ao marcar notificação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROFILE ROUTES ====================

  // Update user profile
  app.put('/api/profile', async (req, res) => {
    try {
      // Temporarily return success until storage methods are implemented
      res.json({ success: true, message: 'Perfil atualizado com sucesso' });
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Update user profile - alternative route
  app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const { name, email, phone, address } = req.body;

      console.log('🔄 Atualizando perfil do usuário:', user.id);
      console.log('📝 Dados recebidos:', { name, email, phone, address });

      // Atualizar dados do usuário
      await storage.updateUser(user.id, {
        name,
        email,
        phone,
        address
      });

      console.log('✅ Perfil atualizado com sucesso');

      // Buscar dados atualizados
      const updatedUser = await storage.getUser(user.id);

      res.json({ 
        success: true, 
        message: 'Perfil atualizado com sucesso',
        user: updatedUser
      });
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Upload profile image
  app.post('/api/profile/upload', async (req, res) => {
    try {
      // Temporarily return success until storage methods are implemented
      res.json({ success: true, message: 'Imagem enviada com sucesso' });
    } catch (error: any) {
      console.error('❌ Erro ao enviar imagem:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Upload user profile image - alternative route
  app.post('/api/user/upload-image', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      
      console.log('📸 Upload de imagem para usuário:', user.id);

      // TODO: Implementar upload de imagem usando multer ou similar
      // Por enquanto, retornamos sucesso temporário
      
      res.json({ 
        success: true, 
        message: 'Imagem enviada com sucesso',
        profileImage: '/uploads/default-avatar.png' // Placeholder
      });
    } catch (error: any) {
      console.error('❌ Erro ao enviar imagem:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Login route
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios" });
      }

      // Get user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(401).json({ message: "Conta bloqueada" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: "Login realizado com sucesso",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified,
          phone: user.phone,
          profileImage: user.profileImage
        }
      });
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Register route
  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password, name, phone, userType } = req.body;

      // Validation
      if (!username || !email || !password || !name) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já existe" });
      }

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        name,
        phone: phone || null,
        userType: userType || 'client'
      });

      // Generate token
      const token = generateToken(user);

      res.json({
        message: "Conta criada com sucesso",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified,
          phone: user.phone,
          profileImage: user.profileImage
        }
      });
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== GET SERVICE REQUEST BY ID ====================

  // Get service request by ID
  app.get('/api/service-requests/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const requestId = parseInt(id);
      
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const serviceRequest = await storage.getServiceRequestById(requestId);
      
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicitação de serviço não encontrada" });
      }

      // Buscar informações do cliente
      const client = await storage.getUser(serviceRequest.clientId);
      
      // Combinar dados do serviço com informações do cliente
      const serviceDataWithClient = {
        ...serviceRequest,
        clientName: client?.name || "Cliente",
        clientProfileImage: client?.profileImage || "",
        clientPhone: client?.phone || "",
        clientEmail: client?.email || ""
      };

      res.json(serviceDataWithClient);
    } catch (error: any) {
      console.error('❌ Erro ao buscar solicitação de serviço:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== GET SERVICE OFFERS BY REQUEST ID ====================

  // Get service offers for a specific service request
  app.get('/api/service-requests/:id/offers', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const offers = await storage.getServiceOffers(parseInt(id));
      res.json(offers);
    } catch (error: any) {
      console.error('❌ Erro ao buscar propostas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== POST SERVICE OFFER FOR REQUEST ====================

  // Create service offer for a specific service request
  app.post('/api/service-requests/:id/offers', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      const serviceRequestId = parseInt(id);

      console.log('👤 Usuário tentando criar proposta:', {
        id: user.id,
        name: user.name,
        userType: user.userType,
        isProvider: user.userType === 'provider'
      });

      if (user.userType !== 'provider') {
        console.log('❌ Acesso negado - userType:', user.userType);
        return res.status(403).json({ message: 'Acesso negado - apenas prestadores podem criar propostas' });
      }

      if (isNaN(serviceRequestId)) {
        return res.status(400).json({ message: "ID da solicitação inválido" });
      }

      // Get professional by user ID
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: 'Profissional não encontrado' });
      }

      // Verificar se a solicitação existe
      const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
      console.log('📋 Solicitação encontrada:', {
        id: serviceRequest?.id,
        serviceType: serviceRequest?.serviceType,
        clientId: serviceRequest?.clientId
      });
      
      if (!serviceRequest) {
        return res.status(404).json({ message: 'Solicitação de serviço não encontrada' });
      }

      // Criar proposta com os dados do body + serviceRequestId do parâmetro
      const serviceOffer = await storage.createServiceOffer({
        serviceRequestId: serviceRequestId,
        professionalId: professional.id,
        proposedPrice: req.body.proposedPrice,
        estimatedTime: req.body.estimatedTime,
        message: req.body.message,
        status: 'pending'
      });

      console.log('✅ Proposta criada com sucesso:', serviceOffer.id);

      // Criar notificação para o cliente (não bloquear se falhar)
      try {
        await storage.createNotification({
          type: 'info',
          title: 'Nova Proposta Recebida',
          message: `Você recebeu uma nova proposta para ${serviceRequest.serviceType}`,
          userId: serviceRequest.clientId,
          actionUrl: '/service-offer'
        });
        console.log('✅ Notificação criada para o cliente ID:', serviceRequest.clientId);
      } catch (notificationError: any) {
        console.error('⚠️ Erro ao criar notificação (proposta já foi criada):', notificationError);
        // Não retornar erro, pois a proposta já foi criada com sucesso
      }
      
      res.json({ success: true, message: 'Proposta criada com sucesso', data: serviceOffer });
    } catch (error: any) {
      console.error('❌ Erro ao criar proposta:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== DELETE SERVICE REQUEST ====================

  // Delete service request (with cascade delete of related offers)
  app.delete('/api/service-requests/:id', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      
      console.log('🗑️ Tentativa de exclusão de service request ID:', requestId, 'por usuário:', user.id);
      
      const serviceRequest = await storage.getServiceRequestById(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }

      // Verificar se o usuário é o proprietário da solicitação
      if (user.userType !== 'client' || serviceRequest.clientId !== user.id) {
        return res.status(403).json({ message: "Apenas o cliente que criou a solicitação pode excluí-la" });
      }

      // Permitir exclusão de solicitações abertas, pendentes ou atribuídas (mas não concluídas)
      if (!['open', 'pending', 'assigned'].includes(serviceRequest.status)) {
        return res.status(400).json({ 
          message: "Apenas solicitações abertas, pendentes ou atribuídas podem ser excluídas",
          currentStatus: serviceRequest.status
        });
      }

      // Excluir o service request (isso automaticamente excluirá todas as propostas relacionadas)
      await storage.deleteServiceRequest(requestId);
      
      console.log('✅ Service request excluído com sucesso, ID:', requestId);
      
      res.json({ 
        success: true,
        message: "Solicitação e todas as propostas relacionadas foram excluídas com sucesso",
        deletedRequestId: requestId
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao excluir solicitação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROVIDER APPOINTMENTS ====================

  // Get appointments for client
  app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      
      if (user.userType !== 'client') {
        return res.status(403).json({ message: 'Acesso negado. Apenas clientes podem acessar esta rota.' });
      }

      console.log('📅 Buscando agendamentos para cliente ID:', user.id);

      // Buscar service requests do cliente que foram aceitos (status = 'assigned' ou 'accepted')
      const serviceRequests = await storage.getServiceRequestsByClient(user.id);
      
      // Filtrar apenas os que têm proposta aceita e converter para formato de appointment
      const appointments = serviceRequests
        .filter(sr => sr.status === 'assigned' || sr.status === 'accepted' || sr.status === 'in_progress' || sr.status === 'awaiting_confirmation' || sr.status === 'completed')
        .map(sr => ({
          id: sr.id,
          clientId: sr.clientId,
          professionalId: sr.assignedProfessionalId,
          serviceType: sr.serviceType,
          description: sr.description,
          scheduledFor: sr.scheduledDate,
          scheduledTime: sr.scheduledTime,
          status: sr.status,
          address: sr.address,
          createdAt: sr.createdAt,
          updatedAt: sr.updatedAt
        }));
      
      console.log('✅ Agendamentos encontrados:', appointments.length);

      res.json(appointments);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar agendamentos do cliente:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get appointments for provider
  app.get('/api/appointments/provider', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      
      if (user.userType !== 'provider') {
        return res.status(403).json({ message: 'Acesso negado. Apenas profissionais podem acessar esta rota.' });
      }

      console.log('📅 Buscando agendamentos para profissional ID:', user.id);

      // Buscar agendamentos do profissional (usando service requests assigned para ele)
      const appointments = await storage.getServiceRequestsByProfessional(user.id);
      
      console.log('✅ Agendamentos encontrados:', appointments.length);

      res.json(appointments);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar agendamentos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== SERVICE REQUESTS BY CATEGORY ====================

  // Get service requests by category
  app.get('/api/service-requests/category/:category', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const category = req.params.category;

      if (user.userType !== 'provider') {
        return res.status(403).json({ message: 'Acesso negado. Apenas profissionais podem acessar esta rota.' });
      }

      console.log('🔍 Buscando solicitações para categoria:', category, 'por profissional ID:', user.id);

      // Buscar service requests da categoria específica que ainda não foram assigned
      const serviceRequests = await storage.getServiceRequestsByCategory(category);
      
      // Filtrar apenas os que não estão assigned ou estão assigned para este profissional
      const availableRequests = serviceRequests.filter(request => 
        request.status === 'open' || request.status === 'pending' || 
        (request.status === 'assigned' && request.assignedProfessionalId === user.id)
      );

      console.log('✅ Solicitações encontradas:', availableRequests.length);

      res.json(availableRequests);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar solicitações por categoria:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROVIDER AVAILABILITY ====================

  // Update provider availability
  app.put('/api/provider/availability', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { available } = req.body;
      
      console.log('🔧 Atualizando disponibilidade do profissional:', { userId: user.id, available });

      if (user.userType !== 'provider') {
        return res.status(403).json({ message: 'Acesso negado. Apenas profissionais podem atualizar sua disponibilidade.' });
      }

      // Atualizar disponibilidade do profissional usando user.id
      await storage.updateProfessionalAvailability(user.id, available);
      
      console.log('✅ Disponibilidade atualizada com sucesso');

      res.json({ message: 'Disponibilidade atualizada com sucesso', available });
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar disponibilidade:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROFESSIONAL COMPLETED SERVICES ====================

  // Get completed services for professional
  app.get('/api/professional/:id/completed-services', authenticateToken, async (req, res) => {
    try {
      console.log('🚀 Endpoint /api/professional/:id/completed-services chamado');
      const user = req.user;
      const professionalId = parseInt(req.params.id);
      
      console.log('👤 Usuário autenticado:', { id: user?.id, userType: user?.userType, name: user?.name });
      console.log('📋 Professional ID solicitado:', professionalId);

      if (user.userType !== 'provider' || user.id !== professionalId) {
        console.log('❌ Acesso negado - verificação de permissão falhou');
        return res.status(403).json({ message: 'Acesso negado. Você só pode acessar seus próprios dados.' });
      }

      console.log('✅ Permissão aprovada, buscando dados...');
      console.log('📊 Buscando serviços concluídos para profissional ID:', professionalId);

      // Buscar o professional_id correspondente ao user_id
      console.log('🔍 Buscando professional_id para user_id:', professionalId);
      const professional = await storage.getProfessionalByUserId(professionalId);
      if (!professional) {
        console.log('❌ Profissional não encontrado para user_id:', professionalId);
        return res.status(404).json({ message: 'Profissional não encontrado' });
      }
      
      console.log('✅ Profissional encontrado:', { id: professional.id, userId: professional.userId, name: professional.name });

      // Buscar service requests concluídos do profissional com dados completos
      console.log('🔍 Buscando serviços concluídos para professional_id:', professional.id);
      const completedServices = await storage.getProfessionalCompletedServices(professional.id);
      
      console.log('✅ Serviços concluídos encontrados:', completedServices.length);
      console.log('📋 Primeiro serviço:', completedServices[0] || 'Nenhum serviço');

      res.json({ data: completedServices });
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar serviços concluídos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROVIDER PAYMENTS ====================

  // Get payments for provider
  app.get('/api/provider/payments', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const filter = req.query.filter || 'all';

      if (user.userType !== 'provider') {
        return res.status(403).json({ message: 'Acesso negado. Apenas profissionais podem acessar esta rota.' });
      }

      console.log('💳 Buscando pagamentos para profissional ID:', user.id, 'com filtro:', filter);

      // Buscar pagamentos do profissional
      const payments = await storage.getPaymentsByProfessional(user.id, filter as string);
      
      // Buscar estatísticas de pagamento
      const stats = await storage.getPaymentStatsByProfessional(user.id);
      
      console.log('✅ Pagamentos encontrados:', payments.length);
      console.log('✅ Estatísticas:', stats);

      res.json({
        payments,
        stats
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar pagamentos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROVIDER PROFILE ====================

  // Get provider profile data
  app.get('/api/provider/profile', authenticateToken, async (req, res) => {
    try {
      const user = req.user;

      if (user.userType !== 'provider') {
        return res.status(403).json({ message: 'Acesso negado. Apenas profissionais podem acessar esta rota.' });
      }

      console.log('👤 Buscando perfil do profissional ID:', user.id);

      // Buscar dados completos do profissional
      const profileData = await storage.getProviderProfile(user.id);
      
      console.log('✅ Perfil encontrado:', !!profileData);

      res.json(profileData);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar perfil do profissional:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== PROVIDER DASHBOARD OVERVIEW ====================

  // Get provider dashboard overview data
  app.get('/api/provider/dashboard', authenticateToken, async (req, res) => {
    try {
      const user = req.user;

      if (user.userType !== 'provider') {
        return res.status(403).json({ message: 'Acesso negado. Apenas profissionais podem acessar esta rota.' });
      }

      console.log('📊 Buscando dados do dashboard para profissional ID:', user.id);

      // Buscar dados completos do dashboard
      const dashboardData = await storage.getProviderDashboardData(user.id);
      
      console.log('✅ Dados do dashboard encontrados:', !!dashboardData);

      res.json(dashboardData);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ==================== NOTIFICATION ROUTES ====================

  // Get notifications count
  app.get('/api/notifications/count', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error: any) {
      console.error('❌ Erro ao buscar contador de notificações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get all notifications
  app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const notifications = await storage.getUserNotifications(user.id);
      res.json(notifications);
    } catch (error: any) {
      console.error('❌ Erro ao buscar notificações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      await storage.markNotificationAsRead(parseInt(id), user.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Create notification (internal use)
  app.post('/api/notifications', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const { type, title, message, userId, actionUrl } = req.body;
      
      const notification = await storage.createNotification({
        type,
        title,
        message,
        userId: userId || user.id,
        actionUrl
      });
      
      res.json({ success: true, notification });
    } catch (error: any) {
      console.error('❌ Erro ao criar notificação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

}
