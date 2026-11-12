import { describe, expect, it, vi } from 'vitest';
import { asyncHandler } from '../../../../utils/async-handler.js';

describe('Caja blanca - async-handler', () => {
  it('envía la respuesta cuando el handler resuelve correctamente', async () => {
    const handler = asyncHandler(async (_req, res, _next) => {
      res.status(200).json({ ok: true });
    });

    const req = {} as any;
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('reenvía errores al next() cuando el handler rechaza', async () => {
    const error = new Error('error de prueba');
    const handler = asyncHandler(async (_req, _res, _next) => {
      throw error;
    });

    const req = {} as any;
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
