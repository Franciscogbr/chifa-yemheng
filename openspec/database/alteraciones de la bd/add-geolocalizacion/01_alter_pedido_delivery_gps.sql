-- add-geolocalizacion · 01 — GPS opcional en pedido_delivery
-- Aditivo: todo NULL para no romper pedidos actuales.
-- No toca ck_peddel_sit (P/R/E/C) ni direccion_entrega NOT NULL.

ALTER TABLE public.pedido_delivery
  ADD COLUMN IF NOT EXISTS lat_cliente numeric(9,6),
  ADD COLUMN IF NOT EXISTS lng_cliente numeric(9,6),
  ADD COLUMN IF NOT EXISTS lat_repartidor numeric(9,6),
  ADD COLUMN IF NOT EXISTS lng_repartidor numeric(9,6),
  ADD COLUMN IF NOT EXISTS f_ubicacion timestamp without time zone;

-- Checks de rango (permiten NULL). Nombres fijos para rollback limpio.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_peddel_lat_cli') THEN
    ALTER TABLE public.pedido_delivery
      ADD CONSTRAINT ck_peddel_lat_cli CHECK (lat_cliente IS NULL OR (lat_cliente BETWEEN -90 AND 90));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_peddel_lng_cli') THEN
    ALTER TABLE public.pedido_delivery
      ADD CONSTRAINT ck_peddel_lng_cli CHECK (lng_cliente IS NULL OR (lng_cliente BETWEEN -180 AND 180));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_peddel_lat_rep') THEN
    ALTER TABLE public.pedido_delivery
      ADD CONSTRAINT ck_peddel_lat_rep CHECK (lat_repartidor IS NULL OR (lat_repartidor BETWEEN -90 AND 90));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_peddel_lng_rep') THEN
    ALTER TABLE public.pedido_delivery
      ADD CONSTRAINT ck_peddel_lng_rep CHECK (lng_repartidor IS NULL OR (lng_repartidor BETWEEN -180 AND 180));
  END IF;
END $$;

COMMENT ON COLUMN public.pedido_delivery.lat_cliente IS 'GPS cliente (opcional, BR-GPS-001). NULL = flujo manual por direccion/distrito.';
COMMENT ON COLUMN public.pedido_delivery.lng_cliente IS 'GPS cliente (opcional, BR-GPS-001).';
COMMENT ON COLUMN public.pedido_delivery.lat_repartidor IS 'GPS repartidor en ruta R (opcional, BR-GPS-001).';
COMMENT ON COLUMN public.pedido_delivery.lng_repartidor IS 'GPS repartidor en ruta R (opcional, BR-GPS-001).';
COMMENT ON COLUMN public.pedido_delivery.f_ubicacion IS 'Última actualización GPS (polling 30s app).';
