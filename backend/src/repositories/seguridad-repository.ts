import { supabase } from '../config/supabase.js';
import { SeguridadError, type SeguridadActor, type Permiso, type Rol, type Usuario, type UsuarioLista, type RolLista, type PermisoLista } from '../models/seguridad.js';
import type { RolCreate, RolQuery, UsuarioCreate, UsuarioQuery, UsuarioUpdate } from '../schemas/seguridad.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';
import { createHash } from 'crypto';

interface UsuarioRow {
  id_usuario: number;
  logeo: string;
  id_tipousuario: number;
  tipo_usuario: { n_tipousuario: string } | null;
  id_empleado: number;
  empleado: { persona: { nombre: string; ap_paterno: string | null } } | null;
  bloqueado: string;
  intentos: number;
  estado: string;
  feccre: string;
}

interface RolRow {
  id_rol: number;
  n_rol: string;
  descripcion: string | null;
  estado: string;
}

interface PermisoRow {
  id_permiso: number;
  id_modulo: number;
  modulo: { n_modulo: string } | null;
  n_permiso: string;
  clave: string;
  descripcion: string | null;
  estado: string;
}

const USUARIO_SELECT = 'id_usuario, logeo, id_tipousuario, tipo_usuario(n_tipousuario), id_empleado, empleado(persona(nombre, ap_paterno)), bloqueado, intentos, estado, feccre';
const ROL_SELECT = 'id_rol, n_rol, descripcion, estado';
const PERMISO_SELECT = 'id_permiso, id_modulo, modulo(n_modulo), n_permiso, clave, descripcion, estado';

function lanzarErrorEscrituraSeguridad(
  error: { code?: string; message: string },
  operation: string,
): never {
  const knownCodes = [
    'AUTO_MODIFICACION_PROHIBIDA',
    'EMPLEADO_INACTIVO',
    'ULTIMO_ADMINISTRADOR',
    'PERMISO_INVALIDO',
    'PRIVILEGE_ESCALATION',
    'MOTIVO_REQUERIDO',
    'TIPO_INVALIDO',
    'ROL_TIPO_NO_ENCONTRADO',
    'FORBIDDEN',
  ] as const;
  const code = knownCodes.find((value) => error.message.includes(value));
  if (code) throw new SeguridadError(code);
  if (error.code === '23505') throw new SeguridadError('YA_EXISTE');
  throw new Error(`${operation}: ${error.message}`);
}

function mapUsuario(row: UsuarioRow): Usuario {
  return {
    id: row.id_usuario,
    logeo: row.logeo,
    tipo: row.tipo_usuario?.n_tipousuario ?? '',
    empleadoId: row.id_empleado ?? null,
    empleado: row.empleado?.persona
      ? `${row.empleado.persona.nombre} ${row.empleado.persona.ap_paterno ?? ''}`.trim()
      : null,
    bloqueado: row.bloqueado ?? 'N',
    intentos: Number(row.intentos ?? 0),
    estado: (row.estado ?? 'A') as Usuario['estado'],
    fechaCreacion: row.feccre,
  };
}

function mapRol(row: RolRow): Rol {
  return {
    id: row.id_rol,
    nombre: row.n_rol,
    descripcion: row.descripcion,
    estado: (row.estado ?? 'A') as Rol['estado'],
  };
}

function mapPermiso(row: PermisoRow): Permiso {
  return {
    id: row.id_permiso,
    modulo: row.modulo?.n_modulo ?? '',
    moduloId: row.id_modulo,
    nombre: row.n_permiso,
    clave: row.clave,
    descripcion: row.descripcion,
    estado: (row.estado ?? 'A') as Permiso['estado'],
  };
}

export async function listarUsuarios(q: UsuarioQuery): Promise<UsuarioLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('usuario')
    .select(USUARIO_SELECT, { count: 'exact' })
    .order('feccre', { ascending: false })
    .order('id_usuario', { ascending: false })
    .range(desde, hasta);

  if (q.buscar) {
    query = query.ilike('logeo', `%${q.buscar}%`);
  }
  if (q.estado) {
    query = query.eq('estado', q.estado);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as UsuarioRow[]).map(mapUsuario),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function listarTiposUsuario(): Promise<string[]> {
  const { data, error } = await supabase
    .from('tipo_usuario')
    .select('n_tipousuario')
    .eq('estado', 'A')
    .order('n_tipousuario', { ascending: true });
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return ((data ?? []) as { n_tipousuario: string }[]).map((row) => row.n_tipousuario);
}

async function validarEmpleadoActivo(id: number): Promise<void> {
  const { data, error } = await supabase
    .from('empleado')
    .select('estado, f_cese')
    .eq('id_empleado', id)
    .maybeSingle();
  if (error) throw new Error(`DB_EMPLOYEE_CHECK_FAIL: ${error.message}`);
  const hoy = new Date().toISOString().slice(0, 10);
  if (!data || data.estado !== 'A' || (data.f_cese !== null && data.f_cese <= hoy)) {
    throw new SeguridadError('EMPLEADO_INACTIVO');
  }
}

export async function crearUsuario(input: UsuarioCreate, actor: SeguridadActor, pc = ''): Promise<Usuario> {
  if (input.tipo.toUpperCase() === 'ADMINISTRADOR' && actor.tipo.toUpperCase() !== 'ADMINISTRADOR') {
    throw new SeguridadError('FORBIDDEN');
  }
  await validarEmpleadoActivo(input.empleadoId);

  const { data: existing, error: existingError } = await supabase
    .from('usuario')
    .select('id_usuario')
    .eq('logeo', input.logeo)
    .maybeSingle();
  if (existingError) throw new Error(`DB_USER_CHECK_FAIL: ${existingError.message}`);
  if (existing) throw new Error('YA_EXISTE');

  const { data: tipo, error: typeError } = await supabase
    .from('tipo_usuario')
    .select('id_tipousuario, estado')
    .eq('n_tipousuario', input.tipo)
    .maybeSingle();
  if (typeError) throw new Error(`DB_USER_TYPE_CHECK_FAIL: ${typeError.message}`);
  if (!tipo || tipo.estado !== 'A') throw new SeguridadError('TIPO_INVALIDO');

  const claveHash = createHash('sha256').update(input.clave).digest('hex');

  const { data, error } = await supabase
    .from('usuario')
    .insert({
      logeo: input.logeo,
      clave: claveHash,
      id_tipousuario: tipo.id_tipousuario,
      id_empleado: input.empleadoId,
      bloqueado: 'N',
      intentos: 0,
      estado: input.estado,
      ...createAudit(actor.logeo, pc),
    })
    .select(USUARIO_SELECT)
    .single();
  if (error) lanzarErrorEscrituraSeguridad(error, 'DB_CREATE_FAIL');
  return mapUsuario(data as unknown as UsuarioRow);
}

export async function actualizarUsuario(id: number, input: UsuarioUpdate, actor: SeguridadActor, pc = ''): Promise<Usuario | null> {
  if (actor.id === id) throw new SeguridadError('AUTO_MODIFICACION_PROHIBIDA');

  const { data: current, error: currentError } = await supabase
    .from('usuario')
    .select('id_usuario, tipo_usuario(n_tipousuario), estado, id_empleado')
    .eq('id_usuario', id)
    .maybeSingle();
  if (currentError) throw new Error(`DB_USER_CHECK_FAIL: ${currentError.message}`);
  if (!current) return null;

  const tipoActual = (current.tipo_usuario as unknown as { n_tipousuario: string } | null)?.n_tipousuario ?? '';
  if (
    actor.tipo.toUpperCase() !== 'ADMINISTRADOR' &&
    (tipoActual.toUpperCase() === 'ADMINISTRADOR' || input.tipo?.toUpperCase() === 'ADMINISTRADOR')
  ) {
    throw new SeguridadError('FORBIDDEN');
  }
  if (input.empleadoId !== undefined) await validarEmpleadoActivo(input.empleadoId);

  const patch: Record<string, unknown> = {
    ...updateAudit(actor.logeo, pc),
    motivo_ultimo_cambio: input.motivo,
  };
  if (input.tipo !== undefined) {
    const { data: tipo, error: typeError } = await supabase
      .from('tipo_usuario')
      .select('id_tipousuario, estado')
      .eq('n_tipousuario', input.tipo)
      .maybeSingle();
    if (typeError) throw new Error(`DB_USER_TYPE_CHECK_FAIL: ${typeError.message}`);
    if (!tipo || tipo.estado !== 'A') throw new SeguridadError('TIPO_INVALIDO');
    patch['id_tipousuario'] = tipo.id_tipousuario;
  }
  if (input.empleadoId !== undefined) patch['id_empleado'] = input.empleadoId;
  if (input.clave !== undefined) {
    patch['clave'] = createHash('sha256').update(input.clave).digest('hex');
    patch['bloqueado'] = 'N';
    patch['intentos'] = 0;
  }
  if (input.estado !== undefined) patch['estado'] = input.estado;

  const { data, error } = await supabase
    .from('usuario')
    .update(patch)
    .eq('id_usuario', id)
    .select(USUARIO_SELECT)
    .maybeSingle();
  if (error) lanzarErrorEscrituraSeguridad(error, 'DB_UPDATE_FAIL');
  if (!data) return null;
  return mapUsuario(data as unknown as UsuarioRow);
}

export async function listarRoles(q: RolQuery): Promise<RolLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('rol')
    .select(ROL_SELECT, { count: 'exact' })
    .order('n_rol', { ascending: true })
    .range(desde, hasta);

  if (q.buscar) query = query.ilike('n_rol', `%${q.buscar}%`);
  if (q.estado) query = query.eq('estado', q.estado);

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as RolRow[]).map(mapRol),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function guardarRol(
  id: number | null,
  input: RolCreate,
  actor: SeguridadActor,
  pc = '',
): Promise<Rol> {
  const { data: savedId, error } = await supabase.rpc('fn_guardar_rol_seguridad', {
    p_id_rol: id,
    p_nombre: input.nombre,
    p_descripcion: input.descripcion ?? null,
    p_estado: input.estado,
    p_permiso_ids: input.permisoIds,
    p_actor_usuario: actor.id,
    p_usuario: actor.logeo,
    p_pc: pc,
    p_motivo: input.motivo,
  });
  if (error) throw new Error(`DB_ROLE_SAVE_FAIL: ${error.message}`);
  if (typeof savedId !== 'number') throw new Error('DB_ROLE_SAVE_FAIL: invalid response');

  const { data, error: readError } = await supabase
    .from('rol')
    .select(ROL_SELECT)
    .eq('id_rol', savedId)
    .single();
  if (readError) throw new Error(`DB_ROLE_READ_FAIL: ${readError.message}`);
  return mapRol(data as unknown as RolRow);
}

export async function listarPermisos(): Promise<PermisoLista> {
  const { data, error } = await supabase
    .from('permiso')
    .select(PERMISO_SELECT)
    .eq('estado', 'A')
    .order('id_modulo', { ascending: true })
    .order('clave', { ascending: true });
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as PermisoRow[]).map(mapPermiso),
    page: 1,
    limit: 1000,
    total: (data ?? []).length,
  };
}

export async function asignarPermisosRol(
  rolId: number,
  permisoIds: number[],
  motivo: string,
  actor: SeguridadActor,
  pc = '',
): Promise<void> {
  const { error } = await supabase.rpc('fn_asignar_permisos_rol_seguridad', {
    p_rol: rolId,
    p_permisos: permisoIds,
    p_usuario: actor.logeo,
    p_pc: pc,
    p_motivo: motivo,
    p_actor_usuario: actor.id,
  });
  if (error) throw new Error(`DB_ASSIGN_FAIL: ${error.message}`);
}

export async function listarPermisosDeRol(rolId: number): Promise<number[]> {
  const { data, error } = await supabase
    .from('rol_permiso')
    .select('id_permiso, permiso!inner(estado)')
    .eq('id_rol', rolId)
    .eq('permiso.estado', 'A')
    .eq('estado', 'A')
    .eq('concedido', 'S');
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return ((data ?? []) as { id_permiso: number }[]).map((row) => row.id_permiso);
}
