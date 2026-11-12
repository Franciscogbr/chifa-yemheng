import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Cliente - Pedidos activos (caja negra)', () => {
  it('GET /cliente/pedidos/activos sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/cliente/pedidos/activos');
    expect(res.status).toBe(401);
  });

  it('GET /cliente/pedidos/activos con token invalido -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/cliente/pedidos/activos')
      .set('Authorization', 'Bearer invalido');
    expect(res.status).toBe(401);
  });
});
