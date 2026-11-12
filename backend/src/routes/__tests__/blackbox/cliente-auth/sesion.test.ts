import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Cliente auth - Sesion (caja negra)', () => {
  it('GET /cliente/sesion -> 200 o 401', async () => {
    const res = await request(app).get('/api/v1/cliente/sesion');
    expect([200, 401]).toContain(res.status);
  });
});
