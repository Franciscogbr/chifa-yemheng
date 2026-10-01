import { z } from 'zod';

export const loginSchema = z.object({
  logeo: z.string().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres'),
  clave: z.string().min(1, 'Ingrese su clave').max(100),
});

export type LoginForm = z.infer<typeof loginSchema>;

export interface AuthUsuario {
  id: number;
  logeo: string;
  tipo: string;
  empleado: string;
  cargo: string;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUsuario;
  roles: string[];
  permisos: string[];
  rutaInicial: string;
}

export type LoginErrorCode =
  | 'CREDENCIALES_INVALIDAS'
  | 'BLOQUEADO'
  | 'INACTIVO'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR';

export const LOGIN_MENSAJES: Record<Exclude<LoginErrorCode, 'NETWORK_ERROR' | 'VALIDATION_ERROR'>, string> = {
  CREDENCIALES_INVALIDAS: 'Usuario o contraseña incorrectos. Intentos restantes: N.',
  BLOQUEADO: 'Usuario bloqueado tras 3 intentos. Contacte al administrador.',
  INACTIVO: 'Usuario inactivo. Contacte al administrador.',
};
