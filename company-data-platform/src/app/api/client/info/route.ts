import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [apiKeys, criteria, totalUsage, todayUsage, weekUsage] = await Promise.all([
    prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        status: true,
        rateLimit: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    }),
    prisma.clientCriteria.findUnique({
      where: { userId: user.id },
    }),
    prisma.apiUsageLog.count({ where: { userId: user.id } }),
    prisma.apiUsageLog.count({ where: { userId: user.id, createdAt: { gte: todayStart } } }),
    prisma.apiUsageLog.count({ where: { userId: user.id, createdAt: { gte: weekStart } } }),
  ]);

  return jsonResponse({
    apiKeys,
    criteria: criteria?.criteria || null,
    canEditCriteria: criteria?.canEdit || false,
    usage: {
      total: totalUsage,
      today: todayUsage,
      thisWeek: weekUsage,
    },
  });
}
