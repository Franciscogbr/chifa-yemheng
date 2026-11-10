import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { movimientoCreateSchema, movimientoQuerySchema, recetaCreateSchema, recetaCostoQuerySchema, recetaQuerySchema, recetaUpdateSchema, stockQuerySchema } from '../schemas/inventario.js';
import { actualizarRecetaService, crearMovimientoService, crearRecetaService, getCostoRecetaService, getStockInsumosService, listarMovimientosService, listarRecetasService } from '../services/inventario-service.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

export async function getMovimientos(req: Request, res: Response): Promise<void> {
  const parsed = movimientoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarMovimientosService(parsed.data));
}
export async function postMovimiento(req: Request, res: Response): Promise<void> {
  const parsed = movimientoCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.status(201).json(await crearMovimientoService(parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('PRODUCTO_INVALIDO')) {
      res.status(422).json({ error: 'PRODUCTO_INVALIDO' });
      return;
    }
    if (msg.includes('STOCK_INSUFICIENTE')) {
      res.status(409).json({ error: 'STOCK_INSUFICIENTE' });
      return;
    }
    res.status(500).json({ error: 'INTERNAL_ERROR', detalle: msg });
  }
}
export async function getRecetas(req: Request, res: Response): Promise<void> {
  const parsed = recetaQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarRecetasService(parsed.data));
}
export async function getStock(req: Request, res: Response): Promise<void> {
  const parsed = stockQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await getStockInsumosService(parsed.data));
}
export async function getStockBajo(req: Request, res: Response): Promise<void> {
  const parsed = stockQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const stock = await getStockInsumosService({ ...parsed.data, soloBajoStock: true });
  res.json(stock);
}
export async function getCostoReceta(req: Request, res: Response): Promise<void> {
  const parsed = recetaCostoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await getCostoRecetaService(parsed.data));
}
export async function postReceta(req: Request, res: Response): Promise<void> {
  const parsed = recetaCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.status(201).json(await crearRecetaService(parsed.data, s.logeo, s.pc));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('INSUMO_INVALIDO')) {
      res.status(422).json({ error: 'INSUMO_INVALIDO' });
      return;
    }
    if (msg.includes('PRODUCTO_INVALIDO')) {
      res.status(422).json({ error: 'PRODUCTO_INVALIDO' });
      return;
    }
    if (msg.includes('RECETA_DUPLICADA')) {
      res.status(409).json({ error: 'RECETA_DUPLICADA' });
      return;
    }
    res.status(500).json({ error: 'INTERNAL_ERROR', detalle: msg });
  }
}

export async function patchReceta(req: Request, res: Response): Promise<void> {
  const parsed = recetaUpdateSchema.safeParse(req.body);
  const id = Number(req.params['id']);
  if (!parsed.success || !Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.success ? undefined : parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  try {
    res.json(await actualizarRecetaService(id, parsed.data, s.logeo, s.pc));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('NOT_FOUND')) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    if (msg.includes('RECETA_DUPLICADA')) {
      res.status(409).json({ error: 'RECETA_DUPLICADA' });
      return;
    }
    if (msg.includes('PRODUCTO_INVALIDO')) {
      res.status(422).json({ error: 'PRODUCTO_INVALIDO' });
      return;
    }
    if (msg.includes('INSUMO_INVALIDO')) {
      res.status(422).json({ error: 'INSUMO_INVALIDO' });
      return;
    }
    res.status(500).json({ error: 'INTERNAL_ERROR', detalle: msg });
  }
}
