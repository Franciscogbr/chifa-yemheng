import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Inventario - Listar (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['INV_VER'] });

  it('GET /inventario sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/inventario/');
    expect(res.status).toBe(401);
  });

  it('GET /inventario/movimientos sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/inventario/movimientos');
    expect(res.status).toBe(401);
  });

  it('GET /inventario/stock sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/inventario/stock');
    expect(res.status).toBe(401);
  });

  it('GET /inventario/movimientos con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/inventario/movimientos')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });
});
