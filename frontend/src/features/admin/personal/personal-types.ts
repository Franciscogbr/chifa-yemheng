export type EstadoRegistro = 'A' | 'I';

export type Genero = 'M' | 'F' | 'O';

/** Etiquetas UI para el enum de género (el valor M/F/O lo manda CK_PERSONA_GEN). */
export const GENERO_LABELS: Record<Genero, string> = {
  M: 'Masculino',
  F: 'Femenino',
  O: 'Otro',
};

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
  genero: Genero | null;
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

export interface PersonalForm {
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  tipoDoc: 'DNI' | 'CE' | 'PASAPORTE';
  documento: string;
  telefono: string;
  correo: string;
  direccion: string;
  distritoId: number;
  fNacimiento: string;
  genero: Genero | '';
  cargoId: number;
  contratoId: number;
  turno: string;
  fondoPension: string;
  nHijos: number | null;
  essalud: string;
  fIngreso: string;
  fCese: string;
  sueldo: number;
}
