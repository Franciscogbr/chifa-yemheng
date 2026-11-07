import { describe, expect, it } from 'vitest';
import { modoPagoMesaSchema, joinSettingSchema } from './pedido.js';

describe('modo de pago de mesa y ajuste de participación (S1, S4)', () => {
  it('modoPagoMesaSchema acepta CUENTA_UNICA y POR_CONSUMO', () => {
    expect(modoPagoMesaSchema.safeParse({ modo: 'CUENTA_UNICA' }).success).toBe(true);
    expect(modoPagoMesaSchema.safeParse({ modo: 'POR_CONSUMO' }).success).toBe(true);
  });

  it('joinSettingSchema acepta aceptaParticipantes booleano', () => {
    expect(joinSettingSchema.safeParse({ aceptaParticipantes: true }).success).toBe(true);
    expect(joinSettingSchema.safeParse({ aceptaParticipantes: false }).success).toBe(true);
  });

  it('joinSettingSchema rechaza campo faltante y valor no booleano', () => {
    expect(joinSettingSchema.safeParse({}).success).toBe(false);
    expect(joinSettingSchema.safeParse({ aceptaParticipantes: 'sí' }).success).toBe(false);
    expect(joinSettingSchema.safeParse({ aceptaParticipantes: 1 }).success).toBe(false);
  });
});
