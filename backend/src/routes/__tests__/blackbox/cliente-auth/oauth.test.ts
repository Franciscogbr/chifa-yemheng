import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Cliente auth - OAuth Google (caja negra)', () => {
  it('POST /cliente/oauth/google -> 200 o 400 o 503', async () => {
    const res = await request(app).post('/api/v1/cliente/oauth/google');
    expect([200, 400, 503]).toContain(res.status);
  });
});
