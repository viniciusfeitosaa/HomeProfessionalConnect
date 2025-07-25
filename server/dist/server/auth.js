import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage.js';
/*
// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists with Google ID
    let user = await storage.getUserByGoogleId(profile.id);
    
    if (user) {
      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      return done(null, user);
    }

    // Check if user exists with same email
    if (profile.emails && profile.emails[0]) {
      user = await storage.getUserByEmail(profile.emails[0].value);
      if (user) {
        // Link Google account to existing user
        await storage.updateUser(user.id, {
          googleId: profile.id,
          lastLoginAt: new Date(),
          isVerified: true
        });
        return done(null, user);
      }
    }

    // Create new user
    const newUser = await storage.createUser({
      username: profile.emails?.[0]?.value || `google_${profile.id}`,
      name: profile.displayName || 'Usuário Google',
      email: profile.emails?.[0]?.value || '',
      googleId: profile.id,
      profileImage: profile.photos?.[0]?.value,
      userType: 'client',
      isVerified: true,
      lastLoginAt: new Date()
    });

    return done(null, newUser);
  } catch (error) {
    return done(error, undefined);
  }
}));*/
// Serialize/deserialize user for sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await storage.getUser(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
// JWT helper functions
export const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        userType: user.userType
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
// Hash password
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};
// Verify password
export const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
// Authentication middleware
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token de acesso necessário' });
    }
    try {
        const decoded = verifyToken(token);
        const userId = decoded.userId || decoded.id; // Support both formats
        const user = await storage.getUser(userId);
        if (!user || user.isBlocked) {
            return res.status(403).json({ message: 'Usuário não encontrado ou bloqueado' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ message: 'Token inválido' });
    }
};
// Anti-fraud middleware
export const rateLimitByIP = async (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    try {
        // Check recent login attempts from this IP
        const recentAttempts = await storage.getRecentLoginAttempts(ip, 15); // Last 15 minutes
        if (recentAttempts.length >= 5) {
            const failedAttempts = recentAttempts.filter(attempt => !attempt.successful);
            if (failedAttempts.length >= 3) {
                // Log suspicious activity
                await storage.createLoginAttempt({
                    email: req.body.email || null,
                    ipAddress: ip,
                    userAgent,
                    successful: false,
                    blocked: true
                });
                return res.status(429).json({
                    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
                    blocked: true
                });
            }
        }
        next();
    }
    catch (error) {
        console.error('Rate limit error:', error);
        next();
    }
};
// Generate verification code
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Send SMS verification (mock implementation)
export const sendSMSVerification = async (phone, code) => {
    // In production, integrate with SMS service like Twilio
    console.log(`SMS sent to ${phone}: Your verification code is ${code}`);
    return true;
};
// Validate Brazilian phone number
export const validateBrazilianPhone = (phone) => {
    const phoneRegex = /^(?:\+55\s?)?(?:\(?[1-9]{2}\)?\s?)?(?:9\s?)?[0-9]{4}[-\s]?[0-9]{4}$/;
    return phoneRegex.test(phone);
};
// Check if email is suspicious
export const isEmailSuspicious = (email) => {
    const suspiciousPatterns = [
        /^[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}$/i, // Very simple email pattern
        /^\d+@/, // Starts with numbers
        /temp|fake|test|spam/i, // Contains suspicious words
        /@(10minutemail|guerrillamail|mailinator)/i // Temporary email services
    ];
    return suspiciousPatterns.some(pattern => pattern.test(email));
};
export default passport;
