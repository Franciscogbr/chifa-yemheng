import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { ClienteError } from '../models/cliente.js';
import {
  clienteCreateSchema,
  clienteEstadoSchema,
  clienteQuerySchema,
  clienteUpdateSchema,
} from '../schemas/cliente.js';
import {
  actualizarService,
  cambiarEstadoService,
  crearService,
  listarService,
  obtenerService,
} from '../services/clientes-service.js';
import { getPc } from '../utils/auditoria.js';

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return { id: user.sub, logeo: user.logeo, pc: getPc(req) };
}

function errorCliente(res: Response, err: unknown): void {
  if (err instanceof ClienteError) {
    const status = err.code === 'NOT_FOUND' ? 404 : 409;
    res.status(status).json({ error: err.code });
    return;
  }
  throw err;
}

export async function getClientes(req: Request, res: Response): Promise<void> {
  const parsed = clienteQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarService(parsed.data));
}

export async function getCliente(req: Request, res: Response): Promise<void> {
  try {
    res.json(await obtenerService(Number(req.params['id'])));
  } catch (err) {
    errorCliente(res, err);
  }
}

export async function postCliente(req: Request, res: Response): Promise<void> {
  const parsed = clienteCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.status(201).json(await crearService(parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorCliente(res, err);
  }
}

export async function putCliente(req: Request, res: Response): Promise<void> {
  const parsed = clienteUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await actualizarService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorCliente(res, err);
  }
}

export async function patchClienteEstado(req: Request, res: Response): Promise<void> {
  const parsed = clienteEstadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const s = sesion(req);
    res.json(await cambiarEstadoService(Number(req.params['id']), parsed.data, s.id, s.logeo, s.pc));
  } catch (err) {
    errorCliente(res, err);
  }
}
