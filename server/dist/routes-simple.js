"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const express_1 = __importDefault(require("express"));
const storage_js_1 = require("./storage.js");
const auth_js_1 = require("./auth.js");
const stripe_1 = __importDefault(require("stripe"));
// Configure Stripe
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente');
}
const stripe = new stripe_1.default(secretKey, {
    apiVersion: '2025-08-27.basil',
});
function setupRoutes(app, redisClient) {
    // ==================== STRIPE PAYMENT ROUTES ====================
    // Criar Payment Intent para uma proposta aceita
    app.post('/api/payment/create-intent', auth_js_1.authenticateToken, async (req, res) => {
        try {
            console.log('🔍 Iniciando criação de Payment Intent');
            const { serviceOfferId } = req.body;
            if (!serviceOfferId) {
                return res.status(400).json({ error: 'serviceOfferId é obrigatório' });
            }
            // Busca dados necessários
            const serviceOffer = await storage_js_1.storage.getServiceOfferById(serviceOfferId);
            if (!serviceOffer) {
                return res.status(404).json({ error: 'Oferta de serviço não encontrada' });
            }
            const serviceRequest = await storage_js_1.storage.getServiceRequestById(serviceOffer.serviceRequestId);
            if (!serviceRequest) {
                return res.status(404).json({ error: 'Solicitação de serviço não encontrada' });
            }
            const professional = await storage_js_1.storage.getProfessionalById(serviceOffer.professionalId);
            if (!professional) {
                return res.status(404).json({ error: 'Profissional não encontrado' });
            }
            const rawPrice = serviceOffer.finalPrice || serviceOffer.proposedPrice;
            if (!rawPrice || isNaN(parseFloat(rawPrice))) {
                return res.status(400).json({ error: 'Preço inválido na oferta de serviço' });
            }
            const amount = parseFloat(rawPrice);
            const lifebeeCommission = amount * 0.05; // 5% de comissão
            const professionalAmount = amount - lifebeeCommission;
            // Cria Payment Intent no Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects amount in cents
                currency: 'brl',
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
            const paymentReference = await storage_js_1.storage.createPaymentReference({
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
    // Webhook para receber notificações do Stripe
    app.post('/api/payment/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.error(`❌ Erro de verificação do Webhook Stripe: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntentSucceeded = event.data.object;
                console.log('✅ PaymentIntent succeeded:', paymentIntentSucceeded.id);
                // Update payment status in DB
                await storage_js_1.storage.updatePaymentReferenceStatus(paymentIntentSucceeded.id, 'approved', 'succeeded', paymentIntentSucceeded.id, new Date());
                // Update service offer status
                const serviceOfferIdApproved = paymentIntentSucceeded.metadata.serviceOfferId;
                if (serviceOfferIdApproved) {
                    await storage_js_1.storage.updateServiceOfferStatus(parseInt(serviceOfferIdApproved), 'accepted');
                    console.log(`✅ Proposta ${serviceOfferIdApproved} marcada como paga`);
                }
                break;
            case 'payment_intent.payment_failed':
                const paymentIntentFailed = event.data.object;
                console.log('❌ PaymentIntent failed:', paymentIntentFailed.id);
                // Update payment status in DB
                await storage_js_1.storage.updatePaymentReferenceStatus(paymentIntentFailed.id, 'rejected', paymentIntentFailed.last_payment_error?.message || 'failed', paymentIntentFailed.id);
                break;
            case 'payment_intent.processing':
                const paymentIntentProcessing = event.data.object;
                console.log('⏳ PaymentIntent processing:', paymentIntentProcessing.id);
                // Update payment status in DB
                await storage_js_1.storage.updatePaymentReferenceStatus(paymentIntentProcessing.id, 'pending', 'processing', paymentIntentProcessing.id);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.status(200).json({ received: true });
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
}
