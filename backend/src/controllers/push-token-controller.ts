import type { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { eliminarTokenDispositivo, registrarTokenDispositivo } from '../repositories/push-token-repository.js';

const pushTokenSchema = z.object({
  token: z.string().trim().min(1).max(4096),
  platform: z.enum(['web', 'android', 'ios']),
});

function repartidorDeSesion(req: Request): number | null {
  const user = (req as AuthenticatedRequest).user;
  const roles = [user.tipo, ...user.roles].map((role) => role.toUpperCase());
  if (!roles.some((role) => role === 'REPARTIDOR' || role === 'DELIVERY')) return null;
  return user.empleadoId ?? null;
}

export async function postPushToken(req: Request, res: Response): Promise<void> {
  const parsed = pushTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const empleadoId = repartidorDeSesion(req);
  if (!empleadoId) {
    res.status(403).json({ error: 'REPARTIDOR_ACCESS_REQUIRED' });
    return;
  }
  await registrarTokenDispositivo(empleadoId, parsed.data.token, parsed.data.platform);
  res.status(201).json({ ok: true });
}

export async function deletePushToken(req: Request, res: Response): Promise<void> {
  const parsed = z.object({ token: z.string().trim().min(1).max(4096) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const empleadoId = repartidorDeSesion(req);
  if (!empleadoId) {
    res.status(403).json({ error: 'REPARTIDOR_ACCESS_REQUIRED' });
    return;
  }
  await eliminarTokenDispositivo(empleadoId, parsed.data.token);
  res.json({ ok: true });
}
