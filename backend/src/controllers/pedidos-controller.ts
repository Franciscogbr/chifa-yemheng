import type { Request, Response } from 'express';
import { PedidoError } from '../models/pedido.js';
import {
  detalleAddSchema,
  pedidoAbrirSchema,
  pedidoAnularSchema,
  pedidoQuerySchema,
  preparacionUpdateSchema,
} from '../schemas/pedido.js';
import {
  agregarDetalleService,
  anularService,
  cambiarPreparacionService,
  cocinaService,
  listarService,
  obtenerService,
  abrirService,
  pedirCuentaStaffService,
  recalcularService,
  entregasPendientesMozoService,
  confirmarEntregaMozoService,
  reservasEsperandoMozoService,
  abrirPedidoReservaMozoService,
} from '../services/pedidos-service.js';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { getPc } from '../utils/auditoria.js';
import { crearLogAuditoria, AuditAction } from '../utils/audit-logger.js';

function sesion(req: Request): { id: number; logeo: string; pc: string; roles: string[] } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req), roles: user.roles };
}

function errorPedido(res: Response, err: unknown): void {
  if (err instanceof PedidoError) {
    const status =
      err.code === 'NOT_FOUND'
        ? 404
        : err.code === 'PEDIDO_FACTURADO' ||
            err.code === 'PEDIDO_ANULADO' ||
            err.code === 'MESA_OCUPADA' ||
            err.code === 'YA_POR_COBRAR' ||
            err.code === 'MESA_POR_COBRAR' ||
            err.code === 'MOZO_PEDIDO_DIGITAL' ||
            err.code === 'RESERVA_NO_ESPERA_MOZO' ||
            err.code === 'ENTREGA_NO_DISPONIBLE'
          ? 409
          : err.code === 'PRODUCTO_NO_DISPONIBLE' || err.code === 'TIPO_INVALIDO'
            ? 422
            : 400;
    res.status(status).json({ error: err.code });
    return;
  }

  // Manejar errores de base de datos genéricos con mensaje útil en lugar de 500
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('DB_ANULAR_FAIL') || msg.includes('fn_anular_pedido_rpc') || msg.includes('usp_anular_pedido')) {
    res.status(409).json({ error: 'ANULAR_FAIL', detail: msg });
    return;
  }

  console.error('[PEDIDO_ERROR_UNHANDLED]', msg);
  res.status(500).json({ error: 'INTERNAL_ERROR', detail: msg });
}

export async function getPedidos(req: Request, res: Response): Promise<void> {
  const parsed = pedidoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarService(parsed.data));
}

/** Pedidos activos con detalle para cocina (KDS). */
export async function getCocina(_req: Request, res: Response): Promise<void> {
  res.json(await cocinaService());
}

export async function getPedido(req: Request, res: Response): Promise<void> {
  try {
    res.json(await obtenerService(Number(req.params['id'])));
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function postPedido(req: Request, res: Response): Promise<void> {
  const parsed = pedidoAbrirSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    const pedido = await abrirService(parsed.data, s.id, s.logeo, s.pc);
    crearLogAuditoria(
      req,
      AuditAction.PEDIDO_CREAR,
      `Pedido ${pedido.numero} creado para mesa ${pedido.mesaNumero ?? 'sin mesa'}`,
      'pedidos',
      { pedidoId: pedido.id, mesaId: pedido.mesaId, comensales: pedido.comensales },
      'info',
    );
    res.status(201).json(pedido);
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function postDetalle(req: Request, res: Response): Promise<void> {
  const parsed = detalleAddSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    const pedido = await agregarDetalleService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc, s.roles);
    crearLogAuditoria(
      req,
      AuditAction.PEDIDO_DETALLE_AGREGAR,
      `Detalle agregado al pedido ${req.params['id']}`,
      'pedidos',
      { pedidoId: Number(req.params['id']), producto: parsed.data.producto, cantidad: parsed.data.cantidad },
      'info',
    );
    res.json(pedido);
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function getEntregasMozo(_req: Request, res: Response): Promise<void> {
  res.json(await entregasPendientesMozoService());
}

export async function getReservasEsperandoMozo(_req: Request, res: Response): Promise<void> {
  res.json(await reservasEsperandoMozoService());
}

export async function postAbrirPedidoReservaMozo(req: Request, res: Response): Promise<void> {
  const reservaId = Number(req.params['id']);
  if (!Number.isInteger(reservaId) || reservaId <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const s = sesion(req);
    res.status(201).json(await abrirPedidoReservaMozoService(reservaId, s.id, s.logeo, s.pc));
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function patchEntregarDetalle(req: Request, res: Response): Promise<void> {
  try {
    const s = sesion(req);
    await confirmarEntregaMozoService(
      Number(req.params['id']),
      Number(req.params['idDetalle']),
      s.id,
    );
    res.json({ ok: true });
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function patchPreparacion(req: Request, res: Response): Promise<void> {
  const parsed = preparacionUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    await cambiarPreparacionService(Number(req.params['idDetalle']), parsed.data.estado, s.id, s.logeo, s.pc);
    crearLogAuditoria(
      req,
      AuditAction.PEDIDO_PREPARACION_CAMBIO,
      `Preparación cambiada a ${parsed.data.estado}`,
      'pedidos',
      { detalleId: Number(req.params['idDetalle']), estado: parsed.data.estado },
      'info',
    );
    res.json({ ok: true });
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function patchAnular(req: Request, res: Response): Promise<void> {
  const parsed = pedidoAnularSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    await anularService(Number(req.params['id']), s.id, parsed.data.motivo, s.pc, s.roles);
    crearLogAuditoria(
      req,
      AuditAction.PEDIDO_ANULAR,
      `Pedido ${req.params['id']} anulado`,
      'pedidos',
      { pedidoId: Number(req.params['id']), motivo: parsed.data.motivo },
      'warn',
    );
    res.json({ ok: true });
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function postRecalcular(req: Request, res: Response): Promise<void> {
  try {
    const pedido = await recalcularService(Number(req.params['id']), sesion(req).roles);
    crearLogAuditoria(
      req,
      AuditAction.PEDIDO_RECALCULAR,
      `Pedido ${req.params['id']} recalculado`,
      'pedidos',
      { pedidoId: Number(req.params['id']) },
      'info',
    );
    res.json(pedido);
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function patchPedirCuenta(req: Request, res: Response): Promise<void> {
  try {
    const s = sesion(req);
    const result = await pedirCuentaStaffService(Number(req.params['id']), s.id, s.logeo, s.pc, s.roles);
    res.json(result);
  } catch (err) {
    errorPedido(res, err);
  }
}