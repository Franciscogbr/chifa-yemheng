import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cobrarParticipanteAtomic: vi.fn(),
  turnoAbiertoDeCaja: vi.fn(),
}));

vi.mock('../../repositories/caja-repository.js', () => ({
  cobrarParticipanteAtomic: mocks.cobrarParticipanteAtomic,
  turnoAbiertoDeCaja: mocks.turnoAbiertoDeCaja,
}));

import { cobrarParticipanteService } from '../caja-service.js';

const PAGOS = [
  { metodoPagoId: 1, monto: 48.5, montoRecibido: 50, referencia: '', banco: '' },
];

describe('cobrarParticipanteService (S3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rechaza cuando no hay turno de caja abierto', async () => {
    mocks.turnoAbiertoDeCaja.mockResolvedValue(null);

    await expect(
      cobrarParticipanteService({
        pedidoId: 14,
        clienteId: 8,
        usuarioId: 3,
        cajaId: 2,
        tipoDocumento: '03',
        participanteDocumento: '08765432',
        participanteNombre: 'Ana García',
        pagos: PAGOS,
      }),
    ).rejects.toThrow('NO_CAJA_ABIERTA');

    expect(mocks.cobrarParticipanteAtomic).not.toHaveBeenCalled();
  });

  it('cobra la cuenta individual via RPC atomico y mapea la respuesta', async () => {
    mocks.turnoAbiertoDeCaja.mockResolvedValue({ id: 21 });
    mocks.cobrarParticipanteAtomic.mockResolvedValue({
      idCuenta: 77,
      idVenta: 9002,
      serie: 'B001',
      numero: '00001235',
      total: 48.5,
      vuelto: 1.5,
      mesaLiquidada: false,
    });

    const result = await cobrarParticipanteService({
      pedidoId: 14,
      clienteId: 8,
      usuarioId: 3,
      cajaId: 2,
      tipoDocumento: '03',
      participanteDocumento: '08765432',
      participanteNombre: 'Ana García',
      pagos: PAGOS,
    });

    expect(mocks.cobrarParticipanteAtomic).toHaveBeenCalledWith({
      pedidoId: 14,
      clienteId: 8,
      usuarioId: 3,
      aperturaId: 21,
      tipoDocumento: '03',
      pagos: PAGOS,
      empresaId: null,
      documento: '08765432',
      nombreDoc: 'Ana García',
    });
    expect(result).toEqual({
      idCuenta: 77,
      idVenta: 9002,
      serie: 'B001',
      numero: '00001235',
      total: 48.5,
      vuelto: 1.5,
      mesaLiquidada: false,
    });
  });

  it('propaga la liquidacion de mesa del RPC (ultimo participante)', async () => {
    mocks.turnoAbiertoDeCaja.mockResolvedValue({ id: 21 });
    mocks.cobrarParticipanteAtomic.mockResolvedValue({
      idCuenta: 78,
      idVenta: 9003,
      serie: 'B001',
      numero: '00001236',
      total: 31.2,
      vuelto: 0,
      mesaLiquidada: true,
    });

    const result = await cobrarParticipanteService({
      pedidoId: 14,
      clienteId: 9,
      usuarioId: 3,
      cajaId: 2,
      tipoDocumento: '01',
      empresaId: 12,
      pagos: [{ metodoPagoId: 2, monto: 31.2, montoRecibido: null, referencia: 'TR-1', banco: 'BCP' }],
    });

    expect(mocks.cobrarParticipanteAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoDocumento: '01',
        empresaId: 12,
        documento: null,
        nombreDoc: null,
      }),
    );
    expect(result.mesaLiquidada).toBe(true);
  });
});
