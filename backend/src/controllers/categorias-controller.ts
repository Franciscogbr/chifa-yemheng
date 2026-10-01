import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { CategoriaError } from '../models/categoria.js';
import {
  categoriaCreateSchema,
  categoriaEstadoSchema,
  categoriaQuerySchema,
  categoriaUpdateSchema,
} from '../schemas/categoria.js';
import {
  actualizarService,
  cambiarEstadoService,
  crearService,
  listarService,
  obtenerService,
} from '../services/categorias-service.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

function errorCategoria(res: Response, err: unknown): void {
  if (err instanceof CategoriaError) {
    const status = err.code === 'NOT_FOUND' ? 404 : 409;
    res.status(status).json({
      error: err.code,
      ...(err.productosAsociados !== undefined
        ? { productosAsociados: err.productosAsociados }
        : {}),
    });
    return;
  }
  throw err;
}

export async function getCategorias(req: Request, res: Response): Promise<void> {
  const parsed = categoriaQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarService(parsed.data));
}

export async function getCategoria(req: Request, res: Response): Promise<void> {
  try {
    res.json(await obtenerService(Number(req.params['id'])));
  } catch (err) {
    errorCategoria(res, err);
  }
}

export async function postCategoria(req: Request, res: Response): Promise<void> {
  const parsed = categoriaCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.status(201).json(await crearService(parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorCategoria(res, err);
  }
}

export async function putCategoria(req: Request, res: Response): Promise<void> {
  const parsed = categoriaUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await actualizarService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorCategoria(res, err);
  }
}

export async function patchCategoriaEstado(req: Request, res: Response): Promise<void> {
  const parsed = categoriaEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await cambiarEstadoService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorCategoria(res, err);
  }
}
