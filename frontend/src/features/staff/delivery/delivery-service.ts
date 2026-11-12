import { leerToken } from '../../auth/login/auth-service';
import type { Delivery, DeliveryLista, EstadoDelivery } from './delivery-types';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/delivery`;

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

export interface FiltrosDelivery {
  page: number;
  limit: number;
  estado: '' | EstadoDelivery;
}

export function listarDelivery(f: FiltrosDelivery): Promise<DeliveryLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.estado) q.set('estado', f.estado);
  return fetch(`${BASE}?${q.toString()}`, { headers: headers() }).then(lanzar<DeliveryLista>);
}

export function crearDelivery(input: {
  pedidoId: number;
  distritoId?: number;
  direccion: string;
  referencia?: string;
  telefono?: string;
  costo?: number;
}): Promise<Delivery> {
  return fetch(BASE, { method: 'POST', headers: headers(), body: JSON.stringify(input) }).then(lanzar<Delivery>);
}

export function asignarRepartidor(id: number, repartidorId: number): Promise<Delivery> {
  return fetch(`${BASE}/${id}/asignar`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ repartidorId }) }).then(lanzar<Delivery>);
}

export function despacharDelivery(id: number): Promise<Delivery> {
  return fetch(`${BASE}/${id}/despachar`, { method: 'PATCH', headers: headers() }).then(lanzar<Delivery>);
}

export function entregarDelivery(id: number): Promise<Delivery> {
  return fetch(`${BASE}/${id}/entregar`, { method: 'PATCH', headers: headers() }).then(lanzar<Delivery>);
}
