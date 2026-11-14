import { leerToken } from '../../auth/login/auth-service';
import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/inventario`;
const PRODUCTOS_BASE = `${API_URL}/productos`;

function headers(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${leerToken() ?? ''}` };
}

async function lanzar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
  return (await res.json()) as T;
}

export interface Receta {
  id: number;
  productoId: number;
  producto: string;
  insumoId: number;
  insumo: string;
  cantidad: number;
  unidad: string;
  estado: 'A' | 'I' | 'E';
}

export interface RecetaLista {
  data: Receta[];
  page: number;
  limit: number;
  total: number;
}

export interface OpcionProducto {
  id: number;
  nombre: string;
}

export interface RecetaCostoDetalleView {
  insumo: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  subtotal: number;
}

export interface RecetaCostoView {
  productoId: number;
  producto: string;
  costoTotal: number;
  detalles: RecetaCostoDetalleView[];
}

export function listarPlatosParaSelect(): Promise<OpcionProducto[]> {
  return fetch(`${PRODUCTOS_BASE}?estado=A`, { headers: headers() })
    .then(async (res) => {
      if (!res.ok) throw new Error('NETWORK_ERROR');
      const data = await res.json();
      const platos = (data.data ?? data ?? []).filter((p: any) => p.tipo === 'P');
      return platos.map((p: any) => ({ id: p.id_producto || p.id, nombre: p.n_producto || p.nombre }));
    });
}

export function listarInsumosParaSelect(): Promise<OpcionProducto[]> {
  return fetch(`${PRODUCTOS_BASE}?estado=A`, { headers: headers() })
    .then(async (res) => {
      if (!res.ok) throw new Error('NETWORK_ERROR');
      const data = await res.json();
      const insumos = (data.data ?? data ?? []).filter((p: any) => p.tipo === 'I');
      return insumos.map((p: any) => ({ id: p.id_producto || p.id, nombre: p.n_producto || p.nombre }));
    });
}

export function getCostoReceta(productoId: number): Promise<RecetaCostoView> {
  const q = new URLSearchParams({ productoId: String(productoId) });
  return fetch(`${BASE}/recetas/costo?${q.toString()}`, { headers: headers() }).then(lanzar<RecetaCostoView>);
}

export function listarRecetas(f: { page: number; limit: number; productoId?: number; texto?: string; estado?: 'A' | 'I' }): Promise<RecetaLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.productoId) q.set('productoId', String(f.productoId));
  if (f.texto) q.set('texto', f.texto);
  if (f.estado) q.set('estado', f.estado);
  return fetch(`${BASE}/recetas?${q.toString()}`, { headers: headers() }).then(lanzar<RecetaLista>);
}

export function crearReceta(input: { productoId: number; insumoId: number; cantidad: number }): Promise<Receta> {
  return fetch(`${BASE}/recetas`, { method: 'POST', headers: headers(), body: JSON.stringify(input) }).then(lanzar<Receta>);
}

export function actualizarReceta(id: number, input: { cantidad?: number; estado?: 'A' | 'I' }): Promise<Receta> {
  return fetch(`${BASE}/recetas/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(input),
  }).then(lanzar<Receta>);
}
