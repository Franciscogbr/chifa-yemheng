import { env } from '../config/env.js';

type Documento = 'dni' | 'ruc';
type Registro = Record<string, unknown>;

export class FactilizaError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = 'FactilizaError';
  }
}

export interface DatosDni {
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  fNacimiento: string | null;
  genero: 'M' | 'F' | 'O' | null;
  direccion: string | null;
  ubicacion: UbigeoNombres;
}

export interface DatosRuc {
  razonSocial: string;
  direccion: string | null;
  ubicacion: UbigeoNombres;
}

export interface UbigeoNombres {
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
}

function isRecord(value: unknown): value is Registro {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function texto(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function nombreUbigeo(data: Registro, clave: string): string | null {
  const campos = isRecord(data['ubigeo']) ? data['ubigeo'] : {};
  const candidatos = [
    data[clave],
    data[`nombre_${clave}`],
    data[`d_${clave}`],
    campos[clave],
    campos[`nombre_${clave}`],
  ];
  for (const candidato of candidatos) {
    const nombre = texto(candidato)
      ?? (isRecord(candidato) ? texto(candidato['nombre']) ?? texto(candidato['name']) : null);
    if (nombre) return nombre;
  }
  return null;
}

function ubicacion(data: Registro): UbigeoNombres {
  return {
    departamento: nombreUbigeo(data, 'departamento'),
    provincia: nombreUbigeo(data, 'provincia'),
    distrito: nombreUbigeo(data, 'distrito'),
  };
}

async function consultarFactiliza(tipo: Documento, numero: string): Promise<Registro> {
  const token = env.FACTILIZA_TOKEN?.trim();
  if (!token) {
    throw new FactilizaError(503, 'FACTILIZA_NOT_CONFIGURED');
  }

  let response: Response;
  try {
    response = await fetch(`https://api.factiliza.com/v1/${tipo}/info/${encodeURIComponent(numero)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new FactilizaError(504, 'FACTILIZA_TIMEOUT');
    }
    console.error(`[Factiliza] Error de conexión al consultar ${tipo} (${error instanceof Error ? error.name : 'unknown'}).`);
    throw new FactilizaError(502, 'FACTILIZA_UNAVAILABLE');
  }

  if (response.status === 429) {
    throw new FactilizaError(503, 'FACTILIZA_RATE_LIMITED');
  }
  if (response.status === 401 || response.status === 403) {
    console.error(`[Factiliza] La API rechazó las credenciales (${response.status}).`);
    throw new FactilizaError(502, 'FACTILIZA_CREDENTIALS_INVALID');
  }
  if (!response.ok) {
    if (response.status === 404 || response.status === 400) {
      throw new FactilizaError(404, 'DOCUMENT_NOT_FOUND');
    }
    throw new FactilizaError(502, 'FACTILIZA_UNAVAILABLE');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new FactilizaError(502, 'FACTILIZA_INVALID_RESPONSE');
  }

  if (!isRecord(body) || body['success'] !== true || !isRecord(body['data'])) {
    throw new FactilizaError(404, 'DOCUMENT_NOT_FOUND');
  }
  return body['data'];
}

function fechaIso(value: unknown): string | null {
  const fecha = texto(value);
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const date = new Date(`${fecha}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== fecha ? null : fecha;
}

function generoPersona(value: unknown): DatosDni['genero'] {
  const sexo = texto(value)?.toUpperCase();
  if (sexo === 'M' || sexo === 'MASCULINO' || sexo === 'HOMBRE') return 'M';
  if (sexo === 'F' || sexo === 'FEMENINO' || sexo === 'MUJER') return 'F';
  if (sexo === 'O') return 'O';
  return null;
}

export async function consultarDni(numero: string): Promise<DatosDni> {
  const data = await consultarFactiliza('dni', numero);
  const nombres = texto(data['nombres']);
  const apPaterno = texto(data['apellido_paterno']);
  const apMaterno = texto(data['apellido_materno']);
  if (!nombres || !apPaterno || !apMaterno) {
    throw new FactilizaError(502, 'FACTILIZA_INVALID_RESPONSE');
  }

  return {
    nombres,
    apPaterno,
    apMaterno,
    fNacimiento: fechaIso(data['fecha_nacimiento']),
    genero: generoPersona(data['sexo']),
    direccion: texto(data['direccion']),
    ubicacion: ubicacion(data),
  };
}

export async function consultarRuc(numero: string): Promise<DatosRuc> {
  const data = await consultarFactiliza('ruc', numero);
  const razonSocial = texto(data['nombre_o_razon_social']);
  if (!razonSocial) {
    throw new FactilizaError(502, 'FACTILIZA_INVALID_RESPONSE');
  }
  return { razonSocial, direccion: texto(data['direccion']), ubicacion: ubicacion(data) };
}
