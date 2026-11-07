import { describe, expect, it } from 'vitest';
import { cobroCajaSchema, movimientoCajaSchema, turnoCajaSchema } from './caja.js';
import { resumirMovimientosPorMedio } from '../utils/caja-totales.js';

describe('schemas de caja', () => {
  it('acepta observación opcional en apertura y limita su longitud a 200', () => {
    const base = { cajaId: 1, montoInicial: 300 };
    expect(turnoCajaSchema.safeParse(base).success).toBe(true);
    expect(turnoCajaSchema.parse(base).observacion).toBe('');
    expect(turnoCajaSchema.safeParse({ ...base, observacion: 'Fondo inicial contado' }).success).toBe(true);
    expect(turnoCajaSchema.safeParse({ ...base, observacion: 'x'.repeat(201) }).success).toBe(false);
  });
  it('acepta varios medios de pago en el mismo cobro', () => {
    const parsed = cobroCajaSchema.safeParse({
      pedidoId: 14,
      cajaId: 2,
      tipoDocumento: '03',
      clienteId: null,
      pagos: [
        { metodoPagoId: 1, monto: 20, montoRecibido: 25, referencia: '', banco: '' },
        { metodoPagoId: 2, monto: 15, referencia: 'POS-103', banco: '' },
      ],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.pagos).toHaveLength(2);
      expect(parsed.data.pagos[0].montoRecibido).toBe(25);
    }
  });

  it('rechaza importes no positivos y cobros sin líneas de pago', () => {
    const base = { pedidoId: 14, cajaId: 2, pagos: [] };
    expect(cobroCajaSchema.safeParse(base).success).toBe(false);
    expect(cobroCajaSchema.safeParse({
      ...base,
      pagos: [{ metodoPagoId: 1, monto: 0 }],
    }).success).toBe(false);
  });

  it('valida la forma del movimiento manual', () => {
    expect(movimientoCajaSchema.safeParse({
      cajaId: 2,
      conceptoId: 7,
      metodoPagoId: 1,
      monto: 10,
      descripcion: 'Ingreso adicional',
    }).success).toBe(true);
    expect(movimientoCajaSchema.safeParse({
      cajaId: 2,
      conceptoId: 7,
      metodoPagoId: 1,
      monto: 0,
      descripcion: 'Ingreso adicional',
    }).success).toBe(false);
  });

  it('acumula ingresos y resta egresos del saldo de cada medio', () => {
    expect(resumirMovimientosPorMedio([
      { medio: 'EFECTIVO', monto: 100, tipoMovimiento: 'INGRESO' },
      { medio: 'EFECTIVO', monto: 25, tipoMovimiento: 'EGRESO' },
      { medio: 'YAPE', monto: 40, tipoMovimiento: 'INGRESO' },
      { medio: 'YAPE', monto: 10, tipoMovimiento: 'EGRESO' },
    ])).toEqual([
      { medio: 'EFECTIVO', total: 75 },
      { medio: 'YAPE', total: 30 },
    ]);
  });

  it('rechaza movimientos con tipo o importe inválido al calcular los saldos', () => {
    expect(() => resumirMovimientosPorMedio([
      { medio: 'EFECTIVO', monto: 10, tipoMovimiento: 'AJUSTE' },
    ])).toThrow('MOVIMIENTO_CAJA_INVALIDO');
    expect(() => resumirMovimientosPorMedio([
      { medio: 'EFECTIVO', monto: Number.NaN, tipoMovimiento: 'INGRESO' },
    ])).toThrow('MOVIMIENTO_CAJA_INVALIDO');
  });
});
