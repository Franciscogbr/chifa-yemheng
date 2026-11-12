import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clienteGoogleLogin,
  clienteLogoutRequest,
  clienteSesionRequest,
  guardarSesionCliente,
  leerCliente,
  leerTokenCliente,
} from '../login/cliente-auth-service';
import type { ClienteSesion } from '../login/cliente-auth-service';
import { limpiarModoCliente } from './cliente-mode';

interface ClienteAuthContextValue {
  token: string | null;
  cliente: Omit<ClienteSesion, 'token'> | null;
  establecerSesion: (sesion: ClienteSesion) => void;
  loginCliente: (idToken: string) => Promise<void>;
  logoutCliente: () => Promise<void>;
  refrescarSesion: () => Promise<void>;
}

const ClienteAuthContext = createContext<ClienteAuthContextValue | null>(null);

export function ClienteAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => leerTokenCliente());
  const [cliente, setCliente] = useState<Omit<ClienteSesion, 'token'> | null>(() => leerCliente());

  const establecerSesion = useCallback((sesion: ClienteSesion) => {
    guardarSesionCliente(sesion);
    setToken(sesion.token);
    setCliente({ id: sesion.id, nombre: sesion.nombre, email: sesion.email, puntos: sesion.puntos });
  }, []);

  const loginCliente = useCallback(async (idToken: string) => {
    const sesion = await clienteGoogleLogin(idToken);
    establecerSesion(sesion);
  }, [establecerSesion]);

  const logoutCliente = useCallback(async () => {
    await clienteLogoutRequest();
    setToken(null);
    setCliente(null);
    limpiarModoCliente();
    window.dispatchEvent(new Event('cliente:limpiar-sesion'));
  }, []);

  const refrescarSesion = useCallback(async () => {
    const data = await clienteSesionRequest();
    if (data) {
      setCliente(data);
    } else {
      setToken(null);
      setCliente(null);
      limpiarModoCliente();
      window.dispatchEvent(new Event('cliente:limpiar-sesion'));
    }
  }, []);

  const value = useMemo(
    () => ({ token, cliente, establecerSesion, loginCliente, logoutCliente, refrescarSesion }),
    [token, cliente, establecerSesion, loginCliente, logoutCliente, refrescarSesion],
  );
  return <ClienteAuthContext.Provider value={value}>{children}</ClienteAuthContext.Provider>;
}

export function useClienteAuth(): ClienteAuthContextValue {
  const ctx = useContext(ClienteAuthContext);
  if (!ctx) {
    throw new Error('useClienteAuth debe usarse dentro de ClienteAuthProvider');
  }
  return ctx;
}