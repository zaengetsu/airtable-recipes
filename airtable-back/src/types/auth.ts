import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user: CustomJwtPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
} 