import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { reservaCreateSchema, reservaQuerySchema, reservaConfirmarSchema, reservaReprogramarSchema, reservaAtencionSchema, disponibilidadQuerySchema } from '../schemas/reservas.js';
import { crearReservaService, confirmarService, atenderService, anularService, reprogramarService, listarReservasService, disponibilidadService } from '../services/reservas-service.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

export async function getReservas(req: Request, res: Response): Promise<void> {
  const parsed = reservaQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  res.json(await listarReservasService(parsed.data));
}

export async function postReserva(req: Request, res: Response): Promise<void> {
  const parsed = reservaCreateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  res.status(201).json(await crearReservaService(parsed.data, s.id, s.logeo, s.pc));
}

export async function patchConfirmar(req: Request, res: Response): Promise<void> {
  const parsed = reservaConfirmarSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try {
    res.json(await confirmarService(Number(req.params['id']), parsed.data, s.logeo, s.pc));
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    if (error.message === 'MESA_NOT_FOUND') {
      res.status(404).json({ error: 'MESA_NOT_FOUND' });
      return;
    }
    if (
      error.message === 'ESTADO_INVALIDO'
      || error.message.startsWith('CAPACIDAD_INSUFICIENTE')
      || error.message.startsWith('MESA_NO_LIBRE')
      || error.message.startsWith('MESA_NO_DISPONIBLE')
    ) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function patchAtender(req: Request, res: Response): Promise<void> {
  const parsed = reservaAtencionSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try {
    res.json(await atenderService(Number(req.params['id']), parsed.data, s.logeo, s.pc));
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.message.includes('RESERVA_NOT_FOUND') || error.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    if (
      error.message.includes('RESERVA_ESTADO_INVALIDO')
      || error.message.includes('RESERVA_SIN_MESA')
      || error.message.includes('RESERVA_FECHA_INVALIDA')
      || error.message.includes('CANAL_ATENCION_INVALIDO')
    ) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function patchAnular(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  try { res.json(await anularService(Number(req.params['id']), s.logeo, s.pc)); }
  catch { res.status(404).json({ error: 'NOT_FOUND' }); }
}

export async function patchReprogramar(req: Request, res: Response): Promise<void> {
  const parsed = reservaReprogramarSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try { res.json(await reprogramarService(Number(req.params['id']), parsed.data, s.logeo, s.pc)); }
  catch { res.status(404).json({ error: 'NOT_FOUND' }); }
}

export async function getDisponibilidad(req: Request, res: Response): Promise<void> {
  const parsed = disponibilidadQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  res.json(await disponibilidadService(parsed.data));
}