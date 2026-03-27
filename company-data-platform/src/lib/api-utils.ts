import { NextRequest } from 'next/server';
import { prisma } from './db';
import { authenticateApiKey } from './auth';

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function getSortParams(searchParams: URLSearchParams, allowedFields: string[]) {
  const sortBy = searchParams.get('sort_by') || 'createdAt';
  const sortOrder = searchParams.get('sort_order') === 'desc' ? 'desc' : 'asc';
  if (!allowedFields.includes(sortBy)) return { orderBy: { createdAt: 'desc' as const } };
  return { orderBy: { [sortBy]: sortOrder } };
}

export async function withApiKeyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: errorResponse('Missing or invalid API key', 401) };
  }

  const apiKeyValue = authHeader.slice(7);
  const apiKey = await authenticateApiKey(apiKeyValue);
  if (!apiKey) {
    return { error: errorResponse('Invalid or expired API key', 401) };
  }

  // Rate limiting check
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const recentRequests = await prisma.apiUsageLog.count({
    where: {
      apiKeyId: apiKey.id,
      createdAt: { gte: oneMinuteAgo },
    },
  });

  if (recentRequests >= apiKey.rateLimit) {
    return { error: errorResponse('Rate limit exceeded', 429) };
  }

  return { apiKey };
}

export async function logApiUsage(
  userId: string,
  apiKeyId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  request: NextRequest
) {
  await prisma.apiUsageLog.create({
    data: {
      userId,
      apiKeyId,
      endpoint,
      method,
      statusCode,
      responseTime,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      queryParams: Object.fromEntries(request.nextUrl.searchParams),
    },
  });
}
