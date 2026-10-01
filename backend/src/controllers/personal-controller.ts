import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { PersonalError } from '../models/personal.js';
import {
  personalCreateSchema,
  personalEstadoSchema,
  personalQuerySchema,
  personalUpdateSchema,
} from '../schemas/personal.js';
import {
  actualizarService,
  cambiarEstadoService,
  crearService,
  listarService,
  obtenerService,
} from '../services/personal-service.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

function errorPersonal(res: Response, err: unknown): void {
  if (err instanceof PersonalError) {
    const status = err.code === 'NOT_FOUND' ? 404 : 409;
    res.status(status).json({ error: err.code });
    return;
  }
  throw err;
}

export async function getPersonal(req: Request, res: Response): Promise<void> {
  const parsed = personalQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarService(parsed.data));
}

export async function getEmpleado(req: Request, res: Response): Promise<void> {
  try {
    res.json(await obtenerService(Number(req.params['id'])));
  } catch (err) {
    errorPersonal(res, err);
  }
}

export async function postEmpleado(req: Request, res: Response): Promise<void> {
  const parsed = personalCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.status(201).json(await crearService(parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorPersonal(res, err);
  }
}

export async function putEmpleado(req: Request, res: Response): Promise<void> {
  const parsed = personalUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await actualizarService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorPersonal(res, err);
  }
}

export async function patchEmpleadoEstado(req: Request, res: Response): Promise<void> {
  const parsed = personalEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await cambiarEstadoService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorPersonal(res, err);
  }
}
