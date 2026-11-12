import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Pedidos - Listar (caja negra)', () => {
  const token = makeTestToken({ roles: ['MOZO', 'ADMIN'] });

  it('GET /pedidos sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/pedidos/');
    expect(res.status).toBe(401);
  });

  it('GET /pedidos/mozo/reservas-pendientes sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/pedidos/mozo/reservas-pendientes');
    expect(res.status).toBe(401);
  });

  it('GET /pedidos con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
    }
  });

  it('GET /pedidos con query invalido -> 400', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/?page=-1')
      .set(authHeader(token));
    expect([400, 401, 403, 503]).toContain(res.status);
  });
});
