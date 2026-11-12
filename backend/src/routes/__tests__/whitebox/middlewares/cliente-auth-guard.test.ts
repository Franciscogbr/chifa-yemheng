import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { clienteAuthGuard } from '../../../../middlewares/cliente-auth-guard.js';
import { env } from '../../../../config/env.js';

describe('Caja blanca - cliente-auth-guard', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.spyOn(env, 'JWT_SECRET', 'get').mockReturnValue('test-secret-caja-negra');
  });

  it('responde 401 cuando no hay token', async () => {
    await clienteAuthGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'CREDENCIALES_INVALIDAS' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('responde 401 cuando el token es inválido', async () => {
    mockReq.headers.authorization = 'Bearer token-invalido';
    await clienteAuthGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('responde 401 cuando el payload no tiene sub numérico', async () => {
    const token = jwt.sign({ sub: 'no-numero', rol: 'CLIENTE' }, 'test-secret-caja-negra');
    mockReq.headers.authorization = `Bearer ${token}`;
    await clienteAuthGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('responde 401 cuando el rol no es CLIENTE', async () => {
    const token = jwt.sign({ sub: 1, rol: 'EMPLEADO' }, 'test-secret-caja-negra');
    mockReq.headers.authorization = `Bearer ${token}`;
    await clienteAuthGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('llama next() y asigna req.user cuando el token es válido', async () => {
    const token = jwt.sign(
      { sub: 5, rol: 'CLIENTE', email: 'cliente@test.com', nombre: 'Cliente Test' },
      'test-secret-caja-negra',
    );
    mockReq.headers.authorization = `Bearer ${token}`;
    await clienteAuthGuard(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      sub: 5,
      rol: 'CLIENTE',
      email: 'cliente@test.com',
      nombre: 'Cliente Test',
    });
  });

  it('usa valores vacíos para email y nombre cuando faltan', async () => {
    const token = jwt.sign({ sub: 5, rol: 'CLIENTE' }, 'test-secret-caja-negra');
    mockReq.headers.authorization = `Bearer ${token}`;
    await clienteAuthGuard(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user.email).toBe('');
    expect(mockReq.user.nombre).toBe('');
  });
});
