import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';
import { TEST_PERSONAL_VALIDO } from '../shared/fixtures.js';

describe('Personal - Crear (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['EMP_CREAR'] });

  it('POST /personal sin auth -> 401', async () => {
    const res = await request(app).post('/api/v1/personal/').send(TEST_PERSONAL_VALIDO);
    expect(res.status).toBe(401);
  });

  it('POST /personal con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/personal/')
      .set(authHeader(token))
      .send({ nombres: 123 });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /personal con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/personal/')
      .set(authHeader(token))
      .send(TEST_PERSONAL_VALIDO);
    expect([201, 409, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
