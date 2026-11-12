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

export interface Movimiento {
  id: number;
  productoId: number;
  producto: string;
  tipo: string;
  cantidad: number;
  costo: number;
  motivo: string | null;
  fecha: string;
}

export interface MovimientoLista {
  data: Movimiento[];
  page: number;
  limit: number;
  total: number;
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

export interface StockInsumoView {
  idProducto: number;
  producto: string;
  categoriaId: number | null;
  categoria: string | null;
  stockActual: number;
  stockMinimo: number;
  unidadId: number | null;
  unidadMedida: string | null;
  estadoBajoStock: boolean;
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

export function getStockBajo(): Promise<StockInsumoView[]> {
  return fetch(`${BASE}/stock/bajo`, { headers: headers() }).then(lanzar<StockInsumoView[]>);
}

export function getStockInsumos(f: {
  productoId?: number;
  nombre?: string;
  categoriaId?: number;
  unidadId?: number;
  stockMinimoDesde?: number;
  stockMinimoHasta?: number;
  stockActualDesde?: number;
  stockActualHasta?: number;
  soloBajoStock?: boolean;
  ordenarPor?: 'nombre' | 'stock_actual' | 'stock_minimo';
  ordenDireccion?: 'asc' | 'desc';
}): Promise<StockInsumoView[]> {
  const q = new URLSearchParams();
  if (f.productoId) q.set('productoId', String(f.productoId));
  if (f.nombre) q.set('nombre', f.nombre);
  if (f.categoriaId) q.set('categoriaId', String(f.categoriaId));
  if (f.unidadId) q.set('unidadId', String(f.unidadId));
  if (f.stockMinimoDesde !== undefined) q.set('stockMinimoDesde', String(f.stockMinimoDesde));
  if (f.stockMinimoHasta !== undefined) q.set('stockMinimoHasta', String(f.stockMinimoHasta));
  if (f.stockActualDesde !== undefined) q.set('stockActualDesde', String(f.stockActualDesde));
  if (f.stockActualHasta !== undefined) q.set('stockActualHasta', String(f.stockActualHasta));
  if (f.soloBajoStock !== undefined) q.set('soloBajoStock', String(f.soloBajoStock));
  if (f.ordenarPor) q.set('ordenarPor', f.ordenarPor);
  if (f.ordenDireccion) q.set('ordenDireccion', f.ordenDireccion);
  return fetch(`${BASE}/stock?${q.toString()}`, { headers: headers() }).then(lanzar<StockInsumoView[]>);
}

export function getCostoReceta(productoId: number): Promise<RecetaCostoView> {
  const q = new URLSearchParams({ productoId: String(productoId) });
  return fetch(`${BASE}/recetas/costo?${q.toString()}`, { headers: headers() }).then(lanzar<RecetaCostoView>);
}

export function listarMovimientos(f: { page: number; limit: number; productoId?: number; tipo?: string; desde?: string; hasta?: string }): Promise<MovimientoLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.productoId) q.set('productoId', String(f.productoId));
  if (f.tipo) q.set('tipo', f.tipo);
  if (f.desde) q.set('desde', f.desde);
  if (f.hasta) q.set('hasta', f.hasta);
  return fetch(`${BASE}/movimientos?${q.toString()}`, { headers: headers() }).then(lanzar<MovimientoLista>);
}

export function crearMovimiento(input: { productoId: number; tipo: string; cantidad: number; costo?: number; motivo?: string }): Promise<Movimiento> {
  return fetch(`${BASE}/movimientos`, { method: 'POST', headers: headers(), body: JSON.stringify(input) }).then(lanzar<Movimiento>);
}

export function listarRecetas(f: { page: number; limit: number; productoId?: number }): Promise<RecetaLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.productoId) q.set('productoId', String(f.productoId));
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
