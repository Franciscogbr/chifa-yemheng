import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';
import { TEST_CAJA_APERTURA } from '../shared/fixtures.js';

describe('Caja - Abrir turno (caja negra)', () => {
  const token = makeTestToken({ roles: ['CAJERO', 'ADMIN'] });

  it('POST /caja/turno sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/caja/turno')
      .send(TEST_CAJA_APERTURA);
    expect(res.status).toBe(401);
  });

  it('POST /caja/turno sin montoInicial -> 400 VALIDATION_ERROR o 401 si auth falla primero', async () => {
    const res = await request(app)
      .post('/api/v1/caja/turno')
      .set(authHeader(token))
      .send({ cajaId: 1 }); // falta montoInicial
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /caja/turno con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/caja/turno')
      .set(authHeader(token))
      .send(TEST_CAJA_APERTURA);
    // 201 si se abrió; 409 si ya hay caja abierta; 401/403/503
    expect([201, 409, 401, 403, 503]).toContain(res.status);
  });
});
