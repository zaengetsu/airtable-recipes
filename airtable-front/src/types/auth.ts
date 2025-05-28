export interface CustomJwtPayload {
  id: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
} 