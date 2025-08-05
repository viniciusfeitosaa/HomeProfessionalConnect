import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage.js';
// Google OAuth Strategy
console.log('🔧 Configurando Google OAuth Strategy...');
console.log('🔧 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente');
console.log('🔧 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 Callback URL:', process.env.NODE_ENV === 'production'
    ? "https://lifebee.netlify.app/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback");
// Google OAuth Strategy (comentado temporariamente para deploy)
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID!,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//   callbackURL: process.env.NODE_ENV === 'production' 
//     ? "https://lifebee.netlify.app/api/auth/google/callback"
//     : "http://localhost:5000/api/auth/google/callback"
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     console.log('🔐 Google OAuth profile iniciado');
//     console.log('📧 Email:', profile.emails?.[0]?.value);
//     console.log('👤 Nome:', profile.displayName);
//     console.log('🆔 ID:', profile.id);
//     
//     // Check if user exists with Google ID
//     let user = await storage.getUserByGoogleId(profile.id);
//     
//     if (user) {
//       // Update last login
//       await storage.updateUser(user.id, { lastLoginAt: new Date() });
//       return done(null, user);
//     }
//     // Check if user exists with same email
//     if (profile.emails && profile.emails[0]) {
//       user = await storage.getUserByEmail(profile.emails[0].value);
//       if (user) {
//         // Link Google account to existing user
//         await storage.updateUser(user.id, { 
//           googleId: profile.id,
//           lastLoginAt: new Date(),
//           isVerified: true
//         });
//         return done(null, user);
//       }
//     }
//     // Create new user
//     const newUser = await storage.createUser({
//       username: profile.emails?.[0]?.value || `google_${profile.id}`,
//       password: '', // OAuth users don't need password
//       name: profile.displayName || 'Usuário Google',
//       email: profile.emails?.[0]?.value || '',
//       phone: null,
//       phoneVerified: false,
//       googleId: profile.id,
//       appleId: null,
//       address: null,
//       profileImage: profile.photos?.[0]?.value || null,
//       userType: 'client',
//       isVerified: true,
//       isBlocked: false,
//       lastLoginAt: new Date(),
//       loginAttempts: 0,
//       resetToken: null,
//       resetTokenExpiry: null
//     });
//     return done(null, newUser);
//   } catch (error) {
//     console.error('❌ Google OAuth error:', error);
//     return done(error, undefined);
//   }
// }));
// Apple OAuth Strategy (comentado temporariamente até configurar as credenciais)
// passport.use('apple', new GoogleStrategy({
//   clientID: process.env.APPLE_CLIENT_ID!,
//   clientSecret: process.env.APPLE_CLIENT_SECRET!,
//   callbackURL: process.env.NODE_ENV === 'production'
//     ? "https://your-domain.com/api/auth/apple/callback"
//     : "http://localhost:5000/api/auth/apple/callback"
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     console.log('🍎 Apple OAuth profile:', profile.id);
//     
//     // Check if user exists with Apple ID
//     let user = await storage.getUserByAppleId(profile.id);
//     
//     if (user) {
//       // Update last login
//       await storage.updateUser(user.id, { lastLoginAt: new Date() });
//       return done(null, user);
//     }
//     // Check if user exists with same email
//     if (profile.emails && profile.emails[0]) {
//       user = await storage.getUserByEmail(profile.emails[0].value);
//       if (user) {
//         // Link Apple account to existing user
//         await storage.updateUser(user.id, { 
//           appleId: profile.id,
//           lastLoginAt: new Date(),
//           isVerified: true
//         });
//         return done(null, user);
//       }
//     }
//     // Create new user
//     const newUser = await storage.createUser({
//       username: profile.emails?.[0]?.value || `apple_${profile.id}`,
//       password: '', // OAuth users don't need password
//       name: profile.displayName || 'Usuário Apple',
//       email: profile.emails?.[0]?.value || '',
//       phone: null,
//       phoneVerified: false,
//       appleId: profile.id,
//       googleId: null,
//       address: null,
//       profileImage: profile.photos?.[0]?.value || null,
//       userType: 'client',
//       isVerified: true,
//       isBlocked: false,
//       lastLoginAt: new Date(),
//       loginAttempts: 0,
//       resetToken: null,
//       resetTokenExpiry: null
//     });
//     return done(null, newUser);
//   } catch (error) {
//     console.error('❌ Apple OAuth error:', error);
//     return done(error, undefined);
//   }
// }));
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
    console.log('🔧 Gerando token para usuário:', {
        id: user.id,
        email: user.email,
        userType: user.userType
    });
    console.log('🔧 JWT_SECRET presente:', !!process.env.JWT_SECRET);
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        userType: user.userType
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('🔧 Token gerado com sucesso, tamanho:', token.length);
    return token;
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
