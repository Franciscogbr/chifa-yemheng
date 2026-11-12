import { leerToken } from '../../auth/login/auth-service';
import type {
  Ambiente,
  AmbienteForm,
  ClientesMesaResponse,
  EstadoMesas,
  Mesa,
  MesaForm,
  MesaLista,
  OcupacionMesa,
} from './mesas-types';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/mesas`;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${leerToken() ?? ''}`,
  };
}

async function lanzar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
  return (await res.json()) as T;
}

export interface FiltrosMesas {
  page: number;
  limit: number;
  ambiente: number | '';
  estado: '' | 'A' | 'I';
  buscar: string;
}

export function listarMesas(f: FiltrosMesas): Promise<MesaLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.ambiente !== '') {
    q.set('ambiente', String(f.ambiente));
  }
  if (f.estado) {
    q.set('estado', f.estado);
  }
  if (f.buscar) {
    q.set('buscar', f.buscar);
  }
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<MesaLista>);
}

export function crearMesa(input: MesaForm): Promise<Mesa> {
  const body = {
    ambienteId: input.ambienteId,
    numero: input.numero.trim().toUpperCase(),
    capacidad: input.capacidad,
    tipoId: input.tipoId,
    detalle: input.detalle.trim(),
  };
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(
    lanzar<Mesa>,
  );
}

export function actualizarMesa(id: number, input: Partial<MesaForm>): Promise<Mesa> {
  const body: Record<string, unknown> = {};
  if (input.ambienteId) {
    body['ambienteId'] = input.ambienteId;
  }
  if (input.numero !== undefined) {
    body['numero'] = input.numero.trim().toUpperCase();
  }
  if (input.capacidad !== undefined) {
    body['capacidad'] = input.capacidad;
  }
  if (input.tipoId) {
    body['tipoId'] = input.tipoId;
  }
  if (input.detalle !== undefined) {
    body['detalle'] = input.detalle.trim();
  }
  if (input.regenerarQr !== undefined) {
    body['regenerarQr'] = input.regenerarQr;
  }
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  }).then(lanzar<Mesa>);
}

export function cambiarEstadoMesa(id: number, estado: 'A' | 'I'): Promise<Mesa> {
  return fetch(`${BASE}/${id}/estado`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ estado }),
  }).then(lanzar<Mesa>);
}

/** Ocupación en vivo por mesa (mozo + consumo en curso). Vacío si no hay pedidos abiertos. */
export function listarOcupacion(): Promise<OcupacionMesa[]> {
  return fetch(`${BASE}/ocupacion`, { headers: headers() }).then(lanzar<OcupacionMesa[]>);
}

/** Clientes participantes en la comanda activa de una mesa, con modo de pago y total. */
export function listarClientesMesa(
  mesaId: number,
): Promise<ClientesMesaResponse> {
  return fetch(`${BASE}/${mesaId}/clientes`, { headers: headers() }).then(
    lanzar<ClientesMesaResponse>,
  );
}

export function listarAmbientes(): Promise<Ambiente[]> {
  return fetch(`${BASE}/ambientes/todos`, { headers: headers() }).then(
    lanzar<{ data: Ambiente[] }>,
  ).then((r) => r.data);
}

export function crearAmbiente(input: AmbienteForm): Promise<Ambiente> {
  return fetch(`${BASE}/ambientes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ nombre: input.nombre.trim(), descripcion: input.descripcion.trim(), piso: input.piso }),
  }).then(lanzar<Ambiente>);
}

export function cambiarEstadoAmbiente(id: number, estado: 'A' | 'I'): Promise<Ambiente> {
  return fetch(`${BASE}/ambientes/${id}/estado`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ estado }),
  }).then(lanzar<Ambiente>);
}

export function estadoService(): Promise<EstadoMesas> {
  return fetch(`${BASE}/estado`, { headers: headers() }).then(lanzar<EstadoMesas>);
}
