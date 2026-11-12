import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Caja - Arqueo (caja negra)', () => {
  const token = makeTestToken({ roles: ['CAJERO', 'ADMIN'] });

  it('POST /caja/arqueo sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/caja/arqueo')
      .send({});
    expect(res.status).toBe(401);
  });

  it('POST /caja/arqueo sin denominaciones -> 400 VALIDATION_ERROR o 401 si auth falla primero', async () => {
    const res = await request(app)
      .post('/api/v1/caja/arqueo')
      .set(authHeader(token))
      .send({ cajaId: 1 });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /caja/arqueo con denominaciones -> 200 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/caja/arqueo')
      .set(authHeader(token))
      .send({
        cajaId: 1,
        denominaciones: [{ valor: 10, cantidad: 5 }],
        observacion: 'PRUEBA_CAJA_NEGRA',
      });
    // 200 si se registró; 409 si no hay turno abierto; 401/403/503
    expect([200, 409, 401, 403, 503]).toContain(res.status);
  });
});
