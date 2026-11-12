import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  ilike: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  lt: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
  execute: vi.fn(),
}));

vi.mock('../config/supabase.js', () => ({
  supabase: { from: mocks.from },
}));

import { getStockInsumos } from './inventario-repository.js';
import { listarMovimientos } from './inventario-repository.js';
import { movimientoQuerySchema, stockQuerySchema } from '../schemas/inventario.js';

const rows = [
  {
    id_producto: 1,
    n_producto: 'Arroz',
    tipo_producto: 'I',
    id_categoriaproducto: 8,
    stock_actual: 2,
    stock_minimo: 3,
    id_unidad: 4,
    unidad_medida: { n_unidad: 'kg' },
    categoria_producto: { n_categoriaproducto: 'Granos' },
  },
  {
    id_producto: 2,
    n_producto: 'Aceite',
    tipo_producto: 'I',
    id_categoriaproducto: 9,
    stock_actual: 5,
    stock_minimo: 3,
    id_unidad: 6,
    unidad_medida: { n_unidad: 'L' },
    categoria_producto: { n_categoriaproducto: 'Abarrotes' },
  },
];

const queryBuilder = {
  select: mocks.select,
  eq: mocks.eq,
  ilike: mocks.ilike,
  gte: mocks.gte,
  lte: mocks.lte,
  lt: mocks.lt,
  order: mocks.order,
  range: mocks.range,
  then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
    mocks.execute().then(resolve, reject),
};

describe('getStockInsumos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue(queryBuilder);
    mocks.select.mockReturnValue(queryBuilder);
    mocks.eq.mockReturnValue(queryBuilder);
    mocks.ilike.mockReturnValue(queryBuilder);
    mocks.gte.mockReturnValue(queryBuilder);
    mocks.lte.mockReturnValue(queryBuilder);
    mocks.lt.mockReturnValue(queryBuilder);
    mocks.order.mockReturnValue(queryBuilder);
    mocks.range.mockReturnValue(queryBuilder);
    mocks.execute.mockResolvedValue({ data: rows, error: null, count: rows.length });
  });

  it('filters low and available stock against each row minimum and returns real category/unit ids', async () => {
    const lowStock = await getStockInsumos(stockQuerySchema.parse({ soloBajoStock: 'true' }));
    const availableStock = await getStockInsumos(stockQuerySchema.parse({ soloBajoStock: 'false' }));

    expect(lowStock.map((item) => item.idProducto)).toEqual([1]);
    expect(availableStock.map((item) => item.idProducto)).toEqual([2]);
    expect(availableStock[0]).toMatchObject({ categoriaId: 9, unidadId: 6 });
    expect(mocks.lte).not.toHaveBeenCalledWith('stock_actual', 'stock_minimo');
  });

  it('passes an inclusive movement date range to the database', async () => {
    await listarMovimientos(movimientoQuerySchema.parse({
      desde: '2026-03-10',
      hasta: '2026-03-10',
    }));

    expect(mocks.gte).toHaveBeenCalledWith('f_movimiento', '2026-03-10T00:00:00');
    expect(mocks.lt).toHaveBeenCalledWith('f_movimiento', '2026-03-11T00:00:00');
  });
});
