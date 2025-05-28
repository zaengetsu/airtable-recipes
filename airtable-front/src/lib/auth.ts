import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from '@/types/auth';

export async function authenticate(request: Request): Promise<CustomJwtPayload | null> {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
    return decoded;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
} 