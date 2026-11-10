import type { Delivery, DeliveryLista } from '../models/delivery.js';
import { listarMisEntregas, getMiEntregaDetalle, iniciarRutaRepartidor, confirmarEntregaRepartidor, actualizarUbicacionRepartidor, getPorRendir, type PorRendirItem } from '../repositories/repartidor-repository.js';
import { DeliveryError } from '../models/delivery.js';
import type { RepartidorEntregasQuery } from '../schemas/repartidor.js';
import { pushService } from './push-service.js';
import { supabase } from '../config/supabase.js';
import { updateAudit } from '../utils/auditoria.js';

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
  // 1. Obtener el delivery y validar que pertenece al repartidor y esté en ruta o entregado
  const { data: delivery, error } = await supabase
    .from('pedido_delivery')
    .select(`
      id_pedidodelivery,
      id_pedido,
      costo_envio,
      situacion,
      id_empleado,
      pedido:pedido!inner(total, id_cliente)
    `)
    .eq('id_pedidodelivery', id)
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .in('situacion', ['R', 'E'])
    .maybeSingle();

  if (error) throw new Error(`DB_GET_FAIL: ${error.message}`);
  if (!delivery) throw new DeliveryError('NOT_FOUND');

  const d = delivery as unknown as {
    id_pedidodelivery: number;
    id_pedido: number;
    costo_envio: number;
    situacion: string;
    id_empleado: number | null;
    pedido: { total: number; id_cliente: number } | null;
  };

  // Validar que exista una caja abierta para registrar la venta
  const { data: aperturaCaja, error: cajaError } = await supabase
    .from('apertura_caja')
    .select('id_aperturacaja')
    .eq('situacion', 'A')
    .eq('estado', 'A')
    .order('f_apertura', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cajaError) throw new Error(`DB_GET_FAIL: ${cajaError.message}`);
  if (!aperturaCaja) throw new DeliveryError('CAJA_NO_ABIERTA');

  const idAperturaCaja = (aperturaCaja as unknown as { id_aperturacaja: number }).id_aperturacaja;

  // Obtener id_usuario del empleado autenticado
  const { data: usuarioRow, error: usuarioError } = await supabase
    .from('usuario')
    .select('id_usuario')
    .eq('id_empleado', d.id_empleado ?? null)
    .eq('estado', 'A')
    .maybeSingle();

  if (usuarioError) throw new Error(`DB_GET_FAIL: ${usuarioError.message}`);
  if (!usuarioRow) throw new DeliveryError('CLIENTE_NOT_FOUND');

  const idUsuario = (usuarioRow as unknown as { id_usuario: number }).id_usuario;
  const idCliente = d.pedido?.id_cliente;
  if (idCliente === null || idCliente === undefined) {
    throw new DeliveryError('CLIENTE_NOT_FOUND');
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

  // 2. Calcular monto a cobrar (pedido + envío, sin pagos previos en este flujo simple)
  const totalPedido = Number(d.pedido?.total ?? 0);
  const costoEnvio = Number(d.costo_envio ?? 0);
  const montoPorCobrar = totalPedido + costoEnvio;

  if (monto <= 0 || monto !== montoPorCobrar) {
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

  // 4. Crear la venta (boleta electrónica)
  const { data: venta, error: ventaError } = await supabase
    .from('venta')
    .insert({
      id_pedido: d.id_pedido,
      id_cliente: idCliente,
      id_usuario: idUsuario,
      id_aperturacaja: idAperturaCaja,
      tipodocumento: '03', // Boleta electrónica
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

  // 5. Generar serie y número de boleta automáticamente
  const { data: serieData, error: serieError } = await supabase.rpc('fn_incrementar_correlativo_serie', {
    p_tipodoc: '03',
  });

  if (serieError) throw new Error(`DB_SERIE_FAIL: ${serieError.message}`);

  const serieRow = Array.isArray(serieData) ? serieData[0] : serieData;
  const serie = (serieRow as unknown as { serie: string; numero: string }).serie;
  const numero = (serieRow as unknown as { serie: string; numero: string }).numero;

  // 6. Registrar boleta electrónica
  const { data: clienteData, error: clienteErr } = await supabase
    .from('cliente')
    .select('n_documento')
    .eq('id_cliente', idCliente)
    .maybeSingle();

  if (clienteErr) throw new Error(`DB_CLIENTE_FAIL: ${clienteErr.message}`);

  const clienteDoc = (clienteData as unknown as { n_documento: string | null })?.n_documento ?? '00000000';
  const clienteNombre = (clienteData as unknown as { nombre: string })?.nombre ?? 'CLIENTE VARIOS';

  const { error: boletaError } = await supabase
    .from('boleta')
    .insert({
      id_venta: v.id_venta,
      serie,
      numero,
      cliente_documento: clienteDoc,
      cliente_nombre: clienteNombre,
    });

  if (boletaError) throw new Error(`DB_BOLETA_FAIL: ${boletaError.message}`);

  // 7. Crear el pago_venta
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

  // 8. Marcar la entrega como entregada (cobro y entrega en un solo paso)
  const { error: entregaError } = await supabase
    .from('pedido_delivery')
    .update({
      situacion: 'E',
      f_entrega: new Date().toISOString(),
      ...updateAudit(usumod, pc ?? ''),
    })
    .eq('id_pedidodelivery', id)
    .eq('id_empleado', empleadoId)
    .eq('estado', 'A')
    .eq('situacion', 'R');

  if (entregaError) throw new Error(`DB_ENTREGA_FAIL: ${entregaError.message}`);

  const nuevoMontoPagado = monto;
  const nuevoMontoPorCobrar = Math.max(0, montoPorCobrar - monto);

  return {
    idVenta: v.id_venta,
    idPago: (pago as unknown as { id_pago: number }).id_pago,
    montoPagado: nuevoMontoPagado,
    metodoPago,
    estado: 'E' as Delivery['estado'],
    montoPorCobrar: nuevoMontoPorCobrar,
  };
}

