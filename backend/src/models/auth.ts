/** Tipos del módulo auth (BR-ACC-035/036). */
export interface LoginRequest {
  logeo: string;
  clave: string;
}

export interface AuthUsuario {
  id: number;
  logeo: string;
  tipo: string;
  empleado: string;
  cargo: string;
}

export interface PermisoEfectivo {
  modulo: string;
  orden: number;
  clave: string;
  permiso: string;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUsuario;
  roles: string[];
  permisos: string[];
  rutaInicial: string;
}

export interface JwtPayload {
  sub: number;
  logeo: string;
  tipo: string;
  roles: string[];
  permisos: string[];
}

/** Respuesta cruda de fn_login (JSON). */
export interface FnLoginResult {
  ok: boolean;
  id_usuario: number;
  logeo: string | null;
  tipo_usuario: string | null;
  empleado: string | null;
  cargo: string | null;
  mensaje: string;
}

export type LoginErrorCode = 'CREDENCIALES_INVALIDAS' | 'BLOQUEADO' | 'INACTIVO';

export type ClaveErrorCode = 'ACTUAL_INCORRECTA' | 'BLOQUEADO' | 'INACTIVO' | 'VALIDATION_ERROR';

export class ClaveError extends Error {
  readonly code: ClaveErrorCode;

  constructor(code: ClaveErrorCode) {
    super(code);
    this.code = code;
  }
}

export class LoginError extends Error {
  readonly code: LoginErrorCode;

  constructor(code: LoginErrorCode) {
    super(code);
    this.code = code;
  }
}
