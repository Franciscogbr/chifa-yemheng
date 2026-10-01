-- auditoria-completa · 01 — red de seguridad: fecmod automático en UPDATE
-- Si el back manda usumod/pcmod pero olvida fecmod, se pone NOW().
-- Si editan directo en Supabase, igual queda fecmod lleno. Histórico no se toca.

CREATE OR REPLACE FUNCTION public.touch_audit()
RETURNS trigger AS $$
BEGIN
  IF NEW.fecmod IS NULL THEN
    NEW.fecmod := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
  tablas text[] := ARRAY[
    'ambiente','apertura_caja','auditoria','boleta','caja','cargo',
    'categoria_producto','cliente','concepto_caja','contrato','departamento',
    'detalle_pedido','detalle_venta','distrito','empleado','empresa',
    'estado_mesa','estado_pedido','factura','mesa','metodo_pago','modulo',
    'movimiento_caja','movimiento_inventario','nota_credito','pago_venta',
    'pedido','pedido_delivery','permiso','persona','producto','provincia',
    'receta','reserva','rol','rol_permiso','serie_documento','tipo_identidad',
    'tipo_mesa','tipo_movimiento_caja','tipo_pedido','tipo_usuario',
    'unidad_medida','usuario','usuario_rol','venta'
  ];
BEGIN
  FOREACH t IN ARRAY tablas LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tr_touch_audit ON public.%I', t);
    EXECUTE format('CREATE TRIGGER tr_touch_audit BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_audit()', t);
  END LOOP;
END;
$$;
