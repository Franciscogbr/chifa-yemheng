import { leerToken } from '../../auth/login/auth-service';
import type { Producto, ProductoForm, ProductoLista, TipoProducto } from './productos-types';

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/productos`;
const BASE_CAT = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/categorias`;
const BASE_UNI = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/unidades`;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
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
  tipo: TipoProducto | '';
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
  if (f.tipo) {
    q.set('tipo', f.tipo);
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

export async function listarUnidadesActivas(): Promise<{ id: number; nombre: string }[]> {
  const res = await fetch(`${BASE_UNI}?limit=100&estado=A`, { headers: headers() }).then(
    lanzar<{ data: { id: number; nombre: string }[] }>,
  );
  return res.data;
}
