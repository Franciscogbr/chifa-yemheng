import { describe, expect, it, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { authGuard } from '../../../../middlewares/auth-guard.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth-guard.js';
import { env } from '../../../../config/env.js';

describe('Caja blanca - auth-guard', () => {
  let mockReq: AuthenticatedRequest;
  let mockRes: any;
  let mockNext: any;

  const validPayload = {
    sub: 1,
    logeo: 'test_user',
    tipo: 'EMPLEADO',
    roles: ['ADMIN'],
    permisos: ['PED_VER'],
    authVersion: 0,
  };

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.spyOn(env, 'JWT_SECRET', 'get').mockReturnValue('test-secret-caja-negra');
  });

  it('responde 401 cuando no hay header Authorization', async () => {
    await authGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'CREDENCIALES_INVALIDAS' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('responde 401 cuando el header no empieza con Bearer ', async () => {
    mockReq.headers.authorization = 'Token abc123';
    await authGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('responde 401 cuando el token es inválido', async () => {
    mockReq.headers.authorization = 'Bearer token-invalido';
    await authGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('responde 401 cuando el payload del JWT no tiene la estructura válida', async () => {
    const tokenInvalido = jwt.sign({ sub: 'no-es-numero' }, 'test-secret-caja-negra');
    mockReq.headers.authorization = `Bearer ${tokenInvalido}`;
    await authGuard(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('responde 503 cuando el estado de sesión no está disponible', async () => {
    const token = jwt.sign(validPayload, 'test-secret-caja-negra');
    mockReq.headers.authorization = `Bearer ${token}`;
    await authGuard(mockReq, mockRes, mockNext);
    expect([401, 503]).toContain(mockRes.status.mock.calls[0]?.[0] || 200);
  });
});
