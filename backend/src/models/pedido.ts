/** Tipos del módulo pedidos (pedido/detalle_pedido/estado_pedido/tipo_pedido). */
export type EstadoPedido = 'A' | 'I';
export type CanalPedido = 'QR' | 'WEB' | 'PRESENCIAL';
export type ModoPagoMesa = 'CUENTA_UNICA' | 'POR_CONSUMO';

export interface Pedido {
  id: number;
  numero: string;
  clienteId: number | null;
  mesaId: number | null;
  mesaNumero: string | null;
  tipoId: number;
  tipo: string;
  canalOrigen: CanalPedido;
  modoPagoMesa: ModoPagoMesa;
  estadoId: number;
  estado: string;
  usuarioId: number;
  empleadoId: number | null;
  fecha: string;
  fechaCierre: string | null;
  comensales: number;
  subtotal: number;
  descuento: number;
  servicio: number;
  igv: number;
  total: number;
  facturado: 'S' | 'N';
  anulado: 'S' | 'N';
  motivoAnulacion: string | null;
  observacion: string | null;
  estadoRegistro: EstadoPedido;
  /** Situación del delivery asociado, null cuando el pedido no tiene delivery. */
  deliverySituacion?: 'P' | 'R' | 'E' | 'C' | null;
  detalles?: DetallePedido[];
  participantes?: ParticipantePedido[];
}

export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subTotal: number;
  notaCocina: string | null;
  estadoPreparacion: 'P' | 'L' | 'A';
  esCortesia: 'S' | 'N';
  fechaSolicitud: string;
  fechaAtencion: string | null;
  fechaEntregaMozo: string | null;
  clienteId: number | null;
  estadoRegistro: EstadoPedido;
}

export interface PedidoLista {
  data: Pedido[];
  page: number;
  limit: number;
  total: number;
}

export type PedidoErrorCode =
  | 'YA_EXISTE'
  | 'NOT_FOUND'
  | 'TIPO_INVALIDO'
  | 'MESA_OCUPADA'
  | 'PEDIDO_FACTURADO'
  | 'PEDIDO_ANULADO'
  | 'PRODUCTO_NO_DISPONIBLE'
  | 'NO_PARTICIPANTE'
  | 'NO_ES_ORGANIZADOR'
  | 'NO_COMANDA_ACTIVA'
  | 'MESA_POR_COBRAR'
  | 'YA_POR_COBRAR'
  | 'MOZO_PEDIDO_DIGITAL'
  | 'ENTREGA_NO_DISPONIBLE'
  | 'RESERVA_NO_ESPERA_MOZO'
  | 'VALIDATION_ERROR'
  | 'LA_MESA_NO_ADMITE_NUEVOS_PARTICIPANTES'
  | 'MODO_PAGO_BLOQUEADO'
  | 'SIN_CUENTA';

export interface ParticipantePedido {
  clienteId: number;
  nombre: string;
  esOrganizador: boolean;
  consumoEstimado?: number;
}

export class PedidoError extends Error {
  readonly code: PedidoErrorCode;

  constructor(code: PedidoErrorCode) {
    super(code);
    this.code = code;
  }
}
