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

    const industries = await prisma.company.groupBy({
      by: ['industry'],
      where: { ...criteriaWhere, industry: { not: null } },
      _count: { industry: true },
      orderBy: { _count: { industry: 'desc' } },
    });

    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, '/api/v1/industries', 'GET', 200, responseTime, request);

    return jsonResponse({
      data: industries.map((i) => ({
        industry: i.industry,
        count: i._count.industry,
      })),
    });
  } catch (error) {
    console.error(error);
    return errorResponse('Internal server error', 500);
  }
}
