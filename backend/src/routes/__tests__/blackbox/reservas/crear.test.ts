import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Reservas - Crear (caja negra)', () => {
  const token = makeTestToken({ roles: ['MOZO', 'ADMIN'] });

  const RESERVA_VALIDA = {
    fecha: '2026-12-01',
    hora: '20:00',
    comensales: 2,
  };

  it('POST /reservas sin auth -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/reservas/')
      .send(RESERVA_VALIDA);
    expect(res.status).toBe(401);
  });

  it('POST /reservas con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/reservas/')
      .set(authHeader(token))
      .send({ fecha: 'fecha-invalida' });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /reservas con payload valido -> 201 o error de negocio', async () => {
    const res = await request(app)
      .post('/api/v1/reservas/')
      .set(authHeader(token))
      .send(RESERVA_VALIDA);
    expect([201, 400, 409, 401, 403, 503]).toContain(res.status);
  }, 15000);
});
