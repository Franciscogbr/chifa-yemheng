import { leerToken } from '../../auth/login/auth-service';
import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/inventario`;

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

export interface KardexItem {
  id: number;
  productoId: number;
  producto: string;
  codigo: string;
  categoria: string | null;
  clasificacion: string | null;
  unidad: string | null;
  tipo: string;
  tipoMovimientoLabel: string;
  cantidad: number;
  stockAnterior: number;
  saldo: number;
  costoUnitario: number;
  costoTotal: number;
  documento: string | null;
  descripcion: string | null;
  fecha: string;
  usuario: string | null;
  esEntrada: boolean;
  esSalida: boolean;
}

export interface KardexIndicadores {
  stockActual: number;
  totalEntradas: number;
  totalSalidas: number;
  stockInicial: number;
  stockFinal: number;
  valorizacionTotal: number;
}

export interface KardexLista {
  data: KardexItem[];
  page: number;
  limit: number;
  total: number;
  indicadores: KardexIndicadores;
}

export interface KardexFilter {
  page?: number;
  limit?: number;
  productoId?: number;
  nombre?: string;
  categoriaId?: number;
  clasificacion?: string;
  tipo?: 'E' | 'S' | 'A' | 'M';
  desde?: string;
  hasta?: string;
}

export interface CategoriaOpcion {
  id: number;
  nombre: string;
}

export function listarKardex(f: KardexFilter): Promise<KardexLista> {
  const q = new URLSearchParams({ page: String(f.page ?? 1), limit: String(f.limit ?? 50) });
  if (f.productoId) q.set('productoId', String(f.productoId));
  if (f.nombre) q.set('nombre', f.nombre);
  if (f.categoriaId) q.set('categoriaId', String(f.categoriaId));
  if (f.clasificacion) q.set('clasificacion', f.clasificacion);
  if (f.tipo) q.set('tipo', f.tipo);
  if (f.desde) q.set('desde', f.desde);
  if (f.hasta) q.set('hasta', f.hasta);
  return fetch(`${BASE}/kardex?${q.toString()}`, { headers: headers() }).then(lanzar<KardexLista>);
}

export function listarCategorias(): Promise<CategoriaOpcion[]> {
  return fetch(`${API_URL}/categorias/`, { headers: headers() }).then(async (res) => {
    if (!res.ok) throw new Error('NETWORK_ERROR');
    const data = await res.json();
    const items = (data.data ?? data ?? []) as Array<{ id: number; nombre: string }>;
    return items.map((c) => ({
      id: c.id,
      nombre: c.nombre,
    }));
  });
}
