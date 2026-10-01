import type { Categoria, CategoriaLista } from '../models/categoria.js';
import { CategoriaError } from '../models/categoria.js';
import type {
  CategoriaCreate,
  CategoriaEstado,
  CategoriaQuery,
  CategoriaUpdate,
} from '../schemas/categoria.js';
import {
  actualizarCategoria,
  auditar,
  crearCategoria,
  existeNombre,
  listarCategorias,
  obtenerCategoria,
} from '../repositories/categorias-repository.js';

export function listarService(q: CategoriaQuery): Promise<CategoriaLista> {
  return listarCategorias(q);
}

export async function obtenerService(id: number): Promise<Categoria> {
  const cat = await obtenerCategoria(id);
  if (!cat) {
    throw new CategoriaError('NOT_FOUND');
  }
  return cat;
}

export async function crearService(input: CategoriaCreate, idUsuario: number, logeo: string, pc = ''): Promise<Categoria> {
  if (await existeNombre(input.nombre)) {
    throw new CategoriaError('YA_EXISTE');
  }
  const cat = await crearCategoria(input, logeo, pc);
  await auditar(idUsuario, 'CREAR_CATEGORIA', cat.id, input.nombre);
  return cat;
}

export async function actualizarService(
  id: number,
  input: CategoriaUpdate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Categoria> {
  const actual = await obtenerCategoria(id);
  if (!actual) {
    throw new CategoriaError('NOT_FOUND');
  }
  if (input.nombre && input.nombre.toLowerCase() !== actual.nombre.toLowerCase()) {
    if (await existeNombre(input.nombre, id)) {
      throw new CategoriaError('YA_EXISTE');
    }
  }
  const cat = await actualizarCategoria(id, input, logeo, pc);
  if (!cat) {
    throw new CategoriaError('NOT_FOUND');
  }
  await auditar(idUsuario, 'EDITAR_CATEGORIA', id, cat.nombre);
  return cat;
}

export async function cambiarEstadoService(
  id: number,
  input: CategoriaEstado,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Categoria> {
  const actual = await obtenerCategoria(id);
  if (!actual) {
    throw new CategoriaError('NOT_FOUND');
  }
  if (input.estado === 'I' && !input.confirmar && actual.productosAsociados > 0) {
    throw new CategoriaError('TIENE_PRODUCTOS', actual.productosAsociados);
  }
  const cat = await actualizarCategoria(id, { estado: input.estado }, logeo, pc);
  if (!cat) {
    throw new CategoriaError('NOT_FOUND');
  }
  await auditar(
    idUsuario,
    input.estado === 'A' ? 'ACTIVAR_CATEGORIA' : 'DESACTIVAR_CATEGORIA',
    id,
    cat.nombre,
  );
  return cat;
}
