import { getCurrentUser } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  return jsonResponse({ user });
}
