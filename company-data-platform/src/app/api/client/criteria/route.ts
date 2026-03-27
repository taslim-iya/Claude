import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const existing = await prisma.clientCriteria.findUnique({
    where: { userId: user.id },
  });

  if (!existing?.canEdit) {
    return errorResponse('You are not permitted to edit criteria', 403);
  }

  const { criteria } = await request.json();

  await prisma.clientCriteria.update({
    where: { userId: user.id },
    data: { criteria },
  });

  return jsonResponse({ success: true });
}
