import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Cliente auth - Logout (caja negra)', () => {
  it('POST /cliente/logout -> 200 o 401', async () => {
    const res = await request(app).post('/api/v1/cliente/logout');
    expect([200, 401]).toContain(res.status);
  });
});
