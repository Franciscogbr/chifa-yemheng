/** Tipos del módulo clientes (clientes.md + CLIENTE/PERSONA/EMPRESA). */
export type TipoCliente = 'N' | 'J';
export type EstadoRegistro = 'A' | 'I';

export interface Cliente {
  id: number;
  tipo: TipoCliente;
  nombre: string;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  nombreComercial: string;
  documento: string;
  tipoDoc: string;
  telefono: string;
  correo: string | null;
  distritoId: number | null;
  distrito: string;
  direccion: string | null;
  codigoCliente: string | null;
  fNacimiento: string | null;
  genero: 'M' | 'F' | 'O' | null;
  puntos: number;
  estado: EstadoRegistro;
}

export interface ClienteLista {
  data: Cliente[];
  page: number;
  limit: number;
  total: number;
}

export type ClienteErrorCode = 'YA_EXISTE' | 'NOT_FOUND' | 'TIPO_INMUTABLE' | 'VALIDATION_ERROR';

export class ClienteError extends Error {
  readonly code: ClienteErrorCode;

  constructor(code: ClienteErrorCode) {
    super(code);
    this.code = code;
  }
}
