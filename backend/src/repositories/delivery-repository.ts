import { supabase } from '../config/supabase.js';
import { DeliveryError, type Delivery, type DeliveryLista } from '../models/delivery.js';
import type { DeliveryCreate, DeliveryQuery, ParametrosNegocioUpdate, TarifaUpsert } from '../schemas/delivery.js';
import { updateAudit } from '../utils/auditoria.js';
import { calcularDistanciaHaversineKm, calcularSugerenciaCosto } from '../utils/delivery-costo.js';

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
  costo_envio_confirmado: boolean;
  situacion: string;
  feccre: string;
  f_salida: string | null;
  f_entrega: string | null;
  lat_cliente: number | null;
  lng_cliente: number | null;
  lat_repartidor: number | null;
  lng_repartidor: number | null;
  f_ubicacion: string | null;
  pedido: { total: number } | null;
}

interface DistritoGPSRow {
  id_distrito: number;
  d_distrito: string;
  lat_ref: number | null;
  lng_ref: number | null;
  radio_km: number | null;
  costo_base: number | null;
  recargo_km: number | null;
}

interface ConfiguracionNegocioRow {
  lat_local: number | null;
  lng_local: number | null;
  direccion_local: string | null;
  radio_cobertura_km: number | null;
}

const SELECT = 'id_pedidodelivery, id_pedido, id_distrito, distrito(d_distrito), direccion_entrega, referencia, telefono_contacto, id_empleado, repartidor:empleado(persona(nombre, ap_paterno)), costo_envio, costo_envio_confirmado, situacion, feccre, f_salida, f_entrega, lat_cliente, lng_cliente, lat_repartidor, lng_repartidor, f_ubicacion, pedido:pedido!inner(total)';

function mapRow(row: DeliveryRow): Delivery {
  const pedidoRow = row as unknown as DeliveryRow & { pedido: { total: number } | null };
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
    latCliente: row.lat_cliente ?? null,
    lngCliente: row.lng_cliente ?? null,
    latRepartidor: row.lat_repartidor ?? null,
    lngRepartidor: row.lng_repartidor ?? null,
    totalPedido: pedidoRow.pedido ? Number(pedidoRow.pedido.total) : undefined,
  };
}

export async function listarDelivery(q: DeliveryQuery): Promise<DeliveryLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('pedido_delivery')
    .select(SELECT, { count: 'exact' })
    .order('feccre', { ascending: false })
    .order('id_pedidodelivery', { ascending: false })
    .range(desde, hasta);

  if (q.estado) query = query.eq('situacion', q.estado);
  if (q.repartidorId) query = query.eq('id_empleado', q.repartidorId);

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as DeliveryRow[]).map(mapRow),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function crearDelivery(
  input: DeliveryCreate,
  usuarioId: number,
  usucre: string,
  pc = '',
): Promise<{ idPedidoDelivery: number; pedidoId: number; situacion: string; costoEnvio: number }> {
  const { data, error } = await supabase.rpc('fn_crear_delivery_admin', {
    p_cliente: input.clienteId,
    p_usuario: usuarioId,
    p_distrito: input.distritoId,
    p_direccion: input.direccion,
    p_referencia: input.referencia ?? null,
    p_telefono: input.telefono,
    p_costo_envio: input.costoEnvio,
    p_items: input.items,
    p_actor: usucre,
    p_pc: pc || null,
  });

  if (error) {
    const message = error.message;
    if (message.includes('CLIENTE_NOT_FOUND')) throw new DeliveryError('CLIENTE_NOT_FOUND');
    if (message.includes('DISTRITO_NOT_FOUND')) throw new DeliveryError('DISTRITO_NOT_FOUND');
    if (message.includes('PRODUCTO_NO_DISPONIBLE') || message.includes('Producto no disponible.')) {
      throw new DeliveryError('PRODUCTO_NO_DISPONIBLE');
    }
    if (message.includes('DELIVERY_VALIDATION_ERROR') || message.includes('DELIVERY_ITEMS_INVALID')) {
      throw new DeliveryError('VALIDATION_ERROR');
    }
    throw new Error(`DB_CREATE_FAIL: ${message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') throw new Error('DB_CREATE_FAIL: DELIVERY_ID_NOT_RETURNED');
  const created = row as {
    id_pedidodelivery?: number;
    id_pedido?: number;
    situacion?: string;
    costo_envio?: number;
  };
  if (!created.id_pedidodelivery || !created.id_pedido) {
    throw new Error('DB_CREATE_FAIL: DELIVERY_ID_NOT_RETURNED');
  }

  return {
    idPedidoDelivery: Number(created.id_pedidodelivery),
    pedidoId: Number(created.id_pedido),
    situacion: created.situacion ?? 'P',
    costoEnvio: Number(created.costo_envio ?? 0),
  };
}

export async function asignarRepartidor(
  id: number,
  repartidorId: number,
  usumod: string,
  pc = '',
  costoEnvio?: number,
): Promise<Delivery | null> {
  const changes = {
    id_empleado: repartidorId,
    costo_envio_confirmado: true,
    ...updateAudit(usumod, pc),
    ...(costoEnvio === undefined ? {} : { costo_envio: costoEnvio }),
  };
  const { data, error } = await supabase
    .from('pedido_delivery')
    .update(changes)
    .eq('id_pedidodelivery', id)
    .eq('situacion', 'P')
    .eq('estado', 'A')
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) return null;
  return mapRow(data as unknown as DeliveryRow);
}

export async function despacharDelivery(id: number, usumod: string, pc = ''): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .update({ situacion: 'R', f_salida: new Date().toISOString(), ...updateAudit(usumod, pc) })
    .eq('id_pedidodelivery', id)
    .eq('situacion', 'P')
    .eq('estado', 'A')
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) return null;
  return mapRow(data as unknown as DeliveryRow);
}

export async function entregarDelivery(id: number, usumod: string, pc = ''): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from('pedido_delivery')
    .update({ situacion: 'E', f_entrega: new Date().toISOString(), ...updateAudit(usumod, pc) })
    .eq('id_pedidodelivery', id)
    .eq('situacion', 'R')
    .eq('estado', 'A')
    .select(SELECT)
    .maybeSingle();
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) return null;
  return mapRow(data as unknown as DeliveryRow);
}

export interface SugerirCostoResult {
  distanciaKm: number | null;
  fueraRadio: boolean;
  dentroCobertura: boolean;
  costoSugerido: number;
}

export async function sugerirCosto(lat: number | null, lng: number | null, distritoId: number): Promise<SugerirCostoResult> {
  const { data: distrito, error } = await supabase
    .from('distrito')
    .select('id_distrito, costo_base, radio_km, recargo_km, lat_ref, lng_ref')
    .eq('id_distrito', distritoId)
    .eq('estado', 'A')
    .maybeSingle();

  if (error) throw new Error(`DB_DISTRITO_FAIL: ${error.message}`);
  if (!distrito) throw new DeliveryError('DISTRITO_NOT_FOUND');

  const d = distrito as unknown as DistritoGPSRow;
  const costoBase = Number(d.costo_base ?? 0);
  const radioKm = Number(d.radio_km ?? 0);
  // Recargo por km fuera de radio: dato de negocio (distrito.recargo_km), nunca constante (BR-GPS-002).
  const recargoKm = Number(d.recargo_km ?? 0);

  const { data: cfg, error: cfgError } = await supabase
    .from('configuracion_negocio')
    .select('lat_local, lng_local, radio_cobertura_km')
    .eq('id', 1)
    .maybeSingle();
  if (cfgError) throw new Error(`DB_CONFIG_FAIL: ${cfgError.message}`);

  const local = cfg as unknown as ConfiguracionNegocioRow | null;

  // Sin GPS del cliente (BR-GPS-001), no se estima distancia ni se bloquea el pedido.
  if (lat === null || lng === null) {
    return calcularSugerenciaCosto({
      costoBase,
      radioKm,
      recargoKm,
      distanciaTarifaKm: null,
      distanciaCoberturaKm: null,
      radioCoberturaKm: local?.radio_cobertura_km ?? null,
    });
  }

  const calcularDistancia = async (
    latOrigen: number | null | undefined,
    lngOrigen: number | null | undefined,
  ): Promise<number | null> => {
    if (latOrigen == null || lngOrigen == null) return null;

    return calcularDistanciaHaversineKm(latOrigen, lngOrigen, lat, lng);
  };

  const [distanciaTarifaKm, distanciaCoberturaKm] = await Promise.all([
    calcularDistancia(d.lat_ref, d.lng_ref),
    calcularDistancia(local?.lat_local, local?.lng_local),
  ]);

  // La tarifa usa el centro de referencia del distrito (BR-GPS-002); el límite
  // duro de entrega se mide desde el local según la configuración del negocio.
  return calcularSugerenciaCosto({
    costoBase,
    radioKm,
    recargoKm,
    distanciaTarifaKm,
    distanciaCoberturaKm,
    radioCoberturaKm: local?.radio_cobertura_km ?? null,
  });
}

export interface ParametrosNegocioResult {
  latLocal: number | null;
  lngLocal: number | null;
  direccionLocal: string | null;
  radioCoberturaKm: number | null;
}

export interface TarifaDistritoResult {
  distritoId: number;
  distrito: string;
  costoBase: number;
  radioKm: number;
  recargoKm: number;
}

export async function getParametrosNegocio(): Promise<ParametrosNegocioResult> {
  const { data, error } = await supabase
    .from('configuracion_negocio')
    .select('lat_local, lng_local, direccion_local, radio_cobertura_km')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(`DB_CONFIG_FAIL: ${error.message}`);
  const c = data as unknown as ConfiguracionNegocioRow | null;
  return {
    latLocal: c?.lat_local ?? null,
    lngLocal: c?.lng_local ?? null,
    direccionLocal: c?.direccion_local ?? null,
    radioCoberturaKm: c?.radio_cobertura_km ?? null,
  };
}

export async function upsertParametrosNegocio(input: ParametrosNegocioUpdate, usumod: string, pc = ''): Promise<ParametrosNegocioResult> {
  const patch: Record<string, unknown> = { ...updateAudit(usumod, pc) };
  if (input.latLocal !== undefined) patch['lat_local'] = input.latLocal;
  if (input.lngLocal !== undefined) patch['lng_local'] = input.lngLocal;
  if (input.direccionLocal !== undefined) patch['direccion_local'] = input.direccionLocal;
  if (input.radioCoberturaKm !== undefined) patch['radio_cobertura_km'] = input.radioCoberturaKm;
  const { error } = await supabase.from('configuracion_negocio').update(patch).eq('id', 1);
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  return getParametrosNegocio();
}

export async function listarTarifasDistrito(): Promise<TarifaDistritoResult[]> {
  const { data, error } = await supabase
    .from('distrito')
    .select('id_distrito, d_distrito, costo_base, radio_km, recargo_km')
    .order('d_distrito', { ascending: true });
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return ((data ?? []) as unknown as DistritoGPSRow[]).map((r) => ({
    distritoId: r.id_distrito,
    distrito: r.d_distrito,
    costoBase: Number(r.costo_base ?? 0),
    radioKm: Number(r.radio_km ?? 0),
    recargoKm: Number(r.recargo_km ?? 0),
  }));
}

export async function upsertTarifaDistrito(distritoId: number, input: TarifaUpsert, usumod: string, pc = ''): Promise<TarifaDistritoResult> {
  const { data, error } = await supabase
    .from('distrito')
    .update({ costo_base: input.costoBase, radio_km: input.radioKm, recargo_km: input.recargoKm, ...updateAudit(usumod, pc) })
    .eq('id_distrito', distritoId)
    .select('id_distrito, d_distrito, costo_base, radio_km, recargo_km')
    .maybeSingle();
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  if (!data) throw new Error('DISTRITO_NOT_FOUND');
  const r = data as unknown as DistritoGPSRow;
  return {
    distritoId: r.id_distrito,
    distrito: r.d_distrito,
    costoBase: Number(r.costo_base ?? 0),
    radioKm: Number(r.radio_km ?? 0),
    recargoKm: Number(r.recargo_km ?? 0),
  };
}
