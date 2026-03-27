import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, hashPassword } from '@/lib/auth';
import { jsonResponse, errorResponse, getPaginationParams } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await requireAuth('ADMIN');
    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CLIENT' },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          clientCriteria: true,
          _count: { select: { apiKeys: true, apiUsageLogs: true } },
        },
      }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
    ]);

    return jsonResponse({
      data: clients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAuth('ADMIN');
    const { email, name, password, criteria, canEdit } = await request.json();

    if (!email || !name || !password) {
      return errorResponse('Email, name, and password are required', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse('Email already registered', 409);

    const passwordHash = await hashPassword(password);

    const client = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'CLIENT',
        clientCriteria: criteria ? {
          create: {
            criteria: criteria,
            canEdit: canEdit || false,
          },
        } : undefined,
      },
      include: { clientCriteria: true },
    });

    await createAuditLog({
      userId: admin.id,
      action: 'CREATE_CLIENT',
      entityType: 'user',
      entityId: client.id,
      newValues: { email, name },
    });

    return jsonResponse({
      id: client.id,
      email: client.email,
      name: client.name,
      role: client.role,
      clientCriteria: client.clientCriteria,
    }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
