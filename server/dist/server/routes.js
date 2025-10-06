import express from "express";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { storage } from "./storage.js";
import { generateToken, verifyPassword, hashPassword, rateLimitByIP, generateVerificationCode, sendSMSVerification, validateBrazilianPhone, authenticateToken } from "./auth.js";
import "./auth.js"; // Initialize passport strategies
import pgSession from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from 'stripe';
// Configure Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada nas variáveis de ambiente.');
}
const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
});
// Configure multer for file uploads
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: multerStorage });
export function setupRoutes(app, redisClient) {
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", "https://api.stripe.com"],
            },
        },
    }));
    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    // CORS configuration
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://lifebee.netlify.app',
            'https://lifebee-app.netlify.app'
        ];
        if (origin && allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
        }
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        }
        else {
            next();
        }
    });
    // Session configuration
    const RedisStore = pgSession(session);
    app.use(session({
        store: new RedisStore({
            conString: process.env.DATABASE_URL,
        }),
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    // ==================== STRIPE PAYMENT ROUTES ====================
    // Teste de configuração do Stripe
    app.get('/api/payment/test-config', async (req, res) => {
        try {
            console.log('🧪 Testando configuração do Stripe...');
            const config = {
                hasKey: !!process.env.STRIPE_SECRET_KEY,
                keyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
                frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
                backendUrl: process.env.BACKEND_URL || 'http://localhost:8080'
            };
            console.log('📋 Configuração:', config);
            res.json({
                success: true,
                config,
                message: 'Configuração verificada com sucesso'
            });
        }
        catch (error) {
            console.error('❌ Erro no teste de configuração:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    // Criar Payment Intent do Stripe
    app.post('/api/payment/create-intent', authenticateToken, async (req, res) => {
        try {
            console.log('🔍 Iniciando criação de Payment Intent');
            console.log('📝 Request body:', req.body);
            const { serviceOfferId } = req.body;
            if (!serviceOfferId) {
                console.log('❌ serviceOfferId não fornecido');
                return res.status(400).json({ error: 'serviceOfferId é obrigatório' });
            }
            // Verificar se a chave está configurada
            if (!process.env.STRIPE_SECRET_KEY) {
                console.log('❌ Chave do Stripe não configurada');
                return res.status(500).json({
                    error: 'Chave do Stripe não configurada. Configure STRIPE_SECRET_KEY no .env'
                });
            }
            // Busca dados necessários
            console.log('🔍 Buscando oferta de serviço ID:', serviceOfferId);
            const serviceOffer = await storage.getServiceOfferById(serviceOfferId);
            if (!serviceOffer) {
                console.log('❌ Oferta de serviço não encontrada');
                return res.status(404).json({ error: 'Oferta de serviço não encontrada' });
            }
            console.log('✅ Oferta encontrada:', { id: serviceOffer.id, price: serviceOffer.finalPrice || serviceOffer.proposedPrice });
            const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
            if (!serviceRequest) {
                console.log('❌ Solicitação de serviço não encontrada');
                return res.status(404).json({ error: 'Solicitação de serviço não encontrada' });
            }
            console.log('✅ Solicitação encontrada:', { id: serviceRequest.id, title: serviceRequest.title });
            const professional = await storage.getProfessionalById(serviceOffer.professionalId);
            if (!professional) {
                console.log('❌ Profissional não encontrado');
                return res.status(404).json({ error: 'Profissional não encontrado' });
            }
            console.log('✅ Profissional encontrado:', { id: professional.id, name: professional.name });
            // Converte valores para número
            const rawPrice = serviceOffer.finalPrice || serviceOffer.proposedPrice;
            console.log('💰 Preço bruto:', rawPrice, 'Tipo:', typeof rawPrice);
            if (!rawPrice || isNaN(parseFloat(rawPrice))) {
                console.log('❌ Preço inválido:', rawPrice);
                return res.status(400).json({ error: 'Preço inválido na oferta de serviço' });
            }
            const amount = parseFloat(rawPrice);
            const amountInCents = Math.round(amount * 100); // Stripe usa centavos
            console.log('💰 Valores calculados:', {
                amount,
                amountInCents,
                serviceOfferPrice: rawPrice
            });
            // Criar Payment Intent no Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'brl',
                metadata: {
                    serviceOfferId: serviceOffer.id.toString(),
                    serviceRequestId: serviceOffer.serviceRequestId.toString(),
                    clientId: serviceRequest.clientId.toString(),
                    professionalId: serviceOffer.professionalId.toString(),
                    serviceName: serviceRequest.title,
                    professionalName: professional.name
                },
                description: `Serviço: ${serviceRequest.title} - ${professional.name}`,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            console.log('✅ Payment Intent criado:', paymentIntent.id);
            // Salva referência do pagamento no banco
            const paymentReference = await storage.createPaymentReference({
                serviceRequestId: serviceOffer.serviceRequestId,
                serviceOfferId: serviceOffer.id,
                clientId: serviceRequest.clientId,
                professionalId: serviceOffer.professionalId,
                amount: amount.toString(),
                preferenceId: paymentIntent.id, // Usando o ID do Payment Intent
                status: 'pending',
                externalReference: `stripe_${paymentIntent.id}`
            });
            console.log('💾 Referência salva no banco:', paymentReference);
            res.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                success: true
            });
        }
        catch (error) {
            console.error('❌ Erro ao criar Payment Intent:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    });
    // Webhook para receber notificações do Stripe
    app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
        try {
            const sig = req.headers['stripe-signature'];
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test');
            }
            catch (err) {
                console.error('❌ Erro na verificação do webhook:', err);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
            console.log('🔔 Webhook recebido:', event.type);
            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    console.log('💳 Pagamento aprovado:', paymentIntent.id);
                    // Buscar a referência do pagamento no banco
                    const paymentRef = await storage.getPaymentReferenceByPreferenceId(paymentIntent.id);
                    if (paymentRef) {
                        // Atualizar o status do pagamento
                        await storage.updatePaymentReferenceStatus(paymentRef.preferenceId, 'approved', 'payment_intent.succeeded', paymentIntent.id, new Date());
                        // Atualizar o status da proposta para 'accepted'
                        await storage.updateServiceOfferStatus(paymentRef.serviceOfferId, 'accepted');
                        console.log('✅ Proposta marcada como paga');
                        // Notificar o cliente sobre o pagamento aprovado
                        await storage.createNotification({
                            userId: paymentRef.clientId,
                            type: 'payment_approved',
                            title: 'Pagamento Aprovado!',
                            message: `Seu pagamento de R$ ${paymentRef.amount} foi aprovado. O profissional foi notificado e entrará em contato em breve.`,
                            data: {
                                serviceRequestId: paymentRef.serviceRequestId,
                                serviceOfferId: paymentRef.serviceOfferId,
                                amount: paymentRef.amount,
                                paymentId: paymentIntent.id
                            }
                        });
                        // Notificar o profissional sobre o pagamento recebido
                        await storage.createNotification({
                            userId: paymentRef.professionalId,
                            type: 'payment_received',
                            title: 'Pagamento Recebido!',
                            message: `Você recebeu um pagamento de R$ ${(Number(paymentRef.amount) * 0.95).toFixed(2)} (após taxa de 5%). O cliente está aguardando o início do serviço.`,
                            data: {
                                serviceRequestId: paymentRef.serviceRequestId,
                                serviceOfferId: paymentRef.serviceOfferId,
                                amount: paymentRef.amount,
                                netAmount: (Number(paymentRef.amount) * 0.95).toFixed(2),
                                paymentId: paymentIntent.id
                            }
                        });
                        console.log('📧 Notificações de pagamento enviadas para cliente e profissional');
                    }
                    else {
                        console.log('⚠️ Referência de pagamento não encontrada para:', paymentIntent.id);
                    }
                    break;
                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object;
                    console.log('❌ Pagamento falhou:', failedPayment.id);
                    const failedPaymentRef = await storage.getPaymentReferenceByPreferenceId(failedPayment.id);
                    if (failedPaymentRef) {
                        await storage.updatePaymentReferenceStatus(failedPaymentRef.preferenceId, 'rejected', 'payment_intent.payment_failed');
                    }
                    break;
                default:
                    console.log(`🔔 Evento não tratado: ${event.type}`);
            }
            res.json({ received: true });
        }
        catch (error) {
            console.error('❌ Erro no webhook:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    // Verificar status de um pagamento
    app.get('/api/payment/status/:paymentIntentId', authenticateToken, async (req, res) => {
        try {
            const { paymentIntentId } = req.params;
            // Buscar referência do pagamento no banco
            const paymentRef = await storage.getPaymentReferenceByPreferenceId(paymentIntentId);
            if (!paymentRef) {
                return res.status(404).json({ error: 'Pagamento não encontrado' });
            }
            res.json({
                success: true,
                payment: {
                    status: paymentRef.status,
                    amount: paymentRef.amount,
                    serviceRequestId: paymentRef.serviceRequestId,
                    serviceOfferId: paymentRef.serviceOfferId,
                }
            });
        }
        catch (error) {
            console.error('❌ Erro ao verificar status do pagamento:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    // Dashboard de pagamentos para profissionais
    app.get('/api/provider/payments', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { filter = 'all' } = req.query;
            // Verificar se é um profissional
            if (user.userType !== 'provider') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            // Buscar pagamentos do profissional
            const payments = await storage.getProviderPayments(user.id, filter);
            // Calcular estatísticas
            const stats = await storage.getProviderPaymentStats(user.id);
            res.json({
                success: true,
                payments,
                stats
            });
        }
        catch (error) {
            console.error('Erro ao buscar pagamentos do profissional:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    // ==================== AUTHENTICATION ROUTES ====================
    // Register route
    app.post("/api/register", rateLimitByIP, async (req, res) => {
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
                return res.status(400).json({ message: "Email já está em uso" });
            }
            // Validate phone if provided
            if (phone && !validateBrazilianPhone(phone)) {
                return res.status(400).json({ message: "Número de telefone inválido" });
            }
            // Hash password
            const hashedPassword = await hashPassword(password);
            // Create user
            const user = await storage.createUser({
                username,
                email,
                password: hashedPassword,
                name,
                phone: phone || null,
                userType: userType || 'client'
            });
            // Generate token
            const token = generateToken(user);
            res.status(201).json({
                message: "Usuário criado com sucesso",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    userType: user.userType,
                    isVerified: user.isVerified
                }
            });
        }
        catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Login route
    app.post("/api/login", rateLimitByIP, async (req, res) => {
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
                return res.status(401).json({ message: "Conta bloqueada. Entre em contato com o suporte." });
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
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    userType: user.userType,
                    isVerified: user.isVerified,
                    lastLoginAt: user.lastLoginAt
                }
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Google OAuth routes
    app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), async (req, res) => {
        try {
            const user = req.user;
            const token = generateToken(user);
            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
        }
        catch (error) {
            console.error("Google OAuth callback error:", error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }
    });
    // Apple OAuth routes
    app.get("/auth/apple", passport.authenticate("apple"));
    app.post("/auth/apple/callback", passport.authenticate("apple", { failureRedirect: "/login" }), async (req, res) => {
        try {
            const user = req.user;
            const token = generateToken(user);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
        }
        catch (error) {
            console.error("Apple OAuth callback error:", error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }
    });
    // Phone verification routes
    app.post("/api/send-verification", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { phone } = req.body;
            if (!phone || !validateBrazilianPhone(phone)) {
                return res.status(400).json({ message: "Número de telefone inválido" });
            }
            const code = generateVerificationCode();
            await storage.saveVerificationCode(user.id, code);
            // Send SMS (implementar integração com provedor SMS)
            await sendSMSVerification(phone, code);
            res.json({ message: "Código de verificação enviado" });
        }
        catch (error) {
            console.error("Send verification error:", error);
            res.status(500).json({ message: "Erro ao enviar código de verificação" });
        }
    });
    app.post("/api/verify-phone", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { code } = req.body;
            const isValid = await storage.verifyPhoneCode(user.id, code);
            if (!isValid) {
                return res.status(400).json({ message: "Código inválido" });
            }
            await storage.markPhoneAsVerified(user.id);
            res.json({ message: "Telefone verificado com sucesso" });
        }
        catch (error) {
            console.error("Verify phone error:", error);
            res.status(500).json({ message: "Erro ao verificar telefone" });
        }
    });
    // ==================== USER ROUTES ====================
    // Get current user
    app.get("/api/user", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const fullUser = await storage.getUser(user.id);
            if (!fullUser) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            res.json({
                id: fullUser.id,
                username: fullUser.username,
                email: fullUser.email,
                name: fullUser.name,
                phone: fullUser.phone,
                phoneVerified: fullUser.phoneVerified,
                address: fullUser.address,
                profileImage: fullUser.profileImage,
                userType: fullUser.userType,
                isVerified: fullUser.isVerified,
                lastLoginAt: fullUser.lastLoginAt
            });
        }
        catch (error) {
            console.error("Get user error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Update user profile
    app.put("/api/user", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { name, phone, address, profileImage } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (phone) {
                if (!validateBrazilianPhone(phone)) {
                    return res.status(400).json({ message: "Número de telefone inválido" });
                }
                updateData.phone = phone;
                updateData.phoneVerified = false; // Reset verification when phone changes
            }
            if (address)
                updateData.address = address;
            if (profileImage)
                updateData.profileImage = profileImage;
            await storage.updateUser(user.id, updateData);
            res.json({ message: "Perfil atualizado com sucesso" });
        }
        catch (error) {
            console.error("Update user error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // ==================== PROFESSIONAL ROUTES ====================
    // Register as professional
    app.post("/api/register-professional", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { name, specialization, category, subCategory, description, experience, certifications, availableHours, hourlyRate } = req.body;
            // Validation
            if (!name || !specialization || !category || !subCategory || !description) {
                return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" });
            }
            // Check if user is already a professional
            const existingProfessional = await storage.getProfessionalByUserId(user.id);
            if (existingProfessional) {
                return res.status(400).json({ message: "Usuário já é um profissional registrado" });
            }
            // Create professional profile
            const professional = await storage.createProfessional({
                userId: user.id,
                name,
                specialization,
                category,
                subCategory,
                description,
                experience: experience || null,
                certifications: certifications || null,
                availableHours: availableHours || null,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null
            });
            res.status(201).json({
                message: "Perfil profissional criado com sucesso",
                professional: {
                    id: professional.id,
                    name: professional.name,
                    specialization: professional.specialization,
                    category: professional.category,
                    subCategory: professional.subCategory,
                    description: professional.description,
                    experience: professional.experience,
                    certifications: professional.certifications,
                    availableHours: professional.availableHours,
                    hourlyRate: professional.hourlyRate,
                    rating: professional.rating
                }
            });
        }
        catch (error) {
            console.error("Register professional error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Get professional profile
    app.get("/api/professional/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const professional = await storage.getProfessionalById(parseInt(id));
            if (!professional) {
                return res.status(404).json({ message: "Profissional não encontrado" });
            }
            res.json(professional);
        }
        catch (error) {
            console.error("Get professional error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Update professional profile
    app.put("/api/professional", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const professional = await storage.getProfessionalByUserId(user.id);
            if (!professional) {
                return res.status(404).json({ message: "Perfil profissional não encontrado" });
            }
            const { name, specialization, category, subCategory, description, experience, certifications, availableHours, hourlyRate } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (specialization)
                updateData.specialization = specialization;
            if (category)
                updateData.category = category;
            if (subCategory)
                updateData.subCategory = subCategory;
            if (description)
                updateData.description = description;
            if (experience)
                updateData.experience = experience;
            if (certifications)
                updateData.certifications = certifications;
            if (availableHours)
                updateData.availableHours = availableHours;
            if (hourlyRate)
                updateData.hourlyRate = parseFloat(hourlyRate);
            await storage.updateProfessional(professional.id, updateData);
            res.json({ message: "Perfil profissional atualizado com sucesso" });
        }
        catch (error) {
            console.error("Update professional error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // ==================== SERVICE REQUEST ROUTES ====================
    // Create service request
    app.post("/api/service-requests", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { title, description, category, budget, location, urgency, preferredDate, preferredTime } = req.body;
            // Validation
            if (!title || !description || !category || !budget || !location) {
                return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" });
            }
            const serviceRequest = await storage.createServiceRequest({
                clientId: user.id,
                title,
                description,
                category,
                budget: parseFloat(budget),
                location,
                urgency: urgency || 'medium',
                preferredDate: preferredDate ? new Date(preferredDate) : null,
                preferredTime: preferredTime || null
            });
            res.status(201).json({
                message: "Solicitação de serviço criada com sucesso",
                serviceRequest
            });
        }
        catch (error) {
            console.error("Create service request error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Get service requests
    app.get("/api/service-requests", async (req, res) => {
        try {
            const { category, location, minBudget, maxBudget } = req.query;
            const filters = {};
            if (category)
                filters.category = category;
            if (location)
                filters.location = location;
            if (minBudget)
                filters.minBudget = parseFloat(minBudget);
            if (maxBudget)
                filters.maxBudget = parseFloat(maxBudget);
            const serviceRequests = await storage.getServiceRequests(filters);
            res.json(serviceRequests);
        }
        catch (error) {
            console.error("Get service requests error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Get service request by ID
    app.get("/api/service-requests/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const serviceRequest = await storage.getServiceRequestById(parseInt(id));
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação de serviço não encontrada" });
            }
            res.json(serviceRequest);
        }
        catch (error) {
            console.error("Get service request error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // ==================== SERVICE OFFER ROUTES ====================
    // Create service offer
    app.post("/api/service-offers", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { serviceRequestId, proposedPrice, estimatedTime, message } = req.body;
            // Validation
            if (!serviceRequestId || !proposedPrice || !estimatedTime || !message) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }
            // Check if user is a professional
            const professional = await storage.getProfessionalByUserId(user.id);
            if (!professional) {
                return res.status(403).json({ message: "Apenas profissionais podem fazer propostas" });
            }
            // Check if service request exists
            const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação de serviço não encontrada" });
            }
            // Check if user already made an offer for this request
            const existingOffer = await storage.getServiceOfferByProfessionalAndRequest(professional.id, serviceRequestId);
            if (existingOffer) {
                return res.status(400).json({ message: "Você já fez uma proposta para esta solicitação" });
            }
            const serviceOffer = await storage.createServiceOffer({
                serviceRequestId,
                professionalId: professional.id,
                proposedPrice: parseFloat(proposedPrice),
                estimatedTime,
                message
            });
            res.status(201).json({
                message: "Proposta enviada com sucesso",
                serviceOffer
            });
        }
        catch (error) {
            console.error("Create service offer error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Get service offers for a request
    app.get("/api/service-requests/:id/offers", async (req, res) => {
        try {
            const { id } = req.params;
            const offers = await storage.getServiceOffersByRequestId(parseInt(id));
            res.json(offers);
        }
        catch (error) {
            console.error("Get service offers error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Accept service offer
    app.post("/api/service-offers/:id/accept", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const serviceOffer = await storage.getServiceOfferById(parseInt(id));
            if (!serviceOffer) {
                return res.status(404).json({ message: "Proposta não encontrada" });
            }
            const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação de serviço não encontrada" });
            }
            // Check if user is the client who made the request
            if (serviceRequest.clientId !== user.id) {
                return res.status(403).json({ message: "Apenas o cliente que fez a solicitação pode aceitar propostas" });
            }
            // Check if request is still open
            if (serviceRequest.status !== 'open') {
                return res.status(400).json({ message: "Esta solicitação não está mais aberta para propostas" });
            }
            // Accept the offer
            await storage.acceptServiceOffer(parseInt(id));
            res.json({ message: "Proposta aceita com sucesso" });
        }
        catch (error) {
            console.error("Accept service offer error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // ==================== NOTIFICATION ROUTES ====================
    // Get user notifications
    app.get("/api/notifications", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const notifications = await storage.getUserNotifications(user.id);
            res.json(notifications);
        }
        catch (error) {
            console.error("Get notifications error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Mark notification as read
    app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { id } = req.params;
            await storage.markNotificationAsRead(parseInt(id), user.id);
            res.json({ message: "Notificação marcada como lida" });
        }
        catch (error) {
            console.error("Mark notification as read error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // ==================== FILE UPLOAD ROUTES ====================
    // Upload profile image
    app.post("/api/upload/profile-image", authenticateToken, upload.single('image'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
            }
            const user = req.user;
            const imageUrl = `/uploads/${req.file.filename}`;
            await storage.updateUser(user.id, { profileImage: imageUrl });
            res.json({
                message: "Imagem de perfil atualizada com sucesso",
                imageUrl
            });
        }
        catch (error) {
            console.error("Upload profile image error:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });
    // Serve uploaded files
    app.use('/uploads', express.static('uploads'));
    // ==================== HEALTH CHECK ====================
    app.get("/api/health", (req, res) => {
        res.json({
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    // ==================== ERROR HANDLING ====================
    app.use((err, req, res, next) => {
        console.error("Unhandled error:", err);
        res.status(500).json({
            message: "Erro interno do servidor",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ message: "Rota não encontrada" });
    });
}
