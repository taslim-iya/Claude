import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { jsonResponse, errorResponse, getPaginationParams } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  const [logs, total] = await Promise.all([
    prisma.apiUsageLog.findMany({
      where: { userId: user.id },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        endpoint: true,
        method: true,
        statusCode: true,
        responseTime: true,
        createdAt: true,
      },
    }),
    prisma.apiUsageLog.count({ where: { userId: user.id } }),
  ]);

  return jsonResponse({
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
