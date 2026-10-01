import { supabase } from '../config/supabase.js';
import type { Cliente, ClienteLista, TipoCliente } from '../models/cliente.js';
import type { ClienteCreate, ClienteQuery } from '../schemas/cliente.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';

interface ClienteRow {
  id_cliente: number;
  tipo_cliente: string;
  puntos: number;
  estado: string;
  f_registro: string;
  id_persona: number | null;
  id_empresa: number | null;
  codigo_cliente: string | null;
  persona: {
    n_documento: string;
    nombre: string;
    ap_paterno: string | null;
    ap_materno: string | null;
    celular: string | null;
    email: string | null;
    direccion: string | null;
    f_nacimiento: string | null;
    genero: 'M' | 'F' | 'O' | null;
    distrito: { id_distrito: number; d_distrito: string } | null;
    tipo_identidad: { n_tipoidentidad: string } | null;
  } | null;
  empresa: {
    id_distrito: number | null;
    ruc: string;
    razon_social: string;
    nombre_comercial: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    distrito: { id_distrito: number; d_distrito: string } | null;
  } | null;
}

const SELECT =
  'id_cliente, tipo_cliente, puntos, estado, f_registro, id_persona, id_empresa, codigo_cliente, persona(id_persona, n_documento, nombre, ap_paterno, ap_materno, celular, email, direccion, f_nacimiento, genero, distrito(id_distrito, d_distrito), tipo_identidad(n_tipoidentidad)), empresa(id_empresa, ruc, razon_social, nombre_comercial, telefono, email, direccion, distrito(id_distrito, d_distrito))';

function mapRow(row: ClienteRow): Cliente {
  if (row.tipo_cliente === 'J' && row.empresa) {
    const e = row.empresa;
    return {
      id: row.id_cliente,
      tipo: 'J',
      nombre: e.razon_social,
      nombres: '',
      apPaterno: '',
      apMaterno: '',
      nombreComercial: e.nombre_comercial ?? '',
      documento: e.ruc,
      tipoDoc: 'RUC',
      telefono: e.telefono ?? '',
      correo: e.email,
      distritoId: e.distrito?.id_distrito ?? null,
      distrito: e.distrito?.d_distrito ?? '',
      direccion: e.direccion,
      codigoCliente: row.codigo_cliente ?? null,
      fNacimiento: null,
      genero: null,
      puntos: row.puntos ?? 0,
      estado: (row.estado ?? 'A') as Cliente['estado'],
    };
  }
  const p = row.persona;
  const nombre = p
    ? [p.nombre, p.ap_paterno, p.ap_materno].filter(Boolean).join(' ')
    : '';
  return {
    id: row.id_cliente,
    tipo: 'N',
    nombre,
    nombres: p?.nombre ?? '',
    apPaterno: p?.ap_paterno ?? '',
    apMaterno: p?.ap_materno ?? '',
    nombreComercial: '',
    documento: p?.n_documento ?? '',
    tipoDoc: p?.tipo_identidad?.n_tipoidentidad ?? 'DNI',
    telefono: p?.celular ?? '',
    correo: p?.email ?? null,
    distritoId: p?.distrito?.id_distrito ?? null,
    distrito: p?.distrito?.d_distrito ?? '',
    direccion: p?.direccion ?? null,
    codigoCliente: row.codigo_cliente ?? null,
    fNacimiento: p?.f_nacimiento ?? null,
    genero: p?.genero ?? null,
    puntos: row.puntos ?? 0,
    estado: (row.estado ?? 'A') as Cliente['estado'],
  };
}

export async function listarClientes(q: ClienteQuery): Promise<ClienteLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  const ordenColumna = q.orden === 'puntos' ? 'puntos' : q.orden === 'alpha' ? 'id_cliente' : 'f_registro';
  const ascendente = q.orden !== 'puntos' && q.orden !== 'recientes' ? true : false;

  let query = supabase
    .from('cliente')
    .select(SELECT, { count: 'exact' })
    .order(ordenColumna, { ascending: ascendente })
    .range(desde, hasta);

  if (q.tipo) {
    query = query.eq('tipo_cliente', q.tipo);
  }
  if (q.estado) {
    query = query.eq('estado', q.estado);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  let rows = ((data ?? []) as unknown as ClienteRow[]).map(mapRow);

  if (q.buscar) {
    const b = q.buscar.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.nombre.toLowerCase().includes(b) ||
        r.documento.includes(q.buscar as string) ||
        (r.correo ?? '').toLowerCase().includes(b),
    );
  }
  if (q.orden === 'alpha') {
    rows = [...rows].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  return { data: rows, page: q.page, limit: q.limit, total: count ?? 0 };
}

export async function obtenerCliente(id: number): Promise<Cliente | null> {
  const { data, error } = await supabase.from('cliente').select(SELECT).eq('id_cliente', id).maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapRow(data as unknown as ClienteRow);
}

async function idTipoIdentidad(nombre: string): Promise<number | null> {
  const { data } = await supabase
    .from('tipo_identidad')
    .select('id_tipoidentidad')
    .eq('n_tipoidentidad', nombre)
    .maybeSingle();
  return (data as { id_tipoidentidad: number } | null)?.id_tipoidentidad ?? null;
}

export async function existeDocumento(tipo: TipoCliente, doc: string): Promise<boolean> {
  if (tipo === 'N') {
    const { count, error } = await supabase
      .from('persona')
      .select('id_persona', { count: 'exact', head: true })
      .eq('n_documento', doc);
    if (error) {
      throw new Error(`DB_EXISTS_FAIL: ${error.message}`);
    }
    return (count ?? 0) > 0;
  }
  const { count, error } = await supabase
    .from('empresa')
    .select('id_empresa', { count: 'exact', head: true })
    .eq('ruc', doc);
  if (error) {
    throw new Error(`DB_EXISTS_FAIL: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function crearCliente(input: ClienteCreate, usucre: string, pc = ''): Promise<Cliente> {
  let idPersona: number | null = null;
  let idEmpresa: number | null = null;

  if (input.tipo === 'N') {
    const nombreTipo =
      input.tipoDoc === 'CE' ? 'CARNET EXTRANJERIA' : (input.tipoDoc ?? 'DNI');
    const idTipo = await idTipoIdentidad(nombreTipo);
    if (!idTipo) {
      throw new Error('DB_REF_FAIL: sin TIPO_IDENTIDAD');
    }
    const { data, error } = await supabase
      .from('persona')
      .insert({
        id_tipoidentidad: idTipo,
        n_documento: input.dni,
        nombre: input.nombres,
        ap_paterno: input.apPaterno || null,
        ap_materno: input.apMaterno || null,
        f_nacimiento: input.fNacimiento ?? null,
        celular: input.telefono,
        email: input.correo || null,
        genero: input.genero ?? null,
        direccion: input.direccion || null,
        id_distrito: input.distritoId ?? null,
        ...createAudit(usucre, pc),
      })
      .select('id_persona')
      .single();
    if (error) {
      throw new Error(`DB_CREATE_FAIL: ${error.message}`);
    }
    idPersona = (data as { id_persona: number }).id_persona;
  } else {
    const { data, error } = await supabase
      .from('empresa')
      .insert({
        ruc: input.ruc,
        razon_social: input.razonSocial,
        nombre_comercial: input.nombreComercial || null,
        telefono: input.telefono,
        email: input.correo || null,
        direccion: input.direccion || null,
        id_distrito: input.distritoId ?? null,
        ...createAudit(usucre, pc),
      })
      .select('id_empresa')
      .single();
    if (error) {
      throw new Error(`DB_CREATE_FAIL: ${error.message}`);
    }
    idEmpresa = (data as { id_empresa: number }).id_empresa;
  }

  const { data, error } = await supabase
    .from('cliente')
    .insert({
      id_persona: idPersona,
      id_empresa: idEmpresa,
      codigo_cliente: input.codigoCliente?.trim() || null,
      tipo_cliente: input.tipo,
      ...createAudit(usucre, pc),
    })
    .select('id_cliente')
    .single();
  if (error) {
    throw new Error(`DB_CREATE_FAIL: ${error.message}`);
  }
  const creado = await obtenerCliente((data as { id_cliente: number }).id_cliente);
  if (!creado) {
    throw new Error('DB_CREATE_FAIL: sin retorno');
  }
  return creado;
}

export async function actualizarCliente(
  id: number,
  input: import('../schemas/cliente.js').ClienteUpdate,
  usumod: string,
  pc = '',
): Promise<Cliente | null> {
  const actual = await obtenerCliente(id);
  if (!actual) {
    return null;
  }
  if (actual.tipo === 'N') {
    const patch: Record<string, unknown> = { ...updateAudit(usumod, pc) };
    const row = await supabase.from('cliente').select('id_persona').eq('id_cliente', id).single();
    const idPersona = (row.data as { id_persona: number } | null)?.id_persona;
    if (!idPersona) {
      throw new Error('DB_REF_FAIL: sin persona');
    }
    if (input.nombres !== undefined) {
      patch['nombre'] = input.nombres;
    }
    if (input.apPaterno !== undefined) {
      patch['ap_paterno'] = input.apPaterno || null;
    }
    if (input.apMaterno !== undefined) {
      patch['ap_materno'] = input.apMaterno || null;
    }
    if (input.telefono !== undefined) {
      patch['celular'] = input.telefono;
    }
    if (input.correo !== undefined) {
      patch['email'] = input.correo || null;
    }
    if (input.direccion !== undefined) {
      patch['direccion'] = input.direccion || null;
    }
    if (input.distritoId !== undefined) {
      patch['id_distrito'] = input.distritoId;
    }
    if (input.fNacimiento !== undefined) {
      patch['f_nacimiento'] = input.fNacimiento;
    }
    if (input.genero !== undefined) {
      patch['genero'] = input.genero;
    }
    const { error } = await supabase.from('persona').update(patch).eq('id_persona', idPersona);
    if (error) {
      throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
    }
  } else {
    const patch: Record<string, unknown> = { ...updateAudit(usumod, pc) };
    const row = await supabase.from('cliente').select('id_empresa').eq('id_cliente', id).single();
    const idEmpresa = (row.data as { id_empresa: number } | null)?.id_empresa;
    if (!idEmpresa) {
      throw new Error('DB_REF_FAIL: sin empresa');
    }
    if (input.razonSocial !== undefined) {
      patch['razon_social'] = input.razonSocial;
    }
    if (input.nombreComercial !== undefined) {
      patch['nombre_comercial'] = input.nombreComercial || null;
    }
    if (input.telefono !== undefined) {
      patch['telefono'] = input.telefono;
    }
    if (input.correo !== undefined) {
      patch['email'] = input.correo || null;
    }
    if (input.direccion !== undefined) {
      patch['direccion'] = input.direccion || null;
    }
    if (input.distritoId !== undefined) {
      patch['id_distrito'] = input.distritoId;
    }
    const { error } = await supabase.from('empresa').update(patch).eq('id_empresa', idEmpresa);
    if (error) {
      throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
    }
  }
  if (input.codigoCliente !== undefined) {
    const { error: errCod } = await supabase
      .from('cliente')
      .update({ codigo_cliente: input.codigoCliente?.trim() || null, ...updateAudit(usumod, pc) })
      .eq('id_cliente', id);
    if (errCod) {
      throw new Error(`DB_UPDATE_FAIL: ${errCod.message}`);
    }
  }
  return obtenerCliente(id);
}

export async function cambiarEstadoCliente(
  id: number,
  estado: 'A' | 'I',
  usumod: string,
  pc = '',
): Promise<Cliente | null> {
  const { error } = await supabase
    .from('cliente')
    .update({ estado, ...updateAudit(usumod, pc) })
    .eq('id_cliente', id);
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  return obtenerCliente(id);
}

export async function auditar(
  idUsuario: number,
  accion: string,
  idRegistro: number,
  valor: string,
): Promise<void> {
  const { error } = await supabase.from('auditoria').insert({
    id_usuario: idUsuario,
    n_tabla: 'CLIENTE',
    accion,
    id_registro: idRegistro,
    valor_nuevo: valor,
  });
  if (error) {
    throw new Error(`DB_AUDIT_FAIL: ${error.message}`);
  }
}
