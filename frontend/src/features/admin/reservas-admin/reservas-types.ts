export const EstadoReservaValores = ['P', 'C', 'A', 'X'] as const;
export type EstadoReserva = typeof EstadoReservaValores[number];

export interface Reserva {
  id: number;
  clienteId: number;
  cliente: string;
  mesaId: number | null;
  mesa: string | null;
  fecha: string;
  hora: string;
  comensales: number;
  observacion: string | null;
  estado: EstadoReserva;
  origen: 'WEB' | 'TELEFONO' | 'PERSONAL';
  llegada: string | null;
  canalAtencion: 'QR' | 'MOZO' | null;
  fechaCreacion: string;
}

export interface ReservaLista {
  data: Reserva[];
  page: number;
  limit: number;
  total: number;
}

export const ESTADO_RESERVA: Record<EstadoReserva, string> = {
  P: 'Pendiente',
  C: 'Confirmada',
  A: 'Atendida',
  X: 'Cancelada',
};
