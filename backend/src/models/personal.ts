/** Tipos del módulo personal (recursos-humanos.md + PERSONA/EMPLEADO). */
export type EstadoRegistro = 'A' | 'I';

export interface Personal {
  id: number;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  documento: string;
  tipoDoc: string;
  telefono: string;
  correo: string | null;
  direccion: string | null;
  distritoId: number | null;
  distrito: string;
  fNacimiento: string | null;
  genero: 'M' | 'F' | 'O' | null;
  cargoId: number;
  cargo: string;
  area: string;
  contratoId: number;
  contrato: string;
  turno: string | null;
  fondoPension: string | null;
  nHijos: number | null;
  essalud: string | null;
  fIngreso: string | null;
  fCese: string | null;
  sueldo: number;
  estado: EstadoRegistro;
}

export interface PersonalLista {
  data: Personal[];
  page: number;
  limit: number;
  total: number;
}

export type PersonalErrorCode = 'YA_EXISTE' | 'NOT_FOUND' | 'VALIDATION_ERROR';

export class PersonalError extends Error {
  readonly code: PersonalErrorCode;

  constructor(code: PersonalErrorCode) {
    super(code);
    this.code = code;
  }
}
