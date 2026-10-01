/** Tipos del módulo categorías (categorias.md + CATEGORIA_PRODUCTO). */
export type AreaDespacho = 'COCINA' | 'BARRA';
export type EstadoRegistro = 'A' | 'I';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  area: AreaDespacho;
  orden: number;
  estado: EstadoRegistro;
  productosAsociados: number;
  fCreacion: string;
}

export interface CategoriaLista {
  data: Categoria[];
  page: number;
  limit: number;
  total: number;
}

export type CategoriaErrorCode =
  | 'YA_EXISTE'
  | 'NOT_FOUND'
  | 'TIENE_PRODUCTOS'
  | 'VALIDATION_ERROR';

export class CategoriaError extends Error {
  readonly code: CategoriaErrorCode;
  readonly productosAsociados?: number;

  constructor(code: CategoriaErrorCode, productosAsociados?: number) {
    super(code);
    this.code = code;
    this.productosAsociados = productosAsociados;
  }
}
