import type { Delivery, DeliveryLista } from '../models/delivery.js';
import { listarMisEntregas, getMiEntregaDetalle, iniciarRutaRepartidor, confirmarEntregaRepartidor, actualizarUbicacionRepartidor, getPorRendir, type PorRendirItem } from '../repositories/repartidor-repository.js';
import { DeliveryError } from '../models/delivery.js';
import type { RepartidorEntregasQuery } from '../schemas/repartidor.js';
import { pushService } from './push-service.js';
import { supabase } from '../config/supabase.js';

async function getDeliveryInfoForPush(id: number) {
  const { data } = await supabase
    .from('pedido_delivery')
    .select(`
      id_pedido,
      direccion_entrega,
      costo_envio,
      pedido:pedido!inner(id_pedido, total)
    `)
    .eq('id_pedidodelivery', id)
    .single();
  return data;
}

export async function listarMisEntregasService(
  empleadoId: number,
  estado: RepartidorEntregasQuery['estado'],
  page: number,
  limit: number,
): Promise<DeliveryLista> {
  return listarMisEntregas(empleadoId, estado, page, limit);
}

export async function getMiEntregaDetalleService(id: number, empleadoId: number): Promise<Delivery> {
  const r = await getMiEntregaDetalle(id, empleadoId);
  if (!r) throw new DeliveryError('NOT_FOUND');
  return r;
}

export async function iniciarRutaRepartidorService(id: number, empleadoId: number, usumod: string, pc?: string): Promise<Delivery> {
  const r = await iniciarRutaRepartidor(id, empleadoId, usumod, pc);
  if (!r) throw new DeliveryError('NOT_FOUND');
  try {
    const info = await getDeliveryInfoForPush(id);
    if (info) {
      await pushService.enviarRutaIniciadaStaff(empleadoId, {
        pedidoId: info.id_pedido,
        deliveryId: id,
      });
    }
  } catch (e) { console.error('[Push] Error en iniciarRutaRepartidor:', e); }
  return r;
}

export async function confirmarEntregaRepartidorService(id: number, empleadoId: number, usumod: string, pc?: string): Promise<Delivery> {
  const { data: delivery, error: deliveryError } = await supabase
    .from('pedido_delivery')
    .select('id_pedido')
    .eq('id_pedidodelivery', id)
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .eq('situacion', 'R')
    .maybeSingle();

  if (deliveryError) throw new Error(`DB_GET_FAIL: ${deliveryError.message}`);
  if (!delivery) throw new DeliveryError('NOT_FOUND');

  const { data: venta, error: ventaError } = await supabase
    .from('venta')
    .select('id_venta')
    .eq('id_pedido', delivery.id_pedido)
    .eq('estado', 'A')
    .maybeSingle();

  if (ventaError) throw new Error(`DB_VENTA_EXISTENTE_FAIL: ${ventaError.message}`);
  if (!venta) throw new DeliveryError('VENTA_NO_EXISTE');

  const r = await confirmarEntregaRepartidor(id, empleadoId, usumod, pc);
  if (!r) throw new DeliveryError('NOT_FOUND');
  return r;
}

export async function actualizarUbicacionRepartidorService(
  id: number,
  empleadoId: number,
  lat: number,
  lng: number,
  usumod: string,
  pc?: string,
): Promise<void> {
  return actualizarUbicacionRepartidor(id, empleadoId, lat, lng, usumod, pc);
}

export async function getPorRendirService(empleadoId: number): Promise<PorRendirItem[]> {
  return getPorRendir(empleadoId);
}

export async function registrarVentaRepartidorService(
  id: number,
  empleadoId: number,
  monto: number,
  metodoPago: string,
  referencia: string | null,
  usumod: string,
  pc?: string,
): Promise<{ idVenta: number; idPago: number; montoPagado: number; metodoPago: string; estado: Delivery['estado']; montoPorCobrar: number }> {
  const { data, error } = await supabase.rpc('fn_registrar_venta_delivery_atomic', {
    p_delivery: id,
    p_empleado: empleadoId,
    p_monto: monto,
    p_metodo_pago: metodoPago,
    p_referencia: referencia,
    p_actor: usumod,
    p_pc: pc ?? null,
  });

  if (error) {
    const message = error.message;
    if (message.includes('CLIENTE_NOT_FOUND')) throw new DeliveryError('CLIENTE_NOT_FOUND');
    if (message.includes('NOT_FOUND')) throw new DeliveryError('NOT_FOUND');
    if (message.includes('INVALID_STATE')) throw new DeliveryError('INVALID_STATE');
    if (message.includes('MONTO_INVALIDO')) throw new DeliveryError('MONTO_INVALIDO');
    if (message.includes('VENTA_YA_EXISTE')) throw new DeliveryError('VENTA_YA_EXISTE');
    if (message.includes('CAJA_NO_ABIERTA')) throw new DeliveryError('CAJA_NO_ABIERTA');
    if (message.includes('PEDIDO_INVALIDO')) throw new DeliveryError('PEDIDO_INVALIDO');
    if (message.includes('USUARIO_REPARTIDOR_NO_DISPONIBLE')) {
      throw new DeliveryError('REPARTIDOR_NO_DISPONIBLE');
    }
    if (
      message.includes('METODO_PAGO_INVALIDO')
      || message.includes('REFERENCIA_REQUERIDA')
      || message.includes('REFERENCIA_INVALIDA')
    ) {
      throw new DeliveryError('VALIDATION_ERROR');
    }
    if (message.includes('SERIE_NO_EXISTE')) throw new Error('SERIE_NO_EXISTE');
    throw new Error(`DB_DELIVERY_CHARGE_FAIL: ${message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') throw new Error('DB_DELIVERY_CHARGE_FAIL: PAYMENT_RESULT_NOT_RETURNED');
  const result = row as {
    id_venta?: number;
    id_pago?: number;
    monto_pagado?: number;
    metodo_pago?: string;
    situacion?: Delivery['estado'];
    monto_por_cobrar?: number;
  };
  if (!result.id_venta || !result.id_pago || !result.metodo_pago) {
    throw new Error('DB_DELIVERY_CHARGE_FAIL: PAYMENT_RESULT_INCOMPLETE');
  }

  return {
    idVenta: Number(result.id_venta),
    idPago: Number(result.id_pago),
    montoPagado: Number(result.monto_pagado ?? monto),
    metodoPago: result.metodo_pago,
    estado: result.situacion ?? 'E',
    montoPorCobrar: Number(result.monto_por_cobrar ?? 0),
  };
}

