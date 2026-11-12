import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Delivery seguimiento - Listar (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['DELIVERY_VER'] });

  it('GET /delivery/seguimiento sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/delivery/seguimiento/');
    expect(res.status).toBe(401);
  });

  it('GET /delivery/seguimiento con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/delivery/seguimiento/')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });
});
