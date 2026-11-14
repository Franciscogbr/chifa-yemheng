import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';
import { TEST_RESERVA_CLIENTE_VALIDA } from '../shared/fixtures.js';

describe('Cliente - Reservas (caja negra)', () => {
  it('POST /cliente/reservas sin token cliente -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/cliente/reservas')
      .send(TEST_RESERVA_CLIENTE_VALIDA);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'CREDENCIALES_INVALIDAS');
  });

  it('POST /cliente/reservas con payload invalido -> 401 (auth primero)', async () => {
    const res = await request(app)
      .post('/api/v1/cliente/reservas')
      .send({});
    expect(res.status).toBe(401);
  });

  it('GET /cliente/reservas/:id/continuar sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/cliente/reservas/17/continuar');
    expect(res.status).toBe(401);
  });

  it('GET /cliente/reservas/:id/continuar rechaza un id inválido', async () => {
    const token = makeTestToken({ sub: 42, rol: 'CLIENTE' });
    const res = await request(app)
      .get('/api/v1/cliente/reservas/no-valida/continuar')
      .set(authHeader(token));
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
  });

  it('DELETE /cliente/reservas/:id sin token -> 401', async () => {
    const res = await request(app).delete('/api/v1/cliente/reservas/17');
    expect(res.status).toBe(401);
  });
});
