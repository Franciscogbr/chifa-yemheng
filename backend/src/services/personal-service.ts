import type { Personal, PersonalLista } from '../models/personal.js';
import { PersonalError } from '../models/personal.js';
import type {
  PersonalCreate,
  PersonalEstado,
  PersonalQuery,
  PersonalUpdate,
} from '../schemas/personal.js';
import {
  actualizarPersonal,
  auditar,
  cambiarEstadoPersonal,
  crearPersonal,
  existeDocumento,
  listarPersonal,
  obtenerPersonal,
} from '../repositories/personal-repository.js';

export function listarService(q: PersonalQuery): Promise<PersonalLista> {
  return listarPersonal(q);
}

export async function obtenerService(id: number): Promise<Personal> {
  const per = await obtenerPersonal(id);
  if (!per) {
    throw new PersonalError('NOT_FOUND');
  }
  return per;
}

export async function crearService(
  input: PersonalCreate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Personal> {
  if (input.tipoDoc === 'DNI' && !/^\d{8}$/.test(input.documento)) {
    throw new PersonalError('VALIDATION_ERROR');
  }
  if (await existeDocumento(input.tipoDoc, input.documento)) {
    throw new PersonalError('YA_EXISTE');
  }
  const per = await crearPersonal(input, logeo, pc);
  await auditar(idUsuario, 'CREAR_EMPLEADO', per.id, `${per.nombres} ${per.apPaterno}`);
  return per;
}

export async function actualizarService(
  id: number,
  input: PersonalUpdate,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Personal> {
  const actual = await obtenerPersonal(id);
  if (!actual) {
    throw new PersonalError('NOT_FOUND');
  }
  const per = await actualizarPersonal(id, input, logeo, pc);
  if (!per) {
    throw new PersonalError('NOT_FOUND');
  }
  await auditar(idUsuario, 'EDITAR_EMPLEADO', id, `${per.nombres} ${per.apPaterno}`);
  return per;
}

export async function cambiarEstadoService(
  id: number,
  input: PersonalEstado,
  idUsuario: number,
  logeo: string,
  pc = '',
): Promise<Personal> {
  const actual = await obtenerPersonal(id);
  if (!actual) {
    throw new PersonalError('NOT_FOUND');
  }
  const per = await cambiarEstadoPersonal(id, input.estado, logeo, pc);
  if (!per) {
    throw new PersonalError('NOT_FOUND');
  }
  await auditar(
    idUsuario,
    input.estado === 'A' ? 'ACTIVAR_EMPLEADO' : 'CESAR_EMPLEADO',
    id,
    `${per.nombres} ${per.apPaterno}`,
  );
  return per;
}
