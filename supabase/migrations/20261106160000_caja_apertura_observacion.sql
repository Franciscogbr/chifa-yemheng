-- T15b: persist optional opening observation atomically with caja opening.
-- The column was added in T15a1; repeat IF NOT EXISTS for safe ordering.
ALTER TABLE public.apertura_caja
  ADD COLUMN IF NOT EXISTS observacion character varying(200);

CREATE OR REPLACE FUNCTION public.fn_aperturar_caja_atomic_observada(
  p_caja integer,
  p_usuario integer,
  p_monto numeric,
  p_numero character varying,
  p_observacion character varying DEFAULT NULL
)
RETURNS TABLE (id_apertura integer, mensaje character varying)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_id_caja integer;
  v_id_apertura integer;
  v_mensaje character varying;
BEGIN
  SELECT c.id_caja INTO v_id_caja
  FROM public.caja AS c
  WHERE c.id_caja = p_caja AND c.estado = 'A'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'CAJA_NO_EXISTE';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.apertura_caja AS ac
    WHERE ac.id_caja = p_caja AND ac.situacion IN ('A', 'P')
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'CAJA_YA_ABIERTA';
  END IF;
  IF p_monto IS NULL OR p_monto < 0 THEN
    RAISE EXCEPTION USING MESSAGE = 'MONTO_INVALIDO';
  END IF;

  CALL public.usp_aperturar_caja(p_caja, p_usuario, p_monto, p_numero, v_id_apertura, v_mensaje);

  UPDATE public.apertura_caja AS ac
  SET observacion = NULLIF(LEFT(BTRIM(COALESCE(p_observacion, '')), 200), '')
  WHERE ac.id_aperturacaja = v_id_apertura;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'APERTURA_SIN_RESULTADO';
  END IF;

  RETURN QUERY SELECT v_id_apertura, v_mensaje;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_aperturar_caja_atomic_observada(integer, integer, numeric, character varying, character varying)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_aperturar_caja_atomic_observada(integer, integer, numeric, character varying, character varying)
  TO service_role;

NOTIFY pgrst, 'reload schema';
