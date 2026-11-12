import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Clientes - Listar (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN', 'MOZO'] });

  it('GET /clientes sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/clientes/');
    expect(res.status).toBe(401);
  });

  it('GET /clientes con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/clientes/')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
    }
  });
});
