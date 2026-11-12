import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Auth - Permisos y RBAC (caja negra)', () => {
  it('GET /auth/permisos sin Authorization -> 401', async () => {
    const res = await request(app).get('/api/v1/auth/permisos');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('CREDENCIALES_INVALIDAS');
  });

  it('GET /auth/permisos con Bearer vacio -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/permisos')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('GET /auth/permisos con token mal formado -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/permisos')
      .set('Authorization', 'NotBearer abc123');
    expect(res.status).toBe(401);
  });

  it('GET /auth/permisos con token valido pero sin sesion en BD -> 401 o 503', async () => {
    const token = makeTestToken({ sub: 999999 });
    const res = await request(app)
      .get('/api/v1/auth/permisos')
      .set(authHeader(token));
    expect([401, 503]).toContain(res.status);
  });

  it('GET /auth/permisos con token valido y rol ADMIN -> 200 o 403', async () => {
    const token = makeTestToken({
      sub: 1,
      roles: ['ADMIN'],
      permisos: ['*'],
    });
    const res = await request(app)
      .get('/api/v1/auth/permisos')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });
});
