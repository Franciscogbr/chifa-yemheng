import { describe, expect, it, vi } from 'vitest';
import { errorHandler, notFoundHandler } from '../../../../middlewares/error-handler.js';

describe('Caja blanca - error-handler', () => {
  describe('notFoundHandler', () => {
    it('responde 404 con NOT_FOUND', () => {
      const req = {} as any;
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'NOT_FOUND' });
    });
  });

  describe('errorHandler', () => {
    it('responde 500 con INTERNAL_ERROR para errores genéricos', () => {
      const err = new Error('algo falló');
      const req = {} as any;
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'INTERNAL_ERROR' });
    });

    it('responde 500 con INTERNAL_ERROR para errores sin mensaje', () => {
      const err = 'string error';
      const req = {} as any;
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'INTERNAL_ERROR' });
    });

    it('registra el error en consola', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('test log');
      const req = {} as any;
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(err);
      consoleSpy.mockRestore();
    });
  });
});
