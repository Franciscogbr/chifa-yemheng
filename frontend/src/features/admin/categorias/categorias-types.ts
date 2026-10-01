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

export interface CategoriaForm {
  nombre: string;
  descripcion: string;
  area: AreaDespacho;
  orden: number;
  estado: EstadoRegistro;
}
