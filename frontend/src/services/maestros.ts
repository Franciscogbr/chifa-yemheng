import { leerToken } from '../features/auth/login/auth-service';

/** Ítem de lista maestra viva (endpoint /maestros/*). Fuente única (cero consts). */
export interface Maestro {
  id: number;
  nombre: string;
  area?: string | null;
  abreviatura?: string | null;
}

import { API_URL } from '../lib/api-url';

const MAESTROS = `${API_URL}/maestros`;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
  };
}

/** Lista viva de distritos con estado A (Ica + aledaños). */
export function listarDistritos(): Promise<Maestro[]> {
  return fetch(`${MAESTROS}/distritos`, { headers: headers() }).then(async (res) => {
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? 'NETWORK_ERROR');
    }
    return (await res.json()) as Maestro[];
  });
}
