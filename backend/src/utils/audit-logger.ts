import type { Request } from 'express';
import { logger } from '../loggers/index.js';

export const AuditAction = {
  PEDIDO_CREAR: 'PEDIDO_CREAR',
  PEDIDO_ANULAR: 'PEDIDO_ANULAR',
  PEDIDO_RECALCULAR: 'PEDIDO_RECALCULAR',
  PEDIDO_DETALLE_AGREGAR: 'PEDIDO_DETALLE_AGREGAR',
  PEDIDO_PREPARACION_CAMBIO: 'PEDIDO_PREPARACION_CAMBIO',
  PEDIDO_COBRAR: 'PEDIDO_COBRAR',
  CAJA_ABRIR: 'CAJA_ABRIR',
  CAJA_CERRAR: 'CAJA_CERRAR',
  CAJA_ARQUEO: 'CAJA_ARQUEO',
  CAJA_DIFERENCIA: 'CAJA_DIFERENCIA',
  INVENTARIO_MOVIMIENTO: 'INVENTARIO_MOVIMIENTO',
  SESION_INICIO: 'SESION_INICIO',
  SESION_CIERRE: 'SESION_CIERRE',
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

export interface AuditLogInput {
  usuarioId: number;
  usuarioLogeo?: string;
  ip: string;
  accion: AuditAction;
  modulo:
    | 'pedidos'
    | 'caja'
    | 'inventario'
    | 'seguridad'
    | 'clientes'
    | 'delivery';
  detalle: string;
  metadata?: Record<string, unknown>;
  nivel?: 'info' | 'warn' | 'error';
}

export const auditLog = (input: AuditLogInput): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    usuarioId: input.usuarioId,
    usuarioLogeo: input.usuarioLogeo,
    ip: input.ip,
    accion: input.accion,
    modulo: input.modulo,
    detalle: input.detalle,
    metadata: input.metadata,
    nivel: input.nivel ?? 'info',
  };

  switch (input.nivel) {
    case 'error':
      logger.error(logEntry, `Auditoría: ${input.accion}`);
      break;
    case 'warn':
      logger.warn(logEntry, `Auditoría: ${input.accion}`);
      break;
    default:
      logger.info(logEntry, `Auditoría: ${input.accion}`);
  }
};

export const crearLogAuditoria = (
  req: Request,
  accion: AuditAction,
  detalle: string,
  modulo: AuditLogInput['modulo'],
  metadata?: Record<string, unknown>,
  nivel: AuditLogInput['nivel'] = 'info'
): void => {
  const user = (req as any).user;
  auditLog({
    usuarioId: user?.sub ?? 0,
    usuarioLogeo: user?.logeo,
    ip: (req as any).socket?.remoteAddress ?? 'unknown',
    accion,
    modulo,
    detalle,
    metadata,
    nivel,
  });
};

