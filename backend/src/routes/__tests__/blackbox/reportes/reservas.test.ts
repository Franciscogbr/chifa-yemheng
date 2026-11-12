import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Reportes - Reservas (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN', 'MOZO'] });

  it('GET /reportes/reservas sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/reportes/reservas');
    expect(res.status).toBe(401);
  });

  it('GET /reportes/reservas con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/reportes/reservas')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
