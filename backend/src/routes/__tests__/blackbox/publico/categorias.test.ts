import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Público - Categorías (caja negra)', () => {
  it('GET /api/v1/categorias -> 200 con array de data', async () => {
    const res = await request(app).get('/api/v1/categorias/');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  }, 15000);

  it('GET /api/v1/categorias/:id -> 200 o 404', async () => {
    const res = await request(app).get('/api/v1/categorias/1');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('id');
    }
  });
});
