import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Cliente auth - Email session (caja negra)', () => {
  it('POST /cliente/email/session con cuerpo vacio -> 400', async () => {
    const res = await request(app).post('/api/v1/cliente/email/session').send({});
    expect(res.status).toBe(400);
  });

  it('POST /cliente/email/session con email invalido -> 400', async () => {
    const res = await request(app)
      .post('/api/v1/cliente/email/session')
      .send({ email: 'no-es-un-email' });
    expect(res.status).toBe(400);
  });
});
