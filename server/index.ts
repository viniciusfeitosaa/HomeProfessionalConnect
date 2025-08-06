import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { seedDatabase } from "./seedData.js";
import { Server as SocketIOServer } from "socket.io";

// Extend Express Request type for user property
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      userType: string;
    }
    interface Request {
      user?: User;
    }
  }
}

const app = express();

console.log('=== Backend inicializado ===');

// Configure CORS for Netlify frontend and development
app.use((req, res, next) => {
  // Skip CORS for uploads - they have their own CORS configuration
  if (req.path.startsWith('/uploads')) {
    return next();
  }
  
  const origin = req.headers.origin;
  
  // Allow both Netlify and localhost for development
  const allowedOrigins = [
    'https://lifebee.netlify.app', 
    'https://lifebee.com.br',
    'http://localhost:5173', 
    'http://localhost:5174'
  ];
  
  console.log('🌐 CORS - Origin:', origin);
  console.log('🌐 CORS - Method:', req.method);
  console.log('🌐 CORS - Path:', req.path);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('🌐 CORS - Origin permitido:', origin);
  } else {
    // Em produção, usar o Netlify como padrão
    const defaultOrigin = process.env.NODE_ENV === 'production' 
      ? 'https://lifebee.netlify.app' 
      : 'http://localhost:5173';
    res.setHeader('Access-Control-Allow-Origin', defaultOrigin);
    console.log('🌐 CORS - Usando origin padrão:', defaultOrigin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log('🌐 CORS - Respondendo a OPTIONS');
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de debug global
app.use((req, res, next) => {
  console.log('🌐 Debug Global - Requisição:', req.method, req.path);
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
  
  const server = await registerRoutes(app);

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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
  }, () => {
    console.log(`Server running on port ${port}`);
  });
})();
