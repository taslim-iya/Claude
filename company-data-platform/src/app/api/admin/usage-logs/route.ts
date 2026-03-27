import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse, getPaginationParams } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAuth('ADMIN');
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);

    const where: Record<string, unknown> = {};
    const userId = searchParams.get('userId');
    if (userId) where.userId = userId;
    const endpoint = searchParams.get('endpoint');
    if (endpoint) where.endpoint = { contains: endpoint };

    const [logs, total] = await Promise.all([
      prisma.apiUsageLog.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          apiKey: { select: { name: true, keyPrefix: true } },
        },
      }),
      prisma.apiUsageLog.count({ where }),
    ]);

    return jsonResponse({
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
