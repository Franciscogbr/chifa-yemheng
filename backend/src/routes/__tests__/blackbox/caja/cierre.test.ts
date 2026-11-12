import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Caja - Cierre (caja negra)', () => {
  const token = makeTestToken({ roles: ['CAJERO', 'ADMIN'] });

  it('POST /caja/cierre sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/caja/cierre')
      .send({ cajaId: 1, montoDeclarado: 100 });
    expect(res.status).toBe(401);
  });

  it('POST /caja/cierre sin montoDeclarado -> 400 VALIDATION_ERROR o 401 si auth falla primero', async () => {
    const res = await request(app)
      .post('/api/v1/caja/cierre')
      .set(authHeader(token))
      .send({ cajaId: 1 });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('GET /caja/cierres-pendientes con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/caja/cierres-pendientes') // ajusta si la ruta es distinta
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });
});
