import type { DeliveryAsignar, DeliveryCreate, DeliveryQuery, ParametrosNegocioUpdate, SugerirCostoQuery, TarifaUpsert } from '../schemas/delivery.js';
import { asignarRepartidor, crearDelivery, despacharDelivery, entregarDelivery, listarDelivery, sugerirCosto, getParametrosNegocio, upsertParametrosNegocio, listarTarifasDistrito, upsertTarifaDistrito } from '../repositories/delivery-repository.js';
import { DeliveryError } from '../models/delivery.js';
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
  if (!data) return null;
  const pedidoData = data as any;
  const pedidoTotal = Array.isArray(pedidoData.pedido) ? pedidoData.pedido[0]?.total : pedidoData.pedido?.total;
  return {
    id_pedido: data.id_pedido,
    direccion_entrega: data.direccion_entrega,
    costo_envio: data.costo_envio,
    pedido_total: pedidoTotal,
  };
}

export async function listarDeliveryService(q: DeliveryQuery) { return listarDelivery(q); }
export async function crearDeliveryService(input: DeliveryCreate, usuarioId: number, usucre: string, pc?: string) {
  return crearDelivery(input, usuarioId, usucre, pc);
}
export async function asignarRepartidorService(id: number, input: DeliveryAsignar, usumod: string, pc?: string) {
  const r = await asignarRepartidor(id, input.repartidorId, usumod, pc, input.costoEnvio);
  if (!r) throw new DeliveryError('NOT_FOUND');
  try {
    const info = await getDeliveryInfoForPush(id);
    if (info) {
      await pushService.enviarNuevaAsignacion(input.repartidorId, {
        pedidoId: info.id_pedido,
        deliveryId: id,
        direccion: info.direccion_entrega,
        total: Number(info.pedido_total ?? 0) + Number(info.costo_envio ?? 0),
      });
    }
  } catch (e) { console.error('[Push] Error en asignar:', e); }
  return r;
}
export async function despacharService(id: number, usumod: string, pc?: string) {
  const r = await despacharDelivery(id, usumod, pc);
  if (!r) throw new DeliveryError('NOT_FOUND');
  try {
    const info = await getDeliveryInfoForPush(id);
    if (info && r.repartidorId) {
      await pushService.enviarEnRuta(r.repartidorId, {
        pedidoId: info.id_pedido,
        deliveryId: id,
        direccion: info.direccion_entrega,
      });
    }
  } catch (e) { console.error('[Push] Error en despachar:', e); }
  return r;
}
export async function entregarService(id: number, usumod: string, pc?: string) {
  const r = await entregarDelivery(id, usumod, pc);
  if (!r) throw new DeliveryError('NOT_FOUND');
  return r;
}
export async function sugerirCostoService(q: SugerirCostoQuery) { return sugerirCosto(q.lat ?? null, q.lng ?? null, q.distrito); }
export async function getParametrosService() { return getParametrosNegocio(); }
export async function updateParametrosService(input: ParametrosNegocioUpdate, usumod: string, pc?: string) { return upsertParametrosNegocio(input, usumod, pc); }
export async function listarTarifasService() { return listarTarifasDistrito(); }
export async function upsertTarifaService(distritoId: number, input: TarifaUpsert, usumod: string, pc?: string) { return upsertTarifaDistrito(distritoId, input, usumod, pc); }
