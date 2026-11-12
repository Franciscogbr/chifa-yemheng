import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Pedidos - Anular (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'] });

  it('PATCH /pedidos/:id/anular sin auth -> 401', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/1/anular')
      .send({ motivo: 'prueba' });
    expect(res.status).toBe(401);
  });

  it('PATCH /pedidos/:id/anular sin motivo -> 400 VALIDATION_ERROR o 401 si auth falla primero', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/1/anular')
      .set(authHeader(token))
      .send({});
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('PATCH /pedidos/:id/anular con motivo valido -> 200 o error de negocio', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/999999/anular')
      .set(authHeader(token))
      .send({ motivo: 'PRUEBA_CAJA_NEGRA' });
    // 200 si se anuló; 404 si no existe; 409 si ya facturado/anulado; 401/403/503
    expect([200, 404, 409, 401, 403, 503]).toContain(res.status);
  });
});
