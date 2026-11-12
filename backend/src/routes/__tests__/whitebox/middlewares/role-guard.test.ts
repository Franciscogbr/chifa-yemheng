import { describe, expect, it, vi } from 'vitest';
import { requireRoles } from '../../../../middlewares/role-guard.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth-guard.js';

function makeMockUser(overrides: Record<string, unknown> = {}): AuthenticatedRequest['user'] {
  return {
    sub: 1,
    logeo: 'test_user',
    tipo: 'EMPLEADO',
    roles: ['ADMIN', 'MOZO'],
    permisos: ['PED_VER'],
    ...overrides,
  } as AuthenticatedRequest['user'];
}

function makeMockReq(user: AuthenticatedRequest['user']): AuthenticatedRequest {
  return { user } as unknown as AuthenticatedRequest;
}

function makeMockRes(): any {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

function makeMockNext(): any {
  return vi.fn();
}

describe('Caja blanca - role-guard', () => {
  it('responde 401 cuando no hay usuario autenticado', () => {
    const req = makeMockReq(undefined as any);
    const res = makeMockRes();
    const next = makeMockNext();

    requireRoles('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'CREDENCIALES_INVALIDAS' });
    expect(next).not.toHaveBeenCalled();
  });

  it('llama next() cuando el usuario tiene el rol requerido en roles', () => {
    const req = makeMockReq(makeMockUser({ roles: ['ADMIN'] }));
    const res = makeMockRes();
    const next = makeMockNext();

    requireRoles('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('llama next() cuando el usuario tiene el rol requerido en tipo', () => {
    const req = makeMockReq(makeMockUser({ tipo: 'MOZO', roles: [] }));
    const res = makeMockRes();
    const next = makeMockNext();

    requireRoles('MOZO')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('responde 403 cuando el usuario no tiene ninguno de los roles', () => {
    const req = makeMockReq(makeMockUser({ roles: ['MOZO'], tipo: 'MOZO' }));
    const res = makeMockRes();
    const next = makeMockNext();

    requireRoles('ADMIN', 'CAJERO')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'FORBIDDEN' });
    expect(next).not.toHaveBeenCalled();
  });

  it('es insensible a mayúsculas/minúsculas', () => {
    const req = makeMockReq(makeMockUser({ roles: ['admin'] }));
    const res = makeMockRes();
    const next = makeMockNext();

    requireRoles('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('acepta múltiples roles y basta con coincidir uno', () => {
    const req = makeMockReq(makeMockUser({ roles: ['MOZO'] }));
    const res = makeMockRes();
    const next = makeMockNext();

    requireRoles('ADMIN', 'CAJERO', 'MOZO')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
