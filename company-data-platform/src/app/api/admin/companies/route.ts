import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse, getPaginationParams, getSortParams } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';

const SORT_FIELDS = ['companyName', 'industry', 'revenue', 'verificationStatus', 'createdAt', 'verificationScore'];

export async function GET(request: NextRequest) {
  try {
    await requireAuth('ADMIN');
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);
    const { orderBy } = getSortParams(searchParams, SORT_FIELDS);

    const where: Record<string, unknown> = {};
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { sicCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    const status = searchParams.get('status');
    if (status) where.verificationStatus = status;

    const industry = searchParams.get('industry');
    if (industry) where.industry = { contains: industry, mode: 'insensitive' };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          _count: { select: { sourceEvidence: true, enrichmentResults: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return jsonResponse({
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (err instanceof Error && err.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();

    const company = await prisma.company.create({
      data: {
        companyName: body.companyName,
        sicCode: body.sicCode,
        industry: body.industry,
        description: body.description,
        revenue: body.revenue,
        profitBeforeTax: body.profitBeforeTax,
        totalAssets: body.totalAssets,
        netAssets: body.netAssets,
        website: body.website,
        sourceType: 'MANUAL_ENTRY',
        verificationStatus: 'UNREVIEWED',
        notes: body.notes,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entityType: 'company',
      entityId: company.id,
      newValues: body,
    });

    return jsonResponse(company, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    if (err instanceof Error && err.message === 'Forbidden') return errorResponse('Forbidden', 403);
    return errorResponse('Internal server error', 500);
  }
}
