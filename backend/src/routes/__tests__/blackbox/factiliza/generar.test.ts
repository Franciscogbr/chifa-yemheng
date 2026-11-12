import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Factiliza - Generar (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['EMP_VER'] });

  it('POST /factiliza/dni sin auth -> 401', async () => {
    const res = await request(app).post('/api/v1/factiliza/dni').send({});
    expect(res.status).toBe(401);
  });

  it('POST /factiliza/ruc sin auth -> 401', async () => {
    const res = await request(app).post('/api/v1/factiliza/ruc').send({});
    expect(res.status).toBe(401);
  });

  it('POST /factiliza/dni con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/factiliza/dni')
      .set(authHeader(token))
      .send({});
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);

  it('POST /factiliza/ruc con payload invalido -> 400 VALIDATION_ERROR o 401', async () => {
    const res = await request(app)
      .post('/api/v1/factiliza/ruc')
      .set(authHeader(token))
      .send({});
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('VALIDATION_ERROR');
    }
  }, 15000);
});
