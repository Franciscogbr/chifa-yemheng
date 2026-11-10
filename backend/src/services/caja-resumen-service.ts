import {
  getMovimientosResumenPorMetodo,
  type MovimientoResumen,
} from '../repositories/caja-resumen-repository.js';

export async function getMovimientosResumenService(
  aperturaId: number,
): Promise<MovimientoResumen> {
  return getMovimientosResumenPorMetodo(aperturaId);
}
