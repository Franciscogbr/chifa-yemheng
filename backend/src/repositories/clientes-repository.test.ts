import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
}));

vi.mock('../config/supabase.js', () => ({
  supabase: { from: mocks.from },
}));

import { listarClientes } from './clientes-repository.js';
import { clienteQuerySchema } from '../schemas/cliente.js';

function persona(id: number, nombre: string) {
  return {
    id_cliente: id,
    tipo_cliente: 'N',
    puntos: 0,
    estado: 'A',
    f_registro: '2026-03-01T10:00:00',
    id_persona: id,
    id_empresa: null,
    codigo_cliente: null,
    persona: {
      n_documento: String(id),
      nombre,
      ap_paterno: null,
      ap_materno: null,
      celular: null,
      email: null,
      direccion: null,
      f_nacimiento: null,
      genero: null,
      distrito: null,
      tipo_identidad: null,
    },
    empresa: null,
  };
}

const queryBuilder = {
  select: mocks.select,
  eq: mocks.eq,
  order: mocks.order,
  range: mocks.range,
};

describe('listarClientes filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue(queryBuilder);
    mocks.select.mockReturnValue(queryBuilder);
    mocks.eq.mockReturnValue(queryBuilder);
    mocks.order.mockReturnValue(queryBuilder);
  });

  it('searches across pages and reports the filtered result count', async () => {
    mocks.range
      .mockResolvedValueOnce({
        data: Array.from({ length: 1000 }, (_, index) => persona(index + 1, `Cliente ${index + 1}`)),
        error: null,
        count: 1001,
      })
      .mockResolvedValueOnce({
        data: [persona(1001, 'Cliente Encontrado')],
        error: null,
        count: 1001,
      });

    const result = await listarClientes(clienteQuerySchema.parse({
      page: '1',
      limit: '20',
      buscar: 'encontrado',
    }));

    expect(result.data.map((cliente) => cliente.id)).toEqual([1001]);
    expect(result.total).toBe(1);
    expect(mocks.range).toHaveBeenNthCalledWith(1, 0, 999);
    expect(mocks.range).toHaveBeenNthCalledWith(2, 1000, 1999);
  });
});
