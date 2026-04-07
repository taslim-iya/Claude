import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonResponse, errorResponse, withApiKeyAuth, logApiUsage } from '@/lib/api-utils';
import { buildWhereClause, ClientFilterCriteria } from '@/lib/criteria-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  const { apiKey, error } = await withApiKeyAuth(request);
  if (error || !apiKey) return error!;

  try {
    const { id } = await params;

    // Apply client criteria to ensure they can access this company
    const clientCriteria = apiKey.user.clientCriteria?.criteria as ClientFilterCriteria | null;
    const criteriaWhere = clientCriteria ? buildWhereClause(clientCriteria) : {};

    const company = await prisma.company.findFirst({
      where: { AND: [{ id }, criteriaWhere] },
      select: {
        id: true,
        companyName: true,
        sicCode: true,
        industry: true,
        description: true,
        revenue: true,
        profitBeforeTax: true,
        totalAssets: true,
        netAssets: true,
        website: true,
        websiteDomain: true,
        verificationStatus: true,
        verificationScore: true,
        lastVerifiedAt: true,
      },
    });

    const responseTime = Date.now() - start;
    if (!company) {
      await logApiUsage(apiKey.user.id, apiKey.id, `/api/v1/companies/${id}`, 'GET', 404, responseTime, request);
      return errorResponse('Company not found', 404);
    }

    await logApiUsage(apiKey.user.id, apiKey.id, `/api/v1/companies/${id}`, 'GET', 200, responseTime, request);
    return jsonResponse(company);
  } catch (error) {
    console.error(error);
    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, `/api/v1/companies/unknown`, 'GET', 500, responseTime, request);
    return errorResponse('Internal server error', 500);
  }
}
