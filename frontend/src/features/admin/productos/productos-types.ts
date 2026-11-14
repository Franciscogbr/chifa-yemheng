export type TipoProducto = 'P' | 'B' | 'I';
export type EstadoRegistro = 'A' | 'I';

export interface Producto {
  id: number;
  nombre: string;

  categoriaId: number;
  categoria: string;
  clasificacion: string | null;
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
  clasificacion?: string | null;
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
  estado: EstadoRegistro;
}

export const TIPOS: { valor: TipoProducto; label: string }[] = [
  { valor: 'P', label: 'Preparado' },
  { valor: 'B', label: 'Bebida' },
  { valor: 'I', label: 'Insumo' },
];

export const CLASIFICACIONES: { valor: string; label: string }[] = [
  { valor: 'ABARROTES', label: 'Abarrotes' },
  { valor: 'CARNES', label: 'Carnes' },
  { valor: 'VEGETALES', label: 'Vegetales' },
  { valor: 'MARISCOS', label: 'Mariscos' },
  { valor: 'LACTEOS', label: 'Lácteos' },
  { valor: 'BEBIDAS', label: 'Bebidas' },
  { valor: 'LICORES', label: 'Licores' },
  { valor: 'POSTRES', label: 'Postres' },
  { valor: 'PLATOS', label: 'Platos' },
  { valor: 'SOPAS', label: 'Sopas' },
  { valor: 'CHIFA', label: 'Chifa' },
  { valor: 'COMBOS', label: 'Combos' },
  { valor: 'ENTRADAS', label: 'Entradas' },
  { valor: 'ESPECIAS', label: 'Especias' },
  { valor: 'ALMACEN', label: 'Almacén' },
  { valor: 'GENERAL', label: 'General' },
];

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
