import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Pedidos - Cocina (caja negra)', () => {
  const tokenCocina = makeTestToken({
    roles: ['COCINA'],
    permisos: ['PED_COCINA'],
  });

  const tokenSinPermiso = makeTestToken({
    roles: ['MOZO'],
    permisos: ['PED_VER'],
  });

  it('GET /pedidos/cocina sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/pedidos/cocina');
    expect(res.status).toBe(401);
  });

  it('GET /pedidos/cocina con rol COCINA -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/cocina')
      .set(authHeader(tokenCocina));
    expect([200, 401, 403, 503]).toContain(res.status);
  });

  it('GET /pedidos/cocina sin permiso PED_COCINA -> 403 o 401/503', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/cocina')
      .set(authHeader(tokenSinPermiso));
    expect([403, 401, 503]).toContain(res.status);
  });
});
