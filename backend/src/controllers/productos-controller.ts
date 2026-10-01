import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { ProductoError } from '../models/producto.js';
import {
  productoCreateSchema,
  productoEstadoSchema,
  productoQuerySchema,
  productoUpdateSchema,
} from '../schemas/producto.js';
import {
  actualizarService,
  cambiarEstadoService,
  crearService,
  listarService,
  obtenerService,
} from '../services/productos-service.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

function errorProducto(res: Response, err: unknown): void {
  if (err instanceof ProductoError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'CATEGORIA_INVALIDA' ? 422 : 409;
    res.status(status).json({ error: err.code });
    return;
  }
  throw err;
}

export async function getProductos(req: Request, res: Response): Promise<void> {
  const parsed = productoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarService(parsed.data));
}

export async function getProducto(req: Request, res: Response): Promise<void> {
  try {
    res.json(await obtenerService(Number(req.params['id'])));
  } catch (err) {
    errorProducto(res, err);
  }
}

export async function postProducto(req: Request, res: Response): Promise<void> {
  const parsed = productoCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.status(201).json(await crearService(parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorProducto(res, err);
  }
}

export async function putProducto(req: Request, res: Response): Promise<void> {
  const parsed = productoUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await actualizarService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorProducto(res, err);
  }
}

export async function patchProductoEstado(req: Request, res: Response): Promise<void> {
  const parsed = productoEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await cambiarEstadoService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorProducto(res, err);
  }
}
