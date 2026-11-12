import { leerToken } from '../../auth/login/auth-service';
import type { Reserva, ReservaLista, EstadoReserva } from './reservas-types';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/reservas`;

function headers(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${leerToken() ?? ''}` };
}

async function lanzar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
  return (await res.json()) as T;
}

export interface FiltrosReservas {
  page: number;
  limit: number;
  fecha: string;
  mesaId: number | '';
  estado: '' | EstadoReserva;
}

export interface MesaDisponible {
  mesaId: number;
  numero: string;
  capacidad: number;
  ambiente: string;
  disponible: boolean;
  razon?: string;
}

export function listarReservas(f: FiltrosReservas): Promise<ReservaLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.fecha) q.set('fecha', f.fecha);
  if (f.mesaId !== '') q.set('mesaId', String(f.mesaId));
  if (f.estado) q.set('estado', f.estado);
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<ReservaLista>);
}

export function crearReserva(input: {
  clienteId: number;
  mesaId?: number;
  fecha: string;
  hora: string;
  comensales?: number;
  observacion?: string;
}): Promise<Reserva> {
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(input) }).then(lanzar<Reserva>);
}

export function listarMesasDisponibles(fecha: string, hora: string, comensales: number): Promise<MesaDisponible[]> {
  const q = new URLSearchParams({ fecha, hora, comensales: String(comensales) });
  return fetch(`${BASE}/disponibilidad?${q.toString()}`, { headers: headers() }).then(lanzar<MesaDisponible[]>);
}

export function confirmarReserva(
  id: number,
  input: { mesaId: number; observacion?: string; adelanto?: number },
): Promise<Reserva> {
  return fetch(`${BASE}/${id}/confirmar`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(input),
  }).then(lanzar<Reserva>);
}

export function anularReserva(id: number): Promise<Reserva> {
  return fetch(`${BASE}/${id}/anular`, { method: 'PATCH', headers: headers() }).then(lanzar<Reserva>);
}

export function atenderReserva(id: number): Promise<Reserva> {
  return fetch(`${BASE}/${id}/atender`, { method: 'PATCH', headers: headers() }).then(lanzar<Reserva>);
}
