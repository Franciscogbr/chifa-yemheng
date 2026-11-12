import { leerToken } from '../../auth/login/auth-service';
import type {
  ParametrosNegocio,
  SugerenciaDireccion,
  TarifaDistrito,
  TarifaForm,
} from './delivery-parametros-types';

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

export function getParametros(): Promise<ParametrosNegocio> {
  return fetch(`${BASE}/parametros`, { headers: headers() }).then(lanzar<ParametrosNegocio>);
}

export function actualizarParametros(input: Partial<ParametrosNegocio>): Promise<ParametrosNegocio> {
  return fetch(`${BASE}/parametros`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(input),
  }).then(lanzar<ParametrosNegocio>);
}

export function listarTarifasDistrito(): Promise<TarifaDistrito[]> {
  return fetch(`${BASE}/parametros/tarifas`, { headers: headers() }).then(lanzar<TarifaDistrito[]>);
}

export function guardarTarifaDistrito(distritoId: number, input: TarifaForm): Promise<TarifaDistrito> {
  return fetch(`${BASE}/parametros/tarifas/${distritoId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(input),
  }).then(lanzar<TarifaDistrito>);
}

const NOMINATIM = 'https://nominatim.openstreetmap.org';

/** Sugerencias de direccion (autocompletado) via Nominatim/OpenStreetMap. */
export async function sugerirDirecciones(query: string): Promise<SugerenciaDireccion[]> {
  const texto = query.trim();
  if (texto.length < 4) return [];
  try {
    const res = await fetch(
      `${NOMINATIM}/search?format=json&q=${encodeURIComponent(texto)}&limit=5&addressdetails=1`,
      { headers: { 'User-Agent': 'ChifaYemheng/1.0', 'Accept-Language': 'es' } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
    return data.map((d) => ({ etiqueta: d.display_name, lat: Number(d.lat), lng: Number(d.lon) }));
  } catch {
    return [];
  }
}

/** Convierte coordenadas en una direccion legible. */
export async function reversarGeocodificacion(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'ChifaYemheng/1.0', 'Accept-Language': 'es' } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}
