export type TipoProducto = 'P' | 'B' | 'I';
export type EstadoRegistro = 'A' | 'I';

export interface Producto {
  id: number;
  nombre: string;
  codigo: string | null;
  categoriaId: number;
  categoria: string;
  tipo: TipoProducto;
  precio: number;
  costo: number;
  unidadId: number;
  unidad: string;
  stock: number;
  stockMin: number;
  controlaStock: boolean;
  tiempo: number | null;
  disponible: boolean;
  imagen: string | null;
  detalle: string | null;
  afectoIgv: boolean;
  estado: EstadoRegistro;
}

export interface ProductoLista {
  data: Producto[];
  page: number;
  limit: number;
  total: number;
}

export interface ProductoForm {
  nombre: string;
  categoriaId: number;
  unidadId: number;
  tipo: TipoProducto;
  precio: number;
  costo: number;
  stock: number;
  stockMin: number;
  controlaStock: boolean;
  tiempo: number;
  disponible: boolean;
  imagen: string;
  detalle: string;
  afectoIgv: boolean;
  codigo: string;
  estado: EstadoRegistro;
}

export const TIPOS: { valor: TipoProducto; label: string }[] = [
  { valor: 'P', label: 'Preparado' },
  { valor: 'B', label: 'Bebida' },
  { valor: 'I', label: 'Insumo' },
];

/**
 * Prefijo de código por categoría (convención de seeds: prefijo de familia + número).
 * Categoría nueva = acordar prefijo de 3 letras y agregarlo aquí.
 */
export const PREFIJO_POR_CATEGORIA: Record<string, string> = {
  'SOPAS ORIENTALES': 'SOP',
  'PLATOS CHIFA': 'CHF',
  ENTRADAS: 'ENT',
  'PLATOS DE FONDO': 'PLF',
  CRIOLLOS: 'CRI',
  MARINOS: 'MAR',
  'BEBIDAS FRIAS': 'BEF',
  'BEBIDAS ORIENTALES': 'BEO',
  'BEBIDAS CALIENTES': 'BEC',
  LICORES: 'LIC',
  POSTRES: 'POS',
  INSUMOS: 'INS',
};

export function prefijoParaCategoria(nombre: string): string {
  const fijo = PREFIJO_POR_CATEGORIA[(nombre ?? '').toUpperCase()];
  if (fijo) {
    return fijo;
  }
  const letras = (nombre ?? '').toUpperCase().replace(/[^A-Z]/g, '');
  return (letras.slice(0, 3) || 'PRD').padEnd(3, 'X');
}

/** Solo el Preparado lleva cocción; Bebida e Insumo no aplican. */
export function requiereTiempo(tipo: TipoProducto): boolean {
  return tipo === 'P';
}

/** Siguiente correlativo del prefijo: max(sufijo numérico) + 1, relleno a 3 dígitos. */
export function siguienteCodigo(prefijo: string, existentes: string[]): string {
  const pre = prefijo.toUpperCase();
  let max = 0;
  for (const c of existentes) {
    const m = /^([A-Za-z]+)(\d+)$/.exec(c.trim());
    if (m && m[1].toUpperCase() === pre) {
      max = Math.max(max, parseInt(m[2], 10));
    }
  }
  return `${pre}${String(max + 1).padStart(3, '0')}`;
}

/** Unidades base (UNIDAD_MEDIDA seed). Endpoint propio queda como mejora. */
export const UNIDADES: { id: number; label: string }[] = [
  { id: 1, label: 'Unidad' },
  { id: 2, label: 'Porción' },
  { id: 3, label: 'Jarra' },
  { id: 4, label: 'Kilogramo' },
  { id: 5, label: 'Litro' },
];
