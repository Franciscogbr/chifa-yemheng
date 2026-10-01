import { leerToken } from '../../auth/login/auth-service';
import { headerEquipo } from '../../../utils/equipo';
import type { Cliente, ClienteForm, ClienteLista, TipoCliente } from './clientes-types';

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/clientes`;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
    ...headerEquipo(),
  };
}

async function lanzar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
  return (await res.json()) as T;
}

export interface FiltrosClientes {
  page: number;
  limit: number;
  buscar: string;
  tipo: '' | TipoCliente;
  estado: '' | 'A' | 'I';
  orden: 'puntos' | 'alpha' | 'recientes';
}

export function listarClientes(f: FiltrosClientes): Promise<ClienteLista> {
  const q = new URLSearchParams({
    page: String(f.page),
    limit: String(f.limit),
    orden: f.orden,
  });
  if (f.buscar) {
    q.set('buscar', f.buscar);
  }
  if (f.tipo) {
    q.set('tipo', f.tipo);
  }
  if (f.estado) {
    q.set('estado', f.estado);
  }
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<ClienteLista>);
}

export { listarDistritos } from '../../../services/maestros';
export { listarTiposIdentidad } from '../personal/personal-service';

export function crearCliente(input: ClienteForm): Promise<Cliente> {
  const distritoId = input.distritoId || undefined;
  const correo = input.correo.trim() || undefined;
  const codigoCliente = input.codigoCliente.trim() || undefined;
  const body =
    input.tipo === 'N'
      ? {
          tipo: 'N' as const,
          nombres: input.nombres.trim(),
          apPaterno: input.apPaterno.trim(),
          apMaterno: input.apMaterno.trim(),
          tipoDoc: input.tipoDoc,
          dni: input.dni.trim(),
          fNacimiento: input.fNacimiento || undefined,
          genero: input.genero || undefined,
          telefono: input.telefono.trim(),
          correo,
          direccion: input.direccion.trim(),
          distritoId,
          codigoCliente,
        }
      : {
          tipo: 'J' as const,
          razonSocial: input.razonSocial.trim(),
          nombreComercial: input.nombreComercial.trim(),
          ruc: input.ruc.trim(),
          telefono: input.telefono.trim(),
          correo,
          direccion: input.direccion.trim(),
          distritoId,
          codigoCliente,
        };
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(
    lanzar<Cliente>,
  );
}

export function actualizarCliente(id: number, input: Partial<ClienteForm>): Promise<Cliente> {
  const body: Record<string, unknown> = {};
  // En updates se omiten los '' que el schema rechaza (min(1)/email).
  if (input.nombres !== undefined && input.nombres.trim()) {
    body['nombres'] = input.nombres.trim();
  }
  if (input.apPaterno !== undefined) {
    body['apPaterno'] = input.apPaterno.trim();
  }
  if (input.apMaterno !== undefined) {
    body['apMaterno'] = input.apMaterno.trim();
  }
  if (input.razonSocial !== undefined && input.razonSocial.trim()) {
    body['razonSocial'] = input.razonSocial.trim();
  }
  if (input.nombreComercial !== undefined) {
    body['nombreComercial'] = input.nombreComercial.trim();
  }
  if (input.telefono !== undefined && input.telefono.trim()) {
    body['telefono'] = input.telefono.trim();
  }
  if (input.correo !== undefined && input.correo.trim()) {
    body['correo'] = input.correo.trim();
  }
  if (input.direccion !== undefined) {
    body['direccion'] = input.direccion.trim();
  }
  if (input.distritoId !== undefined) {
    body['distritoId'] = input.distritoId ? input.distritoId : null;
  }
  if (input.codigoCliente !== undefined) {
    body['codigoCliente'] = input.codigoCliente.trim() || null;
  }
  if (input.fNacimiento !== undefined) {
    body['fNacimiento'] = input.fNacimiento || null;
  }
  if (input.genero !== undefined) {
    body['genero'] = input.genero || null;
  }
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  }).then(lanzar<Cliente>);
}

export function cambiarEstadoCliente(id: number, estado: 'A' | 'I'): Promise<Cliente> {
  return fetch(`${BASE}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ estado }),
  }).then(lanzar<Cliente>);
}
