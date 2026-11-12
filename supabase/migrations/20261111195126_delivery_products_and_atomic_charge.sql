CREATE OR REPLACE FUNCTION public.fn_crear_delivery_admin(
  p_cliente integer,
  p_usuario integer,
  p_distrito integer,
  p_direccion character varying,
  p_referencia character varying,
  p_telefono character varying,
  p_costo_envio numeric,
  p_items jsonb,
  p_actor character varying,
  p_pc character varying
)
RETURNS TABLE (
  id_pedidodelivery integer,
  id_pedido integer,
  situacion character,
  costo_envio numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_creado record;
  v_id_pedido integer;
  v_actor character varying(30);
  v_pc character varying(30);
BEGIN
  v_actor := LEFT(COALESCE(NULLIF(BTRIM(p_actor), ''), 'DELIVERY'), 30);
  v_pc := CASE WHEN CHAR_LENGTH(COALESCE(p_pc, '')) <= 30 THEN NULLIF(p_pc, '') ELSE NULL END;

  SELECT creado.*
    INTO v_creado
  FROM public.fn_crear_delivery_cliente(
    p_cliente,
    p_usuario,
    p_distrito,
    p_direccion,
    p_referencia,
    p_telefono,
    p_costo_envio,
    NULL,
    NULL,
    p_items,
    v_pc
  ) AS creado;

  SELECT pd.id_pedido
    INTO v_id_pedido
  FROM public.pedido_delivery AS pd
  WHERE pd.id_pedidodelivery = v_creado.id_pedidodelivery;

  IF v_id_pedido IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'DELIVERY_CREATE_FAIL';
  END IF;

  UPDATE public.pedido
  SET usucre = v_actor,
      pccre = v_pc
  WHERE public.pedido.id_pedido = v_id_pedido;

  UPDATE public.pedido_delivery
  SET usucre = v_actor,
      pccre = v_pc
  WHERE public.pedido_delivery.id_pedidodelivery = v_creado.id_pedidodelivery;

  RETURN QUERY
  SELECT v_creado.id_pedidodelivery, v_id_pedido, v_creado.situacion, v_creado.costo_envio;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_crear_delivery_admin(
  integer, integer, integer, character varying, character varying, character varying,
  numeric, jsonb, character varying, character varying
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_crear_delivery_admin(
  integer, integer, integer, character varying, character varying, character varying,
  numeric, jsonb, character varying, character varying
) TO service_role;

CREATE OR REPLACE FUNCTION public.fn_registrar_venta_delivery_atomic(
  p_delivery integer,
  p_empleado integer,
  p_monto numeric,
  p_metodo_pago character varying,
  p_referencia character varying,
  p_actor character varying,
  p_pc character varying
)
RETURNS TABLE (
  id_venta integer,
  id_pago integer,
  monto_pagado numeric,
  metodo_pago character varying,
  situacion character,
  monto_por_cobrar numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_delivery public.pedido_delivery%ROWTYPE;
  v_total_pedido numeric(12,2);
  v_total_cobrar numeric(12,2);
  v_total_centimos bigint;
  v_id_cliente integer;
  v_id_usuario integer;
  v_id_apertura integer;
  v_id_metodo integer;
  v_metodo character varying(30);
  v_requiere_referencia character(1);
  v_venta_id integer;
  v_venta_total numeric(12,2);
  v_venta_pagado numeric(12,2);
  v_pagos_total numeric(12,2);
  v_pago_id integer;
  v_pago_metodo integer;
  v_serie_id integer;
  v_serie character(4);
  v_correlativo integer;
  v_numero character(8);
  v_cliente_documento character varying(15);
  v_cliente_nombre character varying(200);
  v_actor character varying(30);
  v_pc character varying(30);
BEGIN
  SELECT pd.*
    INTO v_delivery
  FROM public.pedido_delivery AS pd
  WHERE pd.id_pedidodelivery = p_delivery
    AND pd.id_empleado = p_empleado
    AND pd.estado = 'A'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'NOT_FOUND';
  END IF;
  IF v_delivery.situacion NOT IN ('R', 'E') THEN
    RAISE EXCEPTION USING MESSAGE = 'INVALID_STATE';
  END IF;

  SELECT p.total, p.id_cliente
    INTO v_total_pedido, v_id_cliente
  FROM public.pedido AS p
  WHERE p.id_pedido = v_delivery.id_pedido
    AND p.estado = 'A'
    AND p.anulado = 'N'
  FOR UPDATE;

  IF NOT FOUND OR v_id_cliente IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'PEDIDO_INVALIDO';
  END IF;

  v_total_cobrar := ROUND(COALESCE(v_total_pedido, 0) + COALESCE(v_delivery.costo_envio, 0), 2);
  v_total_centimos := ROUND(v_total_cobrar * 100)::bigint;
  IF p_monto IS NULL OR p_monto <= 0 OR ROUND(p_monto * 100)::bigint <> v_total_centimos THEN
    RAISE EXCEPTION USING MESSAGE = 'MONTO_INVALIDO';
  END IF;

  SELECT v.id_venta, v.total, v.total_pagado
    INTO v_venta_id, v_venta_total, v_venta_pagado
  FROM public.venta AS v
  WHERE v.id_pedido = v_delivery.id_pedido
    AND v.estado = 'A'
    AND v.anulada = 'N'
  ORDER BY v.id_venta DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    SELECT COALESCE(SUM(pv.monto), 0),
           (ARRAY_AGG(pv.id_pago ORDER BY pv.id_pago))[1],
           (ARRAY_AGG(pv.id_metodopago ORDER BY pv.id_pago))[1]
      INTO v_pagos_total, v_pago_id, v_pago_metodo
    FROM public.pago_venta AS pv
    WHERE pv.id_venta = v_venta_id
      AND pv.estado = 'A';

    IF ROUND(v_venta_total * 100)::bigint = v_total_centimos
       AND ROUND(v_venta_pagado * 100)::bigint = v_total_centimos
       AND ROUND(v_pagos_total * 100)::bigint = v_total_centimos
       AND v_pago_id IS NOT NULL THEN
      SELECT mp.n_metodopago
        INTO v_metodo
      FROM public.metodo_pago AS mp
      WHERE mp.id_metodopago = v_pago_metodo
        AND mp.estado = 'A';

      IF v_metodo IS NULL THEN
        RAISE EXCEPTION USING MESSAGE = 'METODO_PAGO_INVALIDO';
      END IF;

      UPDATE public.pedido_delivery
      SET situacion = 'E',
          f_entrega = COALESCE(f_entrega, CURRENT_TIMESTAMP),
          usumod = LEFT(COALESCE(NULLIF(BTRIM(p_actor), ''), 'DELIVERY'), 30),
          pcmod = CASE WHEN CHAR_LENGTH(COALESCE(p_pc, '')) <= 30 THEN NULLIF(p_pc, '') ELSE NULL END,
          fecmod = CURRENT_TIMESTAMP
      WHERE id_pedidodelivery = p_delivery;

      RETURN QUERY
      SELECT v_venta_id, v_pago_id, v_pagos_total, v_metodo, 'E'::character(1), 0::numeric;
      RETURN;
    END IF;

    RAISE EXCEPTION USING MESSAGE = 'VENTA_YA_EXISTE';
  END IF;

  SELECT ac.id_aperturacaja
    INTO v_id_apertura
  FROM public.apertura_caja AS ac
  WHERE ac.situacion = 'A'
    AND ac.estado = 'A'
  ORDER BY ac.f_apertura DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'CAJA_NO_ABIERTA';
  END IF;

  SELECT u.id_usuario
    INTO v_id_usuario
  FROM public.usuario AS u
  WHERE u.id_empleado = p_empleado
    AND u.estado = 'A'
    AND u.bloqueado = 'N'
  ORDER BY u.id_usuario
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'USUARIO_REPARTIDOR_NO_DISPONIBLE';
  END IF;

  SELECT mp.id_metodopago, mp.n_metodopago, mp.requiere_referencia
    INTO v_id_metodo, v_metodo, v_requiere_referencia
  FROM public.metodo_pago AS mp
  WHERE UPPER(BTRIM(mp.n_metodopago)) = UPPER(BTRIM(p_metodo_pago))
    AND mp.estado = 'A'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'METODO_PAGO_INVALIDO';
  END IF;
  IF v_requiere_referencia = 'S' AND NULLIF(BTRIM(p_referencia), '') IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'REFERENCIA_REQUERIDA';
  END IF;
  IF CHAR_LENGTH(COALESCE(p_referencia, '')) > 50 THEN
    RAISE EXCEPTION USING MESSAGE = 'REFERENCIA_INVALIDA';
  END IF;

  SELECT COALESCE(
           NULLIF(BTRIM(pe.n_documento), ''),
           NULLIF(BTRIM(em.ruc), ''),
           '00000000'
         ),
         COALESCE(
           NULLIF(BTRIM(CONCAT_WS(' ', pe.nombre, pe.ap_paterno, pe.ap_materno)), ''),
           NULLIF(BTRIM(em.razon_social), ''),
           NULLIF(BTRIM(em.nombre_comercial), ''),
           'CLIENTE VARIOS'
         )
    INTO v_cliente_documento, v_cliente_nombre
  FROM public.cliente AS c
  LEFT JOIN public.persona AS pe ON pe.id_persona = c.id_persona
  LEFT JOIN public.empresa AS em ON em.id_empresa = c.id_empresa
  WHERE c.id_cliente = v_id_cliente
    AND c.estado = 'A';

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'CLIENTE_NOT_FOUND';
  END IF;

  SELECT sd.id_serie
    INTO v_serie_id
  FROM public.serie_documento AS sd
  WHERE sd.tipo_documento = '03'
    AND sd.estado = 'A'
  ORDER BY sd.id_serie
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'SERIE_NO_EXISTE';
  END IF;

  UPDATE public.serie_documento AS sd
  SET correlativo = sd.correlativo + 1
  WHERE sd.id_serie = v_serie_id
  RETURNING sd.serie, sd.correlativo
    INTO v_serie, v_correlativo;

  IF v_serie IS NULL OR v_correlativo IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'SERIE_NO_EXISTE';
  END IF;
  v_numero := LPAD(v_correlativo::text, 8, '0');
  v_actor := LEFT(COALESCE(NULLIF(BTRIM(p_actor), ''), 'DELIVERY'), 30);
  v_pc := CASE WHEN CHAR_LENGTH(COALESCE(p_pc, '')) <= 30 THEN NULLIF(p_pc, '') ELSE NULL END;

  INSERT INTO public.venta (
    id_pedido, id_cliente, id_usuario, id_aperturacaja, tipodocumento,
    subtotal, descuento, servicio, igv, total, total_pagado, vuelto,
    anulada, estado, usucre, pccre
  ) VALUES (
    v_delivery.id_pedido, v_id_cliente, v_id_usuario, v_id_apertura, '03',
    v_total_pedido, 0, 0, 0, v_total_cobrar, v_total_cobrar, 0,
    'N', 'A', v_actor, v_pc
  )
  RETURNING id_venta INTO v_venta_id;

  INSERT INTO public.boleta (
    id_venta, serie, numero, cliente_documento, cliente_nombre, usucre, pccre
  ) VALUES (
    v_venta_id, v_serie, v_numero, v_cliente_documento, v_cliente_nombre, v_actor, v_pc
  );

  INSERT INTO public.pago_venta (
    id_venta, id_metodopago, monto, referencia, f_pago, estado, usucre, pccre
  ) VALUES (
    v_venta_id, v_id_metodo, v_total_cobrar, NULLIF(BTRIM(p_referencia), ''),
    CURRENT_TIMESTAMP, 'A', v_actor, v_pc
  )
  RETURNING public.pago_venta.id_pago INTO v_pago_id;

  UPDATE public.pedido_delivery
  SET situacion = 'E',
      f_entrega = CURRENT_TIMESTAMP,
      usumod = v_actor,
      pcmod = v_pc,
      fecmod = CURRENT_TIMESTAMP
  WHERE id_pedidodelivery = p_delivery;

  RETURN QUERY
  SELECT v_venta_id, v_pago_id, v_total_cobrar, v_metodo, 'E'::character(1), 0::numeric;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_registrar_venta_delivery_atomic(
  integer, integer, numeric, character varying, character varying, character varying, character varying
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_registrar_venta_delivery_atomic(
  integer, integer, numeric, character varying, character varying, character varying, character varying
) TO service_role;

NOTIFY pgrst, 'reload schema';