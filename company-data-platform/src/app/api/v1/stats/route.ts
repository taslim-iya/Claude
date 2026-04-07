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

    const [
      totalCompanies,
      verifiedCount,
      partialCount,
      failedCount,
      industriesCount,
      withWebsite,
    ] = await Promise.all([
      prisma.company.count({ where: criteriaWhere }),
      prisma.company.count({ where: { ...criteriaWhere, verificationStatus: 'VERIFIED' } }),
      prisma.company.count({ where: { ...criteriaWhere, verificationStatus: 'PARTIAL' } }),
      prisma.company.count({ where: { ...criteriaWhere, verificationStatus: 'FAILED' } }),
      prisma.company.groupBy({
        by: ['industry'],
        where: { ...criteriaWhere, industry: { not: null } },
      }),
      prisma.company.count({ where: { ...criteriaWhere, website: { not: null } } }),
    ]);

    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, '/api/v1/stats', 'GET', 200, responseTime, request);

    return jsonResponse({
      totalCompanies,
      verified: verifiedCount,
      partial: partialCount,
      failed: failedCount,
      unreviewed: totalCompanies - verifiedCount - partialCount - failedCount,
      uniqueIndustries: industriesCount.length,
      withWebsite,
    });
  } catch (error) {
    console.error(error);
    return errorResponse('Internal server error', 500);
  }
}
