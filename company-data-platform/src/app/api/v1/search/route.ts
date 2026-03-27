import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonResponse, errorResponse, getPaginationParams, withApiKeyAuth, logApiUsage } from '@/lib/api-utils';
import { buildWhereClause, ClientFilterCriteria } from '@/lib/criteria-engine';

export async function POST(request: NextRequest) {
  const start = Date.now();
  const { apiKey, error } = await withApiKeyAuth(request);
  if (error || !apiKey) return error!;

  try {
    const body = await request.json();
    const { page, limit, offset } = getPaginationParams(new URLSearchParams({
      page: String(body.page || 1),
      limit: String(body.limit || 20),
    }));

    const filters: Record<string, unknown> = {};

    if (body.companyName) {
      filters.companyName = { contains: body.companyName, mode: 'insensitive' };
    }
    if (body.sicCode) filters.sicCode = body.sicCode;
    if (body.industry) filters.industry = { contains: body.industry, mode: 'insensitive' };
    if (body.revenueMin || body.revenueMax) {
      filters.revenue = {};
      if (body.revenueMin) (filters.revenue as Record<string, unknown>).gte = body.revenueMin;
      if (body.revenueMax) (filters.revenue as Record<string, unknown>).lte = body.revenueMax;
    }
    if (body.verifiedOnly) filters.verificationStatus = 'VERIFIED';
    if (body.websiteExists) {
      filters.website = { not: null };
    }
    if (body.keywords) {
      filters.OR = [
        { description: { contains: body.keywords, mode: 'insensitive' } },
        { industry: { contains: body.keywords, mode: 'insensitive' } },
        { companyName: { contains: body.keywords, mode: 'insensitive' } },
      ];
    }

    // Apply client criteria
    const clientCriteria = apiKey.user.clientCriteria?.criteria as ClientFilterCriteria | null;
    const criteriaWhere = clientCriteria ? buildWhereClause(clientCriteria) : {};
    const where = { AND: [criteriaWhere, filters] };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: body.sortBy ? { [body.sortBy]: body.sortOrder || 'asc' } : { companyName: 'asc' },
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
          verificationStatus: true,
          verificationScore: true,
        },
      }),
      prisma.company.count({ where }),
    ]);

    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, '/api/v1/search', 'POST', 200, responseTime, request);

    return jsonResponse({
      data: companies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    const responseTime = Date.now() - start;
    await logApiUsage(apiKey.user.id, apiKey.id, '/api/v1/search', 'POST', 500, responseTime, request);
    return errorResponse('Internal server error', 500);
  }
}
