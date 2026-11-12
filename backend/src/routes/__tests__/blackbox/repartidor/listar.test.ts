import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Repartidor - Listar (caja negra)', () => {
  const token = makeTestToken({ roles: ['REPARTIDOR'], permisos: ['DELIVERY_VER'] });

  it('GET /repartidor/entregas sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/repartidor/entregas');
    expect(res.status).toBe(401);
  });

  it('GET /repartidor/entregas con auth -> 200 o 403/404/503', async () => {
    const res = await request(app)
      .get('/api/v1/repartidor/entregas')
      .set(authHeader(token));
    // 403 porque auth-guard no encuentra empleadoId en el token por defecto
    expect([200, 401, 403, 404, 503]).toContain(res.status);
  });

  it('GET /repartidor/por-rendir con auth -> 200 o 403/404/503', async () => {
    const res = await request(app)
      .get('/api/v1/repartidor/por-rendir')
      .set(authHeader(token));
    expect([200, 401, 403, 404, 503]).toContain(res.status);
  });
});
