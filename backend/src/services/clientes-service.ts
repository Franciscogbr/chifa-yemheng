import type { Cliente, ClienteLista } from '../models/cliente.js';
import { ClienteError } from '../models/cliente.js';
import type {
  ClienteCreate,
  ClienteEstado,
  ClienteQuery,
  ClienteUpdate,
} from '../schemas/cliente.js';
import {
  actualizarCliente,
  auditar,
  cambiarEstadoCliente,
  crearCliente,
  existeDocumento,
  listarClientes,
  obtenerCliente,
} from '../repositories/clientes-repository.js';

export function listarService(q: ClienteQuery): Promise<ClienteLista> {
  return listarClientes(q);
}

export async function obtenerService(id: number): Promise<Cliente> {
  const cli = await obtenerCliente(id);
  if (!cli) {
    throw new ClienteError('NOT_FOUND');
  }
  return cli;
}

export async function crearService(
  input: ClienteCreate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Cliente> {
  const doc = input.tipo === 'N' ? input.dni : input.ruc;
  if (await existeDocumento(input.tipo, doc)) {
    throw new ClienteError('YA_EXISTE');
  }
  const cli = await crearCliente(input, logeo, pc);
  await auditar(idUsuario, 'CREAR_CLIENTE', cli.id, cli.nombre);
  return cli;
}

export async function actualizarService(
  id: number,
  input: ClienteUpdate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Cliente> {
  const actual = await obtenerCliente(id);
  if (!actual) {
    throw new ClienteError('NOT_FOUND');
  }
  const cli = await actualizarCliente(id, input, logeo, pc);
  if (!cli) {
    throw new ClienteError('NOT_FOUND');
  }
  await auditar(idUsuario, 'EDITAR_CLIENTE', id, cli.nombre);
  return cli;
}

export async function cambiarEstadoService(
  id: number,
  input: ClienteEstado,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Cliente> {
  const actual = await obtenerCliente(id);
  if (!actual) {
    throw new ClienteError('NOT_FOUND');
  }
  const cli = await cambiarEstadoCliente(id, input.estado, logeo, pc);
  if (!cli) {
    throw new ClienteError('NOT_FOUND');
  }
  await auditar(
    idUsuario,
    input.estado === 'A' ? 'ACTIVAR_CLIENTE' : 'DESACTIVAR_CLIENTE',
    id,
    cli.nombre,
  );
  return cli;
}
