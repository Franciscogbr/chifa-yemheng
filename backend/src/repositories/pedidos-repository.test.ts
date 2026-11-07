import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('../config/supabase.js', () => ({
  supabase: { rpc: mocks.rpc },
}));

import {
  configurarModoPagoMesa,
  registrarParticipanteMesa,
} from './pedidos-repository.js';

beforeEach(() => {
  mocks.rpc.mockReset();
});

describe('registrarParticipanteMesa (S1, S4)', () => {
  it('rechaza la unión cuando el organizador cerró el ingreso', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'LA_MESA_NO_ADMITE_NUEVOS_PARTICIPANTES' },
    });

    await expect(
      registrarParticipanteMesa(9, 2),
    ).rejects.toMatchObject({ code: 'LA_MESA_NO_ADMITE_NUEVOS_PARTICIPANTES' });

    expect(mocks.rpc).toHaveBeenCalledWith('fn_registrar_participante_comanda', {
      p_pedido: 9,
      p_cliente: 2,
    });
  });

  it('registra al participante y retorna organizador, membresía y modo', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: [{ organizador_cliente_id: 1, es_organizador: false, modo_pago_mesa: 'POR_CONSUMO' }],
      error: null,
    });

    const result = await registrarParticipanteMesa(9, 2);

    expect(result).toEqual({
      organizadorClienteId: 1,
      esOrganizador: false,
      modoPagoMesa: 'POR_CONSUMO',
    });
  });
});

describe('configurarModoPagoMesa (S4)', () => {
  it('rechaza el cambio de modo una vez bloqueado por el primer cobro', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'MODO_PAGO_BLOQUEADO' },
    });

    await expect(
      configurarModoPagoMesa(9, 1, 'POR_CONSUMO'),
    ).rejects.toMatchObject({ code: 'MODO_PAGO_BLOQUEADO' });

    expect(mocks.rpc).toHaveBeenCalledWith('fn_configurar_modo_pago_comanda', {
      p_pedido: 9,
      p_cliente: 1,
      p_modo: 'POR_CONSUMO',
    });
  });

  it('retorna el nuevo modo cuando el cambio es permitido', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: 'POR_CONSUMO',
      error: null,
    });

    const result = await configurarModoPagoMesa(9, 1, 'POR_CONSUMO');

    expect(result).toBe('POR_CONSUMO');
  });

  it('envuelve errores inesperados del RPC como PedidoError genérico', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'NO_ES_ORGANIZADOR' },
    });

    await expect(
      configurarModoPagoMesa(9, 2, 'CUENTA_UNICA'),
    ).rejects.toMatchObject({ code: 'NO_ES_ORGANIZADOR' });
  });
});
