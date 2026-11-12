import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';
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
});
