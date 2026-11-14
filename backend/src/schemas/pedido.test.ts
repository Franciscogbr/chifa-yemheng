import { describe, expect, it } from 'vitest';
import { modoPagoMesaSchema, joinSettingSchema, reservaAtencionClienteSchema, tandaSchema } from './pedido.js';
import { reservaAtencionSchema } from './reservas.js';

describe('modo de pago de mesa y ajuste de participación (S1, S4)', () => {
  it('modoPagoMesaSchema acepta CUENTA_UNICA y POR_CONSUMO', () => {
    expect(modoPagoMesaSchema.safeParse({ modo: 'CUENTA_UNICA' }).success).toBe(true);
    expect(modoPagoMesaSchema.safeParse({ modo: 'POR_CONSUMO' }).success).toBe(true);
  });

  describe('registro de llegada por el empleado', () => {
    it('no acepta que el empleado asigne el canal de atención', () => {
      expect(reservaAtencionSchema.safeParse({}).success).toBe(true);
      expect(reservaAtencionSchema.safeParse({ canal: 'QR' }).success).toBe(false);
    });
  });

  describe('apertura de tanda ligada a una reserva', () => {
    const detalles = [{ producto: 5, cantidad: 1 }];

    it('acepta reserva sin mesa enviada por el cliente', () => {
      expect(tandaSchema.safeParse({ reservaId: 17, detalles }).success).toBe(true);
    });

    describe('elección de atención para una reserva', () => {
      it('requiere mesa asignada y canal del cliente', () => {
        expect(reservaAtencionClienteSchema.safeParse({
          reservaId: 17,
          mesaId: 9,
          canal: 'QR',
        }).success).toBe(true);
        expect(reservaAtencionClienteSchema.safeParse({
          reservaId: 17,
          canal: 'MOZO',
        }).success).toBe(false);
      });
    });

    it('requiere mesa para el flujo QR genérico o reserva para el flujo reservado', () => {
      expect(tandaSchema.safeParse({ detalles }).success).toBe(false);
      expect(tandaSchema.safeParse({ mesa: 3, detalles }).success).toBe(true);
    });
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
