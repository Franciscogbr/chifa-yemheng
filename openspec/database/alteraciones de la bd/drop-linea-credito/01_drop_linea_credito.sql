-- DROP Linea_Credito (columna dormida, cero referencias en código).
-- PRE-REQUISITO: respaldo de la BD antes de ejecutar (irreversible sin backup).
-- Ejecutar en el SQL Editor de Supabase y luego correr la verificación.
ALTER TABLE public.cliente DROP COLUMN IF EXISTS linea_credito;
