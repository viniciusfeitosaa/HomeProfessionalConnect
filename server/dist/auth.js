"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmailSuspicious = exports.validateBrazilianPhone = exports.sendSMSVerification = exports.generateVerificationCode = exports.rateLimitByIP = exports.authenticateToken = exports.verifyPassword = exports.hashPassword = exports.verifyToken = exports.generateToken = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const storage_js_1 = require("./storage.js");
const node_fetch_1 = __importDefault(require("node-fetch"));
// Google OAuth Strategy
console.log('🔧 Configurando Google OAuth Strategy...');
console.log('🔧 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Presente' : 'Ausente');
console.log('🔧 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Presente' : 'Ausente');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 Callback URL:', process.env.NODE_ENV === 'production'
    ? "https://lifebee-backend.onrender.com/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback");
// Google OAuth Strategy - Verificar se variáveis estão configuradas
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('⚠️ Google OAuth desabilitado - configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no Render');
}
else {
    console.log('✅ Google OAuth habilitado - variáveis configuradas');
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? "https://lifebee-backend.onrender.com/api/auth/google/callback"
            : "http://localhost:5000/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('🔐 Google OAuth profile iniciado');
            console.log('📧 Email:', profile.emails?.[0]?.value);
            console.log('👤 Nome:', profile.displayName);
            console.log('🆔 ID:', profile.id);
            // Fetch additional profile information from Google People API
            let additionalProfileData = {
                phone: null,
                address: null
            };
            try {
                console.log('🔍 Buscando dados adicionais do perfil via Google People API...');
                const peopleApiResponse = await (0, node_fetch_1.default)(`https://people.googleapis.com/v1/people/me?personFields=phoneNumbers,addresses&access_token=${accessToken}`);
                if (peopleApiResponse.ok) {
                    const peopleData = await peopleApiResponse.json();
                    console.log('📱 Dados do People API:', peopleData);
                    // Extract phone number
                    if (peopleData.phoneNumbers && peopleData.phoneNumbers.length > 0) {
                        additionalProfileData.phone = peopleData.phoneNumbers[0].value;
                        console.log('📱 Telefone encontrado:', additionalProfileData.phone);
                    }
                    // Extract address
                    if (peopleData.addresses && peopleData.addresses.length > 0) {
                        const address = peopleData.addresses[0];
                        const addressParts = [];
                        if (address.streetAddress)
                            addressParts.push(address.streetAddress);
                        if (address.locality)
                            addressParts.push(address.locality);
                        if (address.administrativeArea)
                            addressParts.push(address.administrativeArea);
                        if (address.postalCode)
                            addressParts.push(address.postalCode);
                        if (address.country)
                            addressParts.push(address.country);
                        additionalProfileData.address = addressParts.join(', ');
                        console.log('🏠 Endereço encontrado:', additionalProfileData.address);
                    }
                }
                else {
                    console.log('⚠️ Não foi possível obter dados adicionais do People API:', peopleApiResponse.status);
                }
            }
            catch (apiError) {
                console.log('⚠️ Erro ao buscar dados do People API:', apiError);
            }
            // Check if user exists with Google ID
            let user = await storage_js_1.storage.getUserByGoogleId(profile.id);
            if (user) {
                // Update user with additional profile data if available
                const updateData = { lastLoginAt: new Date() };
                if (additionalProfileData.phone && !user.phone) {
                    updateData.phone = additionalProfileData.phone;
                    updateData.phoneVerified = true;
                }
                if (additionalProfileData.address && !user.address) {
                    updateData.address = additionalProfileData.address;
                }
                if (profile.photos?.[0]?.value && !user.profileImage) {
                    updateData.profileImage = profile.photos[0].value;
                }
                await storage_js_1.storage.updateUser(user.id, updateData);
                return done(null, user);
            }
            // Check if user exists with same email
            if (profile.emails && profile.emails[0]) {
                user = await storage_js_1.storage.getUserByEmail(profile.emails[0].value);
                if (user) {
                    // Link Google account to existing user and update profile
                    const updateData = {
                        googleId: profile.id,
                        lastLoginAt: new Date(),
                        isVerified: true
                    };
                    if (additionalProfileData.phone && !user.phone) {
                        updateData.phone = additionalProfileData.phone;
                        updateData.phoneVerified = true;
                    }
                    if (additionalProfileData.address && !user.address) {
                        updateData.address = additionalProfileData.address;
                    }
                    if (profile.photos?.[0]?.value && !user.profileImage) {
                        updateData.profileImage = profile.photos[0].value;
                    }
                    await storage_js_1.storage.updateUser(user.id, updateData);
                    return done(null, user);
                }
            }
            // Create new user with complete profile data
            const newUser = await storage_js_1.storage.createUser({
                username: profile.emails?.[0]?.value || `google_${profile.id}`,
                password: '', // OAuth users don't need password
                name: profile.displayName || 'Usuário Google',
                email: profile.emails?.[0]?.value || '',
                phone: additionalProfileData.phone,
                phoneVerified: additionalProfileData.phone ? true : false,
                googleId: profile.id,
                appleId: null,
                address: additionalProfileData.address,
                profileImage: profile.photos?.[0]?.value || null,
                userType: 'client',
                isVerified: true,
                isBlocked: false,
                lastLoginAt: new Date(),
                loginAttempts: 0,
                resetToken: null,
                resetTokenExpiry: null
            });
            console.log('✅ Novo usuário criado com perfil completo:', {
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                profileImage: newUser.profileImage ? 'Presente' : 'Ausente'
            });
            return done(null, newUser);
        }
        catch (error) {
            console.error('❌ Erro no Google OAuth:', error);
            return done(error, undefined);
        }
    }));
}
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
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await storage_js_1.storage.getUser(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
// JWT helper functions
const generateToken = (user) => {
    console.log('🔧 Gerando token para usuário:', {
        id: user.id,
        email: user.email,
        userType: user.userType
    });
    console.log('🔧 JWT_SECRET presente:', !!process.env.JWT_SECRET);
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        userType: user.userType
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('🔧 Token gerado com sucesso, tamanho:', token.length);
    return token;
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        console.log('🔐 VerifyToken - Verificando token...');
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('✅ VerifyToken - Token válido:', decoded);
        return decoded;
    }
    catch (error) {
        console.error('❌ VerifyToken - Erro ao verificar token:', error);
        return null;
    }
};
exports.verifyToken = verifyToken;
// Hash password
const hashPassword = async (password) => {
    return await bcryptjs_1.default.hash(password, 12);
};
exports.hashPassword = hashPassword;
// Verify password
const verifyPassword = async (password, hash) => {
    return await bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('🔐 ===== INÍCIO DO MIDDLEWARE DE AUTENTICAÇÃO =====');
    console.log('🔐 AuthenticateToken - Auth header:', authHeader ? 'Presente' : 'Ausente');
    console.log('🔐 AuthenticateToken - Token:', token ? 'Presente' : 'Ausente');
    console.log('🔐 AuthenticateToken - Token length:', token ? token.length : 0);
    console.log('🔐 AuthenticateToken - URL da requisição:', req.url);
    console.log('🔐 AuthenticateToken - Método:', req.method);
    if (!token) {
        console.log('❌ AuthenticateToken - Token ausente');
        console.log('🔐 ===== FIM DO MIDDLEWARE - TOKEN AUSENTE =====');
        return res.status(401).json({ message: 'Token de acesso necessário' });
    }
    try {
        console.log('🔐 AuthenticateToken - Verificando token...');
        const decoded = (0, exports.verifyToken)(token);
        console.log('🔐 AuthenticateToken - Token decodificado:', decoded);
        console.log('🔐 AuthenticateToken - Tipo do decoded:', typeof decoded);
        console.log('🔐 AuthenticateToken - Keys do decoded:', decoded ? Object.keys(decoded) : 'null');
        if (!decoded) {
            console.log('❌ AuthenticateToken - Token inválido (não decodificado)');
            console.log('🔐 ===== FIM DO MIDDLEWARE - TOKEN INVÁLIDO =====');
            return res.status(403).json({ message: 'Token inválido' });
        }
        const userId = decoded.userId || decoded.id; // Support both formats
        console.log('🔐 AuthenticateToken - UserId extraído:', userId);
        console.log('🔐 AuthenticateToken - Tipo do userId:', typeof userId);
        console.log('🔐 AuthenticateToken - userId é NaN?', isNaN(userId));
        if (!userId) {
            console.log('❌ AuthenticateToken - UserId não encontrado no token');
            console.log('🔐 AuthenticateToken - decoded.userId:', decoded.userId);
            console.log('🔐 AuthenticateToken - decoded.id:', decoded.id);
            console.log('🔐 ===== FIM DO MIDDLEWARE - USERID NÃO ENCONTRADO =====');
            return res.status(400).json({ message: 'ID da solicitação inválido' });
        }
        console.log('🔐 AuthenticateToken - Buscando usuário no banco...');
        const user = await storage_js_1.storage.getUser(userId);
        console.log('🔐 AuthenticateToken - Usuário encontrado:', user ? 'Sim' : 'Não');
        console.log('🔐 AuthenticateToken - Dados do usuário:', user ? { id: user.id, name: user.name, email: user.email, userType: user.userType } : 'null');
        if (!user || user.isBlocked) {
            console.log('❌ AuthenticateToken - Usuário não encontrado ou bloqueado');
            console.log('🔐 ===== FIM DO MIDDLEWARE - USUÁRIO NÃO ENCONTRADO =====');
            return res.status(403).json({ message: 'Usuário não encontrado ou bloqueado' });
        }
        console.log('✅ AuthenticateToken - Usuário autenticado com sucesso:', user.id, user.name);
        req.user = user;
        console.log('🔐 ===== FIM DO MIDDLEWARE - AUTENTICAÇÃO BEM-SUCEDIDA =====');
        next();
    }
    catch (error) {
        console.error('❌ AuthenticateToken - Erro:', error);
        console.log('🔐 ===== FIM DO MIDDLEWARE - ERRO =====');
        return res.status(403).json({ message: 'Token inválido' });
    }
};
exports.authenticateToken = authenticateToken;
// Anti-fraud middleware
const rateLimitByIP = async (req, res, next) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        return next();
    }
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    try {
        // Check recent login attempts from this IP
        const recentAttempts = await storage_js_1.storage.getRecentLoginAttempts(ip, 15); // Last 15 minutes
        if (recentAttempts.length >= 10) { // Increased from 5 to 10
            const failedAttempts = recentAttempts.filter(attempt => !attempt.successful);
            if (failedAttempts.length >= 5) { // Increased from 3 to 5
                // Log suspicious activity
                await storage_js_1.storage.createLoginAttempt({
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
exports.rateLimitByIP = rateLimitByIP;
// Generate verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateVerificationCode = generateVerificationCode;
// Send SMS verification (mock implementation)
const sendSMSVerification = async (phone, code) => {
    // In production, integrate with SMS service like Twilio
    console.log(`SMS sent to ${phone}: Your verification code is ${code}`);
    return true;
};
exports.sendSMSVerification = sendSMSVerification;
// Validate Brazilian phone number
const validateBrazilianPhone = (phone) => {
    const phoneRegex = /^(?:\+55\s?)?(?:\(?[1-9]{2}\)?\s?)?(?:9\s?)?[0-9]{4}[-\s]?[0-9]{4}$/;
    return phoneRegex.test(phone);
};
exports.validateBrazilianPhone = validateBrazilianPhone;
// Check if email is suspicious
const isEmailSuspicious = (email) => {
    const suspiciousPatterns = [
        /^[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}$/i, // Very simple email pattern
        /^\d+@/, // Starts with numbers
        /temp|fake|test|spam/i, // Contains suspicious words
        /@(10minutemail|guerrillamail|mailinator)/i // Temporary email services
    ];
    return suspiciousPatterns.some(pattern => pattern.test(email));
};
exports.isEmailSuspicious = isEmailSuspicious;
exports.default = passport_1.default;
