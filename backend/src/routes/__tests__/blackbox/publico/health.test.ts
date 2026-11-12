import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../shared/helpers.js';

describe('Público - Health (caja negra)', () => {
  it('GET /api/v1/health -> 200 con ok=true', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body).toHaveProperty('db', expect.any(Boolean));
  });
});
