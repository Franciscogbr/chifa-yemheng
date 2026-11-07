-- T15a4 (S5): rechazo del arqueo por el supervisor -> el cajero vuelve a contar.
-- El supervisor (otro usuario autorizado) anula la solicitud pendiente;
-- el cajero re-arquea cuantas veces sea necesario antes del cierre final.
-- Las incidencias previas quedan como evidencia de auditoria (no se borran).

CREATE OR REPLACE FUNCTION public.fn_rechazar_cierre_caja(
  p_apertura integer,
  p_supervisor integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_solicitante integer;
BEGIN
  SELECT id_usuario_solicita_cierre INTO v_solicitante
  FROM public.apertura_caja
  WHERE id_aperturacaja = p_apertura AND situacion = 'P'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'CIERRE_NO_PENDIENTE';
  END IF;
  IF v_solicitante = p_supervisor THEN
    RAISE EXCEPTION USING MESSAGE = 'VALIDADOR_DEBE_SER_DISTINTO';
  END IF;

  UPDATE public.apertura_caja
     SET situacion = 'A',
         monto_declarado = NULL,
         diferencia = NULL,
         f_solicitud_cierre = NULL,
         fecmod = CURRENT_TIMESTAMP,
         usumod = current_user
   WHERE id_aperturacaja = p_apertura;
END;
$$;

COMMENT ON FUNCTION public.fn_rechazar_cierre_caja(integer, integer) IS
  'S5: rechazo del arqueo por un autorizado distinto del solicitante (VALIDADOR_DEBE_SER_DISTINTO). Reabre el turno (situacion A) para que el cajero re-arquee; las incidencias recordadas quedan como evidencia.';
