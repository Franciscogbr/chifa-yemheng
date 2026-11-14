CREATE OR REPLACE FUNCTION public.fn_abrir_o_unirse_comanda_cliente_seguro(
  p_tipo integer,
  p_usuario integer,
  p_mesa integer,
  p_cliente integer,
  p_comensales integer,
  p_obs character varying
)
RETURNS TABLE (id_pedido integer, numero_pedido character varying, es_nuevo boolean)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_estado_mesa integer;
BEGIN
  SELECT m.id_estadomesa INTO v_estado_mesa
  FROM public.mesa AS m
  WHERE m.id_mesa = p_mesa
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_OCUPADA';
  END IF;
  IF v_estado_mesa = 3 OR EXISTS (
    SELECT 1
    FROM public.reserva AS r
    WHERE r.id_mesa = p_mesa
      AND r.estado = 'A'
      AND r.situacion IN ('C', 'A')
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_REQUIERE_ID';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.fn_abrir_comanda_reserva_qr(
    p_tipo, p_usuario, p_mesa, p_cliente, p_comensales, p_obs
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_cancelar_reserva_cliente(
  p_reserva integer,
  p_cliente integer,
  p_usuario character varying,
  p_pc character varying
)
RETURNS SETOF public.reserva
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reserva public.reserva%ROWTYPE;
  v_estado_mesa integer;
BEGIN
  SELECT r.* INTO v_reserva
  FROM public.reserva AS r
  WHERE r.id_reserva = p_reserva
    AND r.id_cliente = p_cliente
    AND r.estado = 'A'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_NOT_FOUND';
  END IF;
  IF v_reserva.situacion NOT IN ('P', 'C', 'A') THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_ESTADO_INVALIDO';
  END IF;

  IF v_reserva.id_mesa IS NOT NULL THEN
    SELECT m.id_estadomesa INTO v_estado_mesa
    FROM public.mesa AS m
    WHERE m.id_mesa = v_reserva.id_mesa
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION USING MESSAGE = 'MESA_NOT_FOUND';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.pedido AS p
    WHERE p.id_reserva = p_reserva
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_CON_PEDIDO';
  END IF;

  UPDATE public.reserva
  SET situacion = 'X',
      usumod = p_usuario,
      pcmod = NULLIF(p_pc, ''),
      fecmod = now()
  WHERE id_reserva = p_reserva
  RETURNING * INTO v_reserva;

  IF v_reserva.id_mesa IS NOT NULL
    AND v_estado_mesa = 3
    AND NOT EXISTS (
      SELECT 1
      FROM public.reserva AS otra
      WHERE otra.id_mesa = v_reserva.id_mesa
        AND otra.id_reserva <> v_reserva.id_reserva
        AND otra.estado = 'A'
        AND otra.situacion IN ('C', 'A')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.pedido AS p
      WHERE p.id_mesa = v_reserva.id_mesa
        AND p.facturado = 'N'
        AND p.anulado = 'N'
        AND p.estado = 'A'
    ) THEN
    UPDATE public.mesa
    SET id_estadomesa = 1,
        usumod = p_usuario,
        pcmod = NULLIF(p_pc, ''),
        fecmod = now()
    WHERE id_mesa = v_reserva.id_mesa
      AND id_estadomesa = 3;
  END IF;

  RETURN NEXT v_reserva;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_abrir_comanda_reserva_cliente(
  p_reserva integer,
  p_cliente integer,
  p_tipo integer,
  p_usuario integer,
  p_obs character varying
)
RETURNS TABLE (id_pedido integer, numero_pedido character varying, es_nuevo boolean)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reserva public.reserva%ROWTYPE;
  v_pedido public.pedido%ROWTYPE;
  v_estado_mesa integer;
  v_pedido_id integer;
  v_result record;
BEGIN
  SELECT r.* INTO v_reserva
  FROM public.reserva AS r
  WHERE r.id_reserva = p_reserva
    AND r.id_cliente = p_cliente
    AND r.estado = 'A'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_NOT_FOUND';
  END IF;
  IF v_reserva.situacion <> 'A'
    OR v_reserva.f_llegada IS NULL
    OR v_reserva.id_mesa IS NULL
    OR v_reserva.f_reserva::date <> (now() AT TIME ZONE 'America/Lima')::date THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_CONTINUAR_NO_DISPONIBLE';
  END IF;

  SELECT p.* INTO v_pedido
  FROM public.pedido AS p
  WHERE p.id_reserva = p_reserva
  ORDER BY p.id_pedido DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_pedido.id_pedido, v_pedido.numero_pedido, false;
    RETURN;
  END IF;

  IF v_reserva.canal_atencion IS DISTINCT FROM 'QR' THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_CONTINUAR_NO_DISPONIBLE';
  END IF;

  SELECT p.id_pedido INTO v_pedido_id
  FROM public.pedido AS p
  WHERE p.id_mesa = v_reserva.id_mesa
    AND p.facturado = 'N'
    AND p.anulado = 'N'
    AND p.estado = 'A'
  ORDER BY p.f_pedido DESC, p.id_pedido DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_OCUPADA';
  END IF;

  SELECT m.id_estadomesa INTO v_estado_mesa
  FROM public.mesa AS m
  WHERE m.id_mesa = v_reserva.id_mesa
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_NOT_FOUND';
  END IF;
  IF v_estado_mesa NOT IN (1, 3) THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_OCUPADA';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.reserva AS otra
    WHERE otra.id_mesa = v_reserva.id_mesa
      AND otra.id_reserva <> v_reserva.id_reserva
      AND otra.estado = 'A'
      AND otra.situacion IN ('C', 'A')
      AND otra.f_reserva::date = v_reserva.f_reserva::date
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_OCUPADA';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.pedido AS p
    WHERE p.id_mesa = v_reserva.id_mesa
      AND p.facturado = 'N'
      AND p.anulado = 'N'
      AND p.estado = 'A'
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_OCUPADA';
  END IF;

  IF v_estado_mesa = 3 THEN
    UPDATE public.mesa
    SET id_estadomesa = 1,
        usumod = 'CLIENTE',
        pcmod = NULL,
        fecmod = now()
    WHERE id_mesa = v_reserva.id_mesa;
  END IF;

  SELECT * INTO v_result
  FROM public.fn_abrir_o_unirse_comanda_qr(
    p_tipo,
    p_usuario,
    v_reserva.id_mesa,
    p_cliente,
    v_reserva.n_personas,
    COALESCE(p_obs, v_reserva.observacion, '')
  );

  UPDATE public.pedido AS p
  SET id_reserva = v_reserva.id_reserva,
      usumod = 'CLIENTE',
      pcmod = NULL,
      fecmod = now()
  WHERE p.id_pedido = v_result.id_pedido
    AND (p.id_reserva IS NULL OR p.id_reserva = v_reserva.id_reserva);

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'PEDIDO_RESERVA_LINK_FAIL';
  END IF;

  UPDATE public.mesa
  SET id_estadomesa = 2,
      usumod = 'CLIENTE',
      pcmod = NULL,
      fecmod = now()
  WHERE id_mesa = v_reserva.id_mesa;

  RETURN QUERY SELECT v_result.id_pedido, v_result.numero_pedido, v_result.es_nuevo;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_registrar_llegada_reserva(
  p_reserva integer,
  p_canal character varying,
  p_usuario character varying,
  p_pc character varying
)
RETURNS SETOF public.reserva
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reserva public.reserva%ROWTYPE;
BEGIN
  IF p_canal IS NOT NULL AND p_canal NOT IN ('QR', 'MOZO') THEN
    RAISE EXCEPTION USING MESSAGE = 'CANAL_ATENCION_INVALIDO';
  END IF;

  SELECT * INTO v_reserva
  FROM public.reserva
  WHERE id_reserva = p_reserva
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_NOT_FOUND';
  END IF;
  IF v_reserva.situacion NOT IN ('C', 'A') THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_ESTADO_INVALIDO';
  END IF;
  IF v_reserva.id_mesa IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_SIN_MESA';
  END IF;
  IF v_reserva.f_reserva::date <> (now() AT TIME ZONE 'America/Lima')::date THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_FECHA_INVALIDA';
  END IF;

  PERFORM 1
  FROM public.mesa
  WHERE id_mesa = v_reserva.id_mesa
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_NOT_FOUND';
  END IF;

  UPDATE public.reserva
  SET situacion = 'A',
      f_llegada = COALESCE(f_llegada, now()),
      canal_atencion = COALESCE(p_canal, canal_atencion),
      usumod = p_usuario,
      pcmod = NULLIF(p_pc, ''),
      fecmod = now()
  WHERE id_reserva = p_reserva
  RETURNING * INTO v_reserva;

  RETURN NEXT v_reserva;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_elegir_canal_reserva_cliente(
  p_reserva integer,
  p_cliente integer,
  p_mesa integer,
  p_canal character varying
)
RETURNS TABLE (id_reserva integer, id_mesa integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reserva public.reserva%ROWTYPE;
BEGIN
  IF p_canal IS NULL OR p_canal NOT IN ('QR', 'MOZO') THEN
    RAISE EXCEPTION USING MESSAGE = 'CANAL_ATENCION_INVALIDO';
  END IF;

  SELECT r.* INTO v_reserva
  FROM public.reserva AS r
  WHERE r.id_reserva = p_reserva
    AND r.id_cliente = p_cliente
    AND r.estado = 'A'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_NOT_FOUND';
  END IF;
  IF v_reserva.situacion <> 'A'
    OR v_reserva.f_llegada IS NULL
    OR v_reserva.id_mesa IS NULL
    OR v_reserva.f_reserva::date <> (now() AT TIME ZONE 'America/Lima')::date THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_CONTINUAR_NO_DISPONIBLE';
  END IF;
  IF v_reserva.id_mesa <> p_mesa THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_MESA_NO_COINCIDE';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.pedido AS p
    WHERE p.id_reserva = p_reserva
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_CONTINUAR_NO_DISPONIBLE';
  END IF;
  IF v_reserva.canal_atencion IS NOT NULL
    AND v_reserva.canal_atencion <> p_canal THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_CANAL_YA_ELEGIDO';
  END IF;

  PERFORM 1
  FROM public.mesa AS m
  WHERE m.id_mesa = v_reserva.id_mesa
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_NOT_FOUND';
  END IF;

  UPDATE public.reserva
  SET canal_atencion = p_canal,
      usumod = 'CLIENTE',
      pcmod = NULL,
      fecmod = now()
  WHERE id_reserva = p_reserva;

  RETURN QUERY SELECT v_reserva.id_reserva, v_reserva.id_mesa;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_elegir_canal_reserva_cliente(integer, integer, integer, character varying)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_elegir_canal_reserva_cliente(integer, integer, integer, character varying)
  TO service_role;

REVOKE ALL ON FUNCTION public.fn_cancelar_reserva_cliente(integer, integer, character varying, character varying)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_abrir_comanda_reserva_cliente(integer, integer, integer, integer, character varying)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_abrir_o_unirse_comanda_cliente_seguro(integer, integer, integer, integer, integer, character varying)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.fn_cancelar_reserva_cliente(integer, integer, character varying, character varying)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_abrir_comanda_reserva_cliente(integer, integer, integer, integer, character varying)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_abrir_o_unirse_comanda_cliente_seguro(integer, integer, integer, integer, integer, character varying)
  TO service_role;