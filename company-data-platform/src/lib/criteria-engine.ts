import { Prisma } from '@/generated/prisma/client';

export interface ClientFilterCriteria {
  sicCodes?: string[];
  sicCodeRanges?: { from: string; to: string }[];
  industryInclude?: string[];
  industryExclude?: string[];
  revenueMin?: number;
  revenueMax?: number;
  profitBeforeTaxMin?: number;
  profitBeforeTaxMax?: number;
  totalAssetsMin?: number;
  totalAssetsMax?: number;
  netAssetsMin?: number;
  netAssetsMax?: number;
  websiteExists?: boolean;
  verifiedOnly?: boolean;
  descriptionKeywords?: string[];
  industryKeywords?: string[];
}

export function buildWhereClause(criteria: ClientFilterCriteria): Prisma.CompanyWhereInput {
  const conditions: Prisma.CompanyWhereInput[] = [];

  // SIC code exact match
  if (criteria.sicCodes?.length) {
    conditions.push({ sicCode: { in: criteria.sicCodes } });
  }

  // SIC code ranges
  if (criteria.sicCodeRanges?.length) {
    const rangeConditions = criteria.sicCodeRanges.map((range) => ({
      sicCode: { gte: range.from, lte: range.to },
    }));
    conditions.push({ OR: rangeConditions });
  }

  // Industry include
  if (criteria.industryInclude?.length) {
    conditions.push({ industry: { in: criteria.industryInclude } });
  }

  // Industry exclude
  if (criteria.industryExclude?.length) {
    conditions.push({ NOT: { industry: { in: criteria.industryExclude } } });
  }

  // Revenue range
  if (criteria.revenueMin !== undefined) {
    conditions.push({ revenue: { gte: criteria.revenueMin } });
  }
  if (criteria.revenueMax !== undefined) {
    conditions.push({ revenue: { lte: criteria.revenueMax } });
  }

  // Profit Before Tax range
  if (criteria.profitBeforeTaxMin !== undefined) {
    conditions.push({ profitBeforeTax: { gte: criteria.profitBeforeTaxMin } });
  }
  if (criteria.profitBeforeTaxMax !== undefined) {
    conditions.push({ profitBeforeTax: { lte: criteria.profitBeforeTaxMax } });
  }

  // Total Assets range
  if (criteria.totalAssetsMin !== undefined) {
    conditions.push({ totalAssets: { gte: criteria.totalAssetsMin } });
  }
  if (criteria.totalAssetsMax !== undefined) {
    conditions.push({ totalAssets: { lte: criteria.totalAssetsMax } });
  }

  // Net Assets range
  if (criteria.netAssetsMin !== undefined) {
    conditions.push({ netAssets: { gte: criteria.netAssetsMin } });
  }
  if (criteria.netAssetsMax !== undefined) {
    conditions.push({ netAssets: { lte: criteria.netAssetsMax } });
  }

  // Website exists
  if (criteria.websiteExists) {
    conditions.push({ website: { not: null } });
    conditions.push({ NOT: { website: '' } });
  }

  // Verified only
  if (criteria.verifiedOnly) {
    conditions.push({ verificationStatus: 'VERIFIED' });
  }

  // Description keywords
  if (criteria.descriptionKeywords?.length) {
    const keywordConditions = criteria.descriptionKeywords.map((kw) => ({
      description: { contains: kw, mode: 'insensitive' as const },
    }));
    conditions.push({ OR: keywordConditions });
  }

  // Industry keywords
  if (criteria.industryKeywords?.length) {
    const keywordConditions = criteria.industryKeywords.map((kw) => ({
      industry: { contains: kw, mode: 'insensitive' as const },
    }));
    conditions.push({ OR: keywordConditions });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

export function mergeWithClientCriteria(
  clientCriteria: ClientFilterCriteria | null,
  requestFilters: Prisma.CompanyWhereInput
): Prisma.CompanyWhereInput {
  if (!clientCriteria) return requestFilters;
  const criteriaWhere = buildWhereClause(clientCriteria);
  return { AND: [criteriaWhere, requestFilters] };
}
