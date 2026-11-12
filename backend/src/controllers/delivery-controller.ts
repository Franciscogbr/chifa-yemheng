import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { deliveryAsignarSchema, deliveryCreateSchema, deliveryQuerySchema, parametrosNegocioUpdateSchema, sugerirCostoQuerySchema, tarifaUpsertSchema } from '../schemas/delivery.js';
import { asignarRepartidorService, crearDeliveryService, despacharService, entregarService, listarDeliveryService, sugerirCostoService, getParametrosService, updateParametrosService, listarTarifasService, upsertTarifaService } from '../services/delivery-service.js';
import { DeliveryError } from '../models/delivery.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

export async function getDelivery(req: Request, res: Response): Promise<void> {
  const parsed = deliveryQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  res.json(await listarDeliveryService(parsed.data));
}
export async function postDelivery(req: Request, res: Response): Promise<void> {
  const parsed = deliveryCreateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try {
    res.status(201).json(await crearDeliveryService(parsed.data, s.id, s.logeo, s.pc));
  } catch (error) {
    if (error instanceof DeliveryError) {
      if (error.code === 'CLIENTE_NOT_FOUND') {
        res.status(404).json({ error: error.code });
        return;
      }
      if (error.code === 'DISTRITO_NOT_FOUND') {
        res.status(400).json({ error: error.code });
        return;
      }
      if (error.code === 'PRODUCTO_NO_DISPONIBLE') {
        res.status(409).json({ error: error.code });
        return;
      }
      if (error.code === 'VALIDATION_ERROR') {
        res.status(400).json({ error: error.code });
        return;
      }
    }
    throw error;
  }
}
export async function patchAsignar(req: Request, res: Response): Promise<void> {
  const parsed = deliveryAsignarSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try {
    res.json(await asignarRepartidorService(Number(req.params['id']), parsed.data, s.logeo, s.pc));
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw e;
  }
}
export async function patchDespachar(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  try {
    res.json(await despacharService(Number(req.params['id']), s.logeo, s.pc));
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw e;
  }
}
export async function patchEntregar(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  try {
    res.json(await entregarService(Number(req.params['id']), s.logeo, s.pc));
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw e;
  }
}
export async function getSugerirCosto(req: Request, res: Response): Promise<void> {
  const parsed = sugerirCostoQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  res.json(await sugerirCostoService(parsed.data));
}
export async function getParametros(_req: Request, res: Response): Promise<void> {
  res.json(await getParametrosService());
}
export async function putParametros(req: Request, res: Response): Promise<void> {
  const parsed = parametrosNegocioUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  res.json(await updateParametrosService(parsed.data, s.logeo, s.pc));
}
export async function getTarifas(_req: Request, res: Response): Promise<void> {
  res.json(await listarTarifasService());
}
export async function putTarifa(req: Request, res: Response): Promise<void> {
  const parsed = tarifaUpsertSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try { res.json(await upsertTarifaService(Number(req.params['id']), parsed.data, s.logeo, s.pc)); }
  catch { res.status(404).json({ error: 'NOT_FOUND' }); }
}
