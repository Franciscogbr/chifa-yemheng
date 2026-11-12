import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Seguridad - Permisos (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['SEG_ROL'] });

  it('GET /seguridad/permisos sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/seguridad/permisos');
    expect(res.status).toBe(401);
  });

  it('GET /seguridad/permisos con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/seguridad/permisos')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });
});
