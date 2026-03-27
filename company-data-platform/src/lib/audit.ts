import { prisma } from './db';

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValues: params.oldValues ? (params.oldValues as object) : undefined,
      newValues: params.newValues ? (params.newValues as object) : undefined,
      ipAddress: params.ipAddress,
    },
  });
}
