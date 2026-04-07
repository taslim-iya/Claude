import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        sourceEvidence: { orderBy: { createdAt: 'desc' } },
        enrichmentResults: { orderBy: { createdAt: 'desc' } },
        companyEdits: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!company) return errorResponse('Company not found', 404);
    return jsonResponse(company);
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth('ADMIN');
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.company.findUnique({ where: { id } });
    if (!existing) return errorResponse('Company not found', 404);

    // Track field-level edits
    const editableFields = [
      'companyName', 'sicCode', 'industry', 'description',
      'revenue', 'profitBeforeTax', 'totalAssets', 'netAssets',
      'website', 'notes', 'verificationStatus',
    ];

    const edits = [];
    for (const field of editableFields) {
      if (body[field] !== undefined && String(body[field]) !== String((existing as Record<string, unknown>)[field])) {
        edits.push({
          companyId: id,
          userId: user.id,
          fieldName: field,
          oldValue: String((existing as Record<string, unknown>)[field] ?? ''),
          newValue: String(body[field] ?? ''),
        });
      }
    }

    if (edits.length > 0) {
      await prisma.companyEdit.createMany({ data: edits });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...body,
        lastUpdatedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'company',
      entityId: id,
      oldValues: existing as unknown as Record<string, unknown>,
      newValues: body,
    });

    return jsonResponse(updated);
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth('ADMIN');
    const { id } = await params;
    await prisma.company.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entityType: 'company',
      entityId: id,
    });

    return jsonResponse({ success: true });
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
