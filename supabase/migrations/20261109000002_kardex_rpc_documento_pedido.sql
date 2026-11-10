-- Extiende el RPC de registro de movimientos para guardar documento e id_pedido,
-- permitiendo trazabilidad completa del Kardex (qué venta/pedido originó el movimiento).
CREATE OR REPLACE FUNCTION public.fn_registrar_movimiento_inventario(
  p_producto integer,
  p_usuario integer,
  p_tipo character varying,
  p_cantidad numeric,
  p_costo numeric,
  p_documento character varying,
  p_id_pedido integer,
  p_observacion character varying,
  p_usucre character varying,
  p_pc character varying
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_producto public.producto%ROWTYPE;
  v_nuevo_stock numeric(12,3);
  v_id bigint;
BEGIN
  IF p_cantidad IS NULL OR p_cantidad <= 0 OR p_tipo NOT IN ('E', 'S', 'A', 'M') THEN
    RAISE EXCEPTION USING MESSAGE = 'VALIDATION_ERROR';
  END IF;
  SELECT * INTO v_producto
  FROM public.producto AS prod
  WHERE prod.id_producto = p_producto
    AND prod.estado = 'A'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'PRODUCTO_INVALIDO';
  END IF;

  v_nuevo_stock := COALESCE(v_producto.stock_actual, 0);
  IF v_producto.controla_stock = 'S' THEN
    IF p_tipo IN ('E', 'A') THEN
      v_nuevo_stock := v_nuevo_stock + p_cantidad;
    ELSE
      v_nuevo_stock := v_nuevo_stock - p_cantidad;
      IF v_nuevo_stock < 0 THEN
        RAISE EXCEPTION USING MESSAGE = 'STOCK_INSUFICIENTE';
      END IF;
    END IF;
  END IF;

  INSERT INTO public.movimiento_inventario (
    id_producto, id_usuario, id_pedido, tipo_movimiento, cantidad,
    stock_anterior, stock_nuevo, costo_unitario, documento, observacion,
    usucre, pccre
  )
  VALUES (
    p_producto, p_usuario, p_id_pedido, p_tipo, p_cantidad,
    COALESCE(v_producto.stock_actual, 0), v_nuevo_stock,
    COALESCE(p_costo, 0), p_documento, NULLIF(p_observacion, ''),
    p_usucre, p_pc
  )
  RETURNING id_movimientoinv INTO v_id;

  IF v_producto.controla_stock = 'S' THEN
    UPDATE public.producto
    SET stock_actual = v_nuevo_stock,
        usumod = p_usucre,
        pcmod = p_pc,
        fecmod = CURRENT_TIMESTAMP
    WHERE id_producto = p_producto;
  END IF;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_registrar_movimiento_inventario(
  integer, integer, character varying, numeric, numeric,
  character varying, integer, character varying, character varying, character varying
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.fn_registrar_movimiento_inventario(
  integer, integer, character varying, numeric, numeric,
  character varying, integer, character varying, character varying, character varying
) TO service_role;
