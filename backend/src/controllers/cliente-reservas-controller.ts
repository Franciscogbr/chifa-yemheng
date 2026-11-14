import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';
import type { Reserva } from '../models/reservas.js';
import { getPc } from '../utils/auditoria.js';
import {
  cancelarReservaCliente,
  ClienteReservaError,
  obtenerContinuacionReservaCliente,
} from '../repositories/cliente-reservas-repository.js';

const AUTOSERVICIO_USUARIO_ID = 1;

export async function postClienteReserva(req: Request, res: Response): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'TOKEN_INVALIDO' });
    return;
  }
  const v = decoded as Record<string, unknown>;
  if (typeof v['sub'] !== 'number' || v['rol'] !== 'CLIENTE') {
    res.status(401).json({ error: 'ROL_INVALIDO' });
    return;
  }
  const clienteId = v['sub'];
  const email = typeof v['email'] === 'string' ? v['email'] : '';
  const { data: cliente, error: clienteError } = await supabase
    .from('cliente')
    .select('id_cliente')
    .eq('id_cliente', clienteId)
    .eq('estado', 'A')
    .maybeSingle();
  if (clienteError) {
    res.status(500).json({ error: 'DB_CLIENT_LOOKUP_FAIL', details: clienteError.message });
    return;
  }
  if (!cliente) {
    res.status(404).json({ error: 'CLIENTE_NOT_FOUND' });
    return;
  }
  const pc = getPc(req);

  // Validar campos del body
  const { fecha, hora, comensales, observacion, adelanto } = req.body as {
    fecha?: string;
    hora?: string;
    comensales?: number;
    observacion?: string;
    adelanto?: number;
  };
  if (
    typeof fecha !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
    typeof hora !== 'string' ||
    !/^\d{2}:\d{2}$/.test(hora)
  ) {
    res.status(400).json({ error: 'FECHA_HORA_OBLIGATORIAS' });
    return;
  }
  if (
    (comensales !== undefined && (!Number.isInteger(comensales) || comensales < 1 || comensales > 20)) ||
    (adelanto !== undefined && (typeof adelanto !== 'number' || !Number.isFinite(adelanto) || adelanto < 0)) ||
    (observacion !== undefined && (typeof observacion !== 'string' || observacion.length > 200))
  ) {
    res.status(400).json({ error: 'DATOS_RESERVA_INVALIDOS' });
    return;
  }

  const { data, error } = await supabase
    .from('reserva')
    .insert({
      id_cliente: clienteId,
      id_mesa: null,
      id_usuario: AUTOSERVICIO_USUARIO_ID,
      f_reserva: `${fecha}T${hora}:00`,
      n_personas: comensales ?? 2,
      adelanto: adelanto ?? 0,
      observacion: observacion ?? null,
      origen: 'WEB',
      situacion: 'P',
      usucre: email,
      pccre: pc,
      feccre: new Date().toISOString(),
      usumod: '',
      pcmod: null,
      fecmod: null,
    })
    .select()
    .single();
  if (error) { res.status(500).json({ error: 'DB_CREATE_FAIL', details: error.message }); return; }
  res.status(201).json(data as Reserva);
}

export async function getMisReservasCli(req: Request, res: Response): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'TOKEN_INVALIDO' });
    return;
  }
  const v = decoded as Record<string, unknown>;
  if (typeof v['sub'] !== 'number' || v['rol'] !== 'CLIENTE') {
    res.status(401).json({ error: 'ROL_INVALIDO' });
    return;
  }
  const clienteId = v['sub'] as number;

  const { data, error } = await supabase
    .from('reserva')
    .select('id_reserva, id_mesa, f_reserva, n_personas, situacion, observacion, mesa(numero), adelanto, origen, f_llegada, canal_atencion')
    .eq('id_cliente', clienteId)
    .eq('estado', 'A')
    .order('f_reserva', { ascending: false });
  if (error) { res.status(500).json({ error: 'DB_LIST_FAIL', details: error.message }); return; }
  const reservas = data ?? [];
  const reservaIds = reservas.map((reserva) => Number(reserva.id_reserva));
  let pedidosPorReserva = new Map<number, number>();
  if (reservaIds.length > 0) {
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedido')
      .select('id_reserva, id_pedido')
      .in('id_reserva', reservaIds)
      .order('id_pedido', { ascending: false });
    if (pedidosError) {
      res.status(500).json({ error: 'DB_LIST_FAIL', details: pedidosError.message });
      return;
    }
    for (const pedido of pedidos ?? []) {
      const reservaId = Number(pedido.id_reserva);
      if (!pedidosPorReserva.has(reservaId)) {
        pedidosPorReserva.set(reservaId, Number(pedido.id_pedido));
      }
    }
  }
  res.json(reservas.map((reserva) => {
    const mesa = reserva.mesa as { numero?: string | null } | null;
    return {
      ...reserva,
      mesa_numero: mesa?.numero ?? undefined,
      pedido_id: pedidosPorReserva.get(Number(reserva.id_reserva)) ?? null,
    };
  }));
}

function clienteIdDesdeRequest(req: Request): number | null {
  return (req as Request & { user?: { sub: number } }).user?.sub ?? null;
}

function enviarErrorReservaCliente(res: Response, error: unknown): void {
  if (error instanceof ClienteReservaError) {
    const status = error.code === 'RESERVA_NOT_FOUND' ? 404 : 409;
    res.status(status).json({ error: error.code });
    return;
  }
  res.status(500).json({
    error: 'DB_RESERVA_FAIL',
    details: error instanceof Error ? error.message : 'Error inesperado',
  });
}

export async function getContinuacionReservaCliente(req: Request, res: Response): Promise<void> {
  const reservaId = Number(req.params['id']);
  const clienteId = clienteIdDesdeRequest(req);
  if (!Number.isSafeInteger(reservaId) || reservaId <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  if (clienteId == null) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }

  try {
    const continuacion = await obtenerContinuacionReservaCliente(reservaId, clienteId);
    if (!continuacion) {
      res.status(404).json({ error: 'RESERVA_NOT_FOUND' });
      return;
    }
    res.json(continuacion);
  } catch (error) {
    enviarErrorReservaCliente(res, error);
  }
}

export async function deleteClienteReserva(req: Request, res: Response): Promise<void> {
  const reservaId = Number(req.params['id']);
  const user = (req as Request & {
    user?: { sub: number; email?: string };
  }).user;
  if (!Number.isSafeInteger(reservaId) || reservaId <= 0) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  if (!user) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }

  try {
    const reserva = await cancelarReservaCliente(
      reservaId,
      user.sub,
      user.email || 'CLIENTE',
      getPc(req),
    );
    res.json(reserva);
  } catch (error) {
    enviarErrorReservaCliente(res, error);
  }
}