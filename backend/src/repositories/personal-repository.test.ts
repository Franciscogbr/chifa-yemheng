import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  ilike: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
}));

vi.mock('../config/supabase.js', () => ({
  supabase: { from: mocks.from },
}));

import { listarPersonal } from './personal-repository.js';
import { personalQuerySchema } from '../schemas/personal.js';

function empleado(id: number, nombre: string) {
  return {
    id_empleado: id,
    turno: 'Mañana',
    f_ingreso: null,
    f_cese: null,
    salario: 0,
    estado: 'A',
    persona: {
      id_persona: id,
      n_documento: String(id),
      nombre,
      ap_paterno: null,
      ap_materno: null,
      celular: null,
      email: null,
      direccion: null,
      f_nacimiento: null,
      genero: null,
      tipo_identidad: null,
      distrito: null,
    },
    fondo_pension: null,
    n_hijos: null,
    essalud: null,
    cargo: null,
    contrato: null,
  };
}

const queryBuilder = {
  select: mocks.select,
  eq: mocks.eq,
  ilike: mocks.ilike,
  order: mocks.order,
  range: mocks.range,
};

describe('listarPersonal search filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue(queryBuilder);
    mocks.select.mockReturnValue(queryBuilder);
    mocks.eq.mockReturnValue(queryBuilder);
    mocks.ilike.mockReturnValue(queryBuilder);
    mocks.order.mockReturnValue(queryBuilder);
  });

  it('searches beyond the current database page and returns the filtered total', async () => {
    mocks.range
      .mockResolvedValueOnce({
        data: Array.from({ length: 1000 }, (_, index) => empleado(index + 1, `Empleado ${index + 1}`)),
        error: null,
        count: 1001,
      })
      .mockResolvedValueOnce({
        data: [empleado(1001, 'Empleado Encontrado')],
        error: null,
        count: 1001,
      });

    const result = await listarPersonal(personalQuerySchema.parse({
      page: '1',
      limit: '20',
      buscar: 'encontrado',
    }));

    expect(result.data.map((item) => item.id)).toEqual([1001]);
    expect(result.total).toBe(1);
    expect(mocks.range).toHaveBeenNthCalledWith(1, 0, 999);
    expect(mocks.range).toHaveBeenNthCalledWith(2, 1000, 1999);
  });
});
