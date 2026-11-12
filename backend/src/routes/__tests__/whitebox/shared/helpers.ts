import type { NextFunction, Request, Response } from 'express';

/**
 * Crea un objeto Request de Express simulado (mock) para pruebas de caja blanca.
 */
export function makeMockRequest(overrides: Record<string, unknown> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    user: undefined,
    socket: { remoteAddress: undefined },
    ...overrides,
  } as unknown as Request;
}

/**
 * Crea un objeto Response de Express simulado que captura status y body.
 */
export function makeMockResponse(): Response & {
  statusCode?: number;
  body?: unknown;
  calls: Array<{ method: string; args: unknown[] }>;
} {
  const res: any = {
    statusCode: 200,
    body: undefined,
    calls: [],
  };
  res.status = vi.fn(function (code: number) {
    this.statusCode = code;
    this.calls.push({ method: 'status', args: [code] });
    return this;
  });
  res.json = vi.fn(function (data: unknown) {
    this.body = data;
    this.calls.push({ method: 'json', args: [data] });
    return this;
  });
  res.send = vi.fn(function (data: unknown) {
    this.body = data;
    this.calls.push({ method: 'send', args: [data] });
    return this;
  });
  return res;
}

/**
 * Crea una función NextFunction simulada.
 */
export function makeMockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

/**
 * Helper para crear un usuario autenticado simulado (AuthenticatedRequest.user).
 */
export function makeMockUser(overrides: Record<string, unknown> = {}) {
  return {
    sub: 1,
    logeo: 'test_user',
    tipo: 'EMPLEADO',
    roles: ['ADMIN', 'MOZO', 'CAJERO'],
    permisos: [
      'PED_VER', 'PED_REGISTRAR', 'PED_ANULAR', 'PED_COCINA', 'PED_ENTREGAR', 'PED_EDITAR',
      'CAJA_ABRIR', 'CAJA_COBRAR', 'CAJA_CERRAR',
      'CLI_VER', 'PROD_VER', 'MES_VER', 'RES_VER',
      'EMP_VER', 'EMP_CREAR', 'EMP_EDITAR', 'EMP_ELIMINAR',
      'UNIDAD_VER', 'UNIDAD_CREAR', 'UNIDAD_EDITAR', 'UNIDAD_ELIMINAR',
      'TMESA_VER', 'TMESA_CREAR', 'TMESA_EDITAR', 'TMESA_ELIMINAR',
      'INV_VER', 'INV_CREAR', 'REC_VER', 'REC_CREAR',
      'SEG_USUARIO', 'SEG_ROL',
      'DASHBOARD_VER',
      'REN_VER', 'REN_REGISTRAR', 'REN_VALIDAR',
      'AUD_VER',
      'DELIVERY_VER', 'DELIVERY_ENTREGAR', 'DELIVERY_DESPACHAR',
      'CAT_VER', 'CAT_CREAR', 'CAT_EDITAR',
    ],
    ...overrides,
  };
}
