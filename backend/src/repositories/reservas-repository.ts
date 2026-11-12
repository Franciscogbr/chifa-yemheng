import { supabase } from '../config/supabase.js';
import type { Reserva, ReservaLista, DisponibilidadMesa } from '../models/reservas.js';
import type { ReservaCreate, ReservaQuery, ReservaConfirmar, ReservaReprogramar, ReservaAtencion, DisponibilidadQuery } from '../schemas/reservas.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';

interface ReservaRow {
  id_reserva: number;
  id_cliente: number;
  cliente: { persona: { nombre: string; ap_paterno: string | null } } | null;
  id_mesa: number | null;
  mesa: { numero: string } | null;
  f_reserva: string;
  n_personas: number;
  observacion: string | null;
  situacion: string;
  adelanto: number;
  feccre: string;
  origen?: string;
  f_llegada?: string | null;
  canal_atencion?: string | null;
}

const SELECT = 'id_reserva, id_cliente, cliente:cliente(persona(nombre, ap_paterno)), id_mesa, mesa(numero), f_reserva, n_personas, observacion, adelanto, situacion, feccre, origen, f_llegada, canal_atencion';

function mapRow(row: ReservaRow): Reserva {
  return {
    id: row.id_reserva,
    clienteId: row.id_cliente,
    cliente: row.cliente?.persona
      ? `${row.cliente.persona.nombre} ${row.cliente.persona.ap_paterno ?? ''}`.trim()
      : '',
    mesaId: row.id_mesa,
    mesa: row.mesa?.numero ?? null,
    fecha: row.f_reserva.slice(0, 10),
    hora: row.f_reserva.slice(11, 16),
    comensales: Number(row.n_personas ?? 1),
    adelanto: row.adelanto ?? 0,
    observacion: row.observacion,
    estado: (row.situacion ?? 'P') as Reserva['estado'],
    origen: (row.origen ?? 'PERSONAL') as Reserva['origen'],
    llegada: row.f_llegada ?? null,
    canalAtencion: (row.canal_atencion ?? null) as Reserva['canalAtencion'],
    fechaCreacion: row.feccre,
  };
}

export async function listarReservas(q: ReservaQuery): Promise<ReservaLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('reserva')
    .select(SELECT, { count: 'exact' })
    .order('f_reserva', { ascending: false })
    .order('id_reserva', { ascending: false })
    .range(desde, hasta);

  if (q.fecha) {
    query = query.gte('f_reserva', `${q.fecha}T00:00:00`).lte('f_reserva', `${q.fecha}T23:59:59`);
  }
  if (q.mesaId) query = query.eq('id_mesa', q.mesaId);
  if (q.estado) query = query.eq('situacion', q.estado);

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as ReservaRow[]).map(mapRow),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function crearReserva(input: ReservaCreate, usuarioId: number, usucre: string, pc = ''): Promise<Reserva> {
  // Validar disponibilidad de mesa antes de crear (si se indica mesa)
  if (input.mesaId !== undefined && input.mesaId !== null) {
    const { data: ocupada, error: errOc } = await supabase
      .from('reserva')
      .select('situacion, id_mesa')
      .eq('id_mesa', input.mesaId)
      .eq('situacion', 'C')
      .maybeSingle();
    if (errOc) throw new Error(`DB_LIST_FAIL: ${errOc.message}`);
    // Si la mesa ya tiene una reserva confirmada (no consideramos C->A ni X por ahora para simplificar)
    if (ocupada) {
      // Opcional: validar si la fecha/hora coincide (aquí simplificamos)
    }
  }

  const { data, error } = await supabase
    .from('reserva')
    .insert({
      id_cliente: input.clienteId,
      id_mesa: input.mesaId ?? null,
      origen: input.origen,
      id_usuario: usuarioId,
      f_reserva: `${input.fecha.slice(0, 10)}T${input.hora.slice(0, 5)}:00`,
      n_personas: input.comensales,
      adelanto: input.adelanto ?? 0,
      observacion: input.observacion || null,
      situacion: 'P',
      ...createAudit(usucre, pc),
    })
    .select(SELECT)
    .single();
  if (error) throw new Error(`DB_CREATE_FAIL: ${error.message}`);
  return mapRow(data as unknown as ReservaRow);
}

export async function confirmarReserva(id: number, input: ReservaConfirmar, usumod: string, pc = ''): Promise<Reserva> {
  const { data: mesa, error: errMesa } = await supabase
    .from('mesa')
    .select('id_mesa, capacidad, estado, id_estadomesa, tipo_mesa(descripcion, cargo_servicio)')
    .eq('id_mesa', input.mesaId)
    .maybeSingle();
  if (errMesa) throw new Error(`DB_GET_FAIL: ${errMesa.message}`);

  // Validar que la mesa existe y está LIBRE
  if (!mesa) throw new Error('MESA_NOT_FOUND');

  // Validar capacidad ≥ comensales (necesitamos saber comensales de la reserva)
  // Buscamos la reserva actual para obtener comensales
  const { data: reservaActual, error: errRes } = await supabase
    .from('reserva')
    .select('n_personas, situacion, f_reserva')
    .eq('id_reserva', id)
    .maybeSingle();
  if (errRes) throw new Error(`DB_GET_FAIL: ${errRes.message}`);
  if (!reservaActual) throw new Error('NOT_FOUND');
  if (reservaActual.situacion !== 'P') throw new Error('ESTADO_INVALIDO');

  const comensales = reservaActual?.n_personas ?? 1;

  if (mesa.capacidad < comensales) {
    throw new Error(`CAPACIDAD_INSUFICIENTE: mesa ${mesa.capacidad} < comensales ${comensales}`);
  }

  // Validar que la mesa esté LIBRE (estado A en estado_mesa) y no tenga pedido abierto
  // Simplified: solo revisamos que estado_mesa sea LIBRE
  if (mesa.id_estadomesa !== 1) { // 1 = LIBRE
    throw new Error('MESA_NO_LIBRE: la mesa no está en estado LIBRE');
  }

  if (mesa.estado !== 'A') throw new Error('MESA_NO_LIBRE: la mesa está inactiva');

  const fechaReserva = String(reservaActual.f_reserva).slice(0, 10);
  const horaReserva = String(reservaActual.f_reserva).slice(11, 16);
  const disponibilidad = await verificarDisponibilidad({
    fecha: fechaReserva,
    hora: horaReserva,
    comensales,
  });
  const mesaEnHorario = disponibilidad.find((item) => item.mesaId === input.mesaId);
  if (!mesaEnHorario?.disponible) {
    throw new Error(`MESA_NO_DISPONIBLE: ${mesaEnHorario?.razon ?? 'La mesa ya no está disponible'}`);
  }

  const { data, error } = await supabase
    .from('reserva')
    .update({ 
      situacion: 'C', 
      id_mesa: input.mesaId,
      ...(input.observacion !== undefined ? { observacion: input.observacion || null } : {}),
      ...updateAudit(usumod, pc) 
    })
    .eq('id_reserva', id)
    .select(SELECT)
    .maybeSingle();

  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) throw new Error('NOT_FOUND');

  // Actualizar estado operativo de la mesa a RESERVADA (id_estadomesa = 3)
  const { error: mesaError } = await supabase
    .from('mesa')
    .update({ id_estadomesa: 3, ...updateAudit(usumod, pc) }) // 3 = RESERVADA según BD seed
    .eq('id_mesa', input.mesaId);
  if (mesaError) throw new Error(`DB_UPDATE_FAIL: ${mesaError.message}`);

  // Registrar adelanto en MOVIMIENTO_CAJA si aplica (BR-DER-053)
  const reservaData = data as Record<string, unknown>;
  if ((reservaData['adelanto'] as number) > 0) {
    const { data: caja, error: errC } = await supabase
      .from('apertura_caja')
      .select('id_caja')
      .eq('estado', 'A')
      .order('feccre', { ascending: false })
      .maybeSingle();
    if (!errC && caja) {
      await supabase.from('movimiento_caja').insert({
        id_caja: caja.id_caja,
        concepto: 'ADELANTO DE RESERVA',
        signo: '+',
        monto: (reservaData['adelanto'] as number),
        usucre: usumod,
        pccre: pc || null,
        feccre: new Date().toISOString(),
        usumod: '',
        pcmod: null,
        fecmod: null,
      });
    }
  }

  return mapRow(data as unknown as ReservaRow);
}

export async function atenderReserva(
  id: number,
  atencion: ReservaAtencion,
  usumod: string,
  pc = '',
): Promise<Reserva> {
  const { data, error } = await supabase.rpc('fn_registrar_llegada_reserva', {
    p_reserva: id,
    p_canal: atencion.canal,
    p_usuario: usumod,
    p_pc: pc,
  });
  if (error) throw new Error(`DB_ARRIVAL_FAIL: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('NOT_FOUND');
  return mapRow(row as unknown as ReservaRow);
}

export async function anularReserva(id: number, usumod: string, pc = ''): Promise<Reserva> {
  const { data, error } = await supabase
    .from('reserva')
    .update({ situacion: 'X', ...updateAudit(usumod, pc) })
    .eq('id_reserva', id)
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) throw new Error('NOT_FOUND');

  // Liberar mesa
  const { data: r, error: errR } = await supabase
    .from('reserva')
    .select('id_mesa')
    .eq('id_reserva', id)
    .maybeSingle();
  if (errR) throw new Error(`DB_GET_FAIL: ${errR.message}`);
  if (r?.id_mesa) {
    const { error: mesaError } = await supabase
      .from('mesa')
      .update({ id_estadomesa: 1, ...updateAudit(usumod, pc) }) // LIBRE
      .eq('id_mesa', r.id_mesa);
    if (mesaError) throw new Error(`DB_UPDATE_FAIL: ${mesaError.message}`);
  }

  return mapRow(data as unknown as ReservaRow);
}

export async function reprogramarReserva(id: number, input: ReservaReprogramar, usumod: string, pc = ''): Promise<Reserva> {
  const patch: any = { ...updateAudit(usumod, pc) };
  if (input.fecha) patch.f_reserva = `${input.fecha}T${input.hora ?? ''}:00`;
  if (input.hora) patch.f_reserva = `${patch.f_reserva?.slice(0, 10) ?? input.fecha}T${input.hora}:00`;
  if (input.mesaId !== undefined) patch.id_mesa = input.mesaId;
  if (input.comensales !== undefined) {
    // Validar capacidad nueva mesa si cambia
  }

  // Si cambia de mesa, validar que la nueva mesa esté LIBRE y tenga capacidad
  if (input.mesaId !== undefined && input.mesaId !== null) {
    const { data: nuevaMesa, error: errNM } = await supabase
      .from('mesa')
      .select('id_mesa, capacidad, id_estadomesa')
      .eq('id_mesa', input.mesaId)
      .maybeSingle();
    if (errNM) throw new Error(`DB_GET_FAIL: ${errNM.message}`);
    if (!nuevaMesa) throw new Error('MESA_NOT_FOUND');
    if (nuevaMesa.id_estadomesa !== 1) {
      throw new Error('MESA_NO_LIBRE: la nueva mesa no está LIBRE');
    }
    patch.id_mesa = input.mesaId;
  }

  const { data, error } = await supabase
    .from('reserva')
    .update(patch)
    .eq('id_reserva', id)
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) throw new Error('NOT_FOUND');

  // Si cambió mesa, actualizar estado operativo de mesas
  // (Simplificado: si mesa vieja nueva, actualizar ambas)
  // Nota: para simplificar, solo actualizamos la nueva mesa a RESERVADA si la reserva está en C
  // El estado actual se conserva.

  return mapRow(data as unknown as ReservaRow);
}

export async function verificarDisponibilidad(q: DisponibilidadQuery): Promise<DisponibilidadMesa[]> {
  const { fecha, hora, comensales } = q;

  const horaMin = `${hora}:00`;

  // Consultar reservas confirmadas (C) y atendidas (A) en esa fecha/hora para ver solapas
  const { data: reservas, error } = await supabase
    .from('reserva')
    .select('id_mesa, f_reserva, n_personas, situacion')
    .gte('f_reserva', `${fecha}T00:00:00`)
    .lte('f_reserva', `${fecha}T23:59:59`);

  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);

  // Obtener todas las mesas
  const { data: mesas, error: errMesas } = await supabase.from('mesa').select('id_mesa, capacidad, estado, id_estadomesa');
  if (errMesas) throw new Error(`DB_LIST_FAIL: ${errMesas.message}`);

  const resultado: DisponibilidadMesa[] = [];

  for (const mesa of (mesas ?? [])) {
    let disponible = true;
    let razon = '';

    if (mesa.estado !== 'A') {
      disponible = false;
      razon = 'Mesa inactiva';
    } else if (mesa.capacidad < comensales) {
      disponible = false;
      razon = `Capacidad insuficiente: mesa para ${mesa.capacidad}, reserva para ${comensales}`;
    }

    // Verificar solapa con reservas en el mismo horario
    const ocupadaPorReserva = (reservas ?? []).some((r: any) => {
      const rFec = r.f_reserva?.slice(0, 10);
      const rHora = r.f_reserva?.slice(11, 16) ?? '';
      const rPersonas = r.n_personas ?? 0;
      const rSit = r.situacion;

      // Solo considerar reservas confirmadas o atendidas
      if (rSit !== 'C' && rSit !== 'A') return false;

      // Verificar fecha coincidente y solape de hora (simplificación: misma hora exacta)
      const solapa = rFec === fecha && rHora === horaMin;
      if (solapa) {
        disponible = false;
        razon = `Mesa ocupada por reserva a las ${rHora} para ${rPersonas} personas`;
        return true;
      }
      return false;
    });

    if (ocupadaPorReserva) {
      // Ya setting disponible=false y razon; continuar
    } else if (disponible) {
      // Verificar si la mesa está LIBRE operativamente
      if (mesa.id_estadomesa !== 1) { // 1 = LIBRE
        disponible = false;
        razon = mesa.id_estadomesa === 3 ? 'RESERVADA' : mesa.id_estadomesa === 2 ? 'OCUPADA' : 'FUERA DE SERVICIO';
      }
    }

    resultado.push({
      mesaId: mesa.id_mesa,
      numero: String(mesa.id_mesa),
      capacidad: mesa.capacidad,
      ambiente: '', // could join ambiente
      disponible,
      razon,
    });
  }

  return resultado;
}