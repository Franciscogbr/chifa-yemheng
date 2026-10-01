import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/login/auth-context';

/** PublicGuard: si ya hay sesión, fuera del login. */
export function PublicGuard({ children }: { children: ReactNode }) {
  const { token, usuario } = useAuth();
  if (token && usuario) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

/** AuthGuard: exige JWT (logout automático si inválido/expirado). */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      logout();
      return <Navigate to="/auth/login" replace />;
    }
  } catch {
    logout();
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}

/** RoleGuard: exige tipo de usuario permitido. */
export function RoleGuard({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { usuario } = useAuth();
  const tipo = (usuario?.tipo ?? '').toUpperCase();
  if (!roles.map((r) => r.toUpperCase()).includes(tipo)) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}
