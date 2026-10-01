import type { Request, Response } from 'express';
import { ClaveError, LoginError } from '../models/auth.js';
import { claveSchema, loginSchema } from '../schemas/auth.js';
import { cambiarClaveService, loginService, misPermisosService } from '../services/auth-service.js';

export async function postLogin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await loginService(parsed.data);
    res.json(result);
  } catch (err) {
    if (err instanceof LoginError) {
      res.status(401).json({ error: err.code });
      return;
    }
    throw err;
  }
}

export async function getMisPermisos(req: Request, res: Response): Promise<void> {
  const user = (req as Request & { user?: { sub: number } }).user;
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  const permisos = await misPermisosService(user.sub);
  res.json({ permisos });
}

export async function patchClave(req: Request, res: Response): Promise<void> {
  const parsed = claveSchema.safeParse(req.body);
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
    await cambiarClaveService(user.sub, parsed.data);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof ClaveError) {
      const status = err.code === 'VALIDATION_ERROR' ? 400 : 401;
      res.status(status).json({ error: err.code });
      return;
    }
    throw err;
  }
}
