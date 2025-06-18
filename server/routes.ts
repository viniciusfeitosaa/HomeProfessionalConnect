import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  generateToken, 
  verifyPassword, 
  hashPassword, 
  rateLimitByIP, 
  generateVerificationCode, 
  sendSMSVerification,
  validateBrazilianPhone,
  isEmailSuspicious,
  authenticateToken
} from "./auth";
import "./auth"; // Initialize passport strategies
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet());
  
  // Session configuration
  app.use(session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
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

      // Check for suspicious email
      if (isEmailSuspicious(email)) {
        await storage.createLoginAttempt({
          email,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          successful: false,
          blocked: true
        });
        return res.status(403).json({ message: 'Email suspeito detectado' });
      }

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

      // Check user type if specified
      if (userType && user.userType !== userType) {
        return res.status(403).json({ message: 'Tipo de usuário inválido' });
      }

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

      // Check for suspicious email
      if (isEmailSuspicious(email)) {
        return res.status(403).json({ message: 'Email suspeito detectado' });
      }

      // Validate phone if provided
      if (phone && !validateBrazilianPhone(phone)) {
        return res.status(400).json({ message: 'Número de telefone inválido' });
      }

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
        phone,
        phoneVerified: false,
        isVerified: false
      });

      // Generate verification code for phone
      if (phone) {
        const code = generateVerificationCode();
        await storage.createVerificationCode({
          userId: user.id,
          phone,
          code,
          type: 'phone',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });
        
        await sendSMSVerification(phone, code);
      }

      const token = generateToken(user);
      res.status(201).json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          userType: user.userType,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified
        },
        requiresPhoneVerification: !!phone
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Phone verification
  app.post('/api/auth/verify-phone', authenticateToken, async (req, res) => {
    try {
      const { code } = req.body;
      const user = req.user as any;

      if (!code) {
        return res.status(400).json({ message: 'Código é obrigatório' });
      }

      const verificationCode = await storage.getVerificationCode(code, 'phone');
      if (!verificationCode || verificationCode.userId !== user.id) {
        return res.status(400).json({ message: 'Código inválido ou expirado' });
      }

      // Mark code as used and verify user phone
      await storage.markCodeAsUsed(verificationCode.id);
      await storage.updateUser(user.id, { 
        phoneVerified: true,
        isVerified: true
      });

      res.json({ message: 'Telefone verificado com sucesso' });
    } catch (error) {
      console.error('Phone verification error:', error);
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
  app.get("/api/appointments", async (req, res) => {
    try {
      // For demo purposes, always use user ID 1
      const appointments = await storage.getAppointmentsByUser(1);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      // For demo purposes, always use user ID 1
      const notifications = await storage.getNotificationsByUser(1);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/count", async (req, res) => {
    try {
      // For demo purposes, always use user ID 1
      const count = await storage.getUnreadNotificationCount(1);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount < 50) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "brl",
        metadata: {
          userId: "1", // For demo purposes
          service: "healthcare_consultation"
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
