/** Tipos del módulo mesas (mesas.md + MESA/AMBIENTE/TIPO_MESA/ESTADO_MESA). */
export type EstadoRegistro = 'A' | 'I';

export interface Mesa {
  id: number;
  numero: string;
  ambienteId: number;
  ambiente: string;
  capacidad: number;
  tipoId: number;
  tipo: string;
  cargoServicio: number;
  estadoOperativoId: number;
  estadoOperativo: string;
  color: string;
  detalle: string | null;
  qr: string | null;
  estado: EstadoRegistro;
}

export interface MesaLista {
  data: Mesa[];
  page: number;
  limit: number;
  total: number;
}

export interface Ambiente {
  id: number;
  nombre: string;
  descripcion: string | null;
  piso: number | null;
  mesas: number;
  estado: EstadoRegistro;
}

/** Pedido abierto por mesa (mapa en vivo): mozo + consumo en curso. */
export interface OcupacionMesa {
  mesaId: number;
  pedido: string;
  total: number;
  comensales: number;
  mozo: string;
  items: number;
  pendientes: number;
  platos: string[];
}

export type MesaErrorCode =
  | 'YA_EXISTE'
  | 'NOT_FOUND'
  | 'AMBIENTE_INVALIDO'
  | 'TIPO_INVALIDO'
  | 'VALIDATION_ERROR'
  | 'QR_DESINCRONIZADO'
  | 'QR_INVALIDO';

export class MesaError extends Error {
  readonly code: MesaErrorCode;

  constructor(code: MesaErrorCode) {
    super(code);
    this.code = code;
  }
}
