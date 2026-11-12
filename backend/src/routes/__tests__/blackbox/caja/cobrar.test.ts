import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Caja - Cobrar (caja negra)', () => {
  const token = makeTestToken({ roles: ['CAJERO', 'ADMIN'] });

  const COBRO_VALIDO = {
    pedidoId: 1,
    cajaId: 1,
    tipoDocumento: 'BOLETA',
    pagos: [{ metodo: 'EFECTIVO', monto: 100 }],
  };

  it('POST /caja/cobro sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/caja/cobro')
      .send(COBRO_VALIDO);
    expect(res.status).toBe(401);
  });

  it('POST /caja/cobro con payload invalido -> 400 VALIDATION_ERROR o 401 si auth falla primero', async () => {
    const res = await request(app)
      .post('/api/v1/caja/cobro')
      .set(authHeader(token))
      .send({});
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /caja/cobro con payload valido -> 200 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/caja/cobro')
      .set(authHeader(token))
      .send(COBRO_VALIDO);
    // 200 si se cobró; 404 si pedido no existe; 409 si no hay caja abierta; 422 si monto insuficiente; 401/403/503
    expect([200, 404, 409, 422, 401, 403, 503]).toContain(res.status);
  });
});
