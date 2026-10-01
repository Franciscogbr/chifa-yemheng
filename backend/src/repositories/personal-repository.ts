import { supabase } from '../config/supabase.js';
import type { Personal, PersonalLista } from '../models/personal.js';
import type { PersonalCreate, PersonalQuery, PersonalUpdate } from '../schemas/personal.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';

interface PersonalRow {
  id_empleado: number;
  turno: string | null;
  f_ingreso: string | null;
  f_cese: string | null;
  salario: number;
  estado: string;
  persona: {
    id_persona: number;
    n_documento: string;
    nombre: string;
    ap_paterno: string | null;
    ap_materno: string | null;
    celular: string | null;
    email: string | null;
    direccion: string | null;
    f_nacimiento: string | null;
    genero: 'M' | 'F' | 'O' | null;
    tipo_identidad: { n_tipoidentidad: string } | null;
    distrito: { id_distrito: number; d_distrito: string } | null;
  } | null;
  fondo_pension: string | null;
  n_hijos: string | number | null;
  essalud: string | null;
  cargo: { id_cargo: number; n_cargo: string; area: string | null } | null;
  contrato: { id_contrato: number; n_contrato: string } | null;
}

const SELECT =
  'id_empleado, turno, fondo_pension, n_hijos, essalud, f_ingreso, f_cese, salario, estado, persona(id_persona, n_documento, nombre, ap_paterno, ap_materno, celular, email, direccion, f_nacimiento, genero, tipo_identidad(n_tipoidentidad), distrito(id_distrito, d_distrito)), cargo(id_cargo, n_cargo, area), contrato(id_contrato, n_contrato)';

function mapRow(row: PersonalRow): Personal {
  const p = row.persona;
  return {
    id: row.id_empleado,
    nombres: p?.nombre ?? '',
    apPaterno: p?.ap_paterno ?? '',
    apMaterno: p?.ap_materno ?? '',
    documento: p?.n_documento ?? '',
    tipoDoc: p?.tipo_identidad?.n_tipoidentidad ?? 'DNI',
    telefono: p?.celular ?? '',
    correo: p?.email ?? null,
    direccion: p?.direccion ?? null,
    distritoId: p?.distrito?.id_distrito ?? null,
    distrito: p?.distrito?.d_distrito ?? '',
    fNacimiento: p?.f_nacimiento ?? null,
    genero: p?.genero ?? null,
    cargoId: row.cargo?.id_cargo ?? 0,
    cargo: row.cargo?.n_cargo ?? '',
    area: row.cargo?.area ?? '',
    contratoId: row.contrato?.id_contrato ?? 0,
    contrato: row.contrato?.n_contrato ?? '',
    turno: row.turno,
    fondoPension: row.fondo_pension ?? null,
    nHijos: row.n_hijos === null || row.n_hijos === undefined ? null : Number(row.n_hijos),
    essalud: row.essalud ?? null,
    fIngreso: row.f_ingreso,
    fCese: row.f_cese,
    sueldo: Number(row.salario ?? 0),
    estado: (row.estado ?? 'A') as Personal['estado'],
  };
}

export async function listarPersonal(q: PersonalQuery): Promise<PersonalLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('empleado')
    .select(SELECT, { count: 'exact' })
    .order('id_empleado', { ascending: true })
    .range(desde, hasta);

  if (q.cargo !== undefined) {
    query = query.eq('id_cargo', q.cargo);
  }
  if (q.turno) {
    query = query.ilike('turno', `%${q.turno}%`);
  }
  if (q.estado) {
    query = query.eq('estado', q.estado);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  let rows = ((data ?? []) as unknown as PersonalRow[]).map(mapRow);
  if (q.buscar) {
    const b = q.buscar.toLowerCase();
    rows = rows.filter(
      (r) =>
        `${r.nombres} ${r.apPaterno} ${r.apMaterno}`.toLowerCase().includes(b) ||
        r.documento.includes(q.buscar as string) ||
        (r.telefono ?? '').includes(q.buscar as string),
    );
  }
  return { data: rows, page: q.page, limit: q.limit, total: count ?? 0 };
}

export async function obtenerPersonal(id: number): Promise<Personal | null> {
  const { data, error } = await supabase.from('empleado').select(SELECT).eq('id_empleado', id).maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapRow(data as unknown as PersonalRow);
}

async function idTipoDoc(nombre: string): Promise<number | null> {
  const map: Record<string, string> = { DNI: 'DNI', CE: 'CARNET EXTRANJERIA', PASAPORTE: 'PASAPORTE' };
  const { data } = await supabase
    .from('tipo_identidad')
    .select('id_tipoidentidad')
    .eq('n_tipoidentidad', map[nombre] ?? nombre)
    .maybeSingle();
  return (data as { id_tipoidentidad: number } | null)?.id_tipoidentidad ?? null;
}

export async function existeDocumento(tipoDoc: string, doc: string): Promise<boolean> {
  const idTipo = await idTipoDoc(tipoDoc);
  if (!idTipo) {
    return false;
  }
  const { count, error } = await supabase
    .from('persona')
    .select('id_persona', { count: 'exact', head: true })
    .eq('id_tipoidentidad', idTipo)
    .eq('n_documento', doc);
  if (error) {
    throw new Error(`DB_EXISTS_FAIL: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function crearPersonal(input: PersonalCreate, usucre: string, pc = ''): Promise<Personal> {
  const idTipo = await idTipoDoc(input.tipoDoc);
  if (!idTipo) {
    throw new Error('DB_REF_FAIL: sin TIPO_IDENTIDAD');
  }
  const { data: per, error: errPer } = await supabase
    .from('persona')
    .insert({
      id_tipoidentidad: idTipo,
      id_distrito: input.distritoId ?? null,
      n_documento: input.documento,
      nombre: input.nombres,
      ap_paterno: input.apPaterno || null,
      ap_materno: input.apMaterno || null,
      f_nacimiento: input.fNacimiento ?? null,
      email: input.correo || null,
      celular: input.telefono,
      genero: input.genero ?? null,
      direccion: input.direccion || null,
      ...createAudit(usucre, pc),
    })
    .select('id_persona')
    .single();
  if (errPer) {
    throw new Error(`DB_CREATE_FAIL: ${errPer.message}`);
  }
  const idPersona = (per as { id_persona: number }).id_persona;

  const { data: emp, error: errEmp } = await supabase
    .from('empleado')
    .insert({
      id_persona: idPersona,
      id_contrato: input.contratoId,
      id_cargo: input.cargoId,
      salario: input.sueldo,
      turno: input.turno || null,
      fondo_pension: input.fondoPension ? input.fondoPension.toUpperCase() : null,
      n_hijos: input.nHijos ?? null,
      essalud: input.essalud || null,
      f_ingreso: input.fIngreso ?? null,
      ...createAudit(usucre, pc),
    })
    .select('id_empleado')
    .single();
  if (errEmp) {
    await supabase.from('persona').delete().eq('id_persona', idPersona);
    throw new Error(`DB_CREATE_FAIL: ${errEmp.message}`);
  }
  const creado = await obtenerPersonal((emp as { id_empleado: number }).id_empleado);
  if (!creado) {
    throw new Error('DB_CREATE_FAIL: sin retorno');
  }
  return creado;
}

export async function actualizarPersonal(
  id: number,
  input: PersonalUpdate,
  usumod: string,
  pc = '',
): Promise<Personal | null> {
  const actual = await obtenerPersonal(id);
  if (!actual) {
    return null;
  }
  const row = await supabase.from('empleado').select('id_persona').eq('id_empleado', id).single();
  const idPersona = (row.data as { id_persona: number } | null)?.id_persona;
  if (!idPersona) {
    throw new Error('DB_REF_FAIL: sin persona');
  }

  const patchPer: Record<string, unknown> = { ...updateAudit(usumod, pc) };
  if (input.nombres !== undefined) {
    patchPer['nombre'] = input.nombres;
  }
  if (input.apPaterno !== undefined) {
    patchPer['ap_paterno'] = input.apPaterno || null;
  }
  if (input.apMaterno !== undefined) {
    patchPer['ap_materno'] = input.apMaterno || null;
  }
  if (input.telefono !== undefined) {
    patchPer['celular'] = input.telefono;
  }
  if (input.correo !== undefined) {
    patchPer['email'] = input.correo || null;
  }
  if (input.direccion !== undefined) {
    patchPer['direccion'] = input.direccion || null;
  }
  if (input.distritoId !== undefined) {
    patchPer['id_distrito'] = input.distritoId;
  }
  if (input.fNacimiento !== undefined) {
    patchPer['f_nacimiento'] = input.fNacimiento;
  }
  if (input.genero !== undefined) {
    patchPer['genero'] = input.genero;
  }
  const { error: errPer } = await supabase.from('persona').update(patchPer).eq('id_persona', idPersona);
  if (errPer) {
    throw new Error(`DB_UPDATE_FAIL: ${errPer.message}`);
  }

  const patchEmp: Record<string, unknown> = { ...updateAudit(usumod, pc) };
  if (input.cargoId !== undefined) {
    patchEmp['id_cargo'] = input.cargoId;
  }
  if (input.contratoId !== undefined) {
    patchEmp['id_contrato'] = input.contratoId;
  }
  if (input.turno !== undefined) {
    patchEmp['turno'] = input.turno || null;
  }
  if (input.fondoPension !== undefined) {
    patchEmp['fondo_pension'] = input.fondoPension ? input.fondoPension.toUpperCase() : null;
  }
  if (input.nHijos !== undefined) {
    patchEmp['n_hijos'] = input.nHijos;
  }
  if (input.essalud !== undefined) {
    patchEmp['essalud'] = input.essalud || null;
  }
  if (input.fIngreso !== undefined) {
    patchEmp['f_ingreso'] = input.fIngreso;
  }
  if (input.fCese !== undefined) {
    patchEmp['f_cese'] = input.fCese;
  }
  if (input.sueldo !== undefined) {
    patchEmp['salario'] = input.sueldo;
  }
  const { error: errEmp } = await supabase.from('empleado').update(patchEmp).eq('id_empleado', id);
  if (errEmp) {
    throw new Error(`DB_UPDATE_FAIL: ${errEmp.message}`);
  }
  return obtenerPersonal(id);
}

export async function cambiarEstadoPersonal(
  id: number,
  estado: 'A' | 'I',
  usumod: string,
  pc = '',
): Promise<Personal | null> {
  const { error } = await supabase
    .from('empleado')
    .update({ estado, ...updateAudit(usumod, pc) })
    .eq('id_empleado', id);
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  return obtenerPersonal(id);
}

export async function auditar(
  idUsuario: number,
  accion: string,
  idRegistro: number,
  valor: string,
): Promise<void> {
  const { error } = await supabase.from('auditoria').insert({
    id_usuario: idUsuario,
    n_tabla: 'EMPLEADO',
    accion,
    id_registro: idRegistro,
    valor_nuevo: valor,
  });
  if (error) {
    throw new Error(`DB_AUDIT_FAIL: ${error.message}`);
  }
}
