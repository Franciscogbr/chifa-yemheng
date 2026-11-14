/** Tipos del módulo seguridad (USUARIO, ROL, PERMISO). */
export type EstadoRegistro = 'A' | 'I';

export interface Usuario {
  id: number;
  logeo: string;
  tipo: string;
  empleadoId: number | null;
  empleado: string | null;
  bloqueado: string;
  intentos: number;
  estado: EstadoRegistro;
  fechaCreacion: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoRegistro;
}

export interface Permiso {
  id: number;
  modulo: string;
  moduloId: number;
  nombre: string;
  clave: string;
  descripcion: string | null;
  estado: EstadoRegistro;
}

export interface UsuarioLista {
  data: Usuario[];
  page: number;
  limit: number;
  total: number;
}

export interface RolLista {
  data: Rol[];
  page: number;
  limit: number;
  total: number;
}

export interface PermisoLista {
  data: Permiso[];
  page: number;
  limit: number;
  total: number;
}

export interface SeguridadActor {
  id: number;
  logeo: string;
  tipo: string;
  permisos: string[];
}

export type SeguridadErrorCode =
  | 'NOT_FOUND'
  | 'YA_EXISTE'
  | 'TIPO_INVALIDO'
  | 'ROL_TIPO_NO_ENCONTRADO'
  | 'ROL_TIPO_EN_USO'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'AUTO_MODIFICACION_PROHIBIDA'
  | 'EMPLEADO_INACTIVO'
  | 'ULTIMO_ADMINISTRADOR'
  | 'PERMISO_INVALIDO'
  | 'PRIVILEGE_ESCALATION'
  | 'MOTIVO_REQUERIDO';

export class SeguridadError extends Error {
  readonly code: SeguridadErrorCode;

  constructor(code: SeguridadErrorCode) {
    super(code);
    this.code = code;
  }
}
