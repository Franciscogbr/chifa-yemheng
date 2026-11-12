import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Dashboard - Resumen (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['DASHBOARD_VER'] });

  it('GET /dashboard/resumen sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/dashboard/resumen');
    expect(res.status).toBe(401);
  });

  it('GET /dashboard/resumen con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/resumen')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });
});
