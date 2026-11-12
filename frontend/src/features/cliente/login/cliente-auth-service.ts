import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const TOKEN_KEY = 'chifa.cliente.token';
const USER_KEY = 'chifa.cliente.user';

import { API_URL } from '../../../lib/api-url';
let clienteAuthClient: SupabaseClient | null = null;

export interface ClienteSesion {
  id: number;
  nombre: string;
  email: string;
  puntos: number;
  token: string;
}

function getClienteAuthClient(): SupabaseClient {
  if (clienteAuthClient) return clienteAuthClient;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error('El acceso por correo no está configurado. Faltan las variables de Supabase del frontend.');
  }
  clienteAuthClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return clienteAuthClient;
}

function mensajeErrorAuth(message: string, code?: string): string {
  switch (code) {
    case 'redirect_to_not_allowed':
      return 'Supabase rechazó la URL de retorno. Autoriza http://localhost:5174/cliente/login en Authentication > URL Configuration > Redirect URLs.';
    case 'signup_disabled':
      return 'El registro de nuevas cuentas está deshabilitado en Supabase.';
    case 'email_address_invalid':
      return 'El formato del correo no es válido.';
    case 'weak_password':
      return 'La contraseña no cumple los requisitos de seguridad de Supabase.';
    case 'over_email_send_rate_limit':
      return 'Se enviaron demasiados correos. Espera un momento antes de volver a intentarlo.';
    case 'email_exists':
    case 'user_already_exists':
      return 'Ya existe una cuenta con ese correo. Prueba iniciar sesión.';
  }
  if (message.includes('Invalid login credentials')) return 'El correo o la contraseña no son correctos.';
  if (message.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (message.includes('User already registered')) return 'No se pudo registrar la cuenta. Verifica los datos o inicia sesión.';
  return 'No se pudo completar la solicitud. Revisa la configuración de autenticación de Supabase e inténtalo nuevamente.';
}

export async function clienteRegistrarCorreo(email: string, password: string, nombre: string): Promise<void> {
  const client = getClienteAuthClient();
  const callback = new URL('/cliente/login', window.location.origin);
  callback.searchParams.set('email_confirmed', '1');
  const currentParams = new URLSearchParams(window.location.search);
  const mesa = currentParams.get('mesa');
  if (mesa) callback.searchParams.set('mesa', mesa);
  if (currentParams.get('redirect') === 'comanda') callback.searchParams.set('redirect', 'comanda');
  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: callback.toString(),
    },
  });
  if (error) throw new Error(mensajeErrorAuth(error.message, error.code));
}

export async function clientePasswordLogin(email: string, password: string): Promise<ClienteSesion> {
  const client = getClienteAuthClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mensajeErrorAuth(error.message, error.code));
  if (!data.session?.access_token) throw new Error('No se pudo iniciar sesión. Inténtalo nuevamente.');

  const response = await fetch(`${API_URL}/cliente/email/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken: data.session.access_token }),
  });
  const body = await response.json().catch(() => ({})) as {
    token?: string;
    cliente?: { id: number; nombre: string; email: string; puntos: number };
    error?: string;
  };
  if (!response.ok || !body.token || !body.cliente) {
    if (body.error === 'EMAIL_NO_VERIFICADO') throw new Error('Confirma tu correo antes de iniciar sesión.');
    throw new Error('No se pudo validar la sesión. Inténtalo nuevamente.');
  }
  return {
    token: body.token,
    id: body.cliente.id,
    nombre: body.cliente.nombre,
    email: body.cliente.email,
    puntos: body.cliente.puntos,
  };
}

export async function clienteSolicitarRestablecimiento(email: string): Promise<void> {
  const { error } = await getClienteAuthClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/cliente/restablecer`,
  });
  if (error) throw new Error(mensajeErrorAuth(error.message, error.code));
}

export async function clienteActualizarClave(
  accessToken: string,
  refreshToken: string,
  password: string,
): Promise<void> {
  const client = getClienteAuthClient();
  const { error: sessionError } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (sessionError) throw new Error('El enlace para cambiar la contraseña venció o ya fue utilizado. Solicita uno nuevo.');

  const { error } = await client.auth.updateUser({ password });
  if (error) throw new Error(mensajeErrorAuth(error.message, error.code));
  await client.auth.signOut({ scope: 'local' });
}

export async function clienteGoogleLogin(idToken: string): Promise<ClienteSesion> {
  const res = await fetch(`${API_URL}/cliente/oauth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'LOGIN_FAILED');
  }
  const data = (await res.json()) as { token: string; cliente: { id: number; nombre: string; email: string; puntos: number } };
  return { token: data.token, id: data.cliente.id, nombre: data.cliente.nombre, email: data.cliente.email, puntos: data.cliente.puntos };
}

export function guardarSesionCliente(s: ClienteSesion): void {
  localStorage.setItem(TOKEN_KEY, s.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ id: s.id, nombre: s.nombre, email: s.email, puntos: s.puntos }));
}

export function limpiarSesionCliente(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function leerTokenCliente(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function leerCliente(): Omit<ClienteSesion, 'token'> | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Omit<ClienteSesion, 'token'>;
  } catch {
    return null;
  }
}

export async function clienteSesionRequest(): Promise<Omit<ClienteSesion, 'token'> | null> {
  const token = leerTokenCliente();
  if (!token) return null;
  const res = await fetch(`${API_URL}/cliente/sesion`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    limpiarSesionCliente();
    return null;
  }
  const data = (await res.json()) as { id: number; nombre: string; email: string; puntos: number };
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
}

export async function clienteLogoutRequest(): Promise<void> {
  const token = leerTokenCliente();
  if (!token) return;
  await fetch(`${API_URL}/cliente/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
  limpiarSesionCliente();
}