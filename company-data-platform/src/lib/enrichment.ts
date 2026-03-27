import { prisma } from './db';
import { VerificationStatus, EnrichmentJobStatus } from '@/generated/prisma/client';

interface EnrichmentContext {
  companyId: string;
  companyName: string;
  website?: string | null;
  sicCode?: string | null;
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .replace(/\b(ltd|limited|llc|inc|incorporated|plc|corp|corporation)\b\.?/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function checkWebsite(url: string): Promise<{
  accessible: boolean;
  title?: string;
  description?: string;
}> {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(fullUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CompanyDataPlatform/1.0' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return { accessible: false };

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    return {
      accessible: true,
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
    };
  } catch {
    return { accessible: false };
  }
}

function calculateVerificationScore(results: {
  websiteCheck?: { accessible: boolean };
  nameNormalized: boolean;
  domainExtracted: boolean;
  fieldsPresent: number;
  totalFields: number;
}): number {
  let score = 0;
  const maxScore = 100;

  if (results.websiteCheck?.accessible) score += 30;
  if (results.nameNormalized) score += 10;
  if (results.domainExtracted) score += 10;
  score += Math.round((results.fieldsPresent / results.totalFields) * 50);

  return Math.min(score, maxScore);
}

function determineStatus(score: number): VerificationStatus {
  if (score >= 70) return 'VERIFIED';
  if (score >= 40) return 'PARTIAL';
  if (score > 0) return 'FAILED';
  return 'UNREVIEWED';
}

export async function enrichCompany(context: EnrichmentContext): Promise<void> {
  const company = await prisma.company.findUnique({ where: { id: context.companyId } });
  if (!company) return;

  const normalizedName = normalizeCompanyName(company.companyName);
  const domain = company.website ? extractDomain(company.website) : null;

  let websiteResult: Awaited<ReturnType<typeof checkWebsite>> | undefined;
  if (company.website) {
    websiteResult = await checkWebsite(company.website);

    await prisma.sourceEvidence.create({
      data: {
        companyId: company.id,
        sourceType: 'WEB_SCRAPE',
        sourceUrl: company.website,
        fieldName: 'website_check',
        extractedValue: JSON.stringify(websiteResult),
        uploadedValue: company.website,
        confidence: websiteResult.accessible ? 80 : 20,
      },
    });
  }

  const totalFields = 9;
  let fieldsPresent = 0;
  if (company.companyName) fieldsPresent++;
  if (company.sicCode) fieldsPresent++;
  if (company.industry) fieldsPresent++;
  if (company.description) fieldsPresent++;
  if (company.revenue) fieldsPresent++;
  if (company.profitBeforeTax) fieldsPresent++;
  if (company.totalAssets) fieldsPresent++;
  if (company.netAssets) fieldsPresent++;
  if (company.website) fieldsPresent++;

  const score = calculateVerificationScore({
    websiteCheck: websiteResult,
    nameNormalized: !!normalizedName,
    domainExtracted: !!domain,
    fieldsPresent,
    totalFields,
  });

  const status = determineStatus(score);

  await prisma.company.update({
    where: { id: company.id },
    data: {
      websiteDomain: domain,
      verificationStatus: status,
      verificationScore: score,
      lastVerifiedAt: new Date(),
      lastUpdatedAt: new Date(),
    },
  });
}

export async function runEnrichmentJob(companyIds: string[]): Promise<string> {
  const job = await prisma.enrichmentJob.create({
    data: {
      status: 'RUNNING',
      totalRecords: companyIds.length,
      startedAt: new Date(),
    },
  });

  // Process in background - in production this would be a queue
  (async () => {
    let succeeded = 0;
    let failed = 0;

    for (const companyId of companyIds) {
      try {
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) continue;

        await prisma.enrichmentResult.create({
          data: {
            companyId,
            jobId: job.id,
            status: 'RUNNING',
            sourceType: 'WEB_SCRAPE',
          },
        });

        await enrichCompany({
          companyId,
          companyName: company.companyName,
          website: company.website,
          sicCode: company.sicCode,
        });

        await prisma.enrichmentResult.updateMany({
          where: { companyId, jobId: job.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });

        succeeded++;
      } catch (err) {
        failed++;
        await prisma.enrichmentResult.updateMany({
          where: { companyId, jobId: job.id },
          data: {
            status: 'FAILED',
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
            completedAt: new Date(),
          },
        });
      }

      await prisma.enrichmentJob.update({
        where: { id: job.id },
        data: { processed: succeeded + failed, succeeded, failed },
      });
    }

    await prisma.enrichmentJob.update({
      where: { id: job.id },
      data: {
        status: failed === companyIds.length ? 'FAILED' : 'COMPLETED',
        completedAt: new Date(),
        processed: succeeded + failed,
        succeeded,
        failed,
      },
    });
  })();

  return job.id;
}
