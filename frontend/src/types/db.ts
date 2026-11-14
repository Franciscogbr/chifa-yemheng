export type RolNombre = 'ADMINISTRADOR' | 'SUPERVISOR' | 'CAJERO' | 'MOZO' | 'COCINA' | 'REPARTIDOR';

export interface Categoria {
  id_categoriaproducto: number;
  n_categoriaproducto: string;
  descripcion?: string | null;
  area_despacho?: string | null;
  orden_carta?: number | null;
  estado?: string | null;
}

export interface Producto {
  id_producto: number;
  id_categoriaproducto: number;
  n_producto: string;
  detalle?: string | null;
  precio: number;
  tipo_producto?: string | null;
  tiempo_preparacion?: number | null;
  controla_stock?: string | null;
  stock_actual?: number | null;
  stock_minimo?: number | null;
  disponible?: string | null;
  imagen?: string | null;
  estado?: string | null;
  categoria?: string;
}

export interface Mesa {
  id_mesa: number;
  numero?: string | null;
  detalle?: string | null;
  capacidad?: number | null;
  id_estadomesa?: number | null;
  id_ambiente?: number | null;
  estado_mesa?: string;
  ambiente?: string;
  codigo_qr?: string | null;
  estado?: string | null;
}

export interface Pedido {
  id_pedido: number;
  numero_pedido?: string | null;
  id_cliente?: number | null;
  id_mesa?: number | null;
  id_tipopedido?: number | null;
  id_estadopedido?: number | null;
  f_pedido?: string | null;
  total?: number | null;
  subtotal?: number | null;
  igv?: number | null;
  facturado?: string | null;
  anulado?: string | null;
  observacion?: string | null;
  estado_pedido?: string;
  mesa_numero?: string;
}

export interface DetallePedido {
  id_detallepedido?: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number | null;
  subtotal?: number | null;
  estado_preparacion?: string | null;
  observacion?: string | null;
  f_solicitud?: string | null;
  n_producto?: string;
}

export interface Reserva {
  id_reserva: number;
  id_cliente?: number | null;
  id_mesa?: number | null;
  f_reserva?: string | null;
  n_personas?: number | null;
  adelanto?: number | null;
  situacion?: string | null;
  observacion?: string | null;
  origen?: 'WEB' | 'TELEFONO' | 'PERSONAL';
  f_llegada?: string | null;
  canal_atencion?: 'QR' | 'MOZO' | null;
  cliente_nombre?: string;
  mesa_numero?: string;
  pedido_id?: number | null;
}

export interface Delivery {
  id_pedidodelivery?: number;
  id_pedido: number;
  direccion?: string | null;
  id_distrito?: number | null;
  distrito?: string;
  costo_envio?: number | null;
  situacion?: string | null;
  id_repartidor?: number | null;
  repartidor?: string;
  f_salida?: string | null;
  f_entrega?: string | null;
}

export interface StaffUser {
  id_usuario: number;
  logeo: string;
  id_tipousuario: number;
  rol: string;
  id_empleado?: number | null;
  estado: string;
  bloqueado: string;
}

export interface Cliente {
  id_cliente: number;
  codigo_cliente?: string | null;
  tipo_cliente?: string | null;
  puntos?: number | null;
  nombre?: string;
  email?: string;
  celular?: string;
  estado?: string | null;
}