import 'dotenv/config';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
// Carregar .env do diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });
import express from "express";
import { sql } from "drizzle-orm";
import { setupRoutes } from "./routes-simple.js";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import Redis from "redis";
const app = express();
console.log('=== Backend inicializado ===');
// CORS unificado (inclui preflight)
app.use((req, res, next) => {
    if (req.path.startsWith('/uploads'))
        return next();
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://lifebee.netlify.app',
        'https://lifebee.com.br',
        'http://localhost:5173',
        'http://localhost:5174'
    ];
    res.setHeader('Vary', 'Origin');
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else {
        const defaultOrigin = process.env.NODE_ENV === 'production' ? 'https://lifebee.netlify.app' : 'http://localhost:5173';
        res.setHeader('Access-Control-Allow-Origin', defaultOrigin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS')
        return res.status(204).end();
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Middleware de debug global
app.use((req, res, next) => {
    console.log('🌐 Debug Global - Requisição:', req.method, req.path);
    next();
});
// Middleware de verificação de saúde do banco
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api') && req.path !== '/api/health') {
        try {
            // Verificar se o banco está respondendo
            const { db } = await import('./db.js');
            await db.execute(sql `SELECT 1`);
            next();
        }
        catch (error) {
            console.error('❌ Erro de conexão com banco:', error);
            res.status(503).json({
                error: 'Serviço temporariamente indisponível',
                message: 'Erro de conexão com banco de dados'
            });
        }
    }
    else {
        next();
    }
});
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
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
            // if (logLine.length > 80) {
            //   logLine = logLine.slice(0, 79) + "…";
            // }
            console.log(logLine);
        }
    });
    next();
});
(async () => {
    // await seedDatabase(); // REMOVIDO: não limpar mais o banco automaticamente
    // Configurar Redis
    const redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    try {
        await redisClient.connect();
        console.log('✅ Redis conectado');
    }
    catch (error) {
        console.log('⚠️ Redis não disponível, usando fallback');
    }
    // Configurar rotas
    setupRoutes(app, redisClient);
    // Criar servidor HTTP
    const server = createServer(app);
    // Inicializa o Socket.IO junto ao servidor HTTP
    const io = new SocketIOServer(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://localhost:5174",
                "https://lifebee.netlify.app",
                "https://lifebee.com.br"
            ],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("Novo usuário conectado:", socket.id);
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
        });
        socket.on("chatMessage", ({ roomId, message, sender }) => {
            io.to(roomId).emit("chatMessage", { message, sender });
        });
        socket.on("disconnect", () => {
            console.log("Usuário desconectado:", socket.id);
        });
    });
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        // Log detalhado do erro
        console.error('❌ Erro global capturado:');
        console.error('Status:', status);
        console.error('Message:', message);
        console.error('Stack:', err.stack);
        console.error('Error object:', err);
        // Resposta de erro
        const errorResponse = {
            message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : message
        };
        // Adicionar detalhes em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = {
                stack: err.stack,
                name: err.name,
                code: err.code
            };
        }
        res.status(status).json(errorResponse);
    });
    // Servir no PORT fornecido pelo Render/ambiente (sem fixar 5000)
    const port = process.env.PORT || 8080;
    server.listen({
        port: Number(port),
        host: "0.0.0.0",
    }, () => {
        console.log(`Server running on port ${port}`);
    });
})();
