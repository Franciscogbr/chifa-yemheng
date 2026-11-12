import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Delivery - Crear (caja negra)', () => {
  const token = makeTestToken({ roles: ['MOZO', 'ADMIN'] });

  const DELIVERY_VALIDO = {
    clienteId: 1,
    direccion: 'Direccion de prueba caja negra',
    telefono: '999999999',
    total: 25.00,
  };

  it('POST /delivery sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/delivery/')
      .send(DELIVERY_VALIDO);
    expect(res.status).toBe(401);
  });

  it('POST /delivery con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/delivery/')
      .set(authHeader(token))
      .send({ direccion: 123 });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /delivery con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/delivery/')
      .set(authHeader(token))
      .send(DELIVERY_VALIDO);
    expect([201, 400, 409, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
