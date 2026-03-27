import { prisma } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse('Email already registered', 409);
    }

    const passwordHash = await hashPassword(password);

    // First user becomes admin
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'CLIENT';

    const user = await prisma.user.create({
      data: { email, name, passwordHash, role },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
