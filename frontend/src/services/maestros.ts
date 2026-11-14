import { leerToken } from '../features/auth/login/auth-service';
import { API_URL } from '../lib/api-url';

const MAESTROS = `${API_URL}/maestros`;

/** Ítem de lista maestra viva (endpoint /maestros/*). Fuente única (cero consts). */
export interface Maestro {
  id: number;
  nombre: string;
  area?: string | null;
  abreviatura?: string | null;
}

export interface UbigeoNombres {
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
}

export interface UbigeoOpcion {
  id: number;
  nombre: string;
  padreId?: number;
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
  };
}

async function cargarUbigeo<T>(ruta: string): Promise<T[]> {
  const res = await fetch(`${MAESTROS}/${ruta}`, { headers: headers() });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
  const body: unknown = await res.json();
  if (!Array.isArray(body)) {
    throw new Error('INVALID_RESPONSE');
  }
  return body as T[];
}

interface DepartamentoApi {
  id_departamento: number;
  d_departamento: string;
}

interface ProvinciaApi {
  id_provincia: number;
  d_provincia: string;
  id_departamento: number;
}

interface DistritoApi {
  id_distrito: number;
  d_distrito: string;
  id_provincia: number;
}

export async function listarDepartamentosUbigeo(): Promise<UbigeoOpcion[]> {
  const rows = await cargarUbigeo<DepartamentoApi>('departamentos');
  return rows.map((row) => ({ id: row.id_departamento, nombre: row.d_departamento }));
}

export async function listarProvinciasUbigeo(): Promise<UbigeoOpcion[]> {
  const rows = await cargarUbigeo<ProvinciaApi>('provincias');
  return rows.map((row) => ({
    id: row.id_provincia,
    nombre: row.d_provincia,
    padreId: row.id_departamento,
  }));
}

export async function listarDistritosUbigeo(): Promise<UbigeoOpcion[]> {
  const rows = await cargarUbigeo<DistritoApi>('distritos');
  return rows.map((row) => ({
    id: row.id_distrito,
    nombre: row.d_distrito,
    padreId: row.id_provincia,
  }));
}

/** Lista viva de distritos en el formato de los maestros compartidos. */
export async function listarDistritos(): Promise<Maestro[]> {
  const rows = await listarDistritosUbigeo();
  return rows.map(({ id, nombre }) => ({ id, nombre }));
}
