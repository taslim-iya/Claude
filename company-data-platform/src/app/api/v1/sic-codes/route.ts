import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonResponse, errorResponse, withApiKeyAuth, logApiUsage } from '@/lib/api-utils';
import { buildWhereClause, ClientFilterCriteria } from '@/lib/criteria-engine';

export async function GET(request: NextRequest) {
  const start = Date.now();
  const { apiKey, error } = await withApiKeyAuth(request);
  if (error || !apiKey) return error!;

  try {
    const clientCriteria = apiKey.user.clientCriteria?.criteria as ClientFilterCriteria | null;
    const criteriaWhere = clientCriteria ? buildWhereClause(clientCriteria) : {};

    const sicCodes = await prisma.company.groupBy({
      by: ['sicCode'],
      where: { ...criteriaWhere, sicCode: { not: null } },
      _count: { sicCode: true },
      orderBy: { sicCode: 'asc' },
    });

    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, '/api/v1/sic-codes', 'GET', 200, responseTime, request);

    return jsonResponse({
      data: sicCodes.map((s) => ({
        sicCode: s.sicCode,
        count: s._count.sicCode,
      })),
    });
  } catch (error) {
    console.error(error);
    return errorResponse('Internal server error', 500);
  }
}
