import { Request } from 'express';

declare module 'express-session' {
  interface SessionData {
    [key: string]: any;
  }
}

declare global {
  namespace Express {
    interface Request {
      session: any;
      user?: any;
    }
  }
} 