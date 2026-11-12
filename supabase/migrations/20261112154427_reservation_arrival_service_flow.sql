ALTER TABLE public.reserva
  ADD COLUMN IF NOT EXISTS origen character varying(12) NOT NULL DEFAULT 'PERSONAL',
  ADD COLUMN IF NOT EXISTS f_llegada timestamp with time zone,
  ADD COLUMN IF NOT EXISTS canal_atencion character varying(8);

ALTER TABLE public.reserva
  ADD CONSTRAINT ck_reserva_origen
    CHECK (origen IN ('WEB', 'TELEFONO', 'PERSONAL')),
  ADD CONSTRAINT ck_reserva_canal_atencion
    CHECK (canal_atencion IS NULL OR canal_atencion IN ('QR', 'MOZO'));

ALTER TABLE public.pedido
  ADD COLUMN IF NOT EXISTS id_reserva integer
    REFERENCES public.reserva (id_reserva);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pedido_reserva
  ON public.pedido (id_reserva)
  WHERE id_reserva IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_reserva_llegada_mozo
  ON public.reserva (f_llegada, f_reserva)
  WHERE situacion = 'A' AND canal_atencion = 'MOZO';

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
  IF p_canal IS NULL OR p_canal NOT IN ('QR', 'MOZO') THEN
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
      canal_atencion = p_canal,
      usumod = p_usuario,
      pcmod = NULLIF(p_pc, ''),
      fecmod = now()
  WHERE id_reserva = p_reserva
  RETURNING * INTO v_reserva;

  RETURN NEXT v_reserva;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_registrar_llegada_reserva_cliente(
  p_mesa integer,
  p_cliente integer,
  p_canal character varying
)
RETURNS TABLE (id_reserva integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_id_reserva integer;
BEGIN
  SELECT r.id_reserva INTO v_id_reserva
  FROM public.reserva AS r
  WHERE r.id_mesa = p_mesa
    AND r.id_cliente = p_cliente
    AND r.situacion IN ('C', 'A')
    AND r.f_reserva::date = (now() AT TIME ZONE 'America/Lima')::date
  ORDER BY r.f_reserva DESC, r.id_reserva DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  PERFORM public.fn_registrar_llegada_reserva(
    v_id_reserva, p_canal, 'CLIENTE', ''
  );
  RETURN QUERY SELECT v_id_reserva;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_abrir_comanda_reserva_qr(
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
  v_reserva public.reserva%ROWTYPE;
  v_result record;
  v_estado_mesa integer;
BEGIN
  SELECT * INTO v_reserva
  FROM public.reserva
  WHERE id_mesa = p_mesa
    AND id_cliente = p_cliente
    AND situacion IN ('C', 'A')
    AND f_reserva::date = (now() AT TIME ZONE 'America/Lima')::date
  ORDER BY f_reserva DESC, id_reserva DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT * FROM public.fn_abrir_o_unirse_comanda_qr(
      p_tipo, p_usuario, p_mesa, p_cliente, p_comensales, p_obs
    );
    RETURN;
  END IF;

  SELECT id_estadomesa INTO v_estado_mesa
  FROM public.mesa
  WHERE id_mesa = p_mesa
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_NOT_FOUND';
  END IF;

  IF v_estado_mesa = 3 THEN
    UPDATE public.mesa
    SET id_estadomesa = 1
    WHERE id_mesa = p_mesa;
  END IF;

  SELECT * INTO v_result
  FROM public.fn_abrir_o_unirse_comanda_qr(
    p_tipo, p_usuario, p_mesa, p_cliente, p_comensales, p_obs
  );

  UPDATE public.reserva
  SET situacion = 'A',
      f_llegada = COALESCE(f_llegada, now()),
      canal_atencion = 'QR',
      usumod = 'CLIENTE',
      fecmod = now()
  WHERE id_reserva = v_reserva.id_reserva;

  UPDATE public.pedido
  SET id_reserva = v_reserva.id_reserva
  WHERE public.pedido.id_pedido = v_result.id_pedido
    AND (public.pedido.id_reserva IS NULL OR public.pedido.id_reserva = v_reserva.id_reserva);
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'PEDIDO_RESERVA_LINK_FAIL';
  END IF;

  UPDATE public.mesa
  SET id_estadomesa = 2,
      usumod = 'CLIENTE',
      pcmod = NULL,
      fecmod = now()
  WHERE id_mesa = p_mesa;

  RETURN QUERY SELECT v_result.id_pedido, v_result.numero_pedido, v_result.es_nuevo;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_abrir_pedido_reserva_mozo(
  p_reserva integer,
  p_tipo integer,
  p_usuario integer,
  p_comensales integer,
  p_obs character varying,
  p_logeo character varying,
  p_pc character varying
)
RETURNS TABLE (o_id integer, o_num character varying)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reserva public.reserva%ROWTYPE;
  v_id integer;
  v_num character varying;
BEGIN
  SELECT * INTO v_reserva
  FROM public.reserva
  WHERE id_reserva = p_reserva
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_NOT_FOUND';
  END IF;
  IF v_reserva.situacion <> 'A'
    OR v_reserva.canal_atencion <> 'MOZO'
    OR v_reserva.f_llegada IS NULL
    OR v_reserva.id_mesa IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'RESERVA_NO_ESPERA_MOZO';
  END IF;

  PERFORM 1
  FROM public.mesa
  WHERE id_mesa = v_reserva.id_mesa
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_NOT_FOUND';
  END IF;

  SELECT id_pedido, numero_pedido INTO v_id, v_num
  FROM public.pedido
  WHERE id_reserva = p_reserva
    AND facturado = 'N'
    AND anulado = 'N'
    AND estado = 'A'
  ORDER BY f_pedido DESC, id_pedido DESC
  LIMIT 1;
  IF FOUND THEN
    RETURN QUERY SELECT v_id, v_num;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.pedido
    WHERE id_mesa = v_reserva.id_mesa
      AND facturado = 'N'
      AND anulado = 'N'
      AND estado = 'A'
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'MESA_OCUPADA';
  END IF;

  UPDATE public.mesa
  SET id_estadomesa = 1,
      usumod = p_logeo,
      pcmod = NULLIF(p_pc, ''),
      fecmod = now()
  WHERE id_mesa = v_reserva.id_mesa;

  CALL public.usp_abrir_pedido(
    p_tipo,
    p_usuario,
    v_reserva.id_mesa,
    v_reserva.id_cliente,
    NULL,
    COALESCE(p_comensales, v_reserva.n_personas),
    COALESCE(p_obs, v_reserva.observacion, ''),
    v_id,
    v_num
  );

  UPDATE public.pedido
  SET id_reserva = p_reserva,
      usumod = p_logeo,
      pcmod = NULLIF(p_pc, ''),
      fecmod = now()
  WHERE id_pedido = v_id;

  UPDATE public.reserva
  SET usumod = p_logeo,
      pcmod = NULLIF(p_pc, ''),
      fecmod = now()
  WHERE id_reserva = p_reserva;

  UPDATE public.mesa
  SET id_estadomesa = 2,
      usumod = p_logeo,
      pcmod = NULLIF(p_pc, ''),
      fecmod = now()
  WHERE id_mesa = v_reserva.id_mesa;

  RETURN QUERY SELECT v_id, v_num;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_registrar_llegada_reserva(integer, character varying, character varying, character varying)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_registrar_llegada_reserva_cliente(integer, integer, character varying)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_abrir_comanda_reserva_qr(integer, integer, integer, integer, integer, character varying)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_abrir_pedido_reserva_mozo(integer, integer, integer, integer, character varying, character varying, character varying)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.fn_registrar_llegada_reserva(integer, character varying, character varying, character varying)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_registrar_llegada_reserva_cliente(integer, integer, character varying)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_abrir_comanda_reserva_qr(integer, integer, integer, integer, integer, character varying)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_abrir_pedido_reserva_mozo(integer, integer, integer, integer, character varying, character varying, character varying)
  TO service_role;