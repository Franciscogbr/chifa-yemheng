/** Tipos del módulo reservas (RESERVA). */
export type EstadoReserva = 'P' | 'C' | 'A' | 'X';

export interface Reserva {
  id: number;
  clienteId: number;
  cliente: string;
  mesaId: number | null;
  mesa: string | null;
  fecha: string;
  hora: string;
  comensales: number;
  adelanto: number;
  observacion: string | null;
  estado: EstadoReserva;
  origen: 'WEB' | 'TELEFONO' | 'PERSONAL';
  llegada: string | null;
  canalAtencion: 'QR' | 'MOZO' | null;
  fechaCreacion: string;
}

export interface SolicitudMozo {
  reservaId: number;
  cliente: string;
  mesaId: number;
  mesa: string;
  fecha: string;
  hora: string;
  comensales: number;
  llegada: string;
}

export interface ReservaLista {
  data: Reserva[];
  page: number;
  limit: number;
  total: number;
}

export interface DisponibilidadMesa {
  mesaId: number;
  numero: string;
  capacidad: number;
  ambiente: string;
  disponible: boolean;
  razon?: string;
}

export type ReservaErrorCode = 'NOT_FOUND' | 'VALIDATION_ERROR' | 'MESA_OCUPADA' | 'CAPACIDAD_INSUFICIENTE' | 'ESTADO_INVALIDO';

export class ReservaError extends Error {
  readonly code: ReservaErrorCode;

  constructor(code: ReservaErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}