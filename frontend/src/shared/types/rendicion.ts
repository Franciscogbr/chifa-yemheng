export type EstadoRendicion = 'R' | 'O' | 'V';

export interface RepartidorRendicion {
  id: number;
  nombre: string;
}

export interface PedidoPendienteRendicion {
  idPedidoDelivery: number;
  pedidoId: number;
  cliente: string;
  direccion: string;
  total: number;
  metodoPago: string;
  fechaEntrega: string;
  estadoRendicion: 'P';
}

export interface RendicionRegistroResultado {
  id: number;
  estado: 'Rendido' | 'Observado';
  diferencia: number;
  totalEsperado: number;
}

export interface RendicionHistorial {
  id: number;
  repartidorId: number;
  repartidor: string;
  montoEsperado: number;
  montoEntregado: number;
  diferencia: number;
  estado: EstadoRendicion;
  observaciones: string | null;
  fecha: string;
  validadorId: number | null;
  fechaValidacion: string | null;
  pedidos: Array<{ pedidoId: number; totalEsperado: number }>;
}

export interface RendicionHistorialPagina {
  data: RendicionHistorial[];
  page: number;
  limit: number;
  hasMore: boolean;
}
