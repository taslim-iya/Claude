import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `cdp_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth('ADMIN');
    const userId = request.nextUrl.searchParams.get('userId');

    const where = userId ? { userId } : {};
    const keys = await prisma.apiKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        keyPrefix: true,
        name: true,
        status: true,
        rateLimit: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
        revokedAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    return jsonResponse({ data: keys });
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAuth('ADMIN');
    const { userId, name, rateLimit, expiresAt } = await request.json();

    if (!userId || !name) {
      return errorResponse('userId and name are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse('User not found', 404);

    const { key, hash, prefix } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        keyHash: hash,
        keyPrefix: prefix,
        name,
        rateLimit: rateLimit || 1000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: 'CREATE_API_KEY',
      entityType: 'api_key',
      entityId: apiKey.id,
      newValues: { userId, name, keyPrefix: prefix },
    });

    // Return the full key only once at creation time
    return jsonResponse({
      ...apiKey,
      key,
      message: 'Store this API key securely. It will not be shown again.',
    }, 201);
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
