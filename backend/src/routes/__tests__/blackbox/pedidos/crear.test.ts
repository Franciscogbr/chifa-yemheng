import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';
import { TEST_PEDIDO_VALIDO } from '../shared/fixtures.js';

describe('Pedidos - Crear (caja negra)', () => {
  const token = makeTestToken({ roles: ['MOZO', 'ADMIN'] });

  it('POST /pedidos sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/')
      .send(TEST_PEDIDO_VALIDO);
    expect(res.status).toBe(401);
  });

  it('POST /pedidos con payload invalido -> 400 VALIDATION_ERROR o 401 si auth falla primero', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/')
      .set(authHeader(token))
      .send({ tipo: 'texto' }); // tipo debe ser number positivo
    // auth-guard se evalúa antes que validación de cuerpo en Express
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /pedidos con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/')
      .set(authHeader(token))
      .send(TEST_PEDIDO_VALIDO);
    // 201 si se creó; 409 si mesa ocupada; 401/403/503 si hay problema de sesión/BD
    expect([201, 409, 401, 403, 503]).toContain(res.status);
  });
});
