-- add-geolocalizacion · 03 — USP actualizar ubicación delivery
-- Regla: GPS opcional (BR-GPS-001). Nunca cambia situacion P/R/E/C ni bloquea pedido/cobro.
-- Quien: 'CLIENTE' actualiza su pin, 'REPARTIDOR' actualiza su posición en ruta.
-- Uso: app cliente (al pedir) y app repartidor (cada 30s en R). Sin permiso GPS = no se llama.

CREATE OR REPLACE FUNCTION public.usp_actualizar_ubicacion_delivery(
  p_id_pedido integer,
  p_lat numeric,
  p_lng numeric,
  p_quien character varying(12)  -- 'CLIENTE' | 'REPARTIDOR'
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_lat IS NOT NULL AND (p_lat < -90 OR p_lat > 90) THEN
    RAISE EXCEPTION 'Lat fuera de rango (-90/90): %', p_lat;
  END IF;
  IF p_lng IS NOT NULL AND (p_lng < -180 OR p_lng > 180) THEN
    RAISE EXCEPTION 'Lng fuera de rango (-180/180): %', p_lng;
  END IF;
  IF p_quien NOT IN ('CLIENTE', 'REPARTIDOR') THEN
    RAISE EXCEPTION 'p_quien debe ser CLIENTE o REPARTIDOR, llegó: %', p_quien;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.pedido_delivery WHERE id_pedido = p_id_pedido AND estado = 'A') THEN
    RAISE EXCEPTION 'Pedido delivery % no existe o está inactivo', p_id_pedido;
  END IF;

  IF p_quien = 'CLIENTE' THEN
    UPDATE public.pedido_delivery
      SET lat_cliente = p_lat,
          lng_cliente = p_lng,
          f_ubicacion = CURRENT_TIMESTAMP,
          fecmod = CURRENT_TIMESTAMP
      WHERE id_pedido = p_id_pedido AND estado = 'A';
  ELSE
    UPDATE public.pedido_delivery
      SET lat_repartidor = p_lat,
          lng_repartidor = p_lng,
          f_ubicacion = CURRENT_TIMESTAMP,
          fecmod = CURRENT_TIMESTAMP
      WHERE id_pedido = p_id_pedido AND estado = 'A';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.usp_actualizar_ubicacion_delivery(integer, numeric, numeric, character varying)
  IS 'GPS opcional delivery (BR-GPS-001). No toca situacion ni costo_envio.';
