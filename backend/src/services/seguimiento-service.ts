import type { Delivery, DeliveryLista } from '../models/delivery.js';
import type { SeguimientoFiltros } from '../repositories/seguimiento-repository.js';
import { listarSeguimiento, iniciarRutaStaff, confirmarEntregaStaff, anularDelivery, getUbicacionSeguimiento } from '../repositories/seguimiento-repository.js';
import { DeliveryError } from '../models/delivery.js';
import { updateAudit } from '../utils/auditoria.js';
import { supabase } from '../config/supabase.js';

export async function listarSeguimientoService(f: SeguimientoFiltros): Promise<DeliveryLista> {
  return listarSeguimiento(f);
}

export async function iniciarRutaStaffService(id: number, usumod: string, pc?: string): Promise<Delivery> {
  const r = await iniciarRutaStaff(id, usumod, pc);
  if (!r) throw new DeliveryError('NOT_FOUND');
  return r;
}

export async function confirmarEntregaStaffService(id: number, usumod: string, pc?: string): Promise<Delivery> {
  const r = await confirmarEntregaStaff(id, usumod, pc);
  if (!r) throw new DeliveryError('NOT_FOUND');
  return r;
}

export async function anularDeliveryService(id: number, motivo: string, usumod: string, pc?: string): Promise<Delivery> {
  const r = await anularDelivery(id, motivo, usumod, pc);
  if (!r) throw new DeliveryError('NOT_FOUND');
  return r;
}

export async function getUbicacionSeguimientoService(id: number) {
  const r = await getUbicacionSeguimiento(id);
  if (!r) throw new DeliveryError('NOT_FOUND');
  return r;
}

export async function registrarVentaStaffService(
  id: number,
  monto: number,
  metodoPago: string,
  referencia: string | null,
  usumod: string,
  pc?: string,
): Promise<{ idVenta: number; idPago: number; montoPagado: number; metodoPago: string; estado: Delivery['estado']; montoPorCobrar: number }> {
  // 1. Obtener el delivery (staff no necesita ser el repartidor asignado)
  const { data: delivery, error } = await supabase
    .from('pedido_delivery')
    .select(`
      id_pedidodelivery,
      id_pedido,
      costo_envio,
      situacion,
      pedido:pedido!inner(total)
    `)
    .eq('id_pedidodelivery', id)
    .eq('estado', 'A')
    .maybeSingle();

  if (error) throw new Error(`DB_GET_FAIL: ${error.message}`);
  if (!delivery) throw new DeliveryError('NOT_FOUND');

  const d = delivery as unknown as {
    id_pedidodelivery: number;
    id_pedido: number;
    costo_envio: number;
    situacion: string;
    pedido: { total: number } | null;
  };

  // Permitir registrar venta si está en ruta (R) o ya entregado (E) para corrección
  if (d.situacion !== 'R' && d.situacion !== 'E') {
    throw new DeliveryError('INVALID_STATE');
  }

  // Verificar si ya existe una venta registrada para este pedido (evita doble registro)
  const { data: ventaExistente, error: ventaExistenteError } = await supabase
    .from('venta')
    .select('id_venta, total_pagado')
    .eq('id_pedido', d.id_pedido)
    .eq('estado', 'A')
    .maybeSingle();

  if (ventaExistenteError) throw new Error(`DB_VENTA_EXISTENTE_FAIL: ${ventaExistenteError.message}`);
  if (ventaExistente) {
    throw new DeliveryError('VENTA_YA_EXISTE');
  }

  // 2. Calcular monto a cobrar
  const totalPedido = Number(d.pedido?.total ?? 0);
  const costoEnvio = Number(d.costo_envio ?? 0);
  const montoPorCobrar = totalPedido + costoEnvio;

  if (monto <= 0) {
    throw new DeliveryError('MONTO_INVALIDO');
  }
  if (monto > montoPorCobrar) {
    throw new DeliveryError('MONTO_INVALIDO');
  }

  // 3. Resolver id_metodopago por nombre
  const { data: metodoPagoRow, error: mpError } = await supabase
    .from('metodo_pago')
    .select('id_metodopago')
    .eq('n_metodopago', metodoPago)
    .eq('estado', 'A')
    .maybeSingle();

  if (mpError) throw new Error(`DB_METODO_PAGO_FAIL: ${mpError.message}`);
  if (!metodoPagoRow) throw new DeliveryError('VALIDATION_ERROR');

  const mpr = metodoPagoRow as unknown as { id_metodopago: number };

  // 4. Crear la venta
  const { data: venta, error: ventaError } = await supabase
    .from('venta')
    .insert({
      id_pedido: d.id_pedido,
      tipodocumento: 'TK',
      subtotal: totalPedido,
      descuento: 0,
      servicio: 0,
      igv: 0,
      total: totalPedido + costoEnvio,
      total_pagado: monto,
      vuelto: 0,
      anulada: 'N',
      estado: 'A',
      ...updateAudit(usumod, pc ?? ''),
    })
    .select('id_venta')
    .maybeSingle();

  if (ventaError) throw new Error(`DB_VENTA_FAIL: ${ventaError.message}`);
  if (!venta) throw new Error('DB_VENTA_FAIL: NO_VENTA_CREATED');

  const v = venta as unknown as { id_venta: number };

  // 5. Crear el pago_venta
  const { data: pago, error: pagoError } = await supabase
    .from('pago_venta')
    .insert({
      id_venta: v.id_venta,
      id_metodopago: mpr.id_metodopago,
      monto,
      referencia: referencia ?? null,
      f_pago: new Date().toISOString(),
      estado: 'A',
      ...updateAudit(usumod, pc ?? ''),
    })
    .select('id_pago')
    .maybeSingle();

  if (pagoError) throw new Error(`DB_PAGO_FAIL: ${pagoError.message}`);

  // 6. Si está en ruta, marcar como entregado. Si ya está entregado, solo dejar el estado.
  const nuevoEstado: Delivery['estado'] = d.situacion === 'R' ? 'E' : 'E';

  const { error: updateError } = await supabase
    .from('pedido_delivery')
    .update({
      situacion: 'E',
      f_entrega: d.situacion === 'R' ? new Date().toISOString() : undefined,
      ...updateAudit(usumod, pc ?? ''),
    })
    .eq('id_pedidodelivery', id)
    .eq('estado', 'A');

  if (updateError) throw new Error(`DB_UPDATE_FAIL: ${updateError.message}`);

  const nuevoMontoPagado = monto;
  const nuevoMontoPorCobrar = Math.max(0, montoPorCobrar - monto);

  return {
    idVenta: v.id_venta,
    idPago: (pago as unknown as { id_pago: number }).id_pago,
    montoPagado: nuevoMontoPagado,
    metodoPago,
    estado: nuevoEstado,
    montoPorCobrar: nuevoMontoPorCobrar,
  };
}