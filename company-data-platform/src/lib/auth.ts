import { prisma } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { UserRole } from '@/generated/prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) return null;
  return user;
}

export async function requireAuth(role?: UserRole) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  if (role && user.role !== role) throw new Error('Forbidden');
  return user;
}

export async function authenticateApiKey(apiKey: string) {
  const crypto = await import('crypto');
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        include: { clientCriteria: true },
      },
    },
  });

  if (!key || key.status !== 'ACTIVE') return null;
  if (key.expiresAt && key.expiresAt < new Date()) return null;

  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  });

  return key;
}
