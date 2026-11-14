import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));

vi.mock('../config/supabase.js', () => ({
  supabase: { from: mocks.from, rpc: mocks.rpc },
}));

import {
  cancelarReservaCliente,
  obtenerContinuacionReservaCliente,
} from './cliente-reservas-repository.js';
import { abrirComandaReservaCliente } from './pedidos-repository.js';

function queryResult(result: { data: unknown; error: null }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  return query;
}

beforeEach(() => {
  mocks.from.mockReset();
  mocks.rpc.mockReset();
});

describe('continuación de reserva del cliente', () => {
  it('devuelve la mesa asignada cuando la reserva atendida aún no tiene pedido', async () => {
    const reservaQuery = queryResult({
      data: { id_reserva: 17, id_mesa: 9, situacion: 'A', f_llegada: '2026-11-13T16:00:00Z', canal_atencion: null },
      error: null,
    });
    const pedidoQuery = queryResult({ data: null, error: null });
    mocks.from.mockReturnValueOnce(reservaQuery).mockReturnValueOnce(pedidoQuery);

    await expect(obtenerContinuacionReservaCliente(17, 42)).resolves.toEqual({
      reservaId: 17,
      mesaId: 9,
      pedidoId: null,
      canalAtencion: null,
    });
    expect(reservaQuery.eq).toHaveBeenNthCalledWith(1, 'id_reserva', 17);
    expect(reservaQuery.eq).toHaveBeenNthCalledWith(2, 'id_cliente', 42);
  });

  it('devuelve el pedido asociado para abrir su seguimiento', async () => {
    const reservaQuery = queryResult({
      data: { id_reserva: 17, id_mesa: 9, situacion: 'A', f_llegada: '2026-11-13T16:00:00Z', canal_atencion: 'QR' },
      error: null,
    });
    const pedidoQuery = queryResult({ data: { id_pedido: 83 }, error: null });
    mocks.from.mockReturnValueOnce(reservaQuery).mockReturnValueOnce(pedidoQuery);

    await expect(obtenerContinuacionReservaCliente(17, 42)).resolves.toMatchObject({
      reservaId: 17,
      pedidoId: 83,
      canalAtencion: 'QR',
    });
  });

  it('devuelve el canal ya elegido para no volver a ofrecer una decisión', async () => {
    const reservaQuery = queryResult({
      data: { id_reserva: 17, id_mesa: 9, situacion: 'A', f_llegada: '2026-11-13T16:00:00Z', canal_atencion: 'MOZO' },
      error: null,
    });
    const pedidoQuery = queryResult({ data: null, error: null });
    mocks.from.mockReturnValueOnce(reservaQuery).mockReturnValueOnce(pedidoQuery);

    await expect(obtenerContinuacionReservaCliente(17, 42)).resolves.toMatchObject({
      canalAtencion: 'MOZO',
      pedidoId: null,
    });
  });

  it('no revela reservas que pertenecen a otro cliente', async () => {
    const reservaQuery = queryResult({ data: null, error: null });
    mocks.from.mockReturnValueOnce(reservaQuery);

    await expect(obtenerContinuacionReservaCliente(17, 99)).resolves.toBeNull();
    expect(reservaQuery.eq).toHaveBeenNthCalledWith(2, 'id_cliente', 99);
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });
});

describe('cancelación y apertura ligada a reserva', () => {
  it('delegates cancelación a una sola operación atómica y no libera la mesa desde la API', async () => {
    const cancelled = { id_reserva: 17, situacion: 'X', id_mesa: 9 };
    mocks.rpc.mockResolvedValueOnce({ data: [cancelled], error: null });

    await expect(cancelarReservaCliente(17, 42, 'cliente@test', 'pc')).resolves.toEqual(cancelled);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith('fn_cancelar_reserva_cliente', {
      p_reserva: 17,
      p_cliente: 42,
      p_usuario: 'cliente@test',
      p_pc: 'pc',
    });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rechaza la cancelación si la RPC detecta un pedido asociado', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'RESERVA_CON_PEDIDO' },
    });

    await expect(cancelarReservaCliente(17, 42, 'cliente@test', 'pc'))
      .rejects.toMatchObject({ code: 'RESERVA_CON_PEDIDO' });
  });

  it('bloquea la apertura de una reserva cuya mesa ya está ocupada', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'MESA_OCUPADA' },
    });

    await expect(abrirComandaReservaCliente({
      reserva: 17,
      cliente: 42,
      tipo: 1,
      usuario: 1,
      obs: '',
    })).rejects.toMatchObject({ code: 'MESA_OCUPADA' });

    expect(mocks.rpc).toHaveBeenCalledWith('fn_abrir_comanda_reserva_cliente', {
      p_reserva: 17,
      p_cliente: 42,
      p_tipo: 1,
      p_usuario: 1,
      p_obs: '',
    });
  });
});
