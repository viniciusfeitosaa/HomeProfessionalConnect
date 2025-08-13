import express from "express";
import { createServer } from "http";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { storage } from "./storage.js";
import { generateToken, verifyPassword, hashPassword, rateLimitByIP, authenticateToken } from "./auth.js";
import "./auth.js"; // Initialize passport strategies
import pgSession from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
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
const upload = multer({
    storage: multerStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Apenas imagens são permitidas!'));
        }
    }
});
// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased limit for development
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for development
        return process.env.NODE_ENV === 'development' || true; // Always skip for now
    }
});
export async function registerRoutes(app) {
    // Test route to verify server is running
    app.get('/api/test', (req, res) => {
        res.json({
            message: 'Server is running!',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
            googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
            googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente',
            callbackUrl: process.env.NODE_ENV === 'production'
                ? "https://lifebee-backend.onrender.com/api/auth/google/callback"
                : "http://localhost:5000/api/auth/google/callback"
        });
    });
    // Test route to check if Google OAuth routes are registered
    app.get('/api/auth/test', (req, res) => {
        res.json({
            message: 'Google OAuth routes are registered',
            googleAuthUrl: '/api/auth/google',
            googleCallbackUrl: '/api/auth/google/callback',
            googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
            googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente',
            nodeEnv: process.env.NODE_ENV || 'development',
            callbackUrl: process.env.NODE_ENV === 'production'
                ? "https://lifebee-backend.onrender.com/api/auth/google/callback"
                : "http://localhost:5000/api/auth/google/callback"
        });
    });
    // Serve uploaded files - MUST BE BEFORE OTHER ROUTES
    const uploadsPath = path.resolve(process.cwd(), 'uploads');
    console.log('📁 Configurando middleware para arquivos estáticos em:', uploadsPath);
    console.log('📁 Diretório atual (process.cwd()):', process.cwd());
    // Criar diretório uploads se não existir
    if (!fs.existsSync(uploadsPath)) {
        console.log('📁 Criando diretório uploads...');
        fs.mkdirSync(uploadsPath, { recursive: true });
    }
    console.log('📁 Diretório uploads existe:', fs.existsSync(uploadsPath));
    // Tentar ler o conteúdo do diretório apenas se existir
    try {
        const uploadsContent = fs.readdirSync(uploadsPath);
        console.log('📁 Conteúdo do diretório uploads:', uploadsContent);
    }
    catch (error) {
        console.log('📁 Diretório uploads está vazio ou não pode ser lido:', error);
    }
    // Servir arquivos estáticos com CORS
    app.use('/uploads', express.static(uploadsPath, {
        setHeaders: (res, path) => {
            console.log('📂 Servindo arquivo:', path);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
        }
    }));
    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    });
    // Test endpoint to check authentication
    app.get('/api/test-auth', authenticateToken, (req, res) => {
        const user = req.user;
        res.status(200).json({
            message: 'Authentication successful',
            user: {
                id: user.id,
                name: user.name,
                userType: user.userType,
                email: user.email
            }
        });
    });
    // Configure trust proxy more securely
    app.set('trust proxy', 1);
    // Security middleware with CSP configuration for development
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:", "http:"], // Permitir http para desenvolvimento
                connectSrc: ["'self'", "ws:", "wss:", "https:", "http:", "https://accounts.google.com"], // Permitir http para desenvolvimento
                frameSrc: ["'self'", "https://accounts.google.com"]
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false // Desabilitar para permitir cross-origin
    }));
    // Session configuration with PostgreSQL store
    const PgSession = pgSession(session);
    app.use(session({
        store: new PgSession({
            conString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
            tableName: 'sessions', // tabela para armazenar as sessões
            createTableIfMissing: true, // cria a tabela automaticamente se não existir
        }),
        secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'fallback-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
        },
        name: 'lifebee.sid' // nome personalizado do cookie
    }));
    // Initialize passport
    app.use(passport.initialize());
    app.use(passport.session());
    // Authentication routes
    // Traditional login
    app.post('/api/auth/login', authLimiter, rateLimitByIP, async (req, res) => {
        try {
            const { email, password, userType } = req.body;
            // Validate input
            if (!email || !password) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios' });
            }
            // Email validation removed for production readiness
            // Find user
            const user = await storage.getUserByEmail(email);
            if (!user || user.isBlocked) {
                await storage.createLoginAttempt({
                    email,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.get('User-Agent') || 'unknown',
                    successful: false,
                    blocked: false
                });
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
            // Verify password
            if (!user.password || !await verifyPassword(password, user.password)) {
                await storage.createLoginAttempt({
                    email,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.get('User-Agent') || 'unknown',
                    successful: false,
                    blocked: false
                });
                // Increment login attempts
                const attempts = (user.loginAttempts || 0) + 1;
                await storage.updateUserLoginAttempts(user.id, attempts);
                // Block user after 5 failed attempts
                if (attempts >= 5) {
                    await storage.blockUser(user.id);
                    return res.status(403).json({ message: 'Conta bloqueada por muitas tentativas de login' });
                }
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
            // User type check removed - allow login regardless of userType selection
            // Successful login
            await storage.updateUser(user.id, {
                lastLoginAt: new Date(),
                loginAttempts: 0
            });
            await storage.createLoginAttempt({
                email,
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                successful: true,
                blocked: false
            });
            const token = generateToken(user);
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    userType: user.userType,
                    isVerified: user.isVerified,
                    phoneVerified: user.phoneVerified
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Registration
    app.post('/api/auth/register', authLimiter, async (req, res) => {
        try {
            const { username, email, password, name, userType, phone } = req.body;
            // Validate input
            if (!username || !email || !password || !name) {
                return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
            }
            // Email validation removed for production readiness
            // Phone validation removed for production readiness
            // Check if user already exists
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'Email já cadastrado' });
            }
            const existingUsername = await storage.getUserByUsername(username);
            if (existingUsername) {
                return res.status(409).json({ message: 'Nome de usuário já existe' });
            }
            // Hash password
            const hashedPassword = await hashPassword(password);
            // Create user
            const user = await storage.createUser({
                username,
                email,
                password: hashedPassword,
                name,
                userType: userType || 'client',
                phone: phone || null,
                phoneVerified: false,
                googleId: null,
                appleId: null,
                address: null,
                profileImage: null,
                isVerified: false,
                isBlocked: false,
                lastLoginAt: null,
                loginAttempts: 0,
                resetToken: null,
                resetTokenExpiry: null
            });
            // Auto-verify user without SMS
            const updatedUser = await storage.updateUser(user.id, {
                phoneVerified: true,
                isVerified: true
            });
            // Se for provider, cria também na tabela professionals
            if ((userType || 'client') === 'provider') {
                await storage.createProfessional({
                    userId: updatedUser.id,
                    name: name,
                    specialization: 'A definir', // Pode ser preenchido depois
                    category: 'fisioterapeuta', // Pode ser preenchido depois
                    subCategory: 'companhia_apoio_emocional', // Pode ser preenchido depois
                    description: 'Descrição a ser preenchida',
                    experience: '',
                    certifications: '',
                    availableHours: '',
                    hourlyRate: '0',
                    rating: '5.0',
                    totalReviews: 0,
                    location: '',
                    distance: '0',
                    available: true,
                    imageUrl: '',
                    createdAt: new Date()
                });
            }
            // Create welcome notification for new user
            await storage.createNotification({
                userId: user.id,
                message: `Bem-vindo à LifeBee, ${user.name}! Sua conta foi criada com sucesso.`,
                read: false
            });
            const token = generateToken(updatedUser);
            res.status(201).json({
                token,
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    userType: updatedUser.userType,
                    isVerified: true,
                    phoneVerified: true,
                    phone: updatedUser.phone
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Messages API for client-professional communication
    app.get('/api/messages', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            console.log('🔍 GET /api/messages - Usuário autenticado:', user.id, user.userType);
            console.log('🔍 Headers da requisição:', req.headers.authorization ? 'Token presente' : 'Token ausente');
            // Buscar conversas do usuário no banco de dados
            const userConversations = await storage.getConversationsByUser(user.id);
            console.log('📋 Conversas retornadas para usuário', user.id, ':', userConversations.length);
            console.log('📋 Detalhes das conversas:', userConversations.map(c => ({
                id: c.id,
                clientId: c.clientId,
                professionalId: c.professionalId,
                deletedByClient: c.deletedByClient,
                deletedByProfessional: c.deletedByProfessional
            })));
            // Log adicional para debug
            if (userConversations.length === 0) {
                console.log('⚠️ Nenhuma conversa encontrada para o usuário', user.id);
            }
            if (userConversations && userConversations.length > 0) {
                // Se há conversas reais, retornar elas
                const conversationsWithDetails = await Promise.all(userConversations.map(async (conv) => {
                    let otherUser, otherName, otherAvatar;
                    let specialization = "";
                    let rating = 5.0;
                    let location = "";
                    if (user.userType === 'provider') {
                        // Para o provider, destaque o cliente
                        otherUser = await storage.getUser(conv.clientId);
                        otherName = otherUser?.name || "Cliente";
                        otherAvatar = otherUser?.profileImage || "";
                        // Campos extras para cliente já estão com valores padrão
                    }
                    else {
                        // Para o cliente, destaque o profissional
                        otherUser = await storage.getProfessional(conv.professionalId);
                        otherName = otherUser?.name || "Profissional";
                        otherAvatar = otherUser?.imageUrl || "";
                        specialization = otherUser?.specialization || "";
                        rating = Number(otherUser?.rating) || 5.0;
                        location = otherUser?.location || "";
                    }
                    const lastMessage = await storage.getLastMessageByConversation(conv.id);
                    return {
                        id: conv.id,
                        clientId: conv.clientId,
                        clientName: user.userType === 'provider' ? otherName : undefined,
                        clientAvatar: user.userType === 'provider' ? otherAvatar : undefined,
                        professionalId: conv.professionalId,
                        professionalName: user.userType === 'client' ? otherName : undefined,
                        professionalAvatar: user.userType === 'client' ? otherAvatar : undefined,
                        specialization,
                        lastMessage: lastMessage?.content || "Nenhuma mensagem",
                        lastMessageTime: lastMessage?.timestamp || conv.createdAt,
                        unreadCount: await storage.getUnreadMessageCount(conv.id, user.id),
                        isOnline: Math.random() > 0.5, // Simular status online
                        rating,
                        location,
                        messages: await storage.getMessagesByConversation(conv.id)
                    };
                }));
                res.json(conversationsWithDetails);
            }
            else {
                // Se não há conversas, retornar array vazio
                res.json([]);
            }
        }
        catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    app.post('/api/messages', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { recipientId, content, type, conversationId } = req.body;
            console.log('📨 POST /api/messages - Usuário:', user.id, user.userType);
            console.log('📨 Dados da mensagem:', { recipientId, content, type, conversationId });
            if (!recipientId || !content || !conversationId) {
                return res.status(400).json({ message: 'Destinatário, conversa e conteúdo são obrigatórios' });
            }
            // Verificar se o usuário faz parte da conversa (incluindo conversas deletadas)
            const conversations = await storage.getConversationsByUser(user.id);
            console.log('📨 Conversas do usuário:', conversations.map(c => ({ id: c.id, deletedByClient: c.deletedByClient, deletedByProfessional: c.deletedByProfessional })));
            const isParticipant = conversations.some(conv => conv.id === conversationId);
            console.log('📨 Usuário é participante?', isParticipant);
            if (!isParticipant) {
                console.log('📨 Usuário não é participante, verificando se conversa foi deletada...');
                // Verificar se a conversa foi deletada pelo usuário
                const isDeletedByUser = await storage.isConversationDeletedByUser(conversationId, user.id);
                console.log('📨 Conversa foi deletada pelo usuário?', isDeletedByUser);
                if (isDeletedByUser) {
                    // Restaurar a conversa automaticamente para o usuário
                    await storage.restoreConversation(conversationId, user.id);
                    console.log(`✅ Conversa ${conversationId} restaurada automaticamente para usuário ${user.id}`);
                }
                else {
                    console.log('❌ Acesso negado à conversa');
                    return res.status(403).json({ message: 'Acesso negado à conversa' });
                }
            }
            // Verificar se a conversa foi deletada pelo destinatário e restaurar se necessário
            const isDeletedByRecipient = await storage.isConversationDeletedByUser(conversationId, recipientId);
            if (isDeletedByRecipient) {
                await storage.restoreConversation(conversationId, recipientId);
                console.log(`✅ Conversa ${conversationId} restaurada automaticamente para destinatário ${recipientId}`);
            }
            const message = await storage.createMessage({
                conversationId,
                senderId: user.id,
                recipientId,
                content,
                type: type || 'text',
                isRead: false
            });
            console.log('✅ Mensagem criada com sucesso:', message.id);
            res.status(201).json(message);
        }
        catch (error) {
            console.error('❌ Send message error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Start conversation with professional
    app.post('/api/messages/start-conversation', authenticateToken, async (req, res) => {
        console.log('🚀 POST /api/messages/start-conversation chamada');
        console.log('📨 Body recebido:', JSON.stringify(req.body));
        console.log('👤 Usuário autenticado:', req.user);
        try {
            const user = req.user;
            const { professionalId, message } = req.body;
            console.log('professionalId recebido:', professionalId);
            // Verify if professional exists
            const professional = await storage.getProfessional(professionalId);
            console.log('Resultado da busca do profissional:', professional);
            if (!professional) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            // Check if conversation already exists
            const existingConversation = await storage.getConversation(user.id, professionalId);
            if (existingConversation) {
                // Verificar se a conversa foi deletada pelo usuário e restaurar se necessário
                const isDeletedByUser = await storage.isConversationDeletedByUser(existingConversation.id, user.id);
                if (isDeletedByUser) {
                    await storage.restoreConversation(existingConversation.id, user.id);
                    console.log(`✅ Conversa ${existingConversation.id} restaurada automaticamente para usuário ${user.id} (start-conversation)`);
                }
                // Verificar se a conversa foi deletada pelo profissional e restaurar se necessário
                const isDeletedByProfessional = await storage.isConversationDeletedByUser(existingConversation.id, professionalId);
                if (isDeletedByProfessional) {
                    await storage.restoreConversation(existingConversation.id, professionalId);
                    console.log(`✅ Conversa ${existingConversation.id} restaurada automaticamente para profissional ${professionalId} (start-conversation)`);
                }
                // If conversation exists, just send the message
                const newMessage = await storage.createMessage({
                    conversationId: existingConversation.id,
                    senderId: user.id,
                    recipientId: professionalId,
                    content: message || 'Olá! Gostaria de conversar sobre seus serviços.',
                    type: 'text',
                    isRead: false
                });
                return res.status(200).json({
                    message: 'Mensagem enviada com sucesso',
                    conversationId: existingConversation.id,
                    messageData: newMessage
                });
            }
            else {
                // Create new conversation
                const conversation = await storage.createConversation({
                    clientId: user.id,
                    professionalId: professionalId,
                    deletedByClient: false,
                    deletedByProfessional: false
                });
                // Send initial message
                const initialMessage = await storage.createMessage({
                    conversationId: conversation.id,
                    senderId: user.id,
                    recipientId: professionalId,
                    content: message || 'Olá! Gostaria de conversar sobre seus serviços.',
                    type: 'text',
                    isRead: false
                });
                return res.status(201).json({
                    message: 'Conversa iniciada com sucesso',
                    conversationId: conversation.id,
                    messageData: initialMessage
                });
            }
        }
        catch (error) {
            console.error('Start conversation error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Professional start conversation with client
    app.post('/api/conversations', authenticateToken, async (req, res) => {
        console.log('🚀 POST /api/conversations chamada');
        console.log('📨 Body recebido:', JSON.stringify(req.body));
        console.log('👤 Usuário autenticado:', req.user);
        try {
            const user = req.user;
            const { clientId, serviceRequestId, initialMessage } = req.body;
            // Verificar se o usuário é um profissional
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: 'Apenas profissionais podem iniciar conversas' });
            }
            console.log('clientId recebido:', clientId);
            console.log('serviceRequestId recebido:', serviceRequestId);
            // Verificar se o cliente existe
            const client = await storage.getUser(clientId);
            console.log('Resultado da busca do cliente:', client);
            if (!client) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }
            // Verificar se a conversa já existe
            const existingConversation = await storage.getConversation(clientId, user.id);
            if (existingConversation) {
                // Verificar se a conversa foi deletada pelo cliente e restaurar se necessário
                const isDeletedByClient = await storage.isConversationDeletedByUser(existingConversation.id, clientId);
                if (isDeletedByClient) {
                    await storage.restoreConversation(existingConversation.id, clientId);
                    console.log(`✅ Conversa ${existingConversation.id} restaurada automaticamente para cliente ${clientId}`);
                }
                // Verificar se a conversa foi deletada pelo profissional e restaurar se necessário
                const isDeletedByProfessional = await storage.isConversationDeletedByUser(existingConversation.id, user.id);
                if (isDeletedByProfessional) {
                    await storage.restoreConversation(existingConversation.id, user.id);
                    console.log(`✅ Conversa ${existingConversation.id} restaurada automaticamente para profissional ${user.id}`);
                }
                // Se a conversa existe, apenas enviar a mensagem
                const newMessage = await storage.createMessage({
                    conversationId: existingConversation.id,
                    senderId: user.id,
                    recipientId: clientId,
                    content: initialMessage || 'Olá! Gostaria de conversar sobre o serviço.',
                    type: 'text',
                    isRead: false
                });
                return res.status(200).json({
                    message: 'Mensagem enviada com sucesso',
                    id: existingConversation.id,
                    conversationId: existingConversation.id,
                    messageData: newMessage
                });
            }
            else {
                // Criar nova conversa
                const conversation = await storage.createConversation({
                    clientId: clientId,
                    professionalId: user.id,
                    deletedByClient: false,
                    deletedByProfessional: false
                });
                // Enviar mensagem inicial
                const initialMsg = await storage.createMessage({
                    conversationId: conversation.id,
                    senderId: user.id,
                    recipientId: clientId,
                    content: initialMessage || 'Olá! Gostaria de conversar sobre o serviço.',
                    type: 'text',
                    isRead: false
                });
                return res.status(201).json({
                    message: 'Conversa iniciada com sucesso',
                    id: conversation.id,
                    conversationId: conversation.id,
                    messageData: initialMsg
                });
            }
        }
        catch (error) {
            console.error('Professional start conversation error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // User profile management
    app.put('/api/user/profile', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { name, email, phone, address, bio } = req.body;
            const updatedUser = await storage.updateUser(user.id, {
                name,
                email,
                phone,
                // address and bio would need to be added to schema
            });
            res.json({
                message: 'Perfil atualizado com sucesso',
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    userType: updatedUser.userType,
                    phone: updatedUser.phone
                }
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Change password
    app.put('/api/user/password', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
            }
            // Verify current password
            const isValidPassword = await verifyPassword(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Senha atual incorreta' });
            }
            // Hash new password
            const hashedPassword = await hashPassword(newPassword);
            // Update password
            await storage.updateUser(user.id, { password: hashedPassword });
            res.json({ message: 'Senha alterada com sucesso' });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Delete account
    app.delete('/api/user/account', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            // In a real app, you would soft delete or properly handle data removal
            // For now, just return success
            res.json({ message: 'Conta excluída com sucesso' });
        }
        catch (error) {
            console.error('Delete account error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get appointments
    app.get('/api/appointments', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const appointments = await storage.getAppointmentsByUser(user.id);
            res.json(appointments);
        }
        catch (error) {
            console.error('Get appointments error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get current user
    app.get("/api/user", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                isVerified: user.isVerified,
                phoneVerified: user.phoneVerified,
                phone: user.phone,
                profileImage: user.profileImage
            });
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Logout
    app.post('/api/auth/logout', (req, res) => {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao fazer logout' });
            }
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao destruir sessão' });
                }
                res.clearCookie('connect.sid');
                res.json({ message: 'Logout realizado com sucesso' });
            });
        });
    });
    // Get all professionals
    app.get("/api/professionals", async (req, res) => {
        try {
            const { category, search } = req.query;
            let professionals;
            if (search && typeof search === 'string') {
                professionals = await storage.searchProfessionals(search);
            }
            else if (category && typeof category === 'string') {
                professionals = await storage.getProfessionalsByCategory(category);
            }
            else {
                professionals = await storage.getAllProfessionals();
            }
            res.json(professionals);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Get professional by ID
    app.get("/api/professionals/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const professional = await storage.getProfessional(id);
            if (!professional) {
                return res.status(404).json({ message: "Professional not found" });
            }
            res.json(professional);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Get user appointments
    app.get("/api/appointments", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const appointments = await storage.getAppointmentsByUser(user.id);
            res.json(appointments);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Get provider appointments
    app.get("/api/appointments/provider", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            const appointments = await storage.getAppointmentsByProfessional(user.id);
            res.json(appointments);
        }
        catch (error) {
            console.error('Get provider appointments error:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Get user notifications
    app.get("/api/notifications", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const notifications = await storage.getNotificationsByUser(user.id);
            res.json(notifications);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Get unread notification count
    app.get("/api/notifications/count", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const count = await storage.getUnreadNotificationCount(user.id);
            res.json({ count });
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Mark notification as read
    app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await storage.markNotificationRead(id);
            res.json({ message: "Notification marked as read" });
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Payment route (simplified for demo)
    app.post("/api/create-payment-intent", async (req, res) => {
        try {
            const { amount } = req.body;
            if (!amount || amount < 50) {
                return res.status(400).json({ message: "Invalid amount" });
            }
            // Simulate payment processing for demo
            res.json({
                clientSecret: "demo_payment_" + Date.now(),
                success: true,
                message: "Payment processed successfully"
            });
        }
        catch (error) {
            console.error("Payment error:", error);
            res.status(500).json({
                message: "Error processing payment: " + (error instanceof Error ? error.message : 'Erro desconhecido')
            });
        }
    });
    // ===== ROTAS PARA PEDIDOS DO PROFISSIONAL =====
    // Get orders for professional
    app.get("/api/provider/orders", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Buscar pedidos reais do banco de dados
            const orders = await storage.getAppointmentsByProfessional(user.id) || [];
            res.json(orders);
        }
        catch (error) {
            console.error('Get provider orders error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Accept order
    app.post("/api/provider/orders/:id/accept", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const orderId = parseInt(req.params.id);
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Mock implementation - will be replaced with real database update
            console.log(`Professional ${user.id} accepted order ${orderId}`);
            res.json({
                message: "Pedido aceito com sucesso",
                orderId: orderId,
                status: "accepted"
            });
        }
        catch (error) {
            console.error('Accept order error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Reject order
    app.post("/api/provider/orders/:id/reject", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const orderId = parseInt(req.params.id);
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Mock implementation - will be replaced with real database update
            console.log(`Professional ${user.id} rejected order ${orderId}`);
            res.json({
                message: "Pedido rejeitado com sucesso",
                orderId: orderId,
                status: "rejected"
            });
        }
        catch (error) {
            console.error('Reject order error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Complete order
    app.post("/api/provider/orders/:id/complete", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const orderId = parseInt(req.params.id);
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Mock implementation - will be replaced with real database update
            console.log(`Professional ${user.id} completed order ${orderId}`);
            res.json({
                message: "Pedido concluído com sucesso",
                orderId: orderId,
                status: "completed"
            });
        }
        catch (error) {
            console.error('Complete order error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ===== ROTAS PARA PERFIL DO PROFISSIONAL =====
    // Get provider profile
    app.get("/api/provider/profile", authenticateToken, async (req, res) => {
        try {
            console.log('Provider profile request received');
            const user = req.user;
            console.log('User data:', { id: user.id, userType: user.userType });
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Get professional data from database
            console.log('Fetching professional data for user ID:', user.id);
            const professional = await storage.getProfessionalByUserId(user.id);
            console.log('Professional data:', professional);
            // Get user data
            console.log('Fetching user data for user ID:', user.id);
            const userData = await storage.getUser(user.id);
            console.log('User data:', userData);
            if (!userData) {
                return res.status(404).json({ message: "Dados do usuário não encontrados." });
            }
            // If no professional data exists, create a basic profile
            if (!professional) {
                console.log('No professional data found, creating basic profile');
                const basicProfile = {
                    id: 0,
                    userId: user.id,
                    name: userData.name || "",
                    specialization: "",
                    category: "",
                    subCategory: "",
                    description: "",
                    experience: "",
                    certifications: "",
                    availableHours: "",
                    hourlyRate: "",
                    rating: "5.0",
                    totalReviews: 0,
                    location: "",
                    distance: "",
                    available: true,
                    imageUrl: userData.profileImage || "",
                    createdAt: new Date().toISOString(),
                    email: userData.email,
                    phone: userData.phone
                };
                console.log('Sending basic profile data:', basicProfile);
                return res.json(basicProfile);
            }
            // Combine professional and user data
            const profileData = {
                ...professional,
                email: userData.email,
                phone: userData.phone
            };
            console.log('Sending profile data:', profileData);
            res.json(profileData);
        }
        catch (error) {
            console.error('Get provider profile error:', error);
            res.status(500).json({ message: 'Erro interno do servidor', error: error instanceof Error ? error.message : 'Erro desconhecido' });
        }
    });
    // Update provider profile
    app.put("/api/provider/profile", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { name, specialization, category, subCategory, description, experience, certifications, hourlyRate, location, available } = req.body;
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Get professional data
            const professional = await storage.getProfessionalByUserId(user.id);
            if (!professional) {
                return res.status(404).json({ message: "Dados do profissional não encontrados." });
            }
            // Update professional data
            const updatedProfessional = await storage.updateProfessional(professional.id, {
                name,
                specialization,
                category,
                subCategory,
                description,
                experience,
                certifications,
                hourlyRate,
                location,
                available
            });
            // Update user data if name changed
            if (name && name !== user.name) {
                await storage.updateUser(user.id, { name });
            }
            res.json({
                message: "Perfil atualizado com sucesso",
                professional: updatedProfessional
            });
        }
        catch (error) {
            console.error('Update provider profile error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Upload profile image for providers
    app.post("/api/provider/upload-image", authenticateToken, upload.single('profileImage'), async (req, res) => {
        try {
            const user = req.user;
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            if (!req.file) {
                return res.status(400).json({ message: "Nenhuma imagem foi enviada." });
            }
            // Create the image URL
            const imageUrl = `/uploads/${req.file.filename}`;
            // Update user profile image
            await storage.updateUser(user.id, { profileImage: imageUrl });
            // Update professional image URL if professional exists
            const professional = await storage.getProfessionalByUserId(user.id);
            if (professional) {
                await storage.updateProfessional(professional.id, { imageUrl });
            }
            res.json({
                message: "Imagem de perfil atualizada com sucesso",
                imageUrl: imageUrl
            });
        }
        catch (error) {
            console.error('Upload profile image error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Upload profile image for all users (clients and providers)
    app.post("/api/user/upload-image", authenticateToken, upload.single('profileImage'), async (req, res) => {
        try {
            const user = req.user;
            if (!req.file) {
                return res.status(400).json({ message: "Nenhuma imagem foi enviada." });
            }
            // Create the image URL
            const imageUrl = `/uploads/${req.file.filename}`;
            // Update user profile image
            await storage.updateUser(user.id, { profileImage: imageUrl });
            // If user is a provider, also update professional image URL
            if (user.userType === 'provider') {
                const professional = await storage.getProfessionalByUserId(user.id);
                if (professional) {
                    await storage.updateProfessional(professional.id, { imageUrl });
                }
            }
            res.json({
                message: "Imagem de perfil atualizada com sucesso",
                imageUrl: imageUrl
            });
        }
        catch (error) {
            console.error('Upload profile image error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Update user profile
    app.put("/api/user/profile", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { name, email, phone, address } = req.body;
            // Validate required fields
            if (!name || !email) {
                return res.status(400).json({ message: "Nome e email são obrigatórios." });
            }
            // Check if email is already taken by another user
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser && existingUser.id !== user.id) {
                return res.status(400).json({ message: "Este email já está em uso por outro usuário." });
            }
            // Update user profile
            const updatedUser = await storage.updateUser(user.id, {
                name,
                email,
                phone: phone || null,
                address: address || null
            });
            res.json({
                message: "Perfil atualizado com sucesso",
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    profileImage: updatedUser.profileImage,
                    userType: updatedUser.userType
                }
            });
        }
        catch (error) {
            console.error('Update user profile error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ===== ROTAS PARA CONFIGURAÇÕES DO PROFISSIONAL =====
    // Get provider settings
    app.get("/api/provider/settings", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Mock settings data
            const settings = {
                profile: {
                    name: "Ana Carolina Silva",
                    email: "ana.carolina@email.com",
                    phone: "(11) 99999-9999",
                    specialization: "Fisioterapeuta"
                },
                availability: {
                    isAvailable: true,
                    workStartTime: "08:00",
                    workEndTime: "18:00"
                },
                notifications: {
                    newOrders: true,
                    messages: true,
                    payments: true,
                    reminders: true,
                    marketing: false
                },
                payments: {
                    bankAccount: "Banco do Brasil •••• 1234",
                    pixKey: "ana.carolina@email.com"
                }
            };
            res.json(settings);
        }
        catch (error) {
            console.error('Get provider settings error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Update provider settings
    app.put("/api/provider/settings", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { profile, availability, notifications, payments } = req.body;
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Mock implementation - will be replaced with real database update
            console.log(`Updating settings for professional ${user.id}:`, {
                profile,
                availability,
                notifications,
                payments
            });
            res.json({
                message: "Configurações atualizadas com sucesso",
                settings: { profile, availability, notifications, payments }
            });
        }
        catch (error) {
            console.error('Update provider settings error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Update provider availability
    app.put("/api/provider/availability", authenticateToken, async (req, res) => {
        console.log('🔧 Rota /api/provider/availability foi chamada');
        try {
            const user = req.user;
            const { available } = req.body;
            console.log('👤 Usuário:', user);
            console.log('📊 Dados recebidos:', { available });
            // Verify user is a provider
            if (user.userType !== 'provider') {
                console.log('❌ Usuário não é profissional:', user.userType);
                return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
            }
            // Validate input
            if (typeof available !== 'boolean') {
                console.log('❌ Tipo inválido para available:', typeof available);
                return res.status(400).json({ message: "O campo 'available' deve ser um valor booleano" });
            }
            console.log('✅ Atualizando disponibilidade do profissional ID:', user.id, 'para:', available);
            // Update professional availability in database
            await storage.updateProfessionalAvailability(user.id, available);
            console.log(`✅ Professional ${user.id} availability updated to: ${available}`);
            res.json({
                message: "Disponibilidade atualizada com sucesso",
                available
            });
        }
        catch (error) {
            console.error('💥 Update provider availability error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ===== ROTAS PARA SOLICITAÇÕES DE SERVIÇO =====
    // Get my service requests (alias for client) - DEVE VIR ANTES de todas as outras rotas
    app.get("/api/service-requests/my-requests", authenticateToken, async (req, res) => {
        console.log('🔍 Rota /api/service-requests/my-requests foi chamada');
        try {
            const user = req.user;
            console.log('👤 Usuário:', user);
            // Verify user is a client
            if (user.userType !== 'client') {
                console.log('❌ Usuário não é cliente:', user.userType);
                return res.status(403).json({ message: "Apenas clientes podem acessar suas solicitações" });
            }
            console.log('✅ Buscando solicitações para cliente ID:', user.id);
            const serviceRequests = await storage.getServiceRequestsByClient(user.id);
            console.log('📋 Solicitações encontradas:', serviceRequests.length);
            res.json(serviceRequests);
        }
        catch (error) {
            console.error('💥 Get my service requests error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Create service request
    app.post("/api/service-request", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { serviceType, category, description, address, scheduledDate, scheduledTime, urgency, budget } = req.body;
            // Verify user is a client
            if (user.userType !== 'client') {
                return res.status(403).json({ message: "Apenas clientes podem solicitar serviços" });
            }
            // Validate required fields
            if (!serviceType || !category || !description || !address || !scheduledDate || !scheduledTime) {
                return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" });
            }
            // Validate category
            const validCategories = ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"];
            if (!validCategories.includes(category)) {
                return res.status(400).json({ message: "Categoria inválida" });
            }
            // Create service request
            const serviceRequest = await storage.createServiceRequest({
                clientId: user.id,
                serviceType,
                category,
                description,
                address,
                scheduledDate: new Date(scheduledDate),
                scheduledTime,
                urgency: urgency || "medium",
                budget: budget ? parseFloat(budget).toString() : null,
                status: "open",
                assignedProfessionalId: null,
                responses: 0
            });
            // Create notification for professionals in the category
            const professionals = await storage.getProfessionalsByCategory(category);
            for (const professional of professionals) {
                await storage.createNotification({
                    userId: professional.userId,
                    message: `Nova solicitação de ${serviceType} disponível na sua área`,
                    read: false
                });
            }
            res.status(201).json({
                message: "Solicitação criada com sucesso",
                serviceRequest
            });
        }
        catch (error) {
            console.error('Create service request error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get service requests by client
    app.get("/api/service-requests/client", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            // Verify user is a client
            if (user.userType !== 'client') {
                return res.status(403).json({ message: "Apenas clientes podem acessar suas solicitações" });
            }
            const serviceRequests = await storage.getServiceRequestsByClient(user.id);
            res.json(serviceRequests);
        }
        catch (error) {
            console.error('Get client service requests error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Test endpoint to check authentication
    app.get("/api/test-auth", authenticateToken, async (req, res) => {
        console.log('🔍 Rota de teste de autenticação foi chamada');
        const user = req.user;
        console.log('👤 Usuário autenticado:', user);
        res.json({
            message: "Autenticação funcionando",
            user: {
                id: user.id,
                email: user.email,
                userType: user.userType
            }
        });
    });
    // Get service requests by category (for professionals)
    app.get("/api/service-requests/category/:category", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const { category } = req.params;
            // Verify user is a provider
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Apenas profissionais podem acessar solicitações" });
            }
            const serviceRequests = await storage.getServiceRequestsByCategory(category);
            res.json(serviceRequests);
        }
        catch (error) {
            console.error('Get service requests by category error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get specific service request
    app.get("/api/service-request/:id", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const requestId = parseInt(req.params.id);
            const serviceRequest = await storage.getServiceRequest(requestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }
            // Verify user has access to this request
            if (user.userType === 'client' && serviceRequest.clientId !== user.id) {
                return res.status(403).json({ message: "Acesso negado" });
            }
            res.json(serviceRequest);
        }
        catch (error) {
            console.error('Get service request error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Update service request status
    app.put("/api/service-request/:id/status", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const requestId = parseInt(req.params.id);
            const { status } = req.body;
            const serviceRequest = await storage.getServiceRequest(requestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }
            // Verify user has access to this request
            if (user.userType === 'client' && serviceRequest.clientId !== user.id) {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const updatedRequest = await storage.updateServiceRequest(requestId, { status });
            res.json({
                message: "Status atualizado com sucesso",
                serviceRequest: updatedRequest
            });
        }
        catch (error) {
            console.error('Update service request status error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get service request by ID
    app.get("/api/service-requests/:id", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const requestId = parseInt(req.params.id);
            if (isNaN(requestId)) {
                return res.status(400).json({ message: "ID da solicitação inválido" });
            }
            const serviceRequest = await storage.getServiceRequestWithClient(requestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }
            // Verificar se o usuário tem permissão para ver esta solicitação
            // Profissionais podem ver solicitações abertas, clientes só podem ver suas próprias
            if (user.userType === 'client' && serviceRequest.clientId !== user.id) {
                return res.status(403).json({ message: "Acesso negado a esta solicitação" });
            }
            res.json(serviceRequest);
        }
        catch (error) {
            console.error('Get service request error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Get user by ID
    app.get("/api/users/:id", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const targetUserId = parseInt(req.params.id);
            if (isNaN(targetUserId)) {
                return res.status(400).json({ message: "ID do usuário inválido" });
            }
            const targetUser = await storage.getUser(targetUserId);
            if (!targetUser) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            // Retornar apenas informações básicas do usuário (sem senha)
            const { password, ...userInfo } = targetUser;
            res.json(userInfo);
        }
        catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Delete service request
    app.delete("/api/service-requests/:id", authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const requestId = parseInt(req.params.id);
            const serviceRequest = await storage.getServiceRequest(requestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }
            // Verify user is the owner of this request
            if (user.userType !== 'client' || serviceRequest.clientId !== user.id) {
                return res.status(403).json({ message: "Apenas o cliente que criou a solicitação pode excluí-la" });
            }
            // Only allow deletion of open requests
            if (serviceRequest.status !== 'open') {
                return res.status(400).json({ message: "Apenas solicitações abertas podem ser excluídas" });
            }
            await storage.deleteServiceRequest(requestId);
            res.json({ message: "Solicitação excluída com sucesso" });
        }
        catch (error) {
            console.error('Delete service request error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Buscar mensagens de uma conversa específica
    app.get('/api/messages/:conversationId', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const conversationId = parseInt(req.params.conversationId, 10);
            if (isNaN(conversationId)) {
                return res.status(400).json({ message: 'ID da conversa inválido' });
            }
            // Verifica se o usuário faz parte da conversa
            const conversations = await storage.getConversationsByUser(user.id);
            const isParticipant = conversations.some(conv => conv.id === conversationId);
            if (!isParticipant) {
                // Verificar se a conversa foi deletada pelo usuário
                const isDeleted = await storage.isConversationDeletedByUser(conversationId, user.id);
                if (isDeleted) {
                    // Restaurar a conversa automaticamente
                    await storage.restoreConversation(conversationId, user.id);
                    console.log(`Conversa ${conversationId} restaurada automaticamente para usuário ${user.id} (buscar mensagens)`);
                }
                else {
                    return res.status(403).json({ message: 'Acesso negado à conversa' });
                }
            }
            const messages = await storage.getMessagesByConversation(conversationId);
            res.json(messages);
        }
        catch (error) {
            console.error('Erro ao buscar mensagens da conversa:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Marcar conversa como deletada pelo usuário (exclusão individual)
    app.delete('/api/messages/conversation/:conversationId', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const conversationId = parseInt(req.params.conversationId, 10);
            console.log('🗑️ DELETE /api/messages/conversation - Usuário:', user.id, user.userType);
            console.log('🗑️ conversationId para exclusão:', conversationId);
            if (isNaN(conversationId)) {
                return res.status(400).json({ message: 'ID da conversa inválido' });
            }
            // Verifica se o usuário faz parte da conversa
            const conversations = await storage.getConversationsByUser(user.id);
            console.log('🗑️ Conversas do usuário antes da exclusão:', conversations.map(c => c.id));
            const isParticipant = conversations.some(conv => conv.id === conversationId);
            if (!isParticipant) {
                console.log('❌ Usuário não é participante da conversa');
                return res.status(403).json({ message: 'Acesso negado à conversa' });
            }
            // Marca a conversa como deletada pelo usuário (exclusão individual)
            await storage.deleteConversation(conversationId, user.id);
            console.log('✅ Conversa marcada como deletada');
            // Verificar se a exclusão funcionou
            const conversationsAfter = await storage.getConversationsByUser(user.id);
            console.log('🗑️ Conversas do usuário após exclusão:', conversationsAfter.map(c => c.id));
            res.json({ message: 'Conversa removida com sucesso' });
        }
        catch (error) {
            console.error('❌ Erro ao excluir conversa:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ===== ROTAS PARA PROPOSTAS DE SERVIÇOS =====
    // Buscar propostas de um serviço específico
    app.get('/api/service-requests/:id/offers', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const requestId = parseInt(req.params.id);
            if (isNaN(requestId)) {
                return res.status(400).json({ message: "ID da solicitação inválido" });
            }
            // Verificar se a solicitação existe
            const serviceRequest = await storage.getServiceRequest(requestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }
            // Verificar permissões: apenas o cliente que criou a solicitação ou profissionais podem ver as propostas
            if (user.userType === 'client' && serviceRequest.clientId !== user.id) {
                return res.status(403).json({ message: "Acesso negado às propostas" });
            }
            const offers = await storage.getServiceOffersByRequest(requestId);
            res.json(offers);
        }
        catch (error) {
            console.error('Get service offers error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Criar uma nova proposta
    app.post('/api/service-requests/:id/offers', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const requestId = parseInt(req.params.id);
            const { proposedPrice, estimatedTime, message } = req.body;
            if (isNaN(requestId)) {
                return res.status(400).json({ message: "ID da solicitação inválido" });
            }
            // Verificar se o usuário é um profissional
            if (user.userType !== 'provider') {
                return res.status(403).json({ message: "Apenas profissionais podem fazer propostas" });
            }
            // Verificar se a solicitação existe e está aberta
            const serviceRequest = await storage.getServiceRequest(requestId);
            if (!serviceRequest) {
                return res.status(404).json({ message: "Solicitação não encontrada" });
            }
            if (serviceRequest.status !== 'open') {
                return res.status(400).json({ message: "Esta solicitação não está mais aceitando propostas" });
            }
            // Verificar se o profissional já fez uma proposta para esta solicitação
            const existingOffers = await storage.getServiceOffersByRequest(requestId);
            const hasExistingOffer = existingOffers.some(offer => offer.professionalId === user.id);
            if (hasExistingOffer) {
                return res.status(400).json({ message: "Você já fez uma proposta para esta solicitação" });
            }
            // Buscar o profissional
            const professional = await storage.getProfessionalByUserId(user.id);
            if (!professional) {
                return res.status(404).json({ message: "Dados do profissional não encontrados" });
            }
            // Criar a proposta
            const offer = await storage.createServiceOffer({
                serviceRequestId: requestId,
                professionalId: professional.id,
                proposedPrice: proposedPrice.toString(),
                estimatedTime,
                message,
                status: "pending"
            });
            // Atualizar o contador de respostas na solicitação
            await storage.updateServiceRequest(requestId, {
                responses: (serviceRequest.responses || 0) + 1
            });
            res.status(201).json({
                message: "Proposta enviada com sucesso",
                offer
            });
        }
        catch (error) {
            console.error('Create service offer error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // Buscar todas as propostas de um profissional
    app.get('/api/professionals/:id/proposals', authenticateToken, async (req, res) => {
        try {
            const user = req.user;
            const professionalId = parseInt(req.params.id);
            if (isNaN(professionalId)) {
                return res.status(400).json({ message: "ID do profissional inválido" });
            }
            // Verificar se o usuário está acessando suas próprias propostas
            if (user.userType !== 'provider' || user.id !== professionalId) {
                return res.status(403).json({ message: "Acesso negado às propostas" });
            }
            // Buscar o profissional
            const professional = await storage.getProfessionalByUserId(professionalId);
            if (!professional) {
                return res.status(404).json({ message: "Profissional não encontrado" });
            }
            // Buscar todas as propostas do profissional com detalhes dos serviços
            const proposals = await storage.getProposalsByProfessional(professional.id);
            res.json(proposals);
        }
        catch (error) {
            console.error('Get professional proposals error:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });
    // ===== ROTAS DE AUTENTICAÇÃO SOCIAL =====
    // Rota de teste para verificar configuração OAuth
    app.get('/api/auth/test', (req, res) => {
        res.json({
            googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente',
            googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente',
            nodeEnv: process.env.NODE_ENV,
            callbackUrl: process.env.NODE_ENV === 'production'
                ? "https://lifebee.netlify.app/api/auth/google/callback"
                : "http://localhost:5000/api/auth/google/callback"
        });
    });
    // Test route
    app.get('/api/test', (req, res) => {
        console.log('🧪 Rota de teste acessada');
        res.json({
            message: 'Servidor funcionando!',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'development'
        });
    });
    // Google OAuth routes
    app.get('/api/auth/google', (req, res, next) => {
        console.log('🔐 ===== INÍCIO DA AUTENTICAÇÃO GOOGLE =====');
        console.log('🔐 Método:', req.method);
        console.log('🔐 URL:', req.url);
        console.log('🔐 Headers:', req.headers);
        console.log('🔐 User Agent:', req.get('User-Agent'));
        console.log('🔐 Referer:', req.get('Referer'));
        console.log('🔐 Origin:', req.get('Origin'));
        console.log('🔐 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente');
        console.log('🔐 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente');
        console.log('🔐 URL de callback configurada:', process.env.NODE_ENV === 'production'
            ? "https://lifebee-backend.onrender.com/api/auth/google/callback"
            : "http://localhost:5000/api/auth/google/callback");
        console.log('🔐 ===== FIM DOS LOGS DE INÍCIO =====');
        next();
    }, passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/user.addresses.read', 'https://www.googleapis.com/auth/user.phonenumbers.read']
    }));
    app.get('/api/auth/google/callback', passport.authenticate('google', {
        failureRedirect: process.env.NODE_ENV === 'production'
            ? 'https://lifebee.netlify.app/login?error=google_auth_failed'
            : 'http://localhost:5173/login?error=google_auth_failed',
        session: false
    }), async (req, res) => {
        try {
            console.log('🔐 ===== GOOGLE OAUTH CALLBACK INICIADO =====');
            console.log('🔐 Timestamp:', new Date().toISOString());
            console.log('🔐 Query params:', req.query);
            console.log('🔐 Headers:', req.headers);
            console.log('🔐 User object:', req.user);
            console.log('🔐 User type:', typeof req.user);
            console.log('🔐 User keys:', req.user ? Object.keys(req.user) : 'null');
            console.log('🔐 Session:', req.session);
            console.log('🔐 Cookies:', req.cookies);
            console.log('🔐 NODE_ENV:', process.env.NODE_ENV);
            console.log('🔐 ===== FIM DOS LOGS INICIAIS =====');
            const user = req.user;
            console.log('👤 Usuário recebido:', user ? {
                id: user.id,
                email: user.email,
                userType: user.userType,
                name: user.name,
                googleId: user.googleId
            } : 'null');
            if (!user) {
                console.log('❌ Usuário não encontrado no callback');
                return res.redirect('/login?error=google_auth_failed');
            }
            // Generate JWT token
            const token = generateToken(user);
            console.log('🎫 Token gerado com sucesso');
            console.log('🎫 Token length:', token.length);
            // Redirect to frontend with token
            const redirectUrl = process.env.NODE_ENV === 'production'
                ? `https://lifebee.netlify.app/auth-callback?token=${token}&userType=${user.userType}`
                : `http://localhost:5173/auth-callback?token=${token}&userType=${user.userType}`;
            console.log('🔄 ===== REDIRECIONAMENTO FINAL =====');
            console.log('🔄 Redirecionando para:', redirectUrl);
            console.log('🔄 URL length:', redirectUrl.length);
            console.log('🔄 Timestamp:', new Date().toISOString());
            console.log('🔄 ===== FIM DO CALLBACK =====');
            res.redirect(redirectUrl);
        }
        catch (error) {
            console.error('❌ ===== ERRO NO GOOGLE OAUTH CALLBACK =====');
            console.error('❌ Error:', error);
            console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            console.error('❌ Timestamp:', new Date().toISOString());
            console.error('❌ ===== FIM DO ERRO =====');
            const errorRedirectUrl = process.env.NODE_ENV === 'production'
                ? 'https://lifebee.netlify.app/login?error=google_auth_failed'
                : 'http://localhost:5173/login?error=google_auth_failed';
            res.redirect(errorRedirectUrl);
        }
    });
    // Apple OAuth routes (comentado temporariamente para deploy)
    // app.get('/api/auth/apple', passport.authenticate('apple', {
    //   scope: ['name', 'email']
    // }));
    // app.get('/api/auth/apple/callback', passport.authenticate('apple', { 
    //   failureRedirect: '/login',
    //   session: false 
    // }), async (req, res) => {
    //   try {
    //     const user = req.user as any;
    //     if (!user) {
    //       return res.redirect('/login?error=apple_auth_failed');
    //     }
    //     // Generate JWT token
    //     const token = generateToken(user);
    //     // Redirect to frontend with token
    //     const redirectUrl = process.env.NODE_ENV === 'production'
    //       ? `https://lifebee.netlify.app/auth-callback?token=${token}&userType=${user.userType}`
    //       : `http://localhost:5173/auth-callback?token=${token}&userType=${user.userType}`;
    //     res.redirect(redirectUrl);
    //   } catch (error) {
    //     console.error('Apple OAuth callback error:', error);
    //     res.redirect('/login?error=apple_auth_failed');
    //   }
    // });
    // ==================== SERVICE REQUESTS ROUTES ====================
    // Get all service requests for a client
    app.get('/api/service-requests/client', authenticateToken, async (req, res) => {
        try {
            const userId = req.user?.id;
            console.log('🔍 Buscando pedidos para cliente:', userId);
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const requests = await storage.getServiceRequestsForClient(userId);
            console.log('✅ Pedidos encontrados:', requests.length);
            res.json(requests);
        }
        catch (error) {
            console.error('❌ Erro ao buscar pedidos do cliente:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    // ==================== SERVICE OFFERS ROUTES ====================
    // Get all service offers for a client's requests
    app.get('/api/service-offers/client', authenticateToken, async (req, res) => {
        try {
            const userId = req.user?.id;
            console.log('🔍 Buscando propostas para cliente:', userId);
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const offers = await storage.getServiceOffersForClient(userId);
            console.log('✅ Propostas encontradas:', offers.length);
            res.json(offers);
        }
        catch (error) {
            console.error('❌ Erro ao buscar propostas do cliente:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    // Accept a service offer
    app.put('/api/service-offers/:id/accept', authenticateToken, async (req, res) => {
        try {
            const offerId = parseInt(req.params.id);
            const userId = req.user?.id;
            console.log('✅ Aceitando proposta:', offerId, 'pelo cliente:', userId);
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const result = await storage.acceptServiceOffer(offerId, userId);
            if (result.success) {
                res.json({ message: 'Proposta aceita com sucesso' });
            }
            else {
                res.status(400).json({ error: result.error || 'Erro ao aceitar proposta' });
            }
        }
        catch (error) {
            console.error('❌ Erro ao aceitar proposta:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    // Reject a service offer
    app.put('/api/service-offers/:id/reject', authenticateToken, async (req, res) => {
        try {
            const offerId = parseInt(req.params.id);
            const userId = req.user?.id;
            console.log('❌ Rejeitando proposta:', offerId, 'pelo cliente:', userId);
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const result = await storage.rejectServiceOffer(offerId, userId);
            if (result.success) {
                res.json({ message: 'Proposta rejeitada com sucesso' });
            }
            else {
                res.status(400).json({ error: result.error || 'Erro ao rejeitar proposta' });
            }
        }
        catch (error) {
            console.error('❌ Erro ao rejeitar proposta:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
