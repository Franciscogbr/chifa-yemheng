import { supabase } from '../config/supabase.js';
import { DeliveryError, type Delivery, type PedidoItem } from '../models/delivery.js';

interface PedidoDeliveryRow {
  id_pedidodelivery: number;
  id_pedido: number;
  id_distrito: number | null;
  distrito: { d_distrito: string } | null;
  direccion_entrega: string;
  referencia: string | null;
  telefono_contacto: string | null;
  id_empleado: number | null;
  repartidor: { persona: { nombre: string; ap_paterno: string | null } } | null;
  costo_envio: number;
  costo_envio_confirmado: boolean;
  situacion: string;
  feccre: string;
  lat_cliente: number | null;
  lng_cliente: number | null;
  lat_repartidor: number | null;
  lng_repartidor: number | null;
  f_ubicacion: string | null;
  f_salida: string | null;
  f_entrega: string | null;
}

const SELECT = 'id_pedidodelivery, id_pedido, id_distrito, distrito(d_distrito), direccion_entrega, referencia, telefono_contacto, id_empleado, repartidor:empleado(persona(nombre, ap_paterno)), costo_envio, costo_envio_confirmado, situacion, feccre, lat_cliente, lng_cliente, lat_repartidor, lng_repartidor, f_ubicacion, f_salida, f_entrega';

function mapRow(row: PedidoDeliveryRow): Delivery {
  return {
    id: row.id_pedidodelivery,
    pedidoId: row.id_pedido,
    distritoId: row.id_distrito,
    distrito: row.distrito?.d_distrito ?? null,
    direccion: row.direccion_entrega,
    referencia: row.referencia,
    telefono: row.telefono_contacto,
    repartidorId: row.id_empleado,
    repartidor: row.repartidor?.persona
      ? `${row.repartidor.persona.nombre} ${row.repartidor.persona.ap_paterno ?? ''}`.trim()
      : null,
    costo: Number(row.costo_envio ?? 0),
    costoConfirmado: row.costo_envio_confirmado ?? true,
    estado: (row.situacion ?? 'P') as Delivery['estado'],
    fechaCreacion: row.feccre,
    fechaSalida: row.f_salida ?? null,
    fechaEntrega: row.f_entrega ?? null,
  };
}

/** Mapea los ítems del pedido (detalle_pedido -> producto). */
function mapPedidoItems(rows: Array<{
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  nota_cocina: string | null;
  producto: { n_producto: string } | { n_producto: string }[] | null;
}>): PedidoItem[] {
  return (rows ?? []).map((r) => {
    const producto = Array.isArray(r.producto) ? r.producto[0] : r.producto;
    return {
      idProducto: r.id_producto,
      nombre: producto?.n_producto ?? `Producto #${r.id_producto}`,
      cantidad: Number(r.cantidad),
      precioUnitario: Number(r.precio_unitario),
      descuento: Number(r.descuento ?? 0),
      subTotal: Number(r.cantidad) * Number(r.precio_unitario) - Number(r.descuento ?? 0),
      nota: r.nota_cocina ?? null,
    };
  });
}

/** Obtiene totales y método de pago del pedido a través de venta/pago_venta/metodo_pago. */
async function getPedidoPago(idPedido: number): Promise<{
  totalPedido: number | undefined;
  montoPagado: number | undefined;
  metodoPago: string | null;
}> {
  const { data: venta } = await supabase
    .from('venta')
    .select('id_venta, total, total_pagado')
    .eq('id_pedido', idPedido)
    .eq('estado', 'A')
    .maybeSingle();

  if (!venta) {
    return { totalPedido: undefined, montoPagado: undefined, metodoPago: null };
  }

  const totalPedido = Number((venta as any).total ?? 0);
  const montoPagado = Number((venta as any).total_pagado ?? 0);

  const { data: pagos } = await supabase
    .from('pago_venta')
    .select('id_metodopago, monto')
    .eq('id_venta', (venta as any).id_venta)
    .eq('estado', 'A');

  let metodoPago: string | null = null;
  if (pagos && pagos.length > 0) {
    const idMetodoPago = Number((pagos[0] as any).id_metodopago);
    const { data: mp } = await supabase
      .from('metodo_pago')
      .select('n_metodopago')
      .eq('id_metodopago', idMetodoPago)
      .eq('estado', 'A')
      .maybeSingle();
    metodoPago = (mp as any)?.n_metodopago ?? null;
  }

  return { totalPedido, montoPagado, metodoPago };
}

export interface ClienteDeliveryCreateInput {
  clienteId: number;
  items: Array<{ productoId: number; cantidad: number; nota?: string }>;
  direccion: string;
  distritoId: number;
  referencia?: string;
  telefono?: string;
  costoEnvio: number;
  latCliente?: number;
  lngCliente?: number;
}

export interface ClienteDeliveryCreado {
  id: number;
  estado: Delivery['estado'];
  costo: number;
  costoConfirmado: boolean;
}

export async function crearDeliveryCliente(
  input: ClienteDeliveryCreateInput,
  pc: string,
  usuarioId: number,
): Promise<ClienteDeliveryCreado> {
  const { data, error } = await supabase.rpc('fn_crear_delivery_cliente', {
    p_cliente: input.clienteId,
    p_usuario: usuarioId,
    p_distrito: input.distritoId,
    p_direccion: input.direccion,
    p_referencia: input.referencia ?? null,
    p_telefono: input.telefono ?? null,
    p_costo_envio: input.costoEnvio,
    p_lat_cliente: input.latCliente ?? null,
    p_lng_cliente: input.lngCliente ?? null,
    p_items: input.items.map(({ productoId, cantidad, nota }) => ({ productoId, cantidad, nota })),
    p_pc: pc,
  });

  if (error) {
    if (error.message.includes('CLIENTE_NOT_FOUND')) throw new DeliveryError('CLIENTE_NOT_FOUND');
    if (error.message.includes('DISTRITO_NOT_FOUND')) throw new DeliveryError('DISTRITO_NOT_FOUND');
    if (error.message.includes('AUTOSERVICIO_USER_NOT_READY')) throw new DeliveryError('AUTOSERVICIO_USER_NOT_READY');
    if (error.message.includes('Producto no disponible.')) throw new DeliveryError('PRODUCTO_NO_DISPONIBLE');
    if (error.message.includes('DELIVERY_VALIDATION_ERROR') || error.message.includes('DELIVERY_ITEMS_INVALID')) {
      throw new DeliveryError('VALIDATION_ERROR');
    }
    throw new Error(`DELIVERY_CREATE_FAIL: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') throw new Error('DELIVERY_CREATE_FAIL: DELIVERY_ID_NOT_RETURNED');
  const created = row as { id_pedidodelivery?: number; situacion?: string; costo_envio?: number };
  if (!created.id_pedidodelivery) throw new Error('DELIVERY_CREATE_FAIL: DELIVERY_ID_NOT_RETURNED');

  return {
    id: Number(created.id_pedidodelivery),
    estado: (created.situacion ?? 'P') as Delivery['estado'],
    costo: Number(created.costo_envio ?? 0),
    costoConfirmado: false,
  };
}

async function getPedidoDeliveryCliente(id: number, clienteId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .select('id_pedido, pedido!inner(id_cliente)')
    .eq('id_pedidodelivery', id)
    .eq('pedido.id_cliente', clienteId)
    .maybeSingle();

  if (error) throw new Error(`DB_GET_FAIL: ${error.message}`);
  if (!data) return null;
  return Number((data as unknown as { id_pedido: number }).id_pedido);
}

export async function getDeliveryDetalle(id: number, clienteId: number): Promise<Delivery | null> {
  const pedidoId = await getPedidoDeliveryCliente(id, clienteId);
  if (pedidoId === null) return null;

  const { data, error } = await supabase
    .from('pedido_delivery')
    .select(SELECT)
    .eq('id_pedidodelivery', id)
    .eq('id_pedido', pedidoId)
    .maybeSingle();

  if (error) throw new Error(`DB_GET_FAIL: ${error.message}`);
  if (!data) return null;

  const base = mapRow(data as unknown as PedidoDeliveryRow);

  // Ítems del pedido (detalle_pedido -> producto)
  const { data: itemsRows } = await supabase
    .from('detalle_pedido')
    .select('id_producto, cantidad, precio_unitario, descuento, nota_cocina, producto:n_producto(n_producto)')
    .eq('id_pedido', pedidoId)
    .eq('estado', 'A');
  const items = mapPedidoItems(itemsRows ?? []);

  // Totales y método de pago (venta -> pago_venta -> metodo_pago)
  const pago = await getPedidoPago(pedidoId);
  const totalP = pago.totalPedido ?? 0;
  const montoP = pago.montoPagado ?? 0;
  const montoPorCobrar = pago.totalPedido !== undefined && pago.montoPagado !== undefined
    ? Math.max(0, totalP + base.costo - montoP)
    : undefined;

  return {
    ...base,
    items,
    totalPedido: pago.totalPedido,
    montoPagado: pago.montoPagado,
    montoPorCobrar,
    metodoPago: pago.metodoPago,
  };
}

export async function getDeliveryActivoCliente(clienteId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .select('id_pedidodelivery, pedido!inner(id_cliente)')
    .eq('pedido.id_cliente', clienteId)
    .eq('estado', 'A')
    .in('situacion', ['P', 'R'])
    .order('id_pedidodelivery', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return data ? Number((data as unknown as { id_pedidodelivery: number }).id_pedidodelivery) : null;
}

export async function getDeliveryComprobante(id: number, clienteId: number) {
  // Primero validar que el delivery pertenezca al cliente
  const { data: delivery, error: deliveryError } = await supabase
    .from('pedido_delivery')
    .select('id_pedido')
    .eq('id_pedidodelivery', id)
    .eq('pedido.id_cliente', clienteId)
    .eq('estado', 'A')
    .maybeSingle();

  if (deliveryError) throw new Error(`DB_GET_FAIL: ${deliveryError.message}`);
  if (!delivery) return null;

  // Obtener la venta asociada al pedido
  const { data: venta, error: ventaError } = await supabase
    .from('venta')
    .select('id_venta, serie, numero, total, total_pagado, f_venta, tipodocumento')
    .eq('id_pedido', delivery.id_pedido)
    .eq('estado', 'A')
    .maybeSingle();

  if (ventaError) throw new Error(`DB_VENTA_FAIL: ${ventaError.message}`);
  if (!venta) return null;

  // Obtener método de pago
  const { data: pagos, error: pagosError } = await supabase
    .from('pago_venta')
    .select('id_metodopago, monto, f_pago')
    .eq('id_venta', venta.id_venta)
    .eq('estado', 'A');

  if (pagosError) throw new Error(`DB_PAGO_FAIL: ${pagosError.message}`);

  let metodoPago: string | null = null;
  if (pagos && pagos.length > 0) {
    const { data: mp } = await supabase
      .from('metodo_pago')
      .select('n_metodopago')
      .eq('id_metodopago', (pagos[0] as unknown as { id_metodopago: number }).id_metodopago)
      .eq('estado', 'A')
      .maybeSingle();
    metodoPago = (mp as unknown as { n_metodopago: string })?.n_metodopago ?? null;
  }

  // Obtener datos del cliente
  const { data: cliente, error: clienteError } = await supabase
    .from('cliente')
    .select('n_documento, nombre')
    .eq('id_cliente', (venta as unknown as { id_cliente?: number }).id_cliente ?? 0)
    .maybeSingle();

  // Obtener los ítems del pedido (platos del delivery)
  const { data: detalleRows, error: detalleError } = await supabase
    .from('detalle_pedido')
    .select('id_producto, cantidad, precio_unitario, descuento, sub_total, producto:n_producto(n_producto)')
    .eq('id_pedido', delivery.id_pedido)
    .eq('estado', 'A');

  if (detalleError) throw new Error(`DB_DETALLE_FAIL: ${detalleError.message}`);

  const items = ((detalleRows ?? []) as unknown[]).map((row: unknown) => {
    const r = row as unknown as {
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
      descuento: number;
      sub_total: number;
      producto: { n_producto: string } | null;
    };
    return {
      idProducto: r.id_producto,
      nombre: r.producto?.n_producto ?? `Producto #${r.id_producto}`,
      cantidad: Number(r.cantidad),
      precioUnitario: Number(r.precio_unitario),
      descuento: Number(r.descuento ?? 0),
      subTotal: Number(r.sub_total ?? 0),
    };
  });

  return {
    id_venta: venta.id_venta,
    serie: venta.serie,
    numero: venta.numero,
    total: venta.total,
    total_pagado: venta.total_pagado,
    f_venta: venta.f_venta,
    tipo_documento: venta.tipodocumento,
    metodo_pago: metodoPago,
    monto_pagado: venta.total_pagado,
    cliente_documento: cliente?.n_documento ?? null,
    cliente_nombre: cliente?.nombre ?? null,
    items,
  };
}

export async function getDeliveryUbicacion(id: number, clienteId: number) {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .select(`
      id_pedidodelivery,
      id_pedido,
      id_distrito,
      distrito:distrito(d_distrito),
      direccion_entrega,
      costo_envio,
      costo_envio_confirmado,
      situacion,
      f_salida,
      f_entrega,
      lat_cliente,
      lng_cliente,
      lat_repartidor,
      lng_repartidor,
      f_ubicacion,
      id_empleado,
      repartidor:empleado(persona:persona(nombre, ap_paterno)),
      pedido:pedido!inner(id_cliente)
    `)
    .eq('id_pedidodelivery', id)
    .eq('pedido.id_cliente', clienteId)
    .eq('estado', 'A')
    .maybeSingle();

  if (error) throw new Error(`UBICACION_GET_FAIL: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as {
    id_pedidodelivery: number;
    id_pedido: number;
    id_distrito: number | null;
    distrito: { d_distrito: string } | null;
    direccion_entrega: string;
    costo_envio: number;
    costo_envio_confirmado: boolean;
    situacion: string;
    f_salida: string | null;
    f_entrega: string | null;
    lat_cliente: number | null;
    lng_cliente: number | null;
    lat_repartidor: number | null;
    lng_repartidor: number | null;
    f_ubicacion: string | null;
    id_empleado: number | null;
    repartidor: { persona: { nombre: string; ap_paterno: string | null } | null } | null;
  };

  const base = {
    id_pedidodelivery: row.id_pedidodelivery,
    id_pedido: row.id_pedido,
    id_distrito: row.id_distrito,
    distrito: row.distrito?.d_distrito ?? null,
    direccion_entrega: row.direccion_entrega,
    costo_envio: Number(row.costo_envio ?? 0),
    costo_envio_confirmado: row.costo_envio_confirmado,
    situacion: row.situacion,
    f_salida: row.f_salida,
    f_entrega: row.f_entrega,
    lat_cliente: row.lat_cliente,
    lng_cliente: row.lng_cliente,
    lat_repartidor: row.lat_repartidor,
    lng_repartidor: row.lng_repartidor,
    f_ubicacion: row.f_ubicacion,
    id_repartidor: row.id_empleado,
    repartidor: row.repartidor?.persona
      ? `${row.repartidor.persona.nombre} ${row.repartidor.persona.ap_paterno ?? ''}`.trim()
      : null,
  };

  // Ítems del pedido
  const { data: itemsRows } = await supabase
    .from('detalle_pedido')
    .select('id_producto, cantidad, precio_unitario, descuento, nota_cocina, producto:n_producto(n_producto)')
    .eq('id_pedido', row.id_pedido)
    .eq('estado', 'A');
  const items = mapPedidoItems(itemsRows ?? []);

  // Totales y método de pago
  const pago = await getPedidoPago(row.id_pedido);
  const totalP = pago.totalPedido ?? 0;
  const montoP = pago.montoPagado ?? 0;
  const montoPorCobrar = pago.totalPedido !== undefined && pago.montoPagado !== undefined
    ? Math.max(0, totalP + base.costo_envio - montoP)
    : undefined;

  return {
    ...base,
    items,
    totalPedido: pago.totalPedido,
    montoPagado: pago.montoPagado,
    montoPorCobrar,
    metodoPago: pago.metodoPago,
  };
}