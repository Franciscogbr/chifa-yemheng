-- T15a2 (S5): cierre con arqueo por denominaciones y niveles de control.
-- Aditiva: solo crea una funcion nueva. El cierre de dos pasos existente
-- (fn_solicitar_cierre_caja + fn_confirmar_cierre_caja) sigue mandando el flujo;
-- esta funcion lo orquesta y agrega el arqueo + incidencias.
-- v3: variables escalares (fix 'record is not assigned yet').

CREATE OR REPLACE FUNCTION public.fn_solicitar_cierre_arqueo(
  p_apertura integer,
  p_usuario integer,
  p_denominaciones jsonb,
  p_observacion character varying
)
RETURNS TABLE (
  sistema numeric,
  declarado numeric,
  diferencia numeric,
  resultado character varying,
  id_incidencia bigint,
  requiere_supervisor boolean
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  elem jsonb;
  v_contado numeric(12,2) := 0;
  v_sistema numeric(12,2) := 0;
  v_declarado numeric(12,2) := 0;
  v_diferencia numeric(12,2) := 0;
  v_estado character varying(10);
  v_id_incidencia bigint := NULL;
  v_nivel character varying(10);
  v_requiere boolean := false;
  v_id_caja integer;
  v_id_cajero integer;
BEGIN
  -- --- S5: un solo arqueo por turno; el supervisor decide reabrirlo. ---
  IF EXISTS (
    SELECT 1 FROM public.apertura_caja ac
    WHERE ac.id_aperturacaja = p_apertura AND ac.situacion = 'P'
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'ARQUEO_YA_SOLICITADO';
  END IF;

  -- --- Obtener monto del sistema para arqueo automático (denominaciones vacías). ---
  SELECT ac.monto_sistema INTO v_sistema
  FROM public.apertura_caja ac
  WHERE ac.id_aperturacaja = p_apertura AND ac.situacion = 'A';

  -- --- Conteo valido: cada denominacion con valor>0 y cantidad>=0. ---
  -- Arreglo vacio = arqueo automático: contado = monto del sistema.
  IF jsonb_typeof(p_denominaciones) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION USING MESSAGE = 'DENOMINACIONES_INVALIDAS';
  END IF;

  IF jsonb_array_length(p_denominaciones) = 0 THEN
    -- Arqueo automático: el contado es exactamente lo que dice el sistema.
    v_contado := v_sistema;
  ELSE
    FOR elem IN SELECT value FROM jsonb_array_elements(p_denominaciones)
    LOOP
      IF NOT (elem ? 'valor') OR NOT (elem ? 'cantidad')
         OR (elem ->> 'valor')::numeric <= 0
         OR (elem ->> 'cantidad')::int < 0
         OR COALESCE(elem ->> 'tipo', 'BILLETE') NOT IN ('BILLETE', 'MONEDA') THEN
        RAISE EXCEPTION USING MESSAGE = 'DENOMINACIONES_INVALIDAS';
      END IF;
    END LOOP;

    -- --- Dinero contado = sumatoria del conteo fisico. Nunca se ajusta. ---
    SELECT round(COALESCE(sum((e ->> 'valor')::numeric * (e ->> 'cantidad')::int), 0), 2)
      INTO v_contado
    FROM jsonb_array_elements(p_denominaciones) AS e;
  END IF;

  -- --- Regla S5: el cierre SIEMPRE se puede solicitar, aunque difiera. ---
  -- (fn_solicitar_cierre_caja retorna solo sistema/declarado/diferencia; el
  --  estado se deriva igual que en el backend: 0=CUADRADO, >0=SOBRANTE, <0=FALTANTE)
  SELECT r.sistema, r.declarado, r.diferencia
    INTO v_sistema, v_declarado, v_diferencia
  FROM public.fn_solicitar_cierre_caja(p_apertura, p_usuario, v_contado, COALESCE(BTRIM(p_observacion), '')) r;

  v_diferencia := round(COALESCE(v_diferencia, 0), 2);
  CASE
    WHEN v_diferencia < 0 THEN v_estado := 'FALTANTE';
    WHEN v_diferencia > 0 THEN v_estado := 'SOBRANTE';
    ELSE v_estado := 'CUADRADO';
  END CASE;

  SELECT ac.id_caja, ac.id_usuario INTO v_id_caja, v_id_cajero
  FROM public.apertura_caja ac WHERE ac.id_aperturacaja = p_apertura;

  -- --- Observacion obligatoria cuando NO esta cuadrada. ---
  IF v_estado <> 'CUADRADO'
     AND COALESCE(BTRIM(p_observacion), '') = '' THEN
    RAISE EXCEPTION USING MESSAGE = 'OBSERVACION_REQUERIDA';
  END IF;

  -- --- Persiste el conteo fisico (idempotente por apertura+valor). ---
  FOR elem IN SELECT value FROM jsonb_array_elements(p_denominaciones)
  LOOP
    INSERT INTO public.arqueo_denominacion (
      id_aperturacaja, valor, tipo, cantidad, fecmod, usumod
    ) VALUES (
      p_apertura,
      round((elem ->> 'valor')::numeric, 2),
      COALESCE(elem ->> 'tipo', 'BILLETE'),
      (elem ->> 'cantidad')::int,
      CURRENT_TIMESTAMP,
      current_user
    )
    ON CONFLICT (id_aperturacaja, valor)
    DO UPDATE SET cantidad = (elem ->> 'cantidad')::int,
                  tipo = COALESCE(elem ->> 'tipo', EXCLUDED.tipo),
                  fecmod = CURRENT_TIMESTAMP,
                  usumod = current_user;
  END LOOP;

  -- --- Niveles del prompt: Media 10.01..50 ; Critica > 50. ---
  IF abs(v_diferencia) > 50 THEN
    v_nivel := 'CRITICA';
    v_requiere := true;
  ELSIF abs(v_diferencia) > 10 THEN
    v_nivel := 'MEDIA';
    v_requiere := false;
  END IF;

  IF v_nivel IS NOT NULL AND v_id_caja IS NOT NULL THEN
    INSERT INTO public.incidencia_caja (
      id_aperturacaja, id_caja, id_cajero, diferencia, nivel, estado, motivo, feccre
    ) VALUES (
      p_apertura, v_id_caja, v_id_cajero,
      v_diferencia, v_nivel, 'PENDIENTE',
      COALESCE(BTRIM(p_observacion), ''),
      CURRENT_TIMESTAMP
    )
    RETURNING incidencia_caja.id INTO v_id_incidencia;
  END IF;

  RETURN QUERY SELECT
    v_sistema,
    v_declarado,
    v_diferencia,
    CASE WHEN v_estado = 'CUADRADO' THEN 'CUADRADA' ELSE v_estado END,
    v_id_incidencia,
    v_requiere;
END;
$$;

COMMENT ON FUNCTION public.fn_solicitar_cierre_arqueo(integer, integer, jsonb, character varying) IS
  'S5: arqueo + solicitud de cierre. Reglas: el cierre siempre se permite; cuadrado = CUADRADA; dif≠0 exige observacion; |dif|>10 crea incidencia (MEDIA) y |dif|>50 CRITICA y deja requiere_supervisor=true (la confirmacion quedara a cargo de otro usuario autorizado con fn_confirmar_cierre_caja). El dinero contado proviene del conteo por denominacion y no se ajusta nunca. Un solo arqueo por turno: si el turno ya esta P, ARQUEO_YA_SOLICITADO.';
