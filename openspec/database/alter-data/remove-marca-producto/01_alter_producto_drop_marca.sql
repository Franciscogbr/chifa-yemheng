-- remove-marca-producto · 01 — elimina columna no usada en chifa (46/46 NULL verificado)
-- No requerida en ningún flujo: front sin input, back optional default '', spec opcional.
-- Reversible solo restaurando columna: ADD COLUMN marca varchar(50).

ALTER TABLE public.producto DROP COLUMN IF EXISTS marca;
