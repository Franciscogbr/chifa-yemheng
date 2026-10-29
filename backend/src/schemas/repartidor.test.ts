import { describe, expect, it } from 'vitest';
import { repartidorEntregasQuerySchema } from './repartidor.js';

describe('parámetros de entregas del repartidor', () => {
  it('aplica paginación por defecto', () => {
    expect(repartidorEntregasQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 20,
    });
  });

  it('acepta filtros de varios estados para el historial', () => {
    expect(repartidorEntregasQuerySchema.parse({ estado: 'E,C' }).estado).toEqual(['E', 'C']);
  });

  it('rechaza filtros inválidos y límites fuera de rango', () => {
    expect(repartidorEntregasQuerySchema.safeParse({ estado: 'H' }).success).toBe(false);
    expect(repartidorEntregasQuerySchema.safeParse({ limit: '101' }).success).toBe(false);
    expect(repartidorEntregasQuerySchema.safeParse({ page: '0' }).success).toBe(false);
  });
});
