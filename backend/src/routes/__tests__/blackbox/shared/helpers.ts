import jwt from 'jsonwebtoken';
import { createApp } from '../../../../app.js';

export const app = createApp();

/**
 * Genera un JWT válido para pruebas de caja negra.
 * El payload coincide con lo que espera auth-guard (sub, logeo, tipo, roles, permisos, authVersion).
 */
export function makeTestToken(overrides: Record<string, unknown> = {}): string {
  const payload = {
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
    authVersion: 0,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };

  const secret = process.env.JWT_SECRET ?? 'test-secret-caja-negra';
  return jwt.sign(payload, secret);
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
