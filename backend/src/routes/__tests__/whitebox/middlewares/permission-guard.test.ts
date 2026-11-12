import { describe, expect, it, vi } from 'vitest';
import { requirePermisos, requirePermisosORoles } from '../../../../middlewares/permission-guard.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth-guard.js';

function makeMockUser(overrides: Record<string, unknown> = {}): AuthenticatedRequest['user'] {
  return {
    sub: 1,
    logeo: 'test_user',
    tipo: 'EMPLEADO',
    roles: ['ADMIN', 'MOZO'],
    permisos: ['PED_VER', 'PED_REGISTRAR', 'CAJA_ABRIR'],
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

describe('Caja blanca - permission-guard', () => {
  describe('requirePermisos', () => {
    it('responde 401 cuando no hay usuario autenticado', () => {
      const req = makeMockReq(undefined as any);
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisos('PED_VER')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'CREDENCIALES_INVALIDAS' });
      expect(next).not.toHaveBeenCalled();
    });

    it('llama next() cuando el usuario tiene el permiso requerido', () => {
      const req = makeMockReq(makeMockUser({ permisos: ['PED_VER', 'PED_REGISTRAR'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisos('PED_VER')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('responde 403 cuando el usuario no tiene ninguno de los permisos requeridos', () => {
      const req = makeMockReq(makeMockUser({ permisos: ['PED_VER'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisos('CAJA_ABRIR', 'CAJA_COBRAR')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'FORBIDDEN' });
      expect(next).not.toHaveBeenCalled();
    });

    it('permite acceso cuando el usuario tiene al menos uno de varios permisos', () => {
      const req = makeMockReq(makeMockUser({ permisos: ['PED_VER', 'OTRO'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisos('CAJA_ABRIR', 'PED_VER')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('es insensible a mayúsculas/minúsculas en permisos', () => {
      const req = makeMockReq(makeMockUser({ permisos: ['ped_ver'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisos('PED_VER')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('responde 403 cuando no tiene RES_ATENDER', () => {
      const req = makeMockReq(makeMockUser({ permisos: ['RES_VER', 'RES_CREAR'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisos('RES_ATENDER')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'FORBIDDEN' });
      expect(next).not.toHaveBeenCalled();
    });

    it('llama next() cuando el usuario tiene RES_ATENDER', () => {
      const req = makeMockReq(makeMockUser({ permisos: ['RES_VER', 'RES_ATENDER'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisos('RES_ATENDER')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('requirePermisosORoles', () => {
    it('llama next() cuando el usuario tiene el permiso requerido', () => {
      const req = makeMockReq(makeMockUser({ permisos: ['PED_VER'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisosORoles(['PED_VER'], ['CAJERO'])(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('llama next() cuando el usuario tiene el rol requerido aunque no tenga el permiso', () => {
      const req = makeMockReq(makeMockUser({ roles: ['CAJERO'], permisos: ['OTRO'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisosORoles(['PED_VER'], ['CAJERO'])(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('responde 403 cuando no tiene permiso ni rol', () => {
      const req = makeMockReq(makeMockUser({ roles: ['MOZO'], permisos: ['PED_VER'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisosORoles(['CAJA_ABRIR'], ['CAJERO'])(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('es insensible a mayúsculas en roles', () => {
      const req = makeMockReq(makeMockUser({ roles: ['cajero'] }));
      const res = makeMockRes();
      const next = makeMockNext();

      requirePermisosORoles([], ['CAJERO'])(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
