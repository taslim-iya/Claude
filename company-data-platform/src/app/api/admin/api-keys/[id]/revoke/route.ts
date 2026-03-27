import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAuth('ADMIN');
    const { id } = await params;

    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key) return errorResponse('API key not found', 404);

    await prisma.apiKey.update({
      where: { id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });

    await createAuditLog({
      userId: admin.id,
      action: 'REVOKE_API_KEY',
      entityType: 'api_key',
      entityId: id,
    });

    return jsonResponse({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
