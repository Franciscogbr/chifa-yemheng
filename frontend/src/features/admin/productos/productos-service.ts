import { leerToken } from '../../auth/login/auth-service';
import { headerEquipo } from '../../../utils/equipo';
import type { Producto, ProductoForm, ProductoLista } from './productos-types';

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/productos`;
const BASE_CAT = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/categorias`;

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

export interface FiltrosProductos {
  page: number;
  limit: number;
  nombre: string;
  categoria: number | '';
  estado: '' | 'A' | 'I';
  disponible: '' | 'S' | 'N';
}

export function listarProductos(f: FiltrosProductos): Promise<ProductoLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.nombre) {
    q.set('nombre', f.nombre);
  }
  if (f.categoria !== '') {
    q.set('categoria', String(f.categoria));
  }
  if (f.estado) {
    q.set('estado', f.estado);
  }
  if (f.disponible) {
    q.set('disponible', f.disponible);
  }
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<ProductoLista>);
}

export function crearProducto(input: ProductoForm): Promise<Producto> {
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(input) }).then(
    lanzar<Producto>,
  );
}

export function actualizarProducto(id: number, input: Partial<ProductoForm>): Promise<Producto> {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(input),
  }).then(lanzar<Producto>);
}

export function cambiarEstadoProducto(id: number, estado: 'A' | 'I'): Promise<Producto> {
  return fetch(`${BASE}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ estado }),
  }).then(lanzar<Producto>);
}

/**
 * Códigos existentes con el prefijo dado (barrido paginado: la API no filtra por código).
 * Sirve para sugerir el siguiente correlativo en el modal.
 */
export async function listarCodigosConPrefijo(prefijo: string): Promise<string[]> {
  const LIM = 100;
  const pre = prefijo.toUpperCase();
  const codigos: string[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;
  let leidos = 0;
  while (leidos < total) {
    const res = await listarProductos({ page, limit: LIM, nombre: '', categoria: '', estado: '', disponible: '' });
    total = res.total;
    leidos += res.data.length;
    for (const p of res.data) {
      if (p.codigo && p.codigo.toUpperCase().startsWith(pre)) {
        codigos.push(p.codigo);
      }
    }
    if (res.data.length === 0) {
      break;
    }
    page += 1;
  }
  return codigos;
}

export interface CategoriaOpcion {
  id: number;
  nombre: string;
}

export async function listarCategoriasActivas(): Promise<CategoriaOpcion[]> {
  const res = await fetch(`${BASE_CAT}?limit=100&estado=A`, { headers: headers() }).then(
    lanzar<{ data: { id: number; nombre: string }[] }>,
  );
  return res.data;
}
