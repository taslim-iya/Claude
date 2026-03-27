import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { id } = await params;
    const client = await prisma.user.findUnique({
      where: { id, role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        clientCriteria: true,
        apiKeys: {
          select: {
            id: true,
            keyPrefix: true,
            name: true,
            status: true,
            rateLimit: true,
            expiresAt: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
        _count: { select: { apiUsageLogs: true } },
      },
    });
    if (!client) return errorResponse('Client not found', 404);
    return jsonResponse(client);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAuth('ADMIN');
    const { id } = await params;
    const body = await request.json();

    const client = await prisma.user.findUnique({ where: { id, role: 'CLIENT' } });
    if (!client) return errorResponse('Client not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        isActive: body.isActive,
      },
    });

    if (body.criteria !== undefined) {
      await prisma.clientCriteria.upsert({
        where: { userId: id },
        create: {
          userId: id,
          criteria: body.criteria,
          canEdit: body.canEdit ?? false,
        },
        update: {
          criteria: body.criteria,
          canEdit: body.canEdit,
        },
      });
    }

    await createAuditLog({
      userId: admin.id,
      action: 'UPDATE_CLIENT',
      entityType: 'user',
      entityId: id,
      newValues: body,
    });

    return jsonResponse(updated);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
