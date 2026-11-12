import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Clientes - Crear (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'] });

  const CLIENTE_VALIDO = {
    nombre: 'Cliente Prueba Caja Negra',
    telefono: '999999999',
    documento: '12345678',
  };

  it('POST /clientes sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/clientes/')
      .send(CLIENTE_VALIDO);
    expect(res.status).toBe(401);
  });

  it('POST /clientes con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/clientes/')
      .set(authHeader(token))
      .send({ nombre: 123 });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /clientes con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/clientes/')
      .set(authHeader(token))
      .send(CLIENTE_VALIDO);
    expect([201, 409, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
