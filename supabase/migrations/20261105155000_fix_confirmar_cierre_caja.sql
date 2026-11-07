-- T15a4 fix: fn_confirmar_cierre_caja con columnas cualificadas.
-- El bug preexistente (42702 "column reference diferencia is ambiguous")
-- aparece porque RETURNS TABLE declara variables sistema/declarado/diferencia
-- y el SELECT INTO referenciaba la columna 'diferencia' sin alias.
-- Se conserva la conducta exacta (validador distinto, cierre 'C', caja aperturada 'N', auditoria).

CREATE OR REPLACE FUNCTION public.fn_confirmar_cierre_caja(
  p_apertura integer,
  p_supervisor integer
)
RETURNS TABLE (sistema numeric, declarado numeric, diferencia numeric)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caja integer;
  v_solicitante integer;
  v_sistema numeric(12,2);
  v_declarado numeric(12,2);
  v_diferencia numeric(12,2);
BEGIN
  SELECT ac.id_caja, ac.id_usuario_solicita_cierre, ac.monto_sistema, ac.monto_declarado, ac.diferencia
  INTO v_caja, v_solicitante, v_sistema, v_declarado, v_diferencia
  FROM public.apertura_caja AS ac
  WHERE ac.id_aperturacaja = p_apertura AND ac.situacion = 'P'
  FOR UPDATE OF ac;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CIERRE_NO_PENDIENTE';
  END IF;
  IF v_solicitante = p_supervisor THEN
    RAISE EXCEPTION 'VALIDADOR_DEBE_SER_DISTINTO';
  END IF;

  UPDATE public.apertura_caja AS ac
  SET situacion = 'C',
      id_usuariocierre = p_supervisor,
      f_cierre = CURRENT_TIMESTAMP,
      usumod = p_supervisor::text,
      fecmod = CURRENT_TIMESTAMP
  WHERE ac.id_aperturacaja = p_apertura;

  UPDATE public.caja AS c
  SET aperturada = 'N',
      usumod = p_supervisor::text,
      fecmod = CURRENT_TIMESTAMP
  WHERE c.id_caja = v_caja;

  INSERT INTO public.auditoria (id_usuario, n_tabla, accion, id_registro, valor_nuevo)
  VALUES (
    p_supervisor,
    'APERTURA_CAJA',
    'CIERRE_VALIDADO',
    p_apertura,
    'Sistema: ' || v_sistema::text ||
      ' Declarado: ' || v_declarado::text ||
      ' Diferencia: ' || v_diferencia::text
  );

  RETURN QUERY SELECT v_sistema, v_declarado, v_diferencia;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_confirmar_cierre_caja(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_confirmar_cierre_caja(integer, integer) TO service_role;

NOTIFY pgrst, 'reload schema';
