import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, authHeader, makeTestToken } from '../shared/helpers.js';

describe('Cliente - Pedidos comanda (caja negra)', () => {
  it('GET /cliente/pedidos/comanda sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/cliente/pedidos/comanda');
    expect(res.status).toBe(401);
  });

  it('GET /cliente/pedidos/comanda con token invalido -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/cliente/pedidos/comanda')
      .set('Authorization', 'Bearer invalido');
    expect(res.status).toBe(401);
  });

  it('POST /cliente/pedidos/reserva/atencion valida el modo elegido', async () => {
    const token = makeTestToken({ rol: 'CLIENTE', tipo: 'CLIENTE' });
    const res = await request(app)
      .post('/api/v1/cliente/pedidos/reserva/atencion')
      .set(authHeader(token))
      .send({ mesaId: 0, canal: 'DESCONOCIDO' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
  });
});
