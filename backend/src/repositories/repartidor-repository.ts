import { supabase } from '../config/supabase.js';
import { DeliveryError, type Delivery, type DeliveryLista } from '../models/delivery.js';
import type { RepartidorEntregasQuery } from '../schemas/repartidor.js';
import { updateAudit } from '../utils/auditoria.js';
import { listarPendientesRendicion, type PendienteRendicionItem } from './rendicion-repository.js';

interface DeliveryRow {
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
  situacion: string;
  feccre: string;
  lat_cliente: number | null;
  lng_cliente: number | null;
  lat_repartidor: number | null;
  lng_repartidor: number | null;
  f_ubicacion: string | null;
  f_salida?: string | null;
  f_entrega?: string | null;
  costo_envio_confirmado?: boolean;
  pedido?: {
    total: number | null;
    cliente?: { persona?: { nombre: string; ap_paterno: string | null } | null } | null;
    venta?: Array<{
      pago_venta?: Array<{ monto: number; metodo_pago?: { n_metodopago: string } | null }> | null;
    }> | null;
  } | null;
}

const SELECT = 'id_pedidodelivery, id_pedido, id_distrito, distrito(d_distrito), direccion_entrega, referencia, telefono_contacto, id_empleado, repartidor:empleado(persona(nombre, ap_paterno)), costo_envio, situacion, feccre, lat_cliente, lng_cliente, lat_repartidor, lng_repartidor, f_ubicacion';
const SELECT_REPARTIDOR = `${SELECT}, f_salida, f_entrega, costo_envio_confirmado, pedido:pedido!inner(total, cliente:cliente!fk_pedido_cliente(persona:persona(nombre, ap_paterno)), venta:venta(pago_venta:pago_venta(monto, metodo_pago:metodo_pago(n_metodopago))))`;

function mapRepartidorRow(row: DeliveryRow): Delivery {
  const result = mapRow(row);
  const totalPedido = Number(row.pedido?.total ?? 0);
  const pagos = row.pedido?.venta?.flatMap((venta) => venta.pago_venta ?? []) ?? [];
  const montoPagado = pagos.reduce((total, pago) => total + Number(pago.monto ?? 0), 0);
  const costo = Number(row.costo_envio ?? 0);
  const costoConfirmado = row.costo_envio_confirmado ?? true;

  return {
    ...result,
    costoConfirmado,
    fechaSalida: row.f_salida ?? null,
    fechaEntrega: row.f_entrega ?? null,
    fechaUbicacion: row.f_ubicacion ?? null,
    latCliente: row.lat_cliente,
    lngCliente: row.lng_cliente,
    latRepartidor: row.lat_repartidor,
    lngRepartidor: row.lng_repartidor,
    nombreCliente: row.pedido?.cliente?.persona
      ? `${row.pedido.cliente.persona.nombre} ${row.pedido.cliente.persona.ap_paterno ?? ''}`.trim()
      : null,
    totalPedido,
    montoPagado,
    montoPorCobrar: costoConfirmado ? Math.max(0, totalPedido + costo - montoPagado) : undefined,
    metodoPago: pagos.map((pago) => pago.metodo_pago?.n_metodopago).filter(Boolean).join(', ') || null,
  };
}

function mapRow(row: DeliveryRow): Delivery {
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
    estado: (row.situacion ?? 'P') as Delivery['estado'],
    fechaCreacion: row.feccre,
  };
}

export async function listarMisEntregas(
  empleadoId: number,
  estado: RepartidorEntregasQuery['estado'],
  page: number,
  limit: number,
): Promise<DeliveryLista> {
  const desde = (page - 1) * limit;
  const hasta = desde + limit - 1;

  let query = supabase
    .from('pedido_delivery')
    .select(SELECT_REPARTIDOR, { count: 'exact' })
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .order('feccre', { ascending: false })
    .range(desde, hasta);

  if (estado) query = query.in('situacion', estado);

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as DeliveryRow[]).map(mapRepartidorRow),
    page,
    limit,
    total: count ?? 0,
  };
}

export async function getMiEntregaDetalle(id: number, empleadoId: number): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .select(SELECT_REPARTIDOR)
    .eq('id_pedidodelivery', id)
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .maybeSingle();

  if (error) throw new Error(`DB_GET_FAIL: ${error.message}`);
  if (!data) return null;
  return mapRepartidorRow(data as unknown as DeliveryRow);
}

export async function iniciarRutaRepartidor(id: number, empleadoId: number, usumod: string, pc = ''): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .update({ situacion: 'R', f_salida: new Date().toISOString(), ...updateAudit(usumod, pc) })
    .eq('id_pedidodelivery', id)
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .eq('situacion', 'P')
    .select(SELECT_REPARTIDOR)
    .maybeSingle();

  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) return null;
  return mapRepartidorRow(data as unknown as DeliveryRow);
}

export async function confirmarEntregaRepartidor(id: number, empleadoId: number, usumod: string, pc = ''): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .update({ situacion: 'E', f_entrega: new Date().toISOString(), ...updateAudit(usumod, pc) })
    .eq('id_pedidodelivery', id)
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .eq('situacion', 'R')
    .select(SELECT_REPARTIDOR)
    .maybeSingle();

  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) return null;
  return mapRepartidorRow(data as unknown as DeliveryRow);
}

export async function actualizarUbicacionRepartidor(
  id: number,
  empleadoId: number,
  lat: number,
  lng: number,
  usumod: string,
  pc = '',
): Promise<void> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .update({ lat_repartidor: lat, lng_repartidor: lng, f_ubicacion: new Date().toISOString(), ...updateAudit(usumod, pc) })
    .eq('id_pedidodelivery', id)
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .eq('situacion', 'R')
    .select('id_pedidodelivery')
    .maybeSingle();
  if (error) throw new Error(`UBI_ACTUALIZAR_FAIL: ${error.message}`);
  if (!data) throw new DeliveryError('NOT_FOUND');
}

export type PorRendirItem = PendienteRendicionItem;

export async function getPorRendir(empleadoId: number): Promise<PorRendirItem[]> {
  return listarPendientesRendicion(empleadoId);
}