import { useEffect, useState } from 'react';

export type ClienteModo = 'local' | 'casa';

const CLIENTE_MODO_KEY = 'chifa.cliente.modo';
const CLIENTE_MODO_EVENT = 'cliente:modo-cambio';
const MESA_QR_VALIDADO_KEY = 'chifa.cliente.mesa.qr-validado';

function leerModo(): ClienteModo | null {
  const value = sessionStorage.getItem(CLIENTE_MODO_KEY);
  return value === 'local' || value === 'casa' ? value : null;
}

export function guardarModoCliente(modo: ClienteModo): void {
  sessionStorage.setItem(CLIENTE_MODO_KEY, modo);
  window.dispatchEvent(new Event(CLIENTE_MODO_EVENT));
}

export function limpiarModoCliente(): void {
  sessionStorage.removeItem(CLIENTE_MODO_KEY);
  window.dispatchEvent(new Event(CLIENTE_MODO_EVENT));
}

export function marcarQrValidado(): void {
  sessionStorage.setItem(MESA_QR_VALIDADO_KEY, '1');
  window.dispatchEvent(new Event(CLIENTE_MODO_EVENT));
}

export function limpiarQrValidado(): void {
  sessionStorage.removeItem(MESA_QR_VALIDADO_KEY);
  window.dispatchEvent(new Event(CLIENTE_MODO_EVENT));
}

export function leerQrValidado(): boolean {
  return sessionStorage.getItem(MESA_QR_VALIDADO_KEY) === '1';
}

export function useModoCliente(): ClienteModo | null {
  const [modo, setModo] = useState<ClienteModo | null>(leerModo);

  useEffect(() => {
    const actualizar = () => setModo(leerModo());
    window.addEventListener(CLIENTE_MODO_EVENT, actualizar);
    return () => window.removeEventListener(CLIENTE_MODO_EVENT, actualizar);
  }, []);

  return modo;
}
