import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Auth - Caja negra', () => {
  it('POST /auth/login sin cuerpo -> 400', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('POST /auth/login con credenciales invalidas -> 400 o 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ usuario: 'noexiste', clave: 'wrong' });
    expect([400, 401]).toContain(res.status);
  });

  it('GET /auth/permisos sin token -> 401 CREDENCIAS_INVALIDAS', async () => {
    const res = await request(app).get('/api/v1/auth/permisos');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('CREDENCIALES_INVALIDAS');
  });

  it('GET /auth/permisos con token invalido -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/permisos')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('GET /auth/permisos con token valido -> 200 o 401/403/503 segun BD', async () => {
    const token = makeTestToken();
    const res = await request(app)
      .get('/api/v1/auth/permisos')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });

  it('PATCH /auth/clave sin auth -> 401', async () => {
    const res = await request(app).patch('/api/v1/auth/clave').send({});
    expect(res.status).toBe(401);
  });
});
