import { leerToken } from '../../auth/login/auth-service';
import { headerEquipo } from '../../../utils/equipo';
import type { Personal, PersonalForm, PersonalLista } from './personal-types';
import type { Maestro } from '../../../services/maestros';

export { listarDistritos } from '../../../services/maestros';

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/personal`;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
    ...headerEquipo(),
  };
}

async function lanzar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
  return (await res.json()) as T;
}

export interface FiltrosPersonal {
  page: number;
  limit: number;
  buscar: string;
  cargo: number | '';
  turno: string;
  estado: '' | 'A' | 'I';
}

export function listarPersonal(f: FiltrosPersonal): Promise<PersonalLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.buscar) {
    q.set('buscar', f.buscar);
  }
  if (f.cargo !== '') {
    q.set('cargo', String(f.cargo));
  }
  if (f.turno) {
    q.set('turno', f.turno);
  }
  if (f.estado) {
    q.set('estado', f.estado);
  }
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<PersonalLista>);
}

const MAESTROS = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/maestros`;

/** Listas maestras vivas (cargos, contratos, tipos-identidad; distritos va por shared). */
function listarMaestros(ruta: string): Promise<Maestro[]> {
  return fetch(`${MAESTROS}/${ruta}`, { headers: headers() }).then(lanzar<Maestro[]>);
}

export function listarCargos(): Promise<Maestro[]> {
  return listarMaestros('cargos');
}

export function listarContratos(): Promise<Maestro[]> {
  return listarMaestros('contratos');
}

export function listarTiposIdentidad(): Promise<Maestro[]> {
  return listarMaestros('tipos-identidad');
}

export function crearEmpleado(input: Omit<PersonalForm, 'fIngreso'> & { fIngreso?: string }): Promise<Personal> {
  const body = {
    nombres: input.nombres.trim(),
    apPaterno: input.apPaterno.trim(),
    apMaterno: input.apMaterno.trim(),
    tipoDoc: input.tipoDoc,
    documento: input.documento.trim(),
    telefono: input.telefono.trim(),
    correo: input.correo.trim() || undefined,
    direccion: input.direccion.trim(),
    distritoId: input.distritoId || undefined,
    fNacimiento: input.fNacimiento || undefined,
    genero: input.genero || undefined,
    cargoId: input.cargoId,
    contratoId: input.contratoId,
    turno: input.turno,
    fondoPension: input.fondoPension.trim() || undefined,
    nHijos: input.nHijos ?? undefined,
    essalud: input.essalud.trim() || undefined,
    fIngreso: input.fIngreso || undefined,
    sueldo: input.sueldo,
  };
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(
    lanzar<Personal>,
  );
}

export function actualizarEmpleado(id: number, input: Partial<PersonalForm>): Promise<Personal> {
  const body: Record<string, unknown> = {};
  // En updates se omiten los '' que el schema rechaza (min(1)/email).
  if (input.nombres !== undefined && input.nombres.trim()) {
    body['nombres'] = input.nombres.trim();
  }
  if (input.apPaterno !== undefined) {
    body['apPaterno'] = input.apPaterno.trim();
  }
  if (input.apMaterno !== undefined) {
    body['apMaterno'] = input.apMaterno.trim();
  }
  if (input.telefono !== undefined && input.telefono.trim()) {
    body['telefono'] = input.telefono.trim();
  }
  if (input.correo !== undefined && input.correo.trim()) {
    body['correo'] = input.correo.trim();
  }
  if (input.direccion !== undefined) {
    body['direccion'] = input.direccion.trim();
  }
  if (input.distritoId !== undefined) {
    body['distritoId'] = input.distritoId ? input.distritoId : null;
  }
  if (input.fNacimiento !== undefined) {
    body['fNacimiento'] = input.fNacimiento || null;
  }
  if (input.genero !== undefined) {
    body['genero'] = input.genero || null;
  }
  if (input.cargoId) {
    body['cargoId'] = input.cargoId;
  }
  if (input.contratoId) {
    body['contratoId'] = input.contratoId;
  }
  if (input.turno !== undefined) {
    body['turno'] = input.turno;
  }
  if (input.fondoPension !== undefined) {
    body['fondoPension'] = input.fondoPension.trim() || null;
  }
  if (input.nHijos !== undefined) {
    body['nHijos'] = input.nHijos;
  }
  if (input.essalud !== undefined) {
    body['essalud'] = input.essalud.trim() || null;
  }
  if (input.fIngreso) {
    body['fIngreso'] = input.fIngreso;
  }
  if (input.fCese) {
    body['fCese'] = input.fCese;
  }
  if (input.sueldo !== undefined) {
    body['sueldo'] = input.sueldo;
  }
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  }).then(lanzar<Personal>);
}

export function cambiarEstadoEmpleado(id: number, estado: 'A' | 'I'): Promise<Personal> {
  return fetch(`${BASE}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ estado }),
  }).then(lanzar<Personal>);
}
