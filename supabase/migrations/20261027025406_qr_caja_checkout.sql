ALTER TABLE public.apertura_caja
  DROP CONSTRAINT ck_apecaja_sit,
  ADD CONSTRAINT ck_apecaja_sit CHECK (situacion = ANY (ARRAY['A'::bpchar, 'P'::bpchar, 'C'::bpchar])),
  ADD COLUMN id_usuario_solicita_cierre integer REFERENCES public.usuario(id_usuario),
  ADD COLUMN f_solicitud_cierre timestamp without time zone;

CREATE OR REPLACE FUNCTION public.fn_aperturar_caja_atomic(
  p_caja integer,
  p_usuario integer,
  p_monto numeric,
  p_numero character varying
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
  SELECT id_caja INTO v_id_caja
  FROM public.caja
  WHERE id_caja = p_caja AND estado = 'A'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CAJA_NO_EXISTE';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.apertura_caja
    WHERE id_caja = p_caja AND situacion IN ('A', 'P')
  ) THEN
    RAISE EXCEPTION 'CAJA_YA_ABIERTA';
  END IF;

  CALL public.usp_aperturar_caja(p_caja, p_usuario, p_monto, p_numero, v_id_apertura, v_mensaje);
  RETURN QUERY SELECT v_id_apertura, v_mensaje;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_cobrar_pedido_atomic(
  p_pedido integer,
  p_usuario integer,
  p_apertura integer,
  p_tipodoc character varying,
  p_cliente integer,
  p_metodo integer,
  p_recibido numeric,
  p_ref character varying
)
RETURNS TABLE (
  id_venta integer,
  serie character varying,
  numero character varying,
  total numeric,
  vuelto numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_pedido public.pedido%ROWTYPE;
  v_estado_mesa character varying;
  v_total numeric(12,2);
  v_efectivo character(1);
  v_referencia character(1);
  v_ruc character varying;
  v_apertura integer;
  v_id_venta integer;
  v_serie character varying;
  v_numero character varying;
  v_total_venta numeric;
  v_vuelto numeric;
BEGIN
  SELECT * INTO v_pedido
  FROM public.pedido
  WHERE id_pedido = p_pedido
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PEDIDO_NOT_FOUND';
  END IF;
  IF v_pedido.facturado = 'S' THEN
    RAISE EXCEPTION 'PEDIDO_FACTURADO';
  END IF;
  IF v_pedido.anulado = 'S' THEN
    RAISE EXCEPTION 'PEDIDO_ANULADO';
  END IF;

  IF v_pedido.id_mesa IS NOT NULL THEN
    SELECT em.descripcion INTO v_estado_mesa
    FROM public.mesa m
    JOIN public.estado_mesa em ON em.id_estadomesa = m.id_estadomesa
    WHERE m.id_mesa = v_pedido.id_mesa
    FOR UPDATE OF m;

    IF v_estado_mesa IS DISTINCT FROM 'POR COBRAR' THEN
      RAISE EXCEPTION 'PEDIDO_NO_POR_COBRAR';
    END IF;
  END IF;

  SELECT id_aperturacaja INTO v_apertura
  FROM public.apertura_caja
  WHERE id_aperturacaja = p_apertura AND situacion = 'A'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NO_CAJA_ABIERTA';
  END IF;
  IF p_tipodoc IS NULL OR p_tipodoc NOT IN ('01', '03') THEN
    RAISE EXCEPTION 'TIPO_DOCUMENTO_INVALIDO';
  END IF;

  SELECT afecta_efectivo, requiere_referencia
  INTO v_efectivo, v_referencia
  FROM public.metodo_pago
  WHERE id_metodopago = p_metodo AND estado = 'A';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'METODO_PAGO_INVALIDO';
  END IF;

  CALL public.usp_recalcular_pedido(p_pedido);
  SELECT total INTO v_total FROM public.pedido WHERE id_pedido = p_pedido;
  IF v_total IS NULL OR v_total <= 0 THEN
    RAISE EXCEPTION 'TOTAL_CERO';
  END IF;

  IF v_efectivo = 'S' AND COALESCE(p_recibido, v_total) < v_total THEN
    RAISE EXCEPTION 'EFECTIVO_INSUFICIENTE';
  END IF;
  IF v_referencia = 'S' AND COALESCE(BTRIM(p_ref), '') = '' THEN
    RAISE EXCEPTION 'REFERENCIA_REQUERIDA';
  END IF;
  IF p_tipodoc = '01' THEN
    SELECT e.ruc INTO v_ruc
    FROM public.cliente c
    JOIN public.empresa e ON e.id_empresa = c.id_empresa
    WHERE c.id_cliente = p_cliente;
    IF v_ruc IS NULL OR v_ruc !~ '^[0-9]{11}$' THEN
      RAISE EXCEPTION 'RUC_INVALIDO';
    END IF;
  END IF;

  CALL public.usp_facturar_pedido(
    p_pedido,
    p_usuario,
    p_apertura,
    p_tipodoc,
    p_cliente,
    p_metodo,
    CASE WHEN v_efectivo = 'S' THEN COALESCE(p_recibido, v_total) ELSE v_total END,
    LEFT(COALESCE(p_ref, ''), 30),
    v_id_venta,
    v_serie,
    v_numero,
    v_total_venta,
    v_vuelto
  );

  IF p_tipodoc = '03' AND NOT EXISTS (
    SELECT 1 FROM public.boleta WHERE id_venta = v_id_venta
  ) THEN
    INSERT INTO public.boleta (id_venta, serie, numero, cliente_documento, cliente_nombre)
    VALUES (v_id_venta, BTRIM(v_serie), BTRIM(v_numero), '00000000', 'CLIENTES VARIOS');
  END IF;

  RETURN QUERY SELECT v_id_venta, v_serie, v_numero, v_total_venta, v_vuelto;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_solicitar_cierre_caja(
  p_apertura integer,
  p_usuario integer,
  p_declarado numeric,
  p_observacion character varying
)
RETURNS TABLE (sistema numeric, declarado numeric, diferencia numeric)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_caja integer;
  v_usuario_apertura integer;
  v_sistema numeric(12,2);
BEGIN
  SELECT id_caja, id_usuario, monto_sistema
  INTO v_caja, v_usuario_apertura, v_sistema
  FROM public.apertura_caja
  WHERE id_aperturacaja = p_apertura AND situacion = 'A'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TURNO_NO_ABIERTO';
  END IF;
  -- Si no se declara monto (arqueo automático), usar el monto del sistema
  IF p_declarado IS NULL THEN
    p_declarado := v_sistema;
  ELSIF p_declarado < 0 THEN
    RAISE EXCEPTION 'MONTO_INVALIDO';
  END IF;
  IF p_usuario <> v_usuario_apertura THEN
    RAISE EXCEPTION 'SOLO_CAJERO_APERTURA';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.pedido p
    JOIN public.mesa m ON m.id_mesa = p.id_mesa
    JOIN public.estado_mesa em ON em.id_estadomesa = m.id_estadomesa
    WHERE p.facturado = 'N'
      AND p.anulado = 'N'
      AND p.estado = 'A'
      AND em.descripcion = 'POR COBRAR'
  ) THEN
    RAISE EXCEPTION 'PEDIDOS_POR_COBRAR';
  END IF;

  UPDATE public.apertura_caja
  SET situacion = 'P',
      monto_declarado = p_declarado,
      diferencia = p_declarado - v_sistema,
      observacion = NULLIF(LEFT(BTRIM(p_observacion), 200), ''),
      id_usuario_solicita_cierre = p_usuario,
      f_solicitud_cierre = CURRENT_TIMESTAMP,
      usumod = p_usuario::text,
      fecmod = CURRENT_TIMESTAMP
  WHERE id_aperturacaja = p_apertura;

  INSERT INTO public.auditoria (id_usuario, n_tabla, accion, id_registro, valor_nuevo)
  VALUES (
    p_usuario,
    'APERTURA_CAJA',
    'SOLICITUD_CIERRE',
    p_apertura,
    'Sistema: ' || v_sistema::text ||
      ' Declarado: ' || p_declarado::text ||
      ' Diferencia: ' || (p_declarado - v_sistema)::text
  );

  RETURN QUERY SELECT v_sistema, p_declarado, p_declarado - v_sistema;
END;
$$;

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
  SELECT id_caja, id_usuario_solicita_cierre, monto_sistema, monto_declarado, diferencia
  INTO v_caja, v_solicitante, v_sistema, v_declarado, v_diferencia
  FROM public.apertura_caja
  WHERE id_aperturacaja = p_apertura AND situacion = 'P'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CIERRE_NO_PENDIENTE';
  END IF;
  IF v_solicitante = p_supervisor THEN
    RAISE EXCEPTION 'VALIDADOR_DEBE_SER_DISTINTO';
  END IF;

  UPDATE public.apertura_caja
  SET situacion = 'C',
      id_usuariocierre = p_supervisor,
      f_cierre = CURRENT_TIMESTAMP,
      usumod = p_supervisor::text,
      fecmod = CURRENT_TIMESTAMP
  WHERE id_aperturacaja = p_apertura;

  UPDATE public.caja
  SET aperturada = 'N',
      usumod = p_supervisor::text,
      fecmod = CURRENT_TIMESTAMP
  WHERE id_caja = v_caja;

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

REVOKE ALL ON FUNCTION public.fn_cobrar_pedido_atomic(integer, integer, integer, character varying, integer, integer, numeric, character varying) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_aperturar_caja_atomic(integer, integer, numeric, character varying) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_solicitar_cierre_caja(integer, integer, numeric, character varying) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_confirmar_cierre_caja(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cobrar_pedido_atomic(integer, integer, integer, character varying, integer, integer, numeric, character varying) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_aperturar_caja_atomic(integer, integer, numeric, character varying) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_solicitar_cierre_caja(integer, integer, numeric, character varying) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_confirmar_cierre_caja(integer, integer) TO service_role;

INSERT INTO public.permiso (id_modulo, n_permiso, clave, descripcion)
SELECT p.id_modulo, 'Validar cierre de caja', 'CAJ_VALIDAR_CIERRE', 'Aprobar el arqueo solicitado por el cajero'
FROM public.permiso p
WHERE p.clave = 'CAJ_CERRAR'
ON CONFLICT (clave) DO NOTHING;

INSERT INTO public.rol_permiso (id_rol, id_permiso, concedido, estado)
SELECT r.id_rol, p.id_permiso, 'S', 'A'
FROM public.rol r
CROSS JOIN public.permiso p
WHERE r.n_rol IN ('ADMINISTRADOR', 'SUPERVISOR')
  AND p.clave = 'CAJ_VALIDAR_CIERRE'
ON CONFLICT (id_rol, id_permiso) DO UPDATE
SET concedido = 'S', estado = 'A', usumod = 'MIGRATION', fecmod = CURRENT_TIMESTAMP;

NOTIFY pgrst, 'reload schema';