-- Migración: Agregar función fn_elegir_canal_reserva_cliente
-- Permite a un cliente elegir el canal de atención (QR / MOZO) para una reserva activa.

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

REVOKE ALL ON FUNCTION public.fn_elegir_canal_reserva_cliente(
  integer, integer, integer, character varying
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.fn_elegir_canal_reserva_cliente(
  integer, integer, integer, character varying
) TO service_role;

NOTIFY pgrst, 'reload schema';
