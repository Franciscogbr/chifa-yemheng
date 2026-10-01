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

export type TipoDocPersona = 'DNI' | 'CE' | 'PASAPORTE';
export type Genero = 'M' | 'F' | 'O';

export interface ClienteForm {
  tipo: TipoCliente;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  tipoDoc: TipoDocPersona;
  dni: string;
  fNacimiento: string;
  genero: Genero | '';
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  telefono: string;
  correo: string;
  distritoId: number;
  direccion: string;
  codigoCliente: string;
}


