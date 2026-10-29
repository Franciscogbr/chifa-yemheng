import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { z } from 'zod';
import { DeliveryError } from '../models/delivery.js';
import { listarMisEntregasService, getMiEntregaDetalleService, iniciarRutaRepartidorService, confirmarEntregaRepartidorService, actualizarUbicacionRepartidorService, getPorRendirService } from '../services/repartidor-service.js';
import { repartidorEntregasQuerySchema } from '../schemas/repartidor.js';
import { getPc } from '../utils/auditoria.js';

const ubicacionSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

function sesion(req: Request): { usuarioId: number; empleadoId: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  if (!user.empleadoId) throw new Error('REPARTIDOR_EMPLEADO_NOT_FOUND');
  return { usuarioId: user.sub, empleadoId: user.empleadoId, logeo: user.logeo, pc: getPc(req) };
}

export async function getMisEntregas(req: Request, res: Response): Promise<void> {
  const parsed = repartidorEntregasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  const { estado, page, limit } = parsed.data;
  res.json(await listarMisEntregasService(s.empleadoId, estado, page, limit));
}

export async function getMiEntrega(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  try { res.json(await getMiEntregaDetalleService(Number(req.params.id), s.empleadoId)); }
  catch (error) {
    if (error instanceof DeliveryError && error.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw error;
  }
}

export async function postIniciarRuta(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  try { res.json(await iniciarRutaRepartidorService(Number(req.params.id), s.empleadoId, s.logeo, s.pc)); }
  catch (error) {
    if (error instanceof DeliveryError && error.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw error;
  }
}

export async function postConfirmarEntrega(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  try { res.json(await confirmarEntregaRepartidorService(Number(req.params.id), s.empleadoId, s.logeo, s.pc)); }
  catch (error) {
    if (error instanceof DeliveryError && error.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw error;
  }
}

export async function postUbicacion(req: Request, res: Response): Promise<void> {
  const parsed = ubicacionSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try {
    await actualizarUbicacionRepartidorService(
      Number(req.params.id),
      s.empleadoId,
      parsed.data.lat,
      parsed.data.lng,
      s.logeo,
      s.pc,
    );
    res.json({ ok: true });
  }
  catch (error) {
    if (error instanceof DeliveryError && error.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw error;
  }
}

export async function getPorRendir(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  res.json(await getPorRendirService(s.empleadoId));
}