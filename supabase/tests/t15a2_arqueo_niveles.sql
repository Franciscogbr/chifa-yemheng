-- =====================================================================
-- T15a2 — Pruebas de niveles de arqueo (fn_solicitar_cierre_arqueo)
-- Requisito: migraciones 20261105152000 y 20261105153000 aplicadas.
-- Ejecutar el archivo COMPLETO una sola vez. BEGIN..ROLLBACK: sin datos.
-- Éxito: "T15a2 OK n -" en Notices. Falta: "FALLO_T15A2_x".
-- 4 tramos del prompt:
--   1) dif = 0            -> CUADRADA, sin incidencia, sin supervisor
--   2) dif != 0 sin obs   -> OBSERVACION_REQUERIDA
--   3) |dif| <= 10 con obs-> FALTrante/SOBRANTE sin incidencia
--   4) 10 < |dif| <= 50   -> incidencia MEDIA, sin supervisor
--   5) |dif| > 50         -> incidencia CRITICA + requiere_supervisor
-- =====================================================================

BEGIN;

DO $outer$
DECLARE
  v_apertura integer;
  v_usuario integer;
  v_resultado record;
  v_inc_nivel text;
  v_inc_estado text;
  v_incidencias integer;
  v_id_incidencia bigint;
  v_obs text;
BEGIN
  ------------------------------------------------------------------
  -- Fixture: caja activa y apertura fresca con sistema = 300.00
  ------------------------------------------------------------------
  -- Reutiliza el turno abierto existente si lo hay (la caja solo admite uno: uq_apertura_caja_abierta).
  SELECT ac.id_aperturacaja, ac.id_usuario
    INTO v_apertura, v_usuario
  FROM public.apertura_caja ac
  WHERE ac.situacion = 'A'
  ORDER BY ac.id_aperturacaja DESC
  LIMIT 1;

  IF v_apertura IS NULL THEN
    SELECT COALESCE(min(id_caja), 1) INTO v_apertura FROM public.caja WHERE estado = 'A' LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM public.caja WHERE id_caja = COALESCE(v_apertura, 1)) THEN
      RAISE EXCEPTION 'FALLO_T15A2_FIXTURE: no existe caja activa';
    END IF;
    SELECT COALESCE((SELECT id_usuario FROM public.apertura_caja LIMIT 1), 1) INTO v_usuario;

    INSERT INTO public.apertura_caja (id_caja, id_usuario, numero_turno, monto_inicial, situacion, estado)
    VALUES (v_apertura, v_usuario, 'T15A2-' || to_char(clock_timestamp(), 'HH24MISS'), 300.00, 'A', 'A')
    RETURNING id_aperturacaja INTO v_apertura;
  END IF;

  UPDATE public.apertura_caja
     SET monto_sistema = 300.00
   WHERE id_aperturacaja = v_apertura;

  RAISE NOTICE 'T15a2 FIXTURE - apertura % usuario % (sistema 300.00, caja bloqueada durante la prueba)', v_apertura, v_usuario;

  ------------------------------------------------------------------
  -- TRAMO 1: contado 300.00 -> CUADRADA
  ------------------------------------------------------------------
  SELECT * INTO v_resultado FROM public.fn_solicitar_cierre_arqueo(
    v_apertura, v_usuario,
    jsonb_build_array(
      jsonb_build_object('valor', 10, 'cantidad', 15, 'tipo', 'BILLETE'),
      jsonb_build_object('valor', 20, 'cantidad', 5,  'tipo', 'BILLETE'),
      jsonb_build_object('valor', 50, 'cantidad', 1,  'tipo', 'BILLETE'),
      jsonb_build_object('valor', 1,  'cantidad', 0,  'tipo', 'MONEDA')
    ),
    ''
  );
  IF v_resultado.resultado <> 'CUADRADA'
     OR v_resultado.diferencia <> 0
     OR v_resultado.id_incidencia IS NOT NULL
     OR v_resultado.requiere_supervisor THEN
    RAISE EXCEPTION 'FALLO_T15A2_1: esperaba CUADRADA sin incidencia (dif=%, inc=%, sup=%)', v_resultado.diferencia, v_resultado.id_incidencia, v_resultado.requiere_supervisor;
  END IF;
  -- Verifica que el conteo quedó grabado
  SELECT count(*) INTO v_incidencias FROM public.arqueo_denominacion WHERE id_aperturacaja = v_apertura;
  IF v_incidencias <> 4 THEN
    RAISE EXCEPTION 'FALLO_T15A2_1b: conteo no persistido (filas=%)', v_incidencias;
  END IF;
  RAISE NOTICE 'T15a2 OK 1 - CUADRADA (dif 0, sin incidencia) y conteo persistido';

  -- Reset para el siguiente caso
  UPDATE public.apertura_caja SET situacion = 'A', f_solicitud_cierre = NULL,
         monto_declarado = 0.00, monto_sistema = 300.00
   WHERE id_aperturacaja = v_apertura;

  ------------------------------------------------------------------
  -- TRAMO 2: dif != 0 sin observacion -> OBSERVACION_REQUERIDA
  ------------------------------------------------------------------
  BEGIN
    PERFORM * FROM public.fn_solicitar_cierre_arqueo(
      v_apertura, v_usuario,
      jsonb_build_array(jsonb_build_object('valor', 100, 'cantidad', 2, 'tipo', 'BILLETE')),
      ''
    );
    RAISE EXCEPTION 'FALLO_T15A2_2: acepto cierre con diferencia sin observacion';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%OBSERVACION_REQUERIDA%' THEN
      RAISE EXCEPTION 'FALLO_T15A2_2: error inesperado: %', SQLERRM;
    END IF;
  END;
  RAISE NOTICE 'T15a2 OK 2 - OBSERVACION_REQUERIDA cuando dif != 0';

  UPDATE public.apertura_caja SET situacion = 'A', f_solicitud_cierre = NULL,
         monto_declarado = 0.00, monto_sistema = 300.00
   WHERE id_aperturacaja = v_apertura;

  ------------------------------------------------------------------
  -- TRAMO 3: |dif| <= 10 con obs -> sin incidencia
  ------------------------------------------------------------------
  SELECT * INTO v_resultado FROM public.fn_solicitar_cierre_arqueo(
    v_apertura, v_usuario,
    jsonb_build_array(
      jsonb_build_object('valor', 100, 'cantidad', 2, 'tipo', 'BILLETE'),
      jsonb_build_object('valor', 50,  'cantidad', 1, 'tipo', 'BILLETE'),
      jsonb_build_object('valor', 20,  'cantidad', 2, 'tipo', 'BILLETE'),
      jsonb_build_object('valor', 1,   'cantidad', 5, 'tipo', 'MONEDA')
    ),
    'Prueba de tolerancia: falta 5 (contado 295)'
  );
  -- contado = 200 + 50 + 40 + 5 = 295 -> dif = -5 (tramo <= 10)
  IF v_resultado.diferencia NOT BETWEEN -10 AND 10 THEN
    RAISE EXCEPTION 'FALLO_T15A2_3_SETUP: caso diseñado para |dif|<=10 (dif=%)', v_resultado.diferencia;
  END IF;
  IF (v_resultado.resultado NOT IN ('FALTANTE', 'SOBRANTE')) OR v_resultado.id_incidencia IS NOT NULL OR v_resultado.requiere_supervisor THEN
    RAISE EXCEPTION 'FALLO_T15A2_3: tramo <=10 mal resuelto (res=% inc=% sup=%)', v_resultado.resultado, v_resultado.id_incidencia, v_resultado.requiere_supervisor;
  END IF;
  RAISE NOTICE 'T15a2 OK 3 - |dif|<=10 cerrado sin incidencia (dif=%)', v_resultado.diferencia;

  UPDATE public.apertura_caja SET situacion = 'A', f_solicitud_cierre = NULL,
         monto_declarado = 0.00, monto_sistema = 300.00
   WHERE id_aperturacaja = v_apertura;

  ------------------------------------------------------------------
  -- TRAMO 4: 10 < |dif| <= 50 -> incidencia MEDIA, sin supervisor
  ------------------------------------------------------------------
  SELECT * INTO v_resultado FROM public.fn_solicitar_cierre_arqueo(
    v_apertura, v_usuario,
    jsonb_build_array(jsonb_build_object('valor', 50, 'cantidad', 5, 'tipo', 'BILLETE')),
    'Falta un billete de 50'
  );
  -- contado 250 -> dif -50: cae en el tope superior; incidencia MEDIA, sin supervisor
  IF (v_resultado.resultado NOT IN ('FALTANTE', 'SOBRANTE')) OR abs(v_resultado.diferencia) <> 50 THEN
    RAISE EXCEPTION 'FALLO_T15A2_4_SETUP: esperaba dif -50 (obt=%)', v_resultado.diferencia;
  END IF;
  IF v_resultado.id_incidencia IS NULL THEN
    RAISE EXCEPTION 'FALLO_T15A2_4: no genero incidencia con dif = 50';
  END IF;
  IF v_resultado.requiere_supervisor THEN
    RAISE EXCEPTION 'FALLO_T15A2_4b: dif = 50 no debe exigir supervisor';
  END IF;
  SELECT nivel, estado INTO v_inc_nivel, v_inc_estado
  FROM public.incidencia_caja WHERE id = v_resultado.id_incidencia;
  IF v_inc_nivel <> 'MEDIA' OR v_inc_estado <> 'PENDIENTE' THEN
    RAISE EXCEPTION 'FALLO_T15A2_4c: incidencia mal creada (% / %)', v_inc_nivel, v_inc_estado;
  END IF;
  RAISE NOTICE 'T15a2 OK 4 - dif 50 -> incidencia MEDIA PENDIENTE (id %)', v_resultado.id_incidencia;

  UPDATE public.apertura_caja SET situacion = 'A', f_solicitud_cierre = NULL,
         monto_declarado = 0.00, monto_sistema = 300.00
   WHERE id_aperturacaja = v_apertura;

  ------------------------------------------------------------------
  -- TRAMO 5: |dif| > 50 -> incidencia CRITICA + requiere_supervisor
  ------------------------------------------------------------------
  SELECT * INTO v_resultado FROM public.fn_solicitar_cierre_arqueo(
    v_apertura, v_usuario,
    jsonb_build_array(jsonb_build_object('valor', 100, 'cantidad', 2, 'tipo', 'BILLETE')),
    'Faltan 100: revisar billetes en el fondo de caja'
  );
  IF (v_resultado.resultado NOT IN ('FALTANTE', 'SOBRANTE')) OR abs(v_resultado.diferencia) <> 100 THEN
    RAISE EXCEPTION 'FALLO_T15A2_5_SETUP: esperaba dif -100 (obt=%)', v_resultado.diferencia;
  END IF;
  IF v_resultado.id_incidencia IS NULL THEN
    RAISE EXCEPTION 'FALLO_T15A2_5: no genero incidencia con dif = 100';
  END IF;
  IF NOT v_resultado.requiere_supervisor THEN
    RAISE EXCEPTION 'FALLO_T15A2_5b: requiere_supervisor debe ser TRUE con dif 100';
  END IF;
  SELECT nivel, estado INTO v_inc_nivel, v_inc_estado
  FROM public.incidencia_caja WHERE id = v_resultado.id_incidencia;
  IF v_inc_nivel <> 'CRITICA' OR v_inc_estado <> 'PENDIENTE' THEN
    RAISE EXCEPTION 'FALLO_T15A2_5c: incidencia CRITICA mal creada (% / %)', v_inc_nivel, v_inc_estado;
  END IF;
  RAISE NOTICE 'T15a2 OK 5 - dif 100 -> incidencia CRITICA + cierre pendiente de supervisor';

  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'T15a2 COMPLETA: 5 tramos OK. ROLLBACK a continuacion.';
  RAISE NOTICE '====================================================';

EXCEPTION WHEN OTHERS THEN
  RAISE;
END $outer$;

ROLLBACK;
