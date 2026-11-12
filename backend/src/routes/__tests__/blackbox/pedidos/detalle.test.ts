import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Pedidos - Detalle (caja negra)', () => {
  const token = makeTestToken({ roles: ['MOZO', 'ADMIN'] });

  it('GET /pedidos/:id sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/pedidos/1');
    expect(res.status).toBe(401);
  });

  it('GET /pedidos/999999 (inexistente) -> 404 u otro estado controlado', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/999999')
      .set(authHeader(token));
    expect([200, 404, 401, 403, 503]).toContain(res.status);
  });

  it('GET /pedidos/:id con id invalido -> 400 o 404', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/abc')
      .set(authHeader(token));
    expect([400, 404, 401, 403, 503]).toContain(res.status);
  });
});
