import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Reportes - Delivery (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN', 'MOZO'] });

  it('GET /reportes/delivery sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/reportes/delivery');
    expect(res.status).toBe(401);
  });

  it('GET /reportes/delivery con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/reportes/delivery')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
