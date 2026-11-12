/** Tipos del módulo inventario (MOVIMIENTO_INVENTARIO, RECETA). */
export type TipoMovimiento = 'E' | 'S' | 'A' | 'M';
export type TipoProductoInv = 'P' | 'B' | 'I';

export interface MovimientoInventario {
  id: number;
  productoId: number;
  producto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  costo: number;
  motivo: string | null;
  fecha: string;
  usuarioId: number | null;
}

export interface MovimientoLista {
  data: MovimientoInventario[];
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

export interface StockInsumo {
  idProducto: number;
  producto: string;
  tipoProducto: string;
  categoriaId: number | null;
  stockActual: number;
  stockMinimo: number;
  unidadId: number | null;
  unidadMedida: string | null;
  estadoBajoStock: boolean;
}

export interface RecetaCostoDetalle {
  insumoId: number;
  insumo: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  subtotal: number;
}

export interface RecetaCostoResultado {
  productoId: number;
  producto: string;
  costoTotal: number;
  detalles: RecetaCostoDetalle[];
}

export type InventarioErrorCode = 'NOT_FOUND' | 'PRODUCTO_INVALIDO' | 'INSUMO_INVALIDO' | 'STOCK_INSUFICIENTE' | 'RECETA_DUPLICADA' | 'VALIDATION_ERROR';

export class InventarioError extends Error {
  readonly code: InventarioErrorCode;

  constructor(code: InventarioErrorCode) {
    super(code);
    this.code = code;
  }
}
