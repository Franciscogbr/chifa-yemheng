import { describe, expect, it } from 'vitest';
import { movimientoQuerySchema, stockQuerySchema } from './inventario.js';

describe('inventario query filters', () => {
  it('parses the stock status query parameter as a real boolean', () => {
    expect(stockQuerySchema.parse({ soloBajoStock: 'false' }).soloBajoStock).toBe(false);
    expect(stockQuerySchema.parse({ soloBajoStock: 'true' }).soloBajoStock).toBe(true);
  });

  it('accepts inclusive movement date ranges and rejects inverted ranges', () => {
    expect(movimientoQuerySchema.safeParse({ desde: '2026-03-10', hasta: '2026-03-10' }).success).toBe(true);
    expect(movimientoQuerySchema.safeParse({ desde: '2026-03-11', hasta: '2026-03-10' }).success).toBe(false);
  });
});
