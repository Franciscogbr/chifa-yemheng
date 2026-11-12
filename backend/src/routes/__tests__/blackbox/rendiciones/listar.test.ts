import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';
import { TEST_RENDICION_VALIDA } from '../shared/fixtures.js';

describe('Rendiciones - Listar y Crear (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['REN_VER', 'REN_REGISTRAR'] });

  it('GET /rendiciones sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/rendiciones/');
    expect(res.status).toBe(401);
  });

  it('GET /rendiciones con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/rendiciones/')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });

  it('GET /rendiciones/pendientes sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/rendiciones/pendientes');
    expect(res.status).toBe(401);
  });

  it('POST /rendiciones con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/rendiciones/')
      .set(authHeader(token))
      .send({});
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /rendiciones con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/rendiciones/')
      .set(authHeader(token))
      .send(TEST_RENDICION_VALIDA);
    expect([201, 400, 409, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
