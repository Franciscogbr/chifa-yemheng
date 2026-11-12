import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../config/supabase.js', () => ({
  supabase: { from: mocks.from, rpc: mocks.rpc },
}));

import { listarClientesMesa } from './mesas-repository.js';

function builder(result: { data: unknown; error: null }) {
  const query: Record<string, any> = {};
  for (const method of ['select', 'eq', 'order', 'limit', 'neq']) {
    query[method] = vi.fn(() => query);
  }
  query.maybeSingle = vi.fn().mockResolvedValue(result);
  query.then = (resolve: (value: typeof result) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return query;
}

describe('listarClientesMesa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the active order, participant identity, and attributed consumption', async () => {
    const builders = new Map<string, ReturnType<typeof builder>>();
    const responses: Record<string, { data: unknown; error: null }> = {
      pedido: {
        data: { id_pedido: 71, total: 34.5, modo_pago_mesa: 'POR_CONSUMO' },
        error: null,
      },
      pedido_participante: {
        data: [
          {
            id_cliente: 8,
            es_organizador: true,
            cliente: {
              tipo_cliente: 'N',
              persona: {
                n_documento: '12345678',
                nombre: 'Ana',
                ap_paterno: 'Perez',
                ap_materno: null,
                tipo_identidad: { n_tipoidentidad: 'DNI' },
              },
              empresa: null,
            },
          },
          {
            id_cliente: 9,
            es_organizador: false,
            cliente: {
              tipo_cliente: 'J',
              persona: null,
              empresa: {
                ruc: '20123456789',
                razon_social: 'Empresa SAC',
                nombre_comercial: 'Empresa',
              },
            },
          },
        ],
        error: null,
      },
    };
    mocks.from.mockImplementation((table: string) => {
      const query = builder(responses[table]!);
      builders.set(table, query);
      return query;
    });
    mocks.rpc.mockImplementation((_name: string, args: { p_cliente: number }) =>
      Promise.resolve({
        data: args.p_cliente === 8
          ? [{ consumo_abierto: '24.50', estado_cuenta: 'ABIERTA', monto_pagado: '0' }]
          : [{ consumo_abierto: '0', estado_cuenta: 'PAGADA', monto_pagado: '10.00' }],
        error: null,
      }),
    );

    await expect(listarClientesMesa(12)).resolves.toEqual({
      modoPagoMesa: 'POR_CONSUMO',
      totalComanda: 34.5,
      clientes: [{
        clienteId: 8,
        nombre: 'Ana Perez',
        tipoDocumento: 'DNI',
        documento: '12345678',
        esOrganizador: true,
        consumoEstimado: 24.5,
        estadoCuenta: 'ABIERTA',
        montoPagado: 0,
      }, {
        clienteId: 9,
        nombre: 'Empresa',
        tipoDocumento: 'RUC',
        documento: '20123456789',
        esOrganizador: false,
        consumoEstimado: 0,
        estadoCuenta: 'PAGADA',
        montoPagado: 10,
      }],
    });
    expect(mocks.rpc).toHaveBeenCalledTimes(2);
    expect(mocks.rpc).toHaveBeenCalledWith('fn_saldo_participante', {
      p_pedido: 71,
      p_cliente: 8,
    });
  });

  it('uses only active customer-attributed lines for a single account', async () => {
    const responses: Record<string, { data: unknown; error: null }> = {
      pedido: {
        data: { id_pedido: 72, total: 15, modo_pago_mesa: 'CUENTA_UNICA' },
        error: null,
      },
      pedido_participante: {
        data: [{
          id_cliente: 8,
          es_organizador: true,
          cliente: {
            tipo_cliente: 'N',
            persona: {
              n_documento: '12345678',
              nombre: 'Ana',
              ap_paterno: null,
              ap_materno: null,
              tipo_identidad: { n_tipoidentidad: 'DNI' },
            },
            empresa: null,
          },
        }],
        error: null,
      },
      detalle_pedido: {
        data: [
          { id_cliente: 8, sub_total: '15.00' },
          { id_cliente: null, sub_total: '5.00' },
        ],
        error: null,
      },
    };
    const builders = new Map<string, ReturnType<typeof builder>>();
    mocks.from.mockImplementation((table: string) => {
      const query = builder(responses[table]!);
      builders.set(table, query);
      return query;
    });

    await expect(listarClientesMesa(12)).resolves.toMatchObject({
      clientes: [{ clienteId: 8, consumoEstimado: 15 }],
    });
    expect(builders.get('detalle_pedido')?.eq).toHaveBeenCalledWith('estado', 'A');
    expect(builders.get('detalle_pedido')?.neq).toHaveBeenCalledWith('estado_preparacion', 'A');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('returns an empty result when the table has no active order', async () => {
    mocks.from.mockReturnValue(builder({ data: null, error: null }));

    await expect(listarClientesMesa(12)).resolves.toEqual({
      modoPagoMesa: 'CUENTA_UNICA',
      totalComanda: 0,
      clientes: [],
    });
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });
});
