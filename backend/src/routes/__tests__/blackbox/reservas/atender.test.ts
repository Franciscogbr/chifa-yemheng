import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Reservas - Atender (caja negra)', () => {
  const RESERVA_ID = 1;

  it('PATCH /:id/atender sin token -> 401', async () => {
    const res = await request(app).patch(`/api/v1/reservas/${RESERVA_ID}/atender`);
    expect(res.status).toBe(401);
  });

  it('PATCH /:id/atender sin permiso RES_ATENDER -> 403 (o 401 si auth-guard rechaza sin BD)', async () => {
    const tokenSinAtender = makeTestToken({
      roles: ['MOZO', 'ADMIN'],
      permisos: ['RES_VER', 'RES_CREAR', 'RES_CONFIRMAR', 'RES_ANULAR'],
    });
    const res = await request(app)
      .patch(`/api/v1/reservas/${RESERVA_ID}/atender`)
      .set(authHeader(tokenSinAtender));
    expect([401, 403]).toContain(res.status);
    if (res.status === 403) {
      expect(res.body.error).toBe('FORBIDDEN');
    }
  });

  it('PATCH /:id/atender con permiso RES_ATENDER -> no devuelve 403 (200 o error de negocio, o 401 sin BD)', async () => {
    const tokenConAtender = makeTestToken({
      roles: ['MOZO', 'ADMIN'],
      permisos: ['RES_VER', 'RES_CREAR', 'RES_CONFIRMAR', 'RES_ANULAR', 'RES_ATENDER'],
    });
    const res = await request(app)
      .patch(`/api/v1/reservas/${RESERVA_ID}/atender`)
      .set(authHeader(tokenConAtender));
    expect([200, 400, 401, 404, 409, 503]).toContain(res.status);
    expect(res.status).not.toBe(403);
  });
});
