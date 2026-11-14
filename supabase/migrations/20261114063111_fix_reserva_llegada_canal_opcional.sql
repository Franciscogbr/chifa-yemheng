-- Permite registrar la llegada sin elegir el canal todavía.
-- El cliente puede elegir QR o MOZO después de que el personal registre su llegada.
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

REVOKE ALL ON FUNCTION public.fn_registrar_llegada_reserva(
  integer, character varying, character varying, character varying
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_registrar_llegada_reserva(
  integer, character varying, character varying, character varying
) TO service_role;

NOTIFY pgrst, 'reload schema';
