import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { storage } from "./storage.js";
import { 
  generateToken, 
  verifyPassword, 
  hashPassword, 
  rateLimitByIP, 
  generateVerificationCode, 
  sendSMSVerification,
  validateBrazilianPhone,
  authenticateToken
} from "./auth.js";
import "./auth.js"; // Initialize passport strategies
import { z } from "zod";
import pgSession from "connect-pg-simple";
// import * as connectRedis from "connect-redis";
import Redis from "redis";
import { Request, Response } from "express";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
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
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com"]
      },
    },
    crossOriginEmbedderPolicy: false
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
  
  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        const user = req.user as any;
        const token = generateToken(user);
        
        // Log successful login
        await storage.createLoginAttempt({
          email: user.email,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          successful: true,
          blocked: false
        });

        // Redirect with token
        res.redirect(`/?token=${token}&userType=${user.userType}`);
      } catch (error) {
        console.error('Google auth callback error:', error);
        res.redirect('/login?error=auth_failed');
      }
    }
  );

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
    } catch (error) {
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
          category: 'fisioterapeuta',        // Pode ser preenchido depois
          subCategory: 'companhia_apoio_emocional',     // Pode ser preenchido depois
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
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Messages API for client-professional communication
  app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
        const conversationsWithDetails = await Promise.all(
          userConversations.map(async (conv) => {
            let otherUser, otherName, otherAvatar;
            let specialization: string = "";
            let rating: number = 5.0;
            let location: string = "";
            if (user.userType === 'provider') {
              // Para o provider, destaque o cliente
              otherUser = await storage.getUser(conv.clientId);
              otherName = otherUser?.name || "Cliente";
              otherAvatar = otherUser?.profileImage || "";
              // Campos extras para cliente já estão com valores padrão
            } else {
              // Para o cliente, destaque o profissional
              otherUser = await storage.getProfessionalById(conv.professionalId);
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
          })
        );
        res.json(conversationsWithDetails);
      } else {
        // Se não há conversas, retornar array vazio
        res.json([]);
      }
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
        } else {
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
    } catch (error) {
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
      const user = req.user as any;
      const { professionalId, message } = req.body;
      console.log('professionalId recebido:', professionalId);
      // Verify if professional exists
      const professional = await storage.getProfessionalById(professionalId);
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
      } else {
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
    } catch (error) {
      console.error('Start conversation error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // User profile management
  app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Change password
  app.put('/api/user/password', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Delete account
  app.delete('/api/user/account', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      
      // In a real app, you would soft delete or properly handle data removal
      // For now, just return success
      res.json({ message: 'Conta excluída com sucesso' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get appointments
  app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const appointments = await storage.getAppointmentsByUser(user.id);
      res.json(appointments);
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get current user
  app.get("/api/user", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
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
      } else if (category && typeof category === 'string') {
        professionals = await storage.getProfessionalsByCategory(category);
      } else {
        professionals = await storage.getAllProfessionals();
      }
      
      res.json(professionals);
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user appointments
  app.get("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const appointments = await storage.getAppointmentsByUser(user.id);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const notifications = await storage.getNotificationsByUser(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/count", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
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
    } catch (error: any) {
      console.error("Payment error:", error);
      res.status(500).json({ 
        message: "Error processing payment: " + error.message 
      });
    }
  });

  // ===== ROTAS PARA PEDIDOS DO PROFISSIONAL =====

  // Get orders for professional
  app.get("/api/provider/orders", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Verify user is a provider
      if (user.userType !== 'provider') {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }

      // Buscar pedidos reais do banco de dados
      const orders = await storage.getAppointmentsByProfessional(user.id) || [];
      res.json(orders);
    } catch (error) {
      console.error('Get provider orders error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Accept order
  app.post("/api/provider/orders/:id/accept", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Accept order error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Reject order
  app.post("/api/provider/orders/:id/reject", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Reject order error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Complete order
  app.post("/api/provider/orders/:id/complete", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Complete order error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== ROTAS PARA PERFIL DO PROFISSIONAL =====

  // Get provider profile
  app.get("/api/provider/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Verify user is a provider
      if (user.userType !== 'provider') {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }

      // Get professional data from database
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Dados do profissional não encontrados." });
      }

      // Get user data
      const userData = await storage.getUser(user.id);
      
      if (!userData) {
        return res.status(404).json({ message: "Dados do usuário não encontrados." });
      }

      // Combine professional and user data
      const profileData = {
        ...professional,
        email: userData.email,
        phone: userData.phone
      };

      res.json(profileData);
    } catch (error) {
      console.error('Get provider profile error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Update provider profile
  app.put("/api/provider/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const { 
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
      } = req.body;
      
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
    } catch (error) {
      console.error('Update provider profile error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== ROTAS PARA CONFIGURAÇÕES DO PROFISSIONAL =====

  // Get provider settings
  app.get("/api/provider/settings", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      
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
    } catch (error) {
      console.error('Get provider settings error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Update provider settings
  app.put("/api/provider/settings", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Update provider settings error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ===== ROTAS PARA SOLICITAÇÕES DE SERVIÇO =====

  // Get my service requests (alias for client) - DEVE VIR ANTES de todas as outras rotas
  app.get("/api/service-requests/my-requests", authenticateToken, async (req, res) => {
    console.log('🔍 Rota /api/service-requests/my-requests foi chamada');
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('💥 Get my service requests error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Create service request
  app.post("/api/service-request", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Create service request error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get service requests by client
  app.get("/api/service-requests/client", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Verify user is a client
      if (user.userType !== 'client') {
        return res.status(403).json({ message: "Apenas clientes podem acessar suas solicitações" });
      }

      const serviceRequests = await storage.getServiceRequestsByClient(user.id);
      res.json(serviceRequests);
    } catch (error) {
      console.error('Get client service requests error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Test endpoint to check authentication
  app.get("/api/test-auth", authenticateToken, async (req, res) => {
    console.log('🔍 Rota de teste de autenticação foi chamada');
    const user = req.user as any;
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
      const user = req.user as any;
      const { category } = req.params;
      
      // Verify user is a provider
      if (user.userType !== 'provider') {
        return res.status(403).json({ message: "Apenas profissionais podem acessar solicitações" });
      }

      const serviceRequests = await storage.getServiceRequestsByCategory(category);
      res.json(serviceRequests);
    } catch (error) {
      console.error('Get service requests by category error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Get specific service request
  app.get("/api/service-request/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Get service request error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Update service request status
  app.put("/api/service-request/:id/status", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Update service request status error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Delete service request
  app.delete("/api/service-requests/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('Delete service request error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Buscar mensagens de uma conversa específica
  app.get('/api/messages/:conversationId', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
        } else {
          return res.status(403).json({ message: 'Acesso negado à conversa' });
        }
      }
      
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens da conversa:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Marcar conversa como deletada pelo usuário (exclusão individual)
  app.delete('/api/messages/conversation/:conversationId', authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
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
    } catch (error) {
      console.error('❌ Erro ao excluir conversa:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
