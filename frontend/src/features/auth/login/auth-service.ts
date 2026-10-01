import { api } from '../../../services/api';
import type { LoginErrorCode, LoginForm, LoginResponse } from './login-types';

const TOKEN_KEY = 'chifa.token';
const USER_KEY = 'chifa.user';

export async function loginRequest(input: LoginForm): Promise<LoginResponse> {
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('NETWORK_ERROR');
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const code = (body.error ?? 'NETWORK_ERROR') as LoginErrorCode;
    throw new Error(code);
  }
  return (await res.json()) as LoginResponse;
}

export async function cambiarClaveRequest(actual: string, nueva: string): Promise<void> {
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/auth/clave`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${leerToken() ?? ''}`,
    },
    body: JSON.stringify({ actual, nueva }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
}
export function guardarSesion(data: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
}

export function limpiarSesion(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function leerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function leerUsuario(): LoginResponse['usuario'] | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as LoginResponse['usuario'];
  } catch {
    return null;
  }
}

export { api };
