-- remove-caja-area · 01 — quita CAJA de area_despacho, deja solo COCINA/BARRA
-- Verificado: 0 filas con CAJA (8 COCINA, 4 BARRA). Falla si hubiera datos CAJA.

ALTER TABLE public.categoria_producto DROP CONSTRAINT IF EXISTS ck_catprod_area;
ALTER TABLE public.categoria_producto
  ADD CONSTRAINT ck_catprod_area CHECK (area_despacho IN ('COCINA', 'BARRA'));
