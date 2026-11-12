import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Público - Mesas QR (caja negra)', () => {
  it('GET /api/v1/mesas/by-qr sin codigo -> 400', async () => {
    const res = await request(app).get('/api/v1/mesas/by-qr');
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/mesas/by-qr?codigo=NO-EXISTE -> 200 o 404', async () => {
    const res = await request(app).get('/api/v1/mesas/by-qr?codigo=NO-EXISTE');
    expect([200, 404]).toContain(res.status);
  });
});
