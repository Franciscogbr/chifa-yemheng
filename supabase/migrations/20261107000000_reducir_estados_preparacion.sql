-- Migración: reducir estados de preparación de cocina a 2 (Pendiente / Listo)
-- Ejecutar en Supabase SQL Editor.
-- No contiene sentencias destructivas (solo UPDATE). No toca RLS, permisos ni esquema.

-- 1) 'S' (Servido) → 'L' (Listo): los platos ya servidos pasan a Listo
UPDATE detalle_pedido
SET estado_preparacion = 'L'
WHERE estado_preparacion = 'S';

-- 2) 'E' (En preparación) → 'P' (Pendiente): no existe estado intermedio,
--  los platos que se estaban preparando quedan como Pendiente para marcar Listo desde cocina
UPDATE detalle_pedido
SET estado_preparacion = 'P'
WHERE estado_preparacion = 'E';

-- 3) 'P' y 'A' se mantienen sin cambios.
--    'P' = Pendiente (aún no listo)
--    'L' = Listo (listo para entregar al cliente)
--    'A' = Anulado (cancelado, no se prepara ni se cobra)

-- Verificación opcional: contar platos por estado después de la migración
-- SELECT estado_preparacion, COUNT(*) FROM detalle_pedido GROUP BY estado_preparacion;
