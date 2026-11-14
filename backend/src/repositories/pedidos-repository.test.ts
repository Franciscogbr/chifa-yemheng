import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));

vi.mock('../config/supabase.js', () => ({
  supabase: { rpc: mocks.rpc, from: mocks.from },
}));

import {
  abrirOUnirseComandaQR,
  configurarModoPagoMesa,
  elegirCanalReservaCliente,
  elegirCanalReservaClientePorMesa,
  obtenerAtencionReservaCliente,
  registrarParticipanteMesa,
} from './pedidos-repository.js';

beforeEach(() => {
  mocks.rpc.mockReset();
  mocks.from.mockReset();
});

describe('obtenerAtencionReservaCliente', () => {
  it('solo consulta reservas del cliente autenticado y devuelve espera de mozo', async () => {
    const reservaQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id_reserva: 17, id_mesa: 9, situacion: 'A', canal_atencion: 'MOZO' },
        error: null,
      }),
    };
    reservaQuery.select.mockReturnValue(reservaQuery);
    reservaQuery.eq.mockReturnValue(reservaQuery);

    const pedidoQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    pedidoQuery.select.mockReturnValue(pedidoQuery);
    pedidoQuery.eq.mockReturnValue(pedidoQuery);
    pedidoQuery.order.mockReturnValue(pedidoQuery);
    pedidoQuery.limit.mockReturnValue(pedidoQuery);
    mocks.from.mockImplementation((table: string) =>
      table === 'reserva' ? reservaQuery : pedidoQuery,
    );

    await expect(obtenerAtencionReservaCliente(17, 42)).resolves.toEqual({
      reservaId: 17,
      mesaId: 9,
      estado: 'ESPERANDO_MOZO',
      pedidoId: null,
    });
    expect(reservaQuery.eq).toHaveBeenNthCalledWith(1, 'id_reserva', 17);
    expect(reservaQuery.eq).toHaveBeenNthCalledWith(2, 'id_cliente', 42);
  });

  it('devuelve el pedido asociado cuando el mozo ya tomó la solicitud', async () => {
    const reservaQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id_reserva: 17, id_mesa: 9, situacion: 'A', canal_atencion: 'MOZO' },
        error: null,
      }),
    };
    const pedidoQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id_pedido: 83 },
        error: null,
      }),
    };
    mocks.from.mockImplementation((table: string) =>
      table === 'reserva' ? reservaQuery : pedidoQuery,
    );

    await expect(obtenerAtencionReservaCliente(17, 42)).resolves.toMatchObject({
      estado: 'PEDIDO_TOMADO',
      pedidoId: 83,
    });
  });
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

describe('apertura QR segura para mesas reservadas', () => {
  it('exige continuar con el ID de la reserva en una mesa reservada', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'RESERVA_REQUIERE_ID' },
    });

    await expect(abrirOUnirseComandaQR({
      tipo: 1,
      usuario: 1,
      mesa: 9,
      cliente: 42,
      comensales: 2,
      obs: '',
    })).rejects.toMatchObject({ code: 'RESERVA_REQUIERE_ID' });

    expect(mocks.rpc).toHaveBeenCalledWith('fn_abrir_o_unirse_comanda_cliente_seguro', {
      p_tipo: 1,
      p_usuario: 1,
      p_mesa: 9,
      p_cliente: 42,
      p_comensales: 2,
      p_obs: '',
    });
  });
});

describe('elección del canal en una reserva', () => {
  it('envía reserva, mesa verificada y cliente al RPC', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: [{ id_reserva: 17, id_mesa: 9 }],
      error: null,
    });

    await expect(elegirCanalReservaCliente(17, 9, 42, 'QR')).resolves.toEqual({
      reservaId: 17,
      mesaId: 9,
    });
    expect(mocks.rpc).toHaveBeenCalledWith('fn_elegir_canal_reserva_cliente', {
      p_reserva: 17,
      p_cliente: 42,
      p_mesa: 9,
      p_canal: 'QR',
    });
  });

  it('propaga el rechazo cuando el QR no corresponde a la mesa reservada', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'RESERVA_MESA_NO_COINCIDE' },
    });

    await expect(elegirCanalReservaCliente(17, 8, 42, 'QR'))
      .rejects.toMatchObject({ code: 'RESERVA_MESA_NO_COINCIDE' });
  });
});

describe('elección desde el QR de una mesa reservada', () => {
  function reservaMesaQuery(data: unknown) {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
    };
    for (const method of [
      query.select,
      query.eq,
      query.in,
      query.gte,
      query.lte,
      query.order,
      query.limit,
    ]) {
      method.mockReturnValue(query);
    }
    return query;
  }

  it('no registra la llegada desde el QR si el empleado aún no atendió la reserva', async () => {
    const query = reservaMesaQuery({
      id_reserva: 17,
      situacion: 'C',
      f_llegada: null,
    });
    mocks.from.mockReturnValueOnce(query);

    await expect(elegirCanalReservaClientePorMesa(9, 42, 'QR'))
      .rejects.toMatchObject({ code: 'RESERVA_NO_ATENDIDA' });

    expect(query.eq).toHaveBeenCalledWith('id_cliente', 42);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('permite elegir canal desde el QR solo después de la llegada registrada', async () => {
    const query = reservaMesaQuery({
      id_reserva: 17,
      situacion: 'A',
      f_llegada: '2026-11-13T16:00:00',
    });
    mocks.from.mockReturnValueOnce(query);
    mocks.rpc.mockResolvedValueOnce({
      data: [{ id_reserva: 17, id_mesa: 9 }],
      error: null,
    });

    await expect(elegirCanalReservaClientePorMesa(9, 42, 'QR')).resolves.toBe(17);
    expect(mocks.rpc).toHaveBeenCalledWith('fn_elegir_canal_reserva_cliente', {
      p_reserva: 17,
      p_cliente: 42,
      p_mesa: 9,
      p_canal: 'QR',
    });
  });

  it('mantiene el QR genérico cuando la mesa no tiene una reserva del cliente', async () => {
    const query = reservaMesaQuery(null);
    mocks.from.mockReturnValueOnce(query);

    await expect(elegirCanalReservaClientePorMesa(9, 42, 'QR')).resolves.toBeNull();
    expect(mocks.rpc).not.toHaveBeenCalled();
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
