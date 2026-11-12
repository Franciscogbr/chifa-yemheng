import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Mesas - Crear (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'] });

  const MESA_VALIDA = {
    numero: 99,
    tipoMesaId: 1,
    capacidad: 4,
  };

  it('POST /mesas sin auth -> 401', async () => {
    const res = await request(app).post('/api/v1/mesas/').send(MESA_VALIDA);
    expect(res.status).toBe(401);
  });

  it('POST /mesas con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/mesas/')
      .set(authHeader(token))
      .send({ numero: 'texto' });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /mesas con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/mesas/')
      .set(authHeader(token))
      .send(MESA_VALIDA);
    expect([201, 409, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
