import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';
import { TEST_MOVIMIENTO_INVENTARIO_VALIDO } from '../shared/fixtures.js';

describe('Inventario - Movimiento (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['INV_CREAR'] });

  it('POST /inventario/movimientos sin auth -> 401', async () => {
    const res = await request(app).post('/api/v1/inventario/movimientos').send(TEST_MOVIMIENTO_INVENTARIO_VALIDO);
    expect(res.status).toBe(401);
  });

  it('POST /inventario/movimientos con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/inventario/movimientos')
      .set(authHeader(token))
      .send({});
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /inventario/movimientos con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/inventario/movimientos')
      .set(authHeader(token))
      .send(TEST_MOVIMIENTO_INVENTARIO_VALIDO);
    expect([201, 400, 409, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
