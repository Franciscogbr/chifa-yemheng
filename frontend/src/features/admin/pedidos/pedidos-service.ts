import { api } from '../../../shared/services/api-client';

export type EstadoPreparacion = 'P' | 'L' | 'A';
export type CanalOrigenPedido = 'QR' | 'WEB' | 'PRESENCIAL';

export interface DetallePedidoAdmin {
  id: number;
  pedidoId: number;
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subTotal: number;
  notaCocina: string | null;
  estadoPreparacion: EstadoPreparacion;
  esCortesia: 'S' | 'N';
  fechaSolicitud: string | null;
  fechaAtencion: string | null;
  fechaEntregaMozo: string | null;
  clienteId: number | null;
  estadoRegistro: 'A' | 'I';
}

export interface PedidoAdmin {
  id: number;
  numero: string;
  clienteId: number | null;
  mesaId: number | null;
  mesaNumero: string | null;
  tipoId: number;
  tipo: string;
  canalOrigen: CanalOrigenPedido;
  estadoId: number;
  estado: string;
  usuarioId: number;
  empleadoId: number | null;
  fecha: string | null;
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
  estadoRegistro: 'A' | 'I';
  deliverySituacion?: 'P' | 'R' | 'E' | 'C' | null;
  detalles?: DetallePedidoAdmin[];
}

export interface PedidoListaAdmin {
  data: PedidoAdmin[];
  page: number;
  limit: number;
  total: number;
}

export interface PedidoFiltrosAdmin {
  page: number;
  limit: number;
  estado?: string;
  fecha?: string;
}

export function listarPedidosAdmin(
  filtros: PedidoFiltrosAdmin,
  signal?: AbortSignal,
): Promise<PedidoListaAdmin> {
  const query = new URLSearchParams({
    page: String(filtros.page),
    limit: String(filtros.limit),
  });
  if (filtros.estado) query.set('estado', filtros.estado);
  if (filtros.fecha) query.set('fecha', filtros.fecha);
  return api.request<PedidoListaAdmin>(`/pedidos?${query.toString()}`, { signal });
}

export function obtenerPedidoAdmin(id: number, signal?: AbortSignal): Promise<PedidoAdmin> {
  return api.request<PedidoAdmin>(`/pedidos/${id}`, { signal });
}

export function anularPedidoAdmin(id: number, motivo: string): Promise<{ ok: true }> {
  return api.request<{ ok: true }>(`/pedidos/${id}/anular`, {
    method: 'PATCH',
    body: JSON.stringify({ motivo }),
  });
}
