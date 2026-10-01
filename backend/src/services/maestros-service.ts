import type { Maestro } from '../repositories/maestros-repository.js';
import {
  listarCargos,
  listarContratos,
  listarDistritos,
  listarTiposIdentidad,
} from '../repositories/maestros-repository.js';

/** Listas maestras vivas para formularios (cero constantes en frontend). */
export function distritosService(): Promise<Maestro[]> {
  return listarDistritos();
}

export function cargosService(): Promise<Maestro[]> {
  return listarCargos();
}

export function contratosService(): Promise<Maestro[]> {
  return listarContratos();
}

export function tiposIdentidadService(): Promise<Maestro[]> {
  return listarTiposIdentidad();
}
