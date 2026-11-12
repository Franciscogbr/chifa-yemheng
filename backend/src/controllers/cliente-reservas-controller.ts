import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';
import type { Reserva } from '../models/reservas.js';
import { getPc } from '../utils/auditoria.js';

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
  res.json((data ?? []).map((reserva) => {
    const mesa = reserva.mesa as { numero?: string | null } | null;
    return { ...reserva, mesa_numero: mesa?.numero ?? undefined };
  }));
}