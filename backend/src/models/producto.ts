/** Tipos del módulo productos (productos.md + PRODUCTO). */
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

export type ProductoErrorCode =
  | 'YA_EXISTE'
  | 'NOT_FOUND'
  | 'CATEGORIA_INVALIDA'
  | 'VALIDATION_ERROR';

export class ProductoError extends Error {
  readonly code: ProductoErrorCode;

  constructor(code: ProductoErrorCode) {
    super(code);
    this.code = code;
  }
}
