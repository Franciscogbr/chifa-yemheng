export type EstadoRegistro = 'A' | 'I';

export interface ClienteMesa {
  clienteId: number;
  nombre: string;
  tipoDocumento: string;
  documento: string;
  esOrganizador: boolean;
  consumoEstimado: number;
  estadoCuenta: 'ABIERTA' | 'PAGADA' | null;
  montoPagado: number;
}

/** Respuesta del endpoint de clientes por mesa. */
export interface ClientesMesaResponse {
  modoPagoMesa: 'CUENTA_UNICA' | 'POR_CONSUMO';
  totalComanda: number;
  clientes: ClienteMesa[];
}

export interface OcupacionMesa {
  mesaId: number;
  pedido: string;
  canalOrigen: 'QR' | 'WEB' | 'PRESENCIAL' | null;
  total: number;
  comensales: number;
  mozo: string;
  items: number;
  pendientes: number;
  platos: string[];
}

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
  ocupacion?: OcupacionMesa | null;
}

export interface MesaLista {
  data: Mesa[];
  page: number;
  limit: number;
  total: number;
}

export interface EstadoMesas {
  libres: number;
  ocupadas: number;
  reservadas: number;
  porCobrar: number;
  fueraDeServicio: number;
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

export interface MesaForm {
  ambienteId: number;
  numero: string;
  capacidad: number;
  tipoId: number;
  detalle: string;
  regenerarQr: boolean;
}

export interface AmbienteForm {
  nombre: string;
  descripcion: string;
  piso: number;
}

/** Tipos base (TIPO_MESA seed). Endpoint propio queda como mejora. */
export const TIPOS_MESA: { id: number; label: string }[] = [
  { id: 1, label: 'MESA ESTANDAR' },
  { id: 2, label: 'BOX' },
  { id: 3, label: 'BARRA' },
  { id: 4, label: 'MESA VIP' },
];

/** Colores oficiales fallback (ESTADO_MESA.Color manda desde la API). */
export const COLOR_POR_ESTADO: Record<string, string> = {
  LIBRE: '#28A745',
  OCUPADA: '#DC3545',
  RESERVADA: '#FFC107',
  'POR COBRAR': '#17A2B8',
  'FUERA DE SERVICIO': '#6C757D',
};
