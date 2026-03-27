import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse, getPaginationParams } from '@/lib/api-utils';
import { runEnrichmentJob } from '@/lib/enrichment';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await requireAuth('ADMIN');
    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const [jobs, total] = await Promise.all([
      prisma.enrichmentJob.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.enrichmentJob.count(),
    ]);

    return jsonResponse({
      data: jobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('ADMIN');
    const { companyIds, all } = await request.json();

    let ids: string[] = companyIds || [];

    if (all) {
      const companies = await prisma.company.findMany({
        where: {
          verificationStatus: { in: ['UNREVIEWED', 'PENDING_ENRICHMENT'] },
        },
        select: { id: true },
      });
      ids = companies.map((c) => c.id);
    }

    if (ids.length === 0) {
      return errorResponse('No companies to enrich', 400);
    }

    const jobId = await runEnrichmentJob(ids);

    await createAuditLog({
      userId: user.id,
      action: 'START_ENRICHMENT',
      entityType: 'enrichment_job',
      entityId: jobId,
      newValues: { companyCount: ids.length },
    });

    return jsonResponse({ jobId, companiesQueued: ids.length }, 202);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
