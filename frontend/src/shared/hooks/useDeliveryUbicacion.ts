import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api-client';
import type { PedidoItemShared } from '../types/delivery';

export type DeliverySituacion = 'P' | 'R' | 'E' | 'C';

export interface DeliveryUbicacion {
  id_pedidodelivery: number;
  id_pedido: number;
  id_distrito: number | null;
  distrito: string | null;
  direccion_entrega: string;
  costo_envio: number;
  costo_envio_confirmado: boolean;
  situacion: DeliverySituacion;
  f_salida: string | null;
  f_entrega: string | null;
  lat_cliente: number | null;
  lng_cliente: number | null;
  lat_repartidor: number | null;
  lng_repartidor: number | null;
  f_ubicacion: string | null;
  id_repartidor: number | null;
  repartidor: string | null;
  items?: PedidoItemShared[];
  totalPedido?: number;
  montoPagado?: number;
  montoPorCobrar?: number;
  metodoPago?: string | null;
}

/**
 * Ubicación/estado de un delivery para el cliente.
 * Actualiza el seguimiento por el endpoint autenticado del cliente.
 * No consulta directamente pedido_delivery desde el navegador.
 */
export function useDeliveryUbicacion(deliveryId: number | null, interval?: number) {
  const [ubicacion, setUbicacion] = useState<DeliveryUbicacion | null>(null);
  const [loading, setLoading] = useState(true);
  const pollingInterval = interval ?? (ubicacion?.situacion === 'R' ? 8000 : ubicacion?.situacion === 'P' ? 20000 : 0);

  const refresh = useCallback(async () => {
    if (!deliveryId) return;
    try {
      const data = await api.getDeliveryUbicacion(deliveryId);
      setUbicacion(data as DeliveryUbicacion);
    } catch (e) {
      console.error('Error consultando ubicación delivery:', e);
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    if (!deliveryId) return;
    void refresh();
    if (pollingInterval <= 0) return;
    const timer = setInterval(() => void refresh(), pollingInterval);
    return () => clearInterval(timer);
  }, [deliveryId, pollingInterval, refresh]);

  return { ubicacion, loading, refresh };
}
