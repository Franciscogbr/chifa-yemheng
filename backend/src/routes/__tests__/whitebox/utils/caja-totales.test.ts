import { describe, expect, it } from 'vitest';
import {
  resumirMovimientosPorMedio,
  type MovimientoMedio,
} from '../../../../utils/caja-totales.js';

describe('Caja blanca - caja-totales', () => {
  it('agrupa movimientos por medio y aplica signo según tipo', () => {
    const movimientos: MovimientoMedio[] = [
      { medio: 'EFECTIVO', monto: 100, tipoMovimiento: 'INGRESO' },
      { medio: 'EFECTIVO', monto: 30, tipoMovimiento: 'EGRESO' },
      { medio: 'YAPE', monto: 50, tipoMovimiento: 'INGRESO' },
      { medio: 'TARJETA', monto: 200, tipoMovimiento: 'INGRESO' },
      { medio: 'TARJETA', monto: 20, tipoMovimiento: 'EGRESO' },
    ];

    const result = resumirMovimientosPorMedio(movimientos);

    expect(result).toHaveLength(3);
    expect(result.find((r) => r.medio === 'EFECTIVO')?.total).toBe(70);
    expect(result.find((r) => r.medio === 'YAPE')?.total).toBe(50);
    expect(result.find((r) => r.medio === 'TARJETA')?.total).toBe(180);
  });

  it('rechaza tipo de movimiento inválido', () => {
    const movimientos: MovimientoMedio[] = [
      { medio: 'EFECTIVO', monto: 100, tipoMovimiento: 'OTRO' },
    ];

    expect(() => resumirMovimientosPorMedio(movimientos)).toThrow(
      'MOVIMIENTO_CAJA_INVALIDO',
    );
  });

  it('rechaza monto no finito', () => {
    const movimientos: MovimientoMedio[] = [
      { medio: 'EFECTIVO', monto: Number.NaN, tipoMovimiento: 'INGRESO' },
    ];

    expect(() => resumirMovimientosPorMedio(movimientos)).toThrow(
      'MOVIMIENTO_CAJA_INVALIDO',
    );
  });

  it('devuelve array vacío cuando no hay movimientos', () => {
    const result = resumirMovimientosPorMedio([]);
    expect(result).toEqual([]);
  });

  it('ignora mayúsculas/minúsculas en tipo de movimiento', () => {
    const movimientos: MovimientoMedio[] = [
      { medio: 'EFECTIVO', monto: 100, tipoMovimiento: 'ingreso' },
      { medio: 'EFECTIVO', monto: 40, tipoMovimiento: 'egreso' },
    ];

    const result = resumirMovimientosPorMedio(movimientos);
    expect(result[0].total).toBe(60);
  });
});
