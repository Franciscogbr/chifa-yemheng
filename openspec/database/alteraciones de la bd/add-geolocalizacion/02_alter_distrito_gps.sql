-- add-geolocalizacion · 02 — Referencia GPS en distrito
-- Aditivo: solo sugiere costo por distancia (BR-GPS-002).
-- BR-DER-033 sigue mandando: el costo final lo confirma humano.

ALTER TABLE public.distrito
  ADD COLUMN IF NOT EXISTS lat_ref numeric(9,6),
  ADD COLUMN IF NOT EXISTS lng_ref numeric(9,6),
  ADD COLUMN IF NOT EXISTS radio_km numeric(6,2) DEFAULT 5 NOT NULL,
  ADD COLUMN IF NOT EXISTS costo_base numeric(10,2) DEFAULT 0 NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_distrito_radio') THEN
    ALTER TABLE public.distrito
      ADD CONSTRAINT ck_distrito_radio CHECK (radio_km IS NULL OR (radio_km > 0));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_distrito_costo') THEN
    ALTER TABLE public.distrito
      ADD CONSTRAINT ck_distrito_costo CHECK (costo_base IS NULL OR (costo_base >= 0));
  END IF;
END $$;

COMMENT ON COLUMN public.distrito.lat_ref IS 'Centroide distrito para sugerir costo por distancia (BR-GPS-002).';
COMMENT ON COLUMN public.distrito.lng_ref IS 'Centroide distrito para sugerir costo por distancia (BR-GPS-002).';
COMMENT ON COLUMN public.distrito.radio_km IS 'Radio cobertura km. Fuera de radio = aviso, no bloqueo.';
COMMENT ON COLUMN public.distrito.costo_base IS 'Costo base sugerido. El definitivo va en pedido_delivery.costo_envio.';
