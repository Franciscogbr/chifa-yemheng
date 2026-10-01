import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { MesaError } from '../models/mesa.js';
import {
  ambienteCreateSchema,
  ambienteUpdateSchema,
  mesaCreateSchema,
  mesaEstadoSchema,
  mesaQuerySchema,
  mesaQrQuerySchema,
  mesaUpdateSchema,
} from '../schemas/mesa.js';
import {
  actualizarAmbienteService,
  actualizarService,
  ambientesService,
  cambiarEstadoAmbienteService,
  cambiarEstadoService,
  crearAmbienteService,
  crearService,
  listarService,
  obtenerPorQrService,
  obtenerService,
  ocupacionService,
} from '../services/mesas-service.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

function errorMesa(res: Response, err: unknown): void {
  if (err instanceof MesaError) {
    const status =
      err.code === 'NOT_FOUND' || err.code === 'QR_INVALIDO'
        ? 404
        : err.code === 'AMBIENTE_INVALIDO' ||
            err.code === 'TIPO_INVALIDO' ||
            err.code === 'QR_DESINCRONIZADO'
          ? 422
          : 409;
    res.status(status).json({ error: err.code });
    return;
  }
  throw err;
}

export async function getMesas(req: Request, res: Response): Promise<void> {
  const parsed = mesaQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarService(parsed.data));
}

export async function getOcupacion(_req: Request, res: Response): Promise<void> {
  res.json(await ocupacionService());
}

export async function getMesa(req: Request, res: Response): Promise<void> {
  try {
    res.json(await obtenerService(Number(req.params['id'])));
  } catch (err) {
    errorMesa(res, err);
  }
}

/** Público: valida un QR escaneado sin sesión (el QR físico es el secreto). */
export async function getMesaPorQr(req: Request, res: Response): Promise<void> {
  const parsed = mesaQrQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    res.json(await obtenerPorQrService(parsed.data.codigo));
  } catch (err) {
    errorMesa(res, err);
  }
}

export async function postMesa(req: Request, res: Response): Promise<void> {
  const parsed = mesaCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.status(201).json(await crearService(parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorMesa(res, err);
  }
}

export async function putMesa(req: Request, res: Response): Promise<void> {
  const parsed = mesaUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await actualizarService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorMesa(res, err);
  }
}

export async function patchMesaEstado(req: Request, res: Response): Promise<void> {
  const parsed = mesaEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await cambiarEstadoService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorMesa(res, err);
  }
}

export async function getAmbientes(_req: Request, res: Response): Promise<void> {
  res.json({ data: await ambientesService() });
}

export async function postAmbiente(req: Request, res: Response): Promise<void> {
  const parsed = ambienteCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const s = sesion(req);
  res.status(201).json(await crearAmbienteService(parsed.data, s.id, s.logeo, s.pc));
}

export async function putAmbiente(req: Request, res: Response): Promise<void> {
  const parsed = ambienteUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await actualizarAmbienteService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorMesa(res, err);
  }
}

export async function patchAmbienteEstado(req: Request, res: Response): Promise<void> {
  const parsed = mesaEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(
      await cambiarEstadoAmbienteService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc),
    );
  } catch (err) {
    errorMesa(res, err);
  }
}
