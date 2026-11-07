import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  obtenerPedido: vi.fn(),
  saldoParticipante: vi.fn(),
  clienteParticipa: vi.fn(),
}));

vi.mock('../../repositories/pedidos-repository.js', () => ({
  ...mocks,
  agregarDetalleDeCliente: vi.fn(),
  auditar: vi.fn(),
  abrirOUnirseComandaQR: vi.fn(),
  pedidosAbiertosPorMesa: vi.fn(),
  recalcularPedido: vi.fn(),
  obtenerEstadoMesa: vi.fn(),
  pedirCuentaComanda: vi.fn(),
  registrarParticipanteMesa: vi.fn(),
  listarParticipantesPedido: vi.fn(),
  configurarModoPagoMesa: vi.fn(),
}));

import { miCuentaClienteService } from '../cliente-pedidos-service.js';

describe('miCuentaClienteService (S2, S3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.obtenerPedido.mockResolvedValue({
      id: 14, numero: '000123', mesaId: 12, clienteId: 99,
      modoPagoMesa: 'POR_CONSUMO', anulado: 'N', facturado: 'N',
    });
  });

  it('unun cliente no participante no ve la cuenta (NO_PARTICIPANTE)', async () => {
    mocks.clienteParticipa.mockResolvedValue(false);

    await expect(miCuentaClienteService(14, 8)).rejects.toMatchObject({
      code: 'NO_PARTICIPANTE',
    });
    expect(mocks.saldoParticipante).not.toHaveBeenCalled();
  });

  it('devuelve SIN_CUENTA cuando el participante no tiene cuenta', async () => {
    mocks.clienteParticipa.mockResolvedValue(true);
    mocks.saldoParticipante.mockResolvedValue(null);

    await expect(miCuentaClienteService(14, 8)).rejects.toMatchObject({
      code: 'SIN_CUENTA',
    });
  });

  it('muestra al participante solo SU cuenta ABIERTA con sus platos', async () => {
    mocks.obtenerPedido.mockResolvedValue({
      id: 14, numero: '000123', mesaId: 12, clienteId: 8,
      modoPagoMesa: 'POR_CONSUMO', anulado: 'N', facturado: 'N',
    });
    mocks.saldoParticipante.mockResolvedValue({
      idCuenta: 77,
      estadoCuenta: 'ABIERTA',
      saldoPendiente: 42,
      montoPagado: 0,
      platos: [
        { id: 305, producto: 'Arroz Chifa', cantidad: 2, precioUnitario: 18, subTotal: 36, estadoPreparacion: 'E' },
      ],
    });

    const result = await miCuentaClienteService(14, 8);

    expect(result.cuenta).toEqual({
      idCuenta: 77,
      estadoCuenta: 'ABIERTA',
      saldoPendiente: 42,
      montoPagado: 0,
      platos: expect.any(Array),
    });
    expect(result.pedido).toEqual({
      id: 14, mesaId: 12, modoPagoMesa: 'POR_CONSUMO', mesaLiquidada: false,
    });
  });
});
