import type { Ambiente, Mesa, MesaLista, OcupacionMesa } from '../models/mesa.js';
import { MesaError } from '../models/mesa.js';
import type {
  AmbienteCreate,
  AmbienteUpdate,
  MesaCreate,
  MesaEstado,
  MesaQuery,
  MesaUpdate,
} from '../schemas/mesa.js';
import {
  actualizarAmbiente,
  actualizarMesa,
  ambienteActivo,
  auditar,
  cambiarEstadoAmbiente,
  cambiarEstadoMesa,
  crearAmbiente,
  crearMesa,
  existeNumero,
  listarAmbientes,
  listarMesas,
  obtenerMesa,
  obtenerPorQr,
  ocupacionMesas,
  tipoActivo,
} from '../repositories/mesas-repository.js';

export function listarService(q: MesaQuery): Promise<MesaLista> {
  return listarMesas(q);
}

export function ocupacionService(): Promise<OcupacionMesa[]> {
  return ocupacionMesas();
}

export async function obtenerService(id: number): Promise<Mesa> {
  const mesa = await obtenerMesa(id);
  if (!mesa) {
    throw new MesaError('NOT_FOUND');
  }
  return mesa;
}

export async function crearService(
  input: MesaCreate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Mesa> {
  if (!(await ambienteActivo(input.ambienteId))) {
    throw new MesaError('AMBIENTE_INVALIDO');
  }
  if (!(await tipoActivo(input.tipoId))) {
    throw new MesaError('TIPO_INVALIDO');
  }
  const numero = input.numero.trim().toUpperCase();
  if (await existeNumero(input.ambienteId, numero)) {
    throw new MesaError('YA_EXISTE');
  }
  const mesa = await crearMesa({ ...input, numero }, logeo, pc);
  await auditar(idUsuario, 'CREAR_MESA', mesa.id, `${mesa.ambiente} ${mesa.numero}`);
  return mesa;
}

export async function actualizarService(
  id: number,
  input: MesaUpdate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Mesa> {
  const actual = await obtenerMesa(id);
  if (!actual) {
    throw new MesaError('NOT_FOUND');
  }
  const ambienteId = input.ambienteId ?? actual.ambienteId;
  const numero = (input.numero ?? actual.numero).trim().toUpperCase();
  // Candado anti-desync: renombrar sin regenerar dejaría el QR impreso
  // apuntando al número viejo (caso real M-65 vs M-67). Exigir decisión explícita.
  if (
    input.numero !== undefined &&
    numero !== actual.numero.trim().toUpperCase() &&
    !input.regenerarQr
  ) {
    throw new MesaError('QR_DESINCRONIZADO');
  }
  if (
    (input.numero !== undefined || input.ambienteId !== undefined) &&
    (await existeNumero(ambienteId, numero, id))
  ) {
    throw new MesaError('YA_EXISTE');
  }
  if (input.ambienteId !== undefined && !(await ambienteActivo(input.ambienteId))) {
    throw new MesaError('AMBIENTE_INVALIDO');
  }
  if (input.tipoId !== undefined && !(await tipoActivo(input.tipoId))) {
    throw new MesaError('TIPO_INVALIDO');
  }
  const mesa = await actualizarMesa(id, input, logeo, pc);
  if (!mesa) {
    throw new MesaError('NOT_FOUND');
  }
  await auditar(idUsuario, 'EDITAR_MESA', id, `${mesa.ambiente} ${mesa.numero}`);
  if (input.regenerarQr) {
    await auditar(idUsuario, 'REGENERAR_QR', id, mesa.qr ?? '');
  }
  return mesa;
}

export async function cambiarEstadoService(
  id: number,
  input: MesaEstado,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Mesa> {
  const actual = await obtenerMesa(id);
  if (!actual) {
    throw new MesaError('NOT_FOUND');
  }
  const mesa = await cambiarEstadoMesa(id, input.estado, logeo, pc);
  if (!mesa) {
    throw new MesaError('NOT_FOUND');
  }
  await auditar(
    idUsuario,
    input.estado === 'A' ? 'ACTIVAR_MESA' : 'DESACTIVAR_MESA',
    id,
    `${mesa.ambiente} ${mesa.numero}`,
  );
  return mesa;
}

/** Valida un código QR escaneado (`?mesa=<código>`) contra `codigo_qr`. */
export async function obtenerPorQrService(codigo: string): Promise<Mesa> {
  const mesa = await obtenerPorQr(codigo);
  if (!mesa) {
    throw new MesaError('QR_INVALIDO');
  }
  return mesa;
}

export function ambientesService(): Promise<Ambiente[]> {
  return listarAmbientes();
}

export async function crearAmbienteService(
  input: AmbienteCreate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Ambiente> {
  const amb = await crearAmbiente(input, logeo, pc);
  await auditar(idUsuario, 'CREAR_AMBIENTE', amb.id, amb.nombre);
  return amb;
}

export async function actualizarAmbienteService(
  id: number,
  input: AmbienteUpdate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Ambiente> {
  try {
    const amb = await actualizarAmbiente(id, input, logeo, pc);
    if (!amb) {
      throw new MesaError('NOT_FOUND');
    }
    await auditar(idUsuario, 'EDITAR_AMBIENTE', id, amb.nombre);
    return amb;
  } catch (err) {
    if (err instanceof Error && err.message === 'DB_DUPLICATE') {
      throw new MesaError('YA_EXISTE');
    }
    throw err;
  }
}

export async function cambiarEstadoAmbienteService(
  id: number,
  input: MesaEstado,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Ambiente> {
  const amb = await cambiarEstadoAmbiente(id, input.estado, logeo, pc);
  if (!amb) {
    throw new MesaError('NOT_FOUND');
  }
  await auditar(
    idUsuario,
    input.estado === 'A' ? 'ACTIVAR_AMBIENTE' : 'DESACTIVAR_AMBIENTE',
    id,
    amb.nombre,
  );
  return amb;
}
