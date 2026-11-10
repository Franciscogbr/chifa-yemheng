-- Elimina el descuento automático de insumos en el trigger de detalle_venta
-- para evitar doble descuento: el Kardex solo debe descontar cuando la cocina
-- marca el plato como Listo (flujo backend), no al agregar el detalle a la venta.
DROP TRIGGER IF EXISTS trg_consumir_insumos_venta ON public.detalle_venta;

-- Opcional: mantener la función por si se usa en otro lado, pero sin trigger activo.
-- Si se desea eliminar por completo, descomentar la siguiente línea:
-- DROP FUNCTION IF EXISTS public.fn_consumir_insumos_venta();

COMMENT ON TABLE public.movimiento_inventario IS 'Kardex oficial de movimientos de inventario. Fuente única de verdad para entradas y salidas de insumos.';
