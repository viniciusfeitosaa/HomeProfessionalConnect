import express from "express";
import { storage } from "./storage.js";
import { authenticateToken, generateToken, verifyPassword, hashPassword } from "./auth.js";
import Stripe from 'stripe';
// Configure Stripe
console.log(`🔧 Inicializando Stripe...`);
console.log(`🔑 STRIPE_SECRET_KEY presente: ${process.env.STRIPE_SECRET_KEY ? 'Sim' : 'Não'}`);
console.log(`🔑 STRIPE_SECRET_KEY início: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`);
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
});
console.log(`✅ Stripe inicializado com sucesso`);
export function setupRoutes(app, redisClient) {
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
        }
        catch (error) {
            console.error('❌ Erro ao obter configuração do Stripe:', error);
            res.status(500).json({ error: 'Erro interno ao obter configuração do Stripe' });
        }
    });
    // ==================== STRIPE TEST ROUTE ====================
    app.get('/api/payment/test-stripe', async (req, res) => {
        try {
            console.log(`🧪 Testando Stripe...`);
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
        }
        catch (error) {
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
                        location: client && client.city ? client.city : '',
                        messages: await storage.getMessagesByConversation(conv.id)
                    };
                }
                const professional = await storage.getProfessionalById(conv.professionalId);
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
        }
        catch (error) {
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
            }
            catch (err) {
                console.warn('⚠️ Não foi possível marcar mensagens como lidas:', err);
            }
            res.json(conversation);
        }
        catch (error) {
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
                }
                else {
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
        }
        catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            res.status(500).json({ message: 'Erro interno ao enviar mensagem' });
        }
    });
    app.post('/api/messages/start-conversation', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { professionalId, message } = req.body;
            const professional = await storage.getProfessionalById(professionalId);
            if (!professional) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            const existingConversation = await storage.getConversation(user.id, professionalId);
            let conversationId;
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
            }
            else {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error(`❌ Erro no teste do banco:`, error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                details: error
            });
        }
    });
    // ==================== STRIPE WEBHOOK ====================
    app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        }
        catch (err) {
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
                            data: {
                                serviceOfferId: parseInt(serviceOfferId),
                                amount: paymentIntent.amount,
                                paymentIntentId: paymentIntent.id
                            }
                        });
                        // Criar notificação para o cliente
                        await storage.createNotification({
                            userId: parseInt(clientId),
                            type: 'payment_success',
                            title: 'Serviço Concluído! ✅',
                            message: 'Seu pagamento foi processado com sucesso. O serviço está concluído e o profissional foi notificado.',
                            data: {
                                serviceOfferId: parseInt(serviceOfferId),
                                amount: paymentIntent.amount,
                                paymentIntentId: paymentIntent.id
                            }
                        });
                        console.log('✅ Status atualizado e notificações enviadas');
                    }
                }
                catch (error) {
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
                            data: {
                                serviceOfferId: parseInt(serviceOfferId),
                                paymentIntentId: failedPayment.id
                            }
                        });
                    }
                }
                catch (error) {
                    console.error('❌ Erro ao processar pagamento falhado:', error);
                }
                break;
            default:
                console.log(`🔔 Evento não tratado: ${event.type}`);
        }
        res.json({ received: true });
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
                data: {
                    serviceOfferId: parseInt(serviceOfferId),
                    amount: amount,
                    paymentIntentId: paymentIntentId
                }
            });
            console.log('✅ Notificação enviada para o profissional');
            // Criar notificação para o cliente
            console.log(`🔔 Criando notificação para cliente ID: ${serviceRequest.clientId}`);
            await storage.createNotification({
                userId: serviceRequest.clientId,
                type: 'payment_success',
                title: 'Serviço Concluído! ✅',
                message: 'Seu pagamento foi processado com sucesso. O serviço está concluído e o profissional foi notificado.',
                data: {
                    serviceOfferId: parseInt(serviceOfferId),
                    amount: amount,
                    paymentIntentId: paymentIntentId
                }
            });
            console.log('✅ Notificação enviada para o cliente');
            console.log('✅ Processo concluído com sucesso');
            res.json({
                success: true,
                message: 'Status atualizado e notificações enviadas',
                serviceOfferId: parseInt(serviceOfferId),
                status: 'completed'
            });
        }
        catch (error) {
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
        }
        catch (error) {
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
            const rawPrice = serviceOffer.finalPrice || serviceOffer.proposedPrice;
            if (!rawPrice || isNaN(parseFloat(rawPrice))) {
                return res.status(400).json({ error: 'Preço inválido na oferta de serviço' });
            }
            const amount = parseFloat(rawPrice);
            // Stripe Brasil: valor mínimo é R$ 5,00
            const minimumAmount = 5.00;
            const finalAmount = Math.max(amount, minimumAmount);
            const lifebeeCommission = finalAmount * 0.05; // 5% de comissão
            const professionalAmount = finalAmount - lifebeeCommission;
            console.log(`💰 Valor original: R$ ${amount.toFixed(2)}`);
            console.log(`💰 Valor final (mínimo R$ 5,00): R$ ${finalAmount.toFixed(2)}`);
            console.log(`🔑 Stripe Secret Key presente: ${process.env.STRIPE_SECRET_KEY ? 'Sim' : 'Não'}`);
            // Cria Payment Intent no Stripe com métodos de pagamento brasileiros
            console.log(`🚀 Criando Payment Intent com valor: ${Math.round(finalAmount * 100)} centavos`);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(finalAmount * 100), // Stripe expects amount in cents
                currency: 'brl',
                payment_method_types: ['card'],
                metadata: {
                    serviceOfferId: serviceOffer.id.toString(),
                    serviceRequestId: serviceOffer.serviceRequestId.toString(),
                    clientId: serviceRequest.clientId.toString(),
                    professionalId: serviceOffer.professionalId.toString(),
                    lifebeeCommission: lifebeeCommission.toFixed(2),
                    professionalAmount: professionalAmount.toFixed(2),
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
        }
        catch (error) {
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
    // Get service requests for client
    app.get('/api/service-requests/client', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            if (user.userType !== 'client') {
                return res.status(403).json({ message: 'Acesso negado' });
            }
            const serviceRequests = await storage.getServiceRequestsByClient(user.id);
            res.json(serviceRequests);
        }
        catch (error) {
            console.error('❌ Erro ao buscar solicitações:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get service offers for client
    app.get('/api/service-offers/client', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            if (user.userType !== 'client') {
                return res.status(403).json({ message: 'Acesso negado' });
            }
            const serviceOffers = await storage.getServiceOffersForClient(user.id);
            res.json(serviceOffers);
        }
        catch (error) {
            console.error('❌ Erro ao buscar propostas:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get current user
    app.get('/api/user', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const fullUser = await storage.getUser(user.id);
            if (!fullUser) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            res.json(fullUser);
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('❌ Erro ao buscar profissional:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ==================== SERVICE REQUEST ROUTES ====================
    // Create service request
    app.post('/api/service-requests', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            if (user.userType !== 'client') {
                return res.status(403).json({ message: 'Acesso negado' });
            }
            const serviceRequest = await storage.createServiceRequest({
                ...req.body,
                clientId: user.id
            });
            res.json({ success: true, message: 'Solicitação criada com sucesso', data: serviceRequest });
        }
        catch (error) {
            console.error('❌ Erro ao criar solicitação:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get service requests by professional
    app.get('/api/service-requests/professional', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
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
        }
        catch (error) {
            console.error('❌ Erro ao buscar solicitações:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ==================== SERVICE OFFER ROUTES ====================
    // Create service offer
    app.post('/api/service-offers', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
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
            res.json({ success: true, message: 'Proposta criada com sucesso', data: serviceOffer });
        }
        catch (error) {
            console.error('❌ Erro ao criar proposta:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get service offers by professional
    app.get('/api/service-offers/professional', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
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
        }
        catch (error) {
            console.error('❌ Erro ao buscar propostas:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Accept service offer
    app.post('/api/service-offers/:id/accept', async (req, res) => {
        try {
            const { id } = req.params;
            // Temporarily return success until storage methods are implemented
            res.json({ success: true, message: 'Proposta aceita com sucesso' });
        }
        catch (error) {
            console.error('❌ Erro ao aceitar proposta:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ==================== NOTIFICATION ROUTES ====================
    // Get notifications
    app.get('/api/notifications', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const notifications = await storage.getNotificationsByUser(user.id);
            res.json(notifications);
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Upload profile image
    app.post('/api/profile/upload', async (req, res) => {
        try {
            // Temporarily return success until storage methods are implemented
            res.json({ success: true, message: 'Imagem enviada com sucesso' });
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('❌ Erro no registro:', error);
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
        }
        catch (error) {
            console.error('❌ Erro ao excluir solicitação:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ==================== PROVIDER APPOINTMENTS ====================
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
        }
        catch (error) {
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
            const availableRequests = serviceRequests.filter(request => request.status === 'open' || request.status === 'pending' ||
                (request.status === 'assigned' && request.assignedProfessionalId === user.id));
            console.log('✅ Solicitações encontradas:', availableRequests.length);
            res.json(availableRequests);
        }
        catch (error) {
            console.error('❌ Erro ao buscar solicitações por categoria:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ==================== PROFESSIONAL COMPLETED SERVICES ====================
    // Get completed services for professional
    app.get('/api/professional/:id/completed-services', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const professionalId = parseInt(req.params.id);
            if (user.userType !== 'provider' || user.id !== professionalId) {
                return res.status(403).json({ message: 'Acesso negado. Você só pode acessar seus próprios dados.' });
            }
            console.log('📊 Buscando serviços concluídos para profissional ID:', professionalId);
            // Buscar service requests concluídos do profissional com dados completos
            const completedServices = await storage.getProfessionalCompletedServices(professionalId);
            console.log('✅ Serviços concluídos encontrados:', completedServices.length);
            res.json({ data: completedServices });
        }
        catch (error) {
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
            const payments = await storage.getPaymentsByProfessional(user.id, filter);
            // Buscar estatísticas de pagamento
            const stats = await storage.getPaymentStatsByProfessional(user.id);
            console.log('✅ Pagamentos encontrados:', payments.length);
            console.log('✅ Estatísticas:', stats);
            res.json({
                payments,
                stats
            });
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('❌ Erro ao buscar dados do dashboard:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
}
