import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { LoginResponse } from '../models/auth.js';
import { ClaveError, LoginError } from '../models/auth.js';
import {
  leerEstadoUsuario,
  rpcCambiarClave,
  rpcLogin,
  rpcPermisos,
} from '../repositories/auth-repository.js';
import type { ClaveInput, LoginInput } from '../schemas/auth.js';

const RUTA_POR_TIPO: Record<string, string> = {
  ADMINISTRADOR: '/admin',
  SUPERVISOR: '/admin',
  CAJERO: '/caja',
  MOZO: '/mozo',
  COCINA: '/cocina',
  DELIVERY: '/repartidor',
  ALMACEN: '/admin',
};

/** Jerarquía para multi-rol: mayor privilegio manda (login.md). */
const ORDEN_TIPO = [
  'ADMINISTRADOR',
  'SUPERVISOR',
  'CAJERO',
  'MOZO',
  'COCINA',
  'DELIVERY',
  'ALMACEN',
];

function rutaInicial(tipo: string): string {
  const normalized = (tipo ?? '').toUpperCase();
  if (RUTA_POR_TIPO[normalized]) {
    return RUTA_POR_TIPO[normalized] as string;
  }
  return '/admin';
}

export function tipoPrincipal(tipos: string[]): string {
  for (const t of ORDEN_TIPO) {
    if (tipos.map((x) => x.toUpperCase()).includes(t)) {
      return t;
    }
  }
  return tipos[0] ?? 'MOZO';
}

export async function loginService(input: LoginInput): Promise<LoginResponse> {
  const fn = await rpcLogin(input.logeo, input.clave);

  if (!fn.ok || !fn.id_usuario || !fn.logeo) {
    const mensaje = (fn.mensaje ?? '').toLowerCase();
    if (mensaje.includes('bloqueado')) {
      throw new LoginError('BLOQUEADO');
    }
    if (mensaje.includes('inexistente')) {
      const estado = await leerEstadoUsuario(input.logeo);
      if (estado.existe && (estado.bloqueado || estado.inactivo)) {
        throw new LoginError(estado.inactivo && !estado.bloqueado ? 'INACTIVO' : 'BLOQUEADO');
      }
      throw new LoginError('CREDENCIALES_INVALIDAS');
    }
    throw new LoginError('CREDENCIALES_INVALIDAS');
  }

  const permisos = await rpcPermisos(fn.id_usuario);
  const tipo = (fn.tipo_usuario ?? 'MOZO').toUpperCase();
  const payload = {
    sub: fn.id_usuario,
    logeo: fn.logeo,
    tipo,
    roles: [tipo],
    permisos: permisos.map((p) => p.clave),
  };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' });

  return {
    token,
    usuario: {
      id: fn.id_usuario,
      logeo: fn.logeo,
      tipo,
      empleado: fn.empleado ?? '',
      cargo: fn.cargo ?? '',
    },
    roles: [tipo],
    permisos: permisos.map((p) => p.clave),
    rutaInicial: rutaInicial(tipo),
  };
}

export async function misPermisosService(idUsuario: number) {
  return rpcPermisos(idUsuario);
}

export async function cambiarClaveService(idUsuario: number, input: ClaveInput): Promise<void> {
  if (input.nueva === input.actual) {
    throw new ClaveError('VALIDATION_ERROR');
  }
  const res = await rpcCambiarClave(idUsuario, input.actual, input.nueva);
  if (res.ok) {
    return;
  }
  const msg = (res.mensaje ?? '').toLowerCase();
  if (msg.includes('incorrecta')) {
    throw new ClaveError('ACTUAL_INCORRECTA');
  }
  if (msg.includes('bloqueado')) {
    throw new ClaveError('BLOQUEADO');
  }
  throw new ClaveError('INACTIVO');
}
