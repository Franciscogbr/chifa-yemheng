import { leerToken } from '../../auth/login/auth-service';
import { headerEquipo } from '../../../utils/equipo';
import type { Categoria, CategoriaForm, CategoriaLista } from './categorias-types';

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/categorias`;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
    ...headerEquipo(),
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

export function listarCategorias(params: {
  page: number;
  limit: number;
  nombre: string;
  estado: '' | 'A' | 'I';
}): Promise<CategoriaLista> {
  const q = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.nombre) {
    q.set('nombre', params.nombre);
  }
  if (params.estado) {
    q.set('estado', params.estado);
  }
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<CategoriaLista>);
}

export function crearCategoria(input: CategoriaForm): Promise<Categoria> {
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(input) }).then(
    lanzar<Categoria>,
  );
}

export function actualizarCategoria(id: number, input: Partial<CategoriaForm>): Promise<Categoria> {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(input),
  }).then(lanzar<Categoria>);
}

export function cambiarEstadoCategoria(
  id: number,
  estado: 'A' | 'I',
  confirmar = false,
): Promise<Categoria> {
  return fetch(`${BASE}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ estado, confirmar }),
  }).then(lanzar<Categoria>);
}
