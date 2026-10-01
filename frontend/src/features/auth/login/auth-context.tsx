import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  guardarSesion,
  leerToken,
  leerUsuario,
  limpiarSesion,
  loginRequest,
} from './auth-service';
import type { AuthUsuario, LoginForm } from './login-types';

interface AuthContextValue {
  token: string | null;
  usuario: AuthUsuario | null;
  rutaInicial: string | null;
  login: (input: LoginForm) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => leerToken());
  const [usuario, setUsuario] = useState<AuthUsuario | null>(() => leerUsuario());
  const [rutaInicial, setRutaInicial] = useState<string | null>(null);

  const login = useCallback(async (input: LoginForm): Promise<string> => {
    const data = await loginRequest(input);
    guardarSesion(data);
    setToken(data.token);
    setUsuario(data.usuario);
    setRutaInicial(data.rutaInicial);
    return data.rutaInicial;
  }, []);

  const logout = useCallback(() => {
    limpiarSesion();
    setToken(null);
    setUsuario(null);
    setRutaInicial(null);
  }, []);

  const value = useMemo(
    () => ({ token, usuario, rutaInicial, login, logout }),
    [token, usuario, rutaInicial, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
