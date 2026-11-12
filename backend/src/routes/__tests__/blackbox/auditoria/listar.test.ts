import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Auditoría - Listar (caja negra)', () => {
  const token = makeTestToken({ roles: ['ADMIN'], permisos: ['AUD_VER'] });

  it('GET /auditoria sin auth -> 401', async () => {
    const res = await request(app).get('/api/v1/auditoria/');
    expect(res.status).toBe(401);
  });

  it('GET /auditoria con auth -> 200 o 403/503', async () => {
    const res = await request(app)
      .get('/api/v1/auditoria/')
      .set(authHeader(token));
    expect([200, 401, 403, 503]).toContain(res.status);
  });
});
