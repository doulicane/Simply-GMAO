import { prisma } from '../config/database';

interface AuditParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details ?? null,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err: any) {
    // Silencieux — on ne veut pas planter une requête si l'audit echoue
    console.error('[Audit] Erreur ecriture audit log :', err.message);
  }
}
