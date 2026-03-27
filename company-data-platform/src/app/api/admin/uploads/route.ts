import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse, getPaginationParams } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const SCHEMA_FIELDS = [
  'companyName', 'sicCode', 'industry', 'description',
  'revenue', 'profitBeforeTax', 'totalAssets', 'netAssets', 'website',
];

function parseFile(buffer: Buffer, fileName: string): { headers: string[]; rows: Record<string, string>[] } {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    const text = buffer.toString('utf-8');
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    return {
      headers: result.meta.fields || [],
      rows: result.data as Record<string, string>[],
    };
  }

  // Excel
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  return { headers, rows: data };
}

function detectDuplicates(rows: Record<string, string>[], mapping: Record<string, string>): number[] {
  const seen = new Set<string>();
  const duplicateIndices: number[] = [];
  const nameField = Object.keys(mapping).find(k => mapping[k] === 'companyName');

  rows.forEach((row, index) => {
    const name = nameField ? (row[nameField] || '').toLowerCase().trim() : '';
    if (name && seen.has(name)) {
      duplicateIndices.push(index);
    }
    if (name) seen.add(name);
  });

  return duplicateIndices;
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth('ADMIN');
    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    const [uploads, total] = await Promise.all([
      prisma.upload.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { companies: true } },
        },
      }),
      prisma.upload.count(),
    ]);

    return jsonResponse({
      data: uploads,
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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mappingStr = formData.get('mapping') as string;
    const action = formData.get('action') as string; // 'preview' or 'import'

    if (!file) return errorResponse('File is required', 400);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      return errorResponse('Only CSV and Excel files are supported', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { headers, rows } = parseFile(buffer, file.name);

    // Preview mode - return headers and sample data
    if (action === 'preview' || !mappingStr) {
      return jsonResponse({
        headers,
        sampleRows: rows.slice(0, 5),
        totalRows: rows.length,
        schemaFields: SCHEMA_FIELDS,
      });
    }

    // Import mode
    const mapping = JSON.parse(mappingStr) as Record<string, string>;
    const duplicateIndices = detectDuplicates(rows, mapping);

    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: ext || 'unknown',
        columnMapping: mapping,
        totalRows: rows.length,
        duplicatesFound: duplicateIndices.length,
        status: 'processing',
      },
    });

    let imported = 0;
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      if (duplicateIndices.includes(i)) continue;

      try {
        const row = rows[i];
        const companyData: Record<string, unknown> = {
          sourceType: ext === 'csv' ? 'CSV_UPLOAD' : 'EXCEL_UPLOAD',
          verificationStatus: 'PENDING_ENRICHMENT',
          uploadId: upload.id,
          rawSourcePayload: row,
        };

        for (const [fileCol, schemaCol] of Object.entries(mapping)) {
          const value = row[fileCol];
          if (!value) continue;

          if (['revenue', 'profitBeforeTax', 'totalAssets', 'netAssets'].includes(schemaCol)) {
            const num = parseFloat(String(value).replace(/[£$€,]/g, ''));
            if (!isNaN(num)) companyData[schemaCol] = num;
          } else {
            companyData[schemaCol] = String(value).trim();
          }
        }

        if (!companyData.companyName) {
          errors.push({ row: i + 1, error: 'Missing company name' });
          continue;
        }

        // Check for existing duplicates in DB
        const existingCount = await prisma.company.count({
          where: {
            companyName: {
              equals: String(companyData.companyName),
              mode: 'insensitive',
            },
          },
        });

        if (existingCount > 0) {
          errors.push({ row: i + 1, error: `Duplicate: ${companyData.companyName} already exists` });
          continue;
        }

        await prisma.company.create({ data: companyData as never });
        imported++;
      } catch (err) {
        errors.push({ row: i + 1, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        importedRows: imported,
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        errorLog: errors.length > 0 ? errors : undefined,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: 'UPLOAD_IMPORT',
      entityType: 'upload',
      entityId: upload.id,
      newValues: {
        fileName: file.name,
        totalRows: rows.length,
        imported,
        errors: errors.length,
      },
    });

    return jsonResponse({
      uploadId: upload.id,
      totalRows: rows.length,
      imported,
      duplicatesSkipped: duplicateIndices.length,
      errors,
    }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse('Internal server error', 500);
  }
}
