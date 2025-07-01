var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express from "express";

// server/routes.ts
import { createServer } from "http";
import session from "express-session";
import passport2 from "passport";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// shared/schema.js
var schema_exports = {};
__export(schema_exports, {
  appointments: () => appointments,
  loginAttempts: () => loginAttempts,
  notifications: () => notifications,
  professionals: () => professionals,
  users: () => users,
  verificationCodes: () => verificationCodes
});
import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  phoneVerified: boolean("phone_verified").default(false),
  address: text("address"),
  profileImage: text("profile_image"),
  userType: text("user_type", { enum: ["client", "provider"] }).notNull().default("client"),
  isVerified: boolean("is_verified").default(false),
  isBlocked: boolean("is_blocked").default(false),
  lastLoginAt: timestamp("last_login_at"),
  loginAttempts: integer("login_attempts").default(0),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Link to user table for providers
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  category: text("category", {
    enum: ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"]
  }).notNull(),
  subCategory: text("sub_category", {
    enum: [
      "companhia_apoio_emocional",
      "preparacao_refeicoes",
      "compras_transporte",
      "lavanderia_limpeza",
      "curativos_medicacao",
      "terapias_especializadas",
      "acompanhamento_hospitalar"
    ]
  }).notNull(),
  description: text("description").notNull(),
  experience: text("experience"),
  certifications: text("certifications"),
  availableHours: text("available_hours"),
  // JSON string for schedule
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  totalReviews: integer("total_reviews").default(0),
  location: text("location"),
  distance: decimal("distance", { precision: 3, scale: 1 }),
  available: boolean("available").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow()
});
var appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  // Client who booked
  professionalId: integer("professional_id").notNull(),
  professionalName: text("professional_name").notNull(),
  serviceType: text("service_type").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  duration: integer("duration").notNull(),
  // Duration in hours
  totalCost: decimal("total_cost", { precision: 8, scale: 2 }),
  status: text("status", { enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"] }).default("pending"),
  notes: text("notes"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  successful: boolean("successful").notNull().default(false),
  blocked: boolean("blocked").notNull().default(false),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull()
});
var verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  email: text("email"),
  phone: text("phone"),
  code: text("code").notNull(),
  type: text("type", { enum: ["email", "phone", "password_reset"] }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
console.log("=== DATABASE CONNECTION DEBUG ===");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("NETLIFY_DATABASE_URL exists:", !!process.env.NETLIFY_DATABASE_URL);
console.log("Using connection string:", connectionString ? "YES" : "NO");
if (!connectionString) {
  console.error("\u274C DATABASE CONNECTION ERROR: No connection string found!");
  throw new Error(
    "DATABASE_URL or NETLIFY_DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool;
var db;
try {
  pool = new Pool({ connectionString });
  db = drizzle(pool, { schema: schema_exports });
  console.log("\u2705 Database connection established successfully");
} catch (error) {
  console.error("\u274C Database connection failed:", error);
  throw error;
}

// server/storage.ts
import { eq, and, or, gte, ilike, sql } from "drizzle-orm";
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getUserByGoogleId(googleId) {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const allowed = [
      "username",
      "password",
      "googleId",
      "name",
      "email",
      "phone",
      "phoneVerified",
      "address",
      "profileImage",
      "userType",
      "isVerified",
      "isBlocked",
      "lastLoginAt",
      "loginAttempts",
      "resetToken",
      "resetTokenExpiry",
      "updatedAt"
    ];
    const safeUpdates = {};
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = updates[key];
    }
    safeUpdates.updatedAt = /* @__PURE__ */ new Date();
    const [user] = await db.update(users).set(safeUpdates).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserLoginAttempts(id, attempts) {
    await db.update(users).set({ [users.loginAttempts.name]: attempts, [users.updatedAt.name]: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async blockUser(id) {
    await db.update(users).set({ [users.isBlocked.name]: true, [users.updatedAt.name]: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async verifyUser(id) {
    await db.update(users).set({ [users.isVerified.name]: true, [users.updatedAt.name]: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  // Professionals
  async getAllProfessionals() {
    return await db.select().from(professionals).where(eq(professionals.available, true));
  }
  async getProfessionalsByCategory(category) {
    return await db.select().from(professionals).where(and(eq(professionals.category, category), eq(professionals.available, true)));
  }
  async searchProfessionals(query) {
    return await db.select().from(professionals).where(
      and(
        eq(professionals.available, true),
        or(
          ilike(professionals.name, `%${query}%`),
          ilike(professionals.specialization, `%${query}%`),
          ilike(professionals.description, `%${query}%`)
        )
      )
    );
  }
  async getProfessional(id) {
    const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
    return professional || void 0;
  }
  async createProfessional(insertProfessional) {
    const [professional] = await db.insert(professionals).values(insertProfessional).returning();
    return professional;
  }
  async updateProfessional(id, updates) {
    const [professional] = await db.update(professionals).set(updates).where(eq(professionals.id, id)).returning();
    return professional;
  }
  // Appointments
  async getAppointmentsByUser(userId) {
    return await db.select().from(appointments).where(eq(appointments.clientId, userId));
  }
  async getAppointmentsByProfessional(professionalId) {
    return await db.select().from(appointments).where(eq(appointments.professionalId, professionalId));
  }
  async createAppointment(insertAppointment) {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }
  async updateAppointment(id, updates) {
    const [appointment] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return appointment;
  }
  // Notifications
  async getNotificationsByUser(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }
  async getUnreadNotificationCount(userId) {
    const [result] = await db.select({ count: sql`cast(count(*) as int)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result?.count || 0;
  }
  async createNotification(insertNotification) {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }
  async markNotificationRead(id) {
    await db.update(notifications).set({ [notifications.read.name]: true }).where(eq(notifications.id, id));
  }
  // Security & Anti-fraud
  async createLoginAttempt(insertLoginAttempt) {
    const [loginAttempt] = await db.insert(loginAttempts).values(insertLoginAttempt).returning();
    return loginAttempt;
  }
  async getRecentLoginAttempts(ipAddress, minutes) {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1e3);
    return await db.select().from(loginAttempts).where(
      and(
        eq(loginAttempts.ipAddress, ipAddress),
        gte(loginAttempts.attemptedAt, timeAgo)
      )
    );
  }
  async createVerificationCode(insertVerificationCode) {
    const [verificationCode] = await db.insert(verificationCodes).values(insertVerificationCode).returning();
    return verificationCode;
  }
  async getVerificationCode(code, type) {
    const [verificationCode] = await db.select().from(verificationCodes).where(
      and(
        eq(verificationCodes.code, code),
        eq(verificationCodes.type, type),
        eq(verificationCodes.used, false),
        gte(verificationCodes.expiresAt, /* @__PURE__ */ new Date())
      )
    );
    return verificationCode || void 0;
  }
  async markCodeAsUsed(id) {
    await db.update(verificationCodes).set({ [verificationCodes.used.name]: true }).where(eq(verificationCodes.id, id));
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
var generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.userType
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
var verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
var hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};
var verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token de acesso necess\xE1rio" });
  }
  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId || decoded.id;
    const user = await storage.getUser(userId);
    if (!user || user.isBlocked) {
      return res.status(403).json({ message: "Usu\xE1rio n\xE3o encontrado ou bloqueado" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({ message: "Token inv\xE1lido" });
  }
};
var rateLimitByIP = async (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";
  try {
    const recentAttempts = await storage.getRecentLoginAttempts(ip, 15);
    if (recentAttempts.length >= 5) {
      const failedAttempts = recentAttempts.filter((attempt) => !attempt.successful);
      if (failedAttempts.length >= 3) {
        await storage.createLoginAttempt({
          email: req.body.email || null,
          ipAddress: ip,
          userAgent,
          successful: false,
          blocked: true
        });
        return res.status(429).json({
          message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
          blocked: true
        });
      }
    }
    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    next();
  }
};

// server/routes.ts
import pgSession from "connect-pg-simple";
import "express-session";
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  // Increased limit for development
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development";
  }
});
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "Server is healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.set("trust proxy", 1);
  app2.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  const PgSession = pgSession(session);
  app2.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
      tableName: "sessions",
      // tabela para armazenar as sessões
      createTableIfMissing: true
      // cria a tabela automaticamente se não existir
    }),
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      sameSite: "lax"
    },
    name: "lifebee.sid"
    // nome personalizado do cookie
  }));
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  app2.get(
    "/api/auth/google",
    passport2.authenticate("google", { scope: ["profile", "email"] })
  );
  app2.get(
    "/api/auth/google/callback",
    passport2.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
      try {
        const user = req.user;
        const token = generateToken(user);
        await storage.createLoginAttempt({
          email: user.email,
          ipAddress: req.ip || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          successful: true,
          blocked: false
        });
        res.redirect(`/?token=${token}&userType=${user.userType}`);
      } catch (error) {
        console.error("Google auth callback error:", error);
        res.redirect("/login?error=auth_failed");
      }
    }
  );
  app2.post("/api/auth/login", authLimiter, rateLimitByIP, async (req, res) => {
    try {
      const { email, password, userType } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha s\xE3o obrigat\xF3rios" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || user.isBlocked) {
        await storage.createLoginAttempt({
          email,
          ipAddress: req.ip || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          successful: false,
          blocked: false
        });
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      if (!user.password || !await verifyPassword(password, user.password)) {
        await storage.createLoginAttempt({
          email,
          ipAddress: req.ip || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          successful: false,
          blocked: false
        });
        const attempts = (user.loginAttempts || 0) + 1;
        await storage.updateUserLoginAttempts(user.id, attempts);
        if (attempts >= 5) {
          await storage.blockUser(user.id);
          return res.status(403).json({ message: "Conta bloqueada por muitas tentativas de login" });
        }
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      await storage.updateUser(user.id, {
        lastLoginAt: /* @__PURE__ */ new Date(),
        loginAttempts: 0
      });
      await storage.createLoginAttempt({
        email,
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
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
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const { username, email, password, name, userType, phone } = req.body;
      if (!username || !email || !password || !name) {
        return res.status(400).json({ message: "Todos os campos obrigat\xF3rios devem ser preenchidos" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email j\xE1 cadastrado" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: "Nome de usu\xE1rio j\xE1 existe" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        name,
        userType: userType || "client",
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
      const updatedUser = await storage.updateUser(user.id, {
        phoneVerified: true,
        isVerified: true
      });
      await storage.createNotification({
        userId: user.id,
        message: `Bem-vindo \xE0 LifeBee, ${user.name}! Sua conta foi criada com sucesso.`,
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
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/messages", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const conversations = [
        {
          id: 1,
          professionalId: 1,
          professionalName: "Ana Carolina Silva",
          specialization: "Fisioterapeuta",
          lastMessage: "\xD3timo! Nos vemos na pr\xF3xima sess\xE3o ent\xE3o.",
          lastMessageTime: new Date(Date.now() - 1e3 * 60 * 30),
          unreadCount: 2,
          isOnline: true
        }
      ];
      res.json(conversations);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { recipientId, content, type } = req.body;
      if (!recipientId || !content) {
        return res.status(400).json({ message: "Destinat\xE1rio e conte\xFAdo s\xE3o obrigat\xF3rios" });
      }
      const message = {
        id: Date.now(),
        senderId: user.id,
        recipientId,
        content,
        type: type || "text",
        timestamp: /* @__PURE__ */ new Date(),
        isRead: false
      };
      res.status(201).json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { name, email, phone, address, bio } = req.body;
      const updatedUser = await storage.updateUser(user.id, {
        name,
        email,
        phone
        // address and bio would need to be added to schema
      });
      res.json({
        message: "Perfil atualizado com sucesso",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          userType: updatedUser.userType,
          phone: updatedUser.phone
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/user/password", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Senha atual e nova senha s\xE3o obrigat\xF3rias" });
      }
      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/user/account", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      res.json({ message: "Conta exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const appointments2 = [
        {
          id: 1,
          professionalName: "Ana Carolina Silva",
          specialization: "Fisioterapeuta",
          date: /* @__PURE__ */ new Date(),
          time: "14:00",
          status: "confirmado"
        }
      ];
      res.json(appointments2);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/user", authenticateToken, async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      req.session.destroy((err2) => {
        if (err2) {
          return res.status(500).json({ message: "Erro ao destruir sess\xE3o" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout realizado com sucesso" });
      });
    });
  });
  app2.get("/api/professionals", async (req, res) => {
    try {
      const { category, search } = req.query;
      let professionals2;
      if (search && typeof search === "string") {
        professionals2 = await storage.searchProfessionals(search);
      } else if (category && typeof category === "string") {
        professionals2 = await storage.getProfessionalsByCategory(category);
      } else {
        professionals2 = await storage.getAllProfessionals();
      }
      res.json(professionals2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/professionals/:id", async (req, res) => {
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
  app2.get("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const appointments2 = await storage.getAppointmentsByUser(user.id);
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const notifications2 = await storage.getNotificationsByUser(user.id);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/notifications/count", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount < 50) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      res.json({
        clientSecret: "demo_payment_" + Date.now(),
        success: true,
        message: "Payment processed successfully"
      });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({
        message: "Error processing payment: " + error.message
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/seedData.ts
async function seedDatabase() {
  console.log("=== SEED DATABASE DEBUG ===");
  console.log("Starting seedDatabase function...");
  try {
    console.log("Checking if data already exists...");
    const existingProfessionals = await db.select().from(professionals).limit(1);
    console.log("Existing professionals count:", existingProfessionals.length);
    if (existingProfessionals.length > 0) {
      console.log("Database already seeded");
      return;
    }
    console.log("Seeding database with initial data...");
    const sampleProfessionals = [
      {
        userId: 1,
        name: "Ana Carolina Silva",
        specialization: "Fisioterapeuta Especializada",
        category: "fisioterapeuta",
        subCategory: "terapias_especializadas",
        description: "Especialista em reabilita\xE7\xE3o neurol\xF3gica e ortop\xE9dica com mais de 8 anos de experi\xEAncia.",
        experience: "8 anos de experi\xEAncia em fisioterapia",
        certifications: "CREFITO-3, Especializa\xE7\xE3o em Neurologia",
        availableHours: JSON.stringify({
          monday: ["08:00", "17:00"],
          tuesday: ["08:00", "17:00"],
          wednesday: ["08:00", "17:00"],
          thursday: ["08:00", "17:00"],
          friday: ["08:00", "15:00"]
        }),
        hourlyRate: "85.00",
        rating: "4.9",
        totalReviews: 127,
        location: "Vila Madalena, S\xE3o Paulo",
        distance: "2.3",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
      },
      {
        userId: 2,
        name: "Carlos Eduardo Santos",
        specialization: "T\xE9cnico em Enfermagem",
        category: "tecnico_enfermagem",
        subCategory: "curativos_medicacao",
        description: "T\xE9cnico experiente em cuidados domiciliares, curativos e administra\xE7\xE3o de medicamentos.",
        experience: "6 anos de experi\xEAncia em enfermagem",
        certifications: "COREN-SP, Curso de Urg\xEAncia e Emerg\xEAncia",
        availableHours: JSON.stringify({
          monday: ["06:00", "18:00"],
          tuesday: ["06:00", "18:00"],
          wednesday: ["06:00", "18:00"],
          thursday: ["06:00", "18:00"],
          friday: ["06:00", "18:00"],
          saturday: ["08:00", "14:00"]
        }),
        hourlyRate: "45.00",
        rating: "4.8",
        totalReviews: 89,
        location: "Ipiranga, S\xE3o Paulo",
        distance: "1.8",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face"
      },
      {
        userId: 3,
        name: "Maria Fernanda Costa",
        specialization: "Acompanhante Hospitalar",
        category: "acompanhante_hospitalar",
        subCategory: "acompanhamento_hospitalar",
        description: "Acompanhante especializada em cuidados com idosos e pacientes em recupera\xE7\xE3o.",
        experience: "5 anos de experi\xEAncia",
        certifications: "Curso de Cuidador de Idosos, Primeiros Socorros",
        availableHours: JSON.stringify({
          monday: ["24h"],
          tuesday: ["24h"],
          wednesday: ["24h"],
          thursday: ["24h"],
          friday: ["24h"],
          saturday: ["24h"],
          sunday: ["24h"]
        }),
        hourlyRate: "38.00",
        rating: "4.7",
        totalReviews: 156,
        location: "Moema, S\xE3o Paulo",
        distance: "3.1",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1594824475953-2b2bb7f37b95?w=300&h=300&fit=crop&crop=face"
      },
      {
        userId: 4,
        name: "Roberto Lima",
        specialization: "Fisioterapeuta Respirat\xF3rio",
        category: "fisioterapeuta",
        subCategory: "terapias_especializadas",
        description: "Especialista em fisioterapia respirat\xF3ria e reabilita\xE7\xE3o card\xEDaca.",
        experience: "10 anos de experi\xEAncia",
        certifications: "CREFITO-3, Especializa\xE7\xE3o em Fisioterapia Respirat\xF3ria",
        availableHours: JSON.stringify({
          monday: ["07:00", "19:00"],
          tuesday: ["07:00", "19:00"],
          wednesday: ["07:00", "19:00"],
          thursday: ["07:00", "19:00"],
          friday: ["07:00", "16:00"]
        }),
        hourlyRate: "95.00",
        rating: "4.9",
        totalReviews: 98,
        location: "Pinheiros, S\xE3o Paulo",
        distance: "1.5",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face"
      },
      {
        userId: 5,
        name: "Juliana Oliveira",
        specialization: "Acompanhante Domiciliar",
        category: "acompanhante_hospitalar",
        subCategory: "companhia_apoio_emocional",
        description: "Cuidadora especializada em apoio emocional e atividades da vida di\xE1ria.",
        experience: "7 anos de experi\xEAncia",
        certifications: "Curso de Psicologia Aplicada, Cuidados com Idosos",
        availableHours: JSON.stringify({
          monday: ["08:00", "20:00"],
          tuesday: ["08:00", "20:00"],
          wednesday: ["08:00", "20:00"],
          thursday: ["08:00", "20:00"],
          friday: ["08:00", "20:00"],
          saturday: ["10:00", "18:00"]
        }),
        hourlyRate: "42.00",
        rating: "4.8",
        totalReviews: 203,
        location: "Vila Ol\xEDmpia, S\xE3o Paulo",
        distance: "2.8",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&h=300&fit=crop&crop=face"
      }
    ];
    await db.insert(professionals).values(sampleProfessionals);
    console.log(`Successfully seeded ${sampleProfessionals.length} professionals`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// server/index.ts
var app = express();
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", "https://lifebee.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
(async () => {
  await seedDatabase();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  const port = process.env.PORT || 5e3;
  server.listen({
    port: Number(port),
    host: "0.0.0.0"
  }, () => {
    console.log(`Server running on port ${port}`);
  });
})();
