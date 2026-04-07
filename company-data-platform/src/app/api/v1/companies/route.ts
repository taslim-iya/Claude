import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonResponse, errorResponse, getPaginationParams, getSortParams, withApiKeyAuth, logApiUsage } from '@/lib/api-utils';
import { buildWhereClause, ClientFilterCriteria } from '@/lib/criteria-engine';

const SORT_FIELDS = ['companyName', 'industry', 'revenue', 'profitBeforeTax', 'totalAssets', 'netAssets', 'createdAt'];

const CLIENT_VISIBLE_FIELDS = {
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
};

export async function GET(request: NextRequest) {
  const start = Date.now();
  const { apiKey, error } = await withApiKeyAuth(request);
  if (error || !apiKey) return error!;

  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);
    const { orderBy } = getSortParams(searchParams, SORT_FIELDS);

    // Build request-level filters
    const requestWhere: Record<string, unknown> = {};
    const search = searchParams.get('search');
    if (search) {
      requestWhere.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }
    const industry = searchParams.get('industry');
    if (industry) requestWhere.industry = { contains: industry, mode: 'insensitive' };
    const sicCode = searchParams.get('sic_code');
    if (sicCode) requestWhere.sicCode = sicCode;
    const verified = searchParams.get('verified');
    if (verified === 'true') requestWhere.verificationStatus = 'VERIFIED';

    // Apply client criteria
    const clientCriteria = apiKey.user.clientCriteria?.criteria as ClientFilterCriteria | null;
    const criteriaWhere = clientCriteria ? buildWhereClause(clientCriteria) : {};

    const where = { AND: [criteriaWhere, requestWhere] };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: CLIENT_VISIBLE_FIELDS,
      }),
      prisma.company.count({ where }),
    ]);

    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, '/api/v1/companies', 'GET', 200, responseTime, request);

    return jsonResponse({
      data: companies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, '/api/v1/companies', 'GET', 500, responseTime, request);
    return errorResponse('Internal server error', 500);
  }
}
