import { leerToken } from '../../auth/login/auth-service';
import type { Unidad, UnidadForm, UnidadLista } from './unidades-types';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/unidades`;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
  };
}

async function lanzar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      productosAsociados?: number;
    };
    const err = new Error(body.error ?? 'NETWORK_ERROR') as Error & {
      productosAsociados?: number;
    };
    err.productosAsociados = body.productosAsociados;
    throw err;
  }
  return (await res.json()) as T;
}

export function listarUnidades(params: {
  page: number;
  limit: number;
  buscar: string;
  estado: '' | 'A' | 'I';
}): Promise<UnidadLista> {
  const q = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.buscar) {
    q.set('buscar', params.buscar);
  }
  if (params.estado) {
    q.set('estado', params.estado);
  }
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<UnidadLista>);
}

export function crearUnidad(input: UnidadForm): Promise<Unidad> {
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(input) }).then(
    lanzar<Unidad>,
  );
}

export function actualizarUnidad(id: number, input: Partial<UnidadForm>): Promise<Unidad> {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(input),
  }).then(lanzar<Unidad>);
}

export function cambiarEstadoUnidad(
  id: number,
  estado: 'A' | 'I',
  confirmar = false,
): Promise<Unidad> {
  return fetch(`${BASE}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ estado, confirmar }),
  }).then(lanzar<Unidad>);
}
