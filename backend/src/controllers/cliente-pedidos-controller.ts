import type { Request, Response } from 'express';
import { PedidoError } from '../models/pedido.js';
import {
  comandaQuerySchema,
  cuentaSchema,
  detalleAddSchema,
  modoPagoMesaSchema,
  pedidoAbrirSchema,
} from '../schemas/pedido.js';
import {
  agregarDetalleClienteService,
  abrirClienteService,
  comandaActivaClienteService,
  detalleClienteService,
  miCuentaClienteService,
  pedirCuentaClienteService,
  pedidosAbiertosPorMesaService,
  recalcularClienteService,
  configurarModoPagoClienteService,
} from '../services/cliente-pedidos-service.js';

function errorPedido(res: Response, err: unknown): void {
  if (err instanceof PedidoError) {
    const status =
      err.code === 'NOT_FOUND' || err.code === 'NO_COMANDA_ACTIVA' || err.code === 'SIN_CUENTA'
        ? 404
        : err.code === 'NO_PARTICIPANTE' || err.code === 'NO_ES_ORGANIZADOR'
          ? 403
          : err.code === 'PEDIDO_FACTURADO' ||
              err.code === 'PEDIDO_ANULADO' ||
              err.code === 'MESA_OCUPADA' ||
              err.code === 'YA_POR_COBRAR'
            ? 409
            : err.code === 'PRODUCTO_NO_DISPONIBLE' ||
                err.code === 'TIPO_INVALIDO' ||
                err.code === 'MESA_POR_COBRAR'
              ? 422
              : 400;
    res.status(status).json({ error: err.code });
    return;
  }
  throw err;
}

export async function postClientePedido(req: Request, res: Response): Promise<void> {
  const parsed = pedidoAbrirSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const pedido = await abrirClienteService(parsed.data, user.sub);
    res.status(201).json(pedido);
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function postClienteDetalle(req: Request, res: Response): Promise<void> {
  const parsed = detalleAddSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const pedido = await agregarDetalleClienteService(Number(req.params['id']), parsed.data, user.sub);
    res.json(pedido);
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function postClienteRecalcular(req: Request, res: Response): Promise<void> {
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const pedido = await recalcularClienteService(Number(req.params['id']), user.sub);
    res.json(pedido);
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function getClientePedidosActivos(req: Request, res: Response): Promise<void> {
  const mesaId = Number(req.query['mesaId']);
  if (!mesaId || isNaN(mesaId)) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  try {
    const pedidos = await pedidosAbiertosPorMesaService(mesaId);
    res.json({ data: pedidos });
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function getClienteComandaActiva(req: Request, res: Response): Promise<void> {
  const parsed = comandaQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const comanda = await comandaActivaClienteService(parsed.data.mesaId, user.sub);
    res.json(comanda ?? {});
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function patchClienteModoPago(req: Request, res: Response): Promise<void> {
  const pedidoId = Number(req.params['id']);
  const parsed = modoPagoMesaSchema.safeParse(req.body);
  if (!Number.isInteger(pedidoId) || pedidoId <= 0 || !parsed.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: parsed.success ? undefined : parsed.error.flatten(),
    });
    return;
  }
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const result = await configurarModoPagoClienteService(pedidoId, user.sub, parsed.data.modo);
    res.json(result);
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function getClientePedidoDetalle(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const pedido = await detalleClienteService(id, user.sub);
    res.json(pedido);
  } catch (err) {
    errorPedido(res, err);
  }
}

/** S2/S3: "Mi cuenta" del participante: solo sus platos, estados y saldo. */
export async function getClienteMiCuenta(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    res.json(await miCuentaClienteService(id, user.sub));
  } catch (err) {
    errorPedido(res, err);
  }
}

export async function patchClienteCuenta(req: Request, res: Response): Promise<void> {
  const parsed = cuentaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const result = await pedirCuentaClienteService(parsed.data.mesaId, user.sub);
    res.json(result);
  } catch (err) {
    errorPedido(res, err);
  }
}