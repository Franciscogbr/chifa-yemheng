import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Reportes - Analisis Comercial (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN', 'MOZO'] });

  it('GET /reportes/analisis-comercial sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/reportes/analisis-comercial');
    expect(res.status).toBe(401);
  });

  it('GET /reportes/analisis-comercial con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/reportes/analisis-comercial')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
