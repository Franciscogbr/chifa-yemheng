import type { Producto, ProductoLista } from '../models/producto.js';
import { ProductoError } from '../models/producto.js';
import type {
  ProductoCreate,
  ProductoEstado,
  ProductoQuery,
  ProductoUpdate,
} from '../schemas/producto.js';
import {
  actualizarProducto,
  auditar,
  categoriaActiva,
  crearProducto,
  existeCodigo,
  listarProductos,
  obtenerProducto,
} from '../repositories/productos-repository.js';

export function listarService(q: ProductoQuery): Promise<ProductoLista> {
  return listarProductos(q);
}

export async function obtenerService(id: number): Promise<Producto> {
  const prod = await obtenerProducto(id);
  if (!prod) {
    throw new ProductoError('NOT_FOUND');
  }
  return prod;
}

export async function crearService(
  input: ProductoCreate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Producto> {
  if (!(await categoriaActiva(input.categoriaId))) {
    throw new ProductoError('CATEGORIA_INVALIDA');
  }
  if (input.codigo?.trim() && (await existeCodigo(input.codigo.trim()))) {
    throw new ProductoError('YA_EXISTE');
  }
  const prod = await crearProducto(input, logeo, pc);
  await auditar(idUsuario, 'CREAR_PRODUCTO', prod.id, prod.nombre);
  return prod;
}

export async function actualizarService(
  id: number,
  input: ProductoUpdate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Producto> {
  const actual = await obtenerProducto(id);
  if (!actual) {
    throw new ProductoError('NOT_FOUND');
  }
  if (input.categoriaId !== undefined && !(await categoriaActiva(input.categoriaId))) {
    throw new ProductoError('CATEGORIA_INVALIDA');
  }
  if (input.codigo !== undefined && input.codigo?.trim()) {
    if (await existeCodigo(input.codigo.trim(), id)) {
      throw new ProductoError('YA_EXISTE');
    }
  }
  const prod = await actualizarProducto(id, input, logeo, pc);
  if (!prod) {
    throw new ProductoError('NOT_FOUND');
  }
  await auditar(idUsuario, 'EDITAR_PRODUCTO', id, prod.nombre);
  return prod;
}

export async function cambiarEstadoService(
  id: number,
  input: ProductoEstado,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Producto> {
  const actual = await obtenerProducto(id);
  if (!actual) {
    throw new ProductoError('NOT_FOUND');
  }
  const prod = await actualizarProducto(id, { estado: input.estado }, logeo, pc);
  if (!prod) {
    throw new ProductoError('NOT_FOUND');
  }
  await auditar(
    idUsuario,
    input.estado === 'A' ? 'ACTIVAR_PRODUCTO' : 'DESACTIVAR_PRODUCTO',
    id,
    prod.nombre,
  );
  return prod;
}
