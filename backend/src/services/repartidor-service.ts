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