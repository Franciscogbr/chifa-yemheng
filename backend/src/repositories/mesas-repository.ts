import { randomBytes } from 'node:crypto';
import { supabase } from '../config/supabase.js';
import type { Ambiente, Mesa, MesaLista, OcupacionMesa } from '../models/mesa.js';
import type {
  AmbienteCreate,
  AmbienteUpdate,
  MesaCreate,
  MesaQuery,
  MesaUpdate,
} from '../schemas/mesa.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';

interface MesaRow {
  id_mesa: number;
  numero: string;
  capacidad: number;
  detalle: string | null;
  codigo_qr: string | null;
  estado: string;
  id_ambiente: number;
  ambiente: { n_ambiente: string } | null;
  id_tipomesa: number;
  tipo_mesa: { descripcion: string; cargo_servicio: number } | null;
  id_estadomesa: number;
  estado_mesa: { descripcion: string; color: string | null } | null;
}

const SELECT =
  'id_mesa, numero, capacidad, detalle, codigo_qr, estado, id_ambiente, ambiente(n_ambiente), id_tipomesa, tipo_mesa(descripcion, cargo_servicio), id_estadomesa, estado_mesa(descripcion, color)';

function mapRow(row: MesaRow): Mesa {
  return {
    id: row.id_mesa,
    numero: row.numero,
    ambienteId: row.id_ambiente,
    ambiente: row.ambiente?.n_ambiente ?? '',
    capacidad: row.capacidad,
    tipoId: row.id_tipomesa,
    tipo: row.tipo_mesa?.descripcion ?? '',
    cargoServicio: Number(row.tipo_mesa?.cargo_servicio ?? 0),
    estadoOperativoId: row.id_estadomesa,
    estadoOperativo: row.estado_mesa?.descripcion ?? '',
    color: row.estado_mesa?.color ?? '#6C757D',
    detalle: row.detalle,
    qr: row.codigo_qr,
    estado: (row.estado ?? 'A') as Mesa['estado'],
  };
}

export function qrPara(numero: string, token?: string): string {
  const num = numero.trim().toUpperCase();
  if (token) {
    return `yemheng.pe/m/${num}-${token}`;
  }
  return `yemheng.pe/m/${num}`;
}

/** Token url-safe de 8 chars para rotación por seguridad (misma mesa). */
export function qrToken(): string {
  return randomBytes(6).toString('base64url').slice(0, 8);
}

export async function listarMesas(q: MesaQuery): Promise<MesaLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('mesa')
    .select(SELECT, { count: 'exact' })
    .order('id_mesa', { ascending: true })
    .range(desde, hasta);

  if (q.ambiente !== undefined) {
    query = query.eq('id_ambiente', q.ambiente);
  }
  if (q.estado) {
    query = query.eq('estado', q.estado);
  }
  if (q.buscar) {
    query = query.ilike('numero', `%${q.buscar}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  return {
    data: ((data ?? []) as unknown as MesaRow[]).map(mapRow),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function obtenerMesa(id: number): Promise<Mesa | null> {
  const { data, error } = await supabase.from('mesa').select(SELECT).eq('id_mesa', id).maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapRow(data as unknown as MesaRow);
}

/** Resuelve una mesa por su `codigo_qr` exacto (para validar QR escaneado). */
export async function obtenerPorQr(codigo: string): Promise<Mesa | null> {
  const { data, error } = await supabase
    .from('mesa')
    .select(SELECT)
    .eq('codigo_qr', codigo.trim())
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapRow(data as unknown as MesaRow);
}

export async function existeNumero(ambienteId: number, numero: string, excluirId?: number): Promise<boolean> {
  let query = supabase
    .from('mesa')
    .select('id_mesa', { count: 'exact', head: true })
    .eq('id_ambiente', ambienteId)
    .ilike('numero', numero);
  if (excluirId !== undefined) {
    query = query.neq('id_mesa', excluirId);
  }
  const { count, error } = await query;
  if (error) {
    throw new Error(`DB_EXISTS_FAIL: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

async function referenciaActiva(tabla: string, idCol: string, id: number): Promise<boolean> {
  const { data, error } = await supabase.from(tabla).select('estado').eq(idCol, id).maybeSingle();
  if (error) {
    throw new Error(`DB_REF_FAIL: ${error.message}`);
  }
  const row = data as { estado: string } | null;
  return !!row && row.estado === 'A';
}

export async function crearMesa(input: MesaCreate, usucre: string, pc = ''): Promise<Mesa> {
  const numero = input.numero.trim().toUpperCase();
  // Reintenta si el token colisiona con el UNIQUE uq_mesa_codigo_qr.
  let ultimoError: unknown = null;
  for (let intento = 0; intento < 3; intento += 1) {
    const { data, error } = await supabase
      .from('mesa')
      .insert({
        id_ambiente: input.ambienteId,
        id_tipomesa: input.tipoId,
        id_estadomesa: 1,
        numero,
        capacidad: input.capacidad,
        detalle: input.detalle || null,
        codigo_qr: qrPara(numero, qrToken()),
        estado: input.estado,
        ...createAudit(usucre, pc),
      })
      .select(SELECT)
      .single();
    if (!error) {
      return mapRow(data as unknown as MesaRow);
    }
    ultimoError = error;
    const msg = `${error.message ?? ''} ${error.code ?? ''}`.toLowerCase();
    if (!msg.includes('duplicate') && !msg.includes('unique') && !msg.includes('23505')) {
      break;
    }
  }
  throw new Error(`DB_CREATE_FAIL: ${(ultimoError as Error)?.message ?? 'unknown'}`);
}

export async function actualizarMesa(
  id: number,
  input: MesaUpdate,
  usumod: string,
  pc = '',
): Promise<Mesa | null> {
  const patch: Record<string, unknown> = { ...updateAudit(usumod, pc) };
  const { regenerarQr, ...campos } = input;
  if (campos.ambienteId !== undefined) {
    patch['id_ambiente'] = campos.ambienteId;
  }
  if (campos.numero !== undefined) {
    patch['numero'] = campos.numero.trim().toUpperCase();
    // Por defecto se MANTIENE codigo_qr aunque cambie el número.
    // Solo se regenera si regenerarQr:true (rotación por seguridad).
  }
  if (campos.capacidad !== undefined) {
    patch['capacidad'] = campos.capacidad;
  }
  if (campos.tipoId !== undefined) {
    patch['id_tipomesa'] = campos.tipoId;
  }
  if (campos.detalle !== undefined) {
    patch['detalle'] = campos.detalle || null;
  }
  if (regenerarQr) {
    const actual = await obtenerMesa(id);
    const numeroFinal = (campos.numero ?? actual?.numero ?? '').trim().toUpperCase();
    // Reintenta si el token colisiona con el UNIQUE uq_mesa_codigo_qr.
    let ultimoError: unknown = null;
    for (let intento = 0; intento < 3; intento += 1) {
      const { data, error } = await supabase
        .from('mesa')
        .update({ ...patch, codigo_qr: qrPara(numeroFinal, qrToken()) })
        .eq('id_mesa', id)
        .select(SELECT)
        .maybeSingle();
      if (!error) {
        if (!data) {
          return null;
        }
        return mapRow(data as unknown as MesaRow);
      }
      ultimoError = error;
      const msg = `${error.message ?? ''} ${error.code ?? ''}`.toLowerCase();
      if (!msg.includes('duplicate') && !msg.includes('unique') && !msg.includes('23505')) {
        break;
      }
    }
    throw new Error(`DB_UPDATE_FAIL: ${(ultimoError as Error)?.message ?? 'unknown'}`);
  }
  const { data, error } = await supabase
    .from('mesa')
    .update(patch)
    .eq('id_mesa', id)
    .select(SELECT)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapRow(data as unknown as MesaRow);
}

export async function cambiarEstadoMesa(
  id: number,
  estado: 'A' | 'I',
  usumod = '',
  pc = '',
): Promise<Mesa | null> {
  const audit = usumod
    ? updateAudit(usumod, pc)
    : { fecmod: new Date().toISOString(), ...(pc ? { pcmod: pc } : {}) };
  const { error } = await supabase
    .from('mesa')
    .update({ estado, ...audit })
    .eq('id_mesa', id);
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  return obtenerMesa(id);
}

export async function ambienteActivo(id: number): Promise<boolean> {
  return referenciaActiva('ambiente', 'id_ambiente', id);
}

export async function tipoActivo(id: number): Promise<boolean> {
  return referenciaActiva('tipo_mesa', 'id_tipomesa', id);
}

export async function listarAmbientes(): Promise<Ambiente[]> {
  const { data, error } = await supabase
    .from('ambiente')
    .select('id_ambiente, n_ambiente, descripcion, piso, estado')
    .order('id_ambiente', { ascending: true });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  const rows = (data ?? []) as {
    id_ambiente: number;
    n_ambiente: string;
    descripcion: string | null;
    piso: number | null;
    estado: string;
  }[];
  const out: Ambiente[] = [];
  for (const r of rows) {
    const conteo = await supabase
      .from('mesa')
      .select('id_mesa', { count: 'exact', head: true })
      .eq('id_ambiente', r.id_ambiente)
      .eq('estado', 'A');
    out.push({
      id: r.id_ambiente,
      nombre: r.n_ambiente,
      descripcion: r.descripcion,
      piso: r.piso,
      mesas: conteo.count ?? 0,
      estado: (r.estado ?? 'A') as Ambiente['estado'],
    });
  }
  return out;
}

export async function crearAmbiente(input: AmbienteCreate, usucre: string, pc = ''): Promise<Ambiente> {
  const { data, error } = await supabase
    .from('ambiente')
    .insert({
      n_ambiente: input.nombre,
      descripcion: input.descripcion || null,
      piso: input.piso ?? null,
      ...createAudit(usucre, pc),
    })
    .select('id_ambiente')
    .single();
  if (error) {
    throw new Error(`DB_CREATE_FAIL: ${error.message}`);
  }
  const lista = await listarAmbientes();
  const creado = lista.find((a) => a.id === (data as { id_ambiente: number }).id_ambiente);
  if (!creado) {
    throw new Error('DB_CREATE_FAIL: sin retorno');
  }
  return creado;
}

export async function actualizarAmbiente(
  id: number,
  input: AmbienteUpdate,
  usumod = '',
  pc = '',
): Promise<Ambiente | null> {
  const patch: Record<string, unknown> = {
    ...(usumod
      ? updateAudit(usumod, pc)
      : { fecmod: new Date().toISOString(), ...(pc ? { pcmod: pc } : {}) }),
  };
  if (input.nombre !== undefined) {
    const { data: dup } = await supabase
      .from('ambiente')
      .select('id_ambiente')
      .ilike('n_ambiente', input.nombre)
      .neq('id_ambiente', id)
      .maybeSingle();
    if (dup) {
      throw new Error('DB_DUPLICATE');
    }
    patch['n_ambiente'] = input.nombre;
  }
  if (input.descripcion !== undefined) {
    patch['descripcion'] = input.descripcion || null;
  }
  if (input.piso !== undefined) {
    patch['piso'] = input.piso;
  }
  const { error } = await supabase.from('ambiente').update(patch).eq('id_ambiente', id);
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  const lista = await listarAmbientes();
  return lista.find((a) => a.id === id) ?? null;
}

export async function cambiarEstadoAmbiente(
  id: number,
  estado: 'A' | 'I',
  usumod = '',
  pc = '',
): Promise<Ambiente | null> {
  const audit = usumod
    ? updateAudit(usumod, pc)
    : { fecmod: new Date().toISOString(), ...(pc ? { pcmod: pc } : {}) };
  const { error } = await supabase
    .from('ambiente')
    .update({ estado, ...audit })
    .eq('id_ambiente', id);
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  const lista = await listarAmbientes();
  return lista.find((a) => a.id === id) ?? null;
}

interface PedidoAbiertoRow {
  id_pedido: number;
  id_mesa: number;
  numero_pedido: string;
  total: number;
  n_comensales: number;
  empleado: { persona: { nombre: string; ap_paterno: string | null; ap_materno: string | null } | null } | null;
}

/** Ocupación en vivo: último pedido abierto por mesa (no facturado ni anulado). */
export async function ocupacionMesas(): Promise<OcupacionMesa[]> {
  const { data, error } = await supabase
    .from('pedido')
    .select('id_pedido, id_mesa, numero_pedido, total, n_comensales, empleado(persona(nombre, ap_paterno, ap_materno))')
    .eq('facturado', 'N')
    .eq('anulado', 'N')
    .eq('estado', 'A')
    .not('id_mesa', 'is', null)
    .order('f_pedido', { ascending: false });
  if (error) {
    throw new Error(`DB_OCCUP_FAIL: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as PedidoAbiertoRow[];
  const porMesa = new Map<number, PedidoAbiertoRow>();
  for (const r of rows) {
    if (!porMesa.has(r.id_mesa)) {
      porMesa.set(r.id_mesa, r);
    }
  }
  if (porMesa.size === 0) {
    return [];
  }
  const { data: det, error: detError } = await supabase
    .from('detalle_pedido')
    .select('id_pedido, estado_preparacion')
    .in('id_pedido', [...new Set([...porMesa.values()].map((r) => r.id_pedido))]);
  if (detError) {
    throw new Error(`DB_OCCUP_FAIL: ${detError.message}`);
  }
  const pedidoIds = [...new Set([...porMesa.values()].map((r) => r.id_pedido))];
  const conteo = new Map<number, { items: number; pendientes: number }>();
  for (const d of (det ?? []) as { id_pedido: number; estado_preparacion: string }[]) {
    const c = conteo.get(d.id_pedido) ?? { items: 0, pendientes: 0 };
    c.items += 1;
    if (d.estado_preparacion === 'P' || d.estado_preparacion === 'E') {
      c.pendientes += 1;
    }
    conteo.set(d.id_pedido, c);
  }
  const { data: pla, error: plaError } = await supabase
    .from('detalle_pedido')
    .select('id_pedido, cantidad, producto(n_producto)')
    .in('id_pedido', pedidoIds)
    .order('cantidad', { ascending: false });
  if (plaError) {
    throw new Error(`DB_OCCUP_FAIL: ${plaError.message}`);
  }
  const platosPorPedido = new Map<number, string[]>();
  for (
    const p of (pla ?? []) as unknown as {
      id_pedido: number;
      producto: { n_producto: string } | { n_producto: string }[] | null;
    }[]
  ) {
    const prod = p.producto;
    const nombre = Array.isArray(prod) ? prod[0]?.n_producto : prod?.n_producto;
    if (!nombre) {
      continue;
    }
    const lista = platosPorPedido.get(p.id_pedido) ?? [];
    if (!lista.includes(nombre) && lista.length < 5) {
      lista.push(nombre);
    }
    platosPorPedido.set(p.id_pedido, lista);
  }
  return [...porMesa.entries()].map(([mesaId, r]) => {
    const persona = r.empleado?.persona;
    const mozo = [persona?.nombre, persona?.ap_paterno, persona?.ap_materno].filter(Boolean).join(' ');
    const c = conteo.get(r.id_pedido) ?? { items: 0, pendientes: 0 };
    return {
      mesaId,
      pedido: r.numero_pedido,
      total: Number(r.total ?? 0),
      comensales: Number(r.n_comensales ?? 0),
      mozo: mozo || '—',
      items: c.items,
      pendientes: c.pendientes,
      platos: platosPorPedido.get(r.id_pedido) ?? [],
    };
  });
}

export async function auditar(
  idUsuario: number,
  accion: string,
  idRegistro: number,
  valor: string,
): Promise<void> {
  const { error } = await supabase.from('auditoria').insert({
    id_usuario: idUsuario,
    n_tabla: 'MESA',
    accion,
    id_registro: idRegistro,
    valor_nuevo: valor,
  });
  if (error) {
    throw new Error(`DB_AUDIT_FAIL: ${error.message}`);
  }
}
