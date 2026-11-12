import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Cliente - Delivery (caja negra)', () => {
  it('GET /cliente/delivery sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/cliente/delivery');
    expect(res.status).toBe(401);
  });

  it('GET /cliente/delivery/cobertura sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/cliente/delivery/cobertura');
    expect(res.status).toBe(401);
  });

  it('POST /cliente/delivery sin token -> 401', async () => {
    const res = await request(app).post('/api/v1/cliente/delivery').send({});
    expect(res.status).toBe(401);
  });

  it('GET /cliente/delivery/sugerir-costo sin token -> 401', async () => {
    const res = await request(app).get('/api/v1/cliente/delivery/sugerir-costo');
    expect(res.status).toBe(401);
  });
});
