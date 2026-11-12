DO $migration$
DECLARE
  v_definition text;
BEGIN
  SELECT pg_get_functiondef(
    'public.fn_registrar_venta_delivery_atomic(integer,integer,numeric,character varying,character varying,character varying,character varying)'::regprocedure
  )
  INTO v_definition;

  IF STRPOS(v_definition, 'RETURNING id_venta INTO v_venta_id;') = 0 THEN
    IF STRPOS(v_definition, 'RETURNING inserted_venta.id_venta INTO v_venta_id;') > 0 THEN
      RETURN;
    END IF;
    RAISE EXCEPTION 'Expected unqualified venta id return in delivery charge function';
  END IF;

  v_definition := REPLACE(
    v_definition,
    'INSERT INTO public.venta (',
    'INSERT INTO public.venta AS inserted_venta ('
  );
  v_definition := REPLACE(
    v_definition,
    'RETURNING id_venta INTO v_venta_id;',
    'RETURNING inserted_venta.id_venta INTO v_venta_id;'
  );

  EXECUTE v_definition;
END;
$migration$;

NOTIFY pgrst, 'reload schema';