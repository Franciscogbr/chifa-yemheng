-- T17a: vinculo exacto linea-de-pedido <-> cuenta y cuenta <-> venta, y emisor fiscal.
-- Aditiva: CREATE TABLE/COLUMN/INDEX/COMMENT/FUNCTION. Sin DROP de datos.
-- Corrige el riesgo: re-abierto cuentas cobranVictoria/visualizan platos o ventas previas.

-- ==========================================================================
-- 1) cada detalle de participante queda ligado a UNA cuenta concreta
-- ==========================================================================
ALTER TABLE public.detalle_pedido
  ADD COLUMN IF NOT EXISTS id_cuenta bigint REFERENCES public.cuenta_participante(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ix_detalle_pedido_cuenta
  ON public.detalle_pedido (id_cuenta);

COMMENT ON COLUMN public.detalle_pedido.id_cuenta IS
  'S3:T17a: cuenta_participante exacta a la que pertenece este detalle; NULL para consumos de mesa completa (CUENTA_UNICA) o registros historicos previos a la migracion.';

-- ==========================================================================
-- 2) cuenta cerrada sabe a que venta/comprobante pertenece
-- ==========================================================================
ALTER TABLE public.cuenta_participante
  ADD COLUMN IF NOT EXISTS id_venta integer REFERENCES public.venta(id_venta);

CREATE INDEX IF NOT EXISTS ix_cuenta_participante_venta
  ON public.cuenta_participante (id_venta);

COMMENT ON COLUMN public.cuenta_participante.id_venta IS
  'S3:T17a: venta exacta del cobro; debe corresponder con serie/numero_comprobante y al monto_pagado para el recibo individual.';

-- ==========================================================================
-- 3) saldo y cobro SOLO sobre la cuenta ABIERTA concreta (única por pedido+cliente)
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.fn_saldo_participante(
  p_pedido integer,
  p_cliente integer
)
RETURNS TABLE (
  id_cuenta bigint,
  estado_cuenta character varying,
  consumo_abierto numeric,
  monto_pagado numeric,
  platos jsonb
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  WITH activos AS (
    SELECT
      cp.id AS id_cuenta,
      cp.estado_cuenta,
      COALESCE(SUM(CASE WHEN dp.estado = 'A' AND dp.estado_preparacion <> 'A'
                        THEN dp.sub_total END), 0) AS consumo_abierto,
      COALESCE(MAX(cp.monto_pagado), 0) AS monto_pagado,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', dp.id_detallepedido,
            'producto', COALESCE(pr.n_producto, ''),
            'cantidad', dp.cantidad,
            'precioUnitario', dp.precio_unitario,
            'subTotal', dp.sub_total,
            'estadoPreparacion', dp.estado_preparacion
          )
          ORDER BY dp.id_detallepedido
        ) FILTER (WHERE dp.id_detallepedido IS NOT NULL),
        '[]'::jsonb
      ) AS platos
    FROM public.cuenta_participante AS cp
    LEFT JOIN public.detalle_pedido AS dp
      ON dp.id_cuenta = cp.id
      AND dp.estado = 'A'
      AND dp.estado_preparacion <> 'A'
    LEFT JOIN public.producto AS pr
      ON pr.id_producto = dp.id_producto
    WHERE cp.id_pedido = p_pedido
      AND cp.id_cliente = p_cliente
    GROUP BY cp.id, cp.estado_cuenta
  )
  SELECT
    a.id_cuenta,
    a.estado_cuenta,
    CASE WHEN a.estado_cuenta = 'ABIERTA' THEN a.consumo_abierto ELSE 0 END,
    a.monto_pagado,
    a.platos
  FROM activos a
  WHERE a.estado_cuenta = 'ABIERTA'
     OR NOT EXISTS (SELECT 1 FROM activos open_a WHERE open_a.estado_cuenta = 'ABIERTA')
  ORDER BY CASE WHEN a.estado_cuenta = 'ABIERTA' THEN 0 ELSE 1 END, a.id_cuenta DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.fn_saldo_participante(integer, integer) IS
  'S3:T17a: los platos y el consumo se calculan SOLO con detalle de SU cuenta ABIERTA (via detalle_pedido.id_cuenta), no por cliente. La cuenta cerrada queda con su monto_pagado y su plato listado.';

-- ==========================================================================
-- 4) alta de plato: asigna SIEMPRE la cuenta ABIERTA (crea si faltara)
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.fn_agregar_detalle_pedido_cliente(
  p_pedido integer,
  p_prod integer,
  p_cant numeric,
  p_nota character varying,
  p_desc numeric,
  p_cliente integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_pedido public.pedido%ROWTYPE;
  v_estado_mesa character varying;
  v_detalle integer;
  v_cuenta_abierta bigint;
BEGIN
  SELECT * INTO v_pedido
  FROM public.pedido
  WHERE id_pedido = p_pedido
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'NO_COMANDA_ACTIVA';
  END IF;
  IF v_pedido.facturado = 'S' THEN
    RAISE EXCEPTION USING MESSAGE = 'PEDIDO_FACTURADO';
  END IF;
  IF v_pedido.anulado = 'S' THEN
    RAISE EXCEPTION USING MESSAGE = 'PEDIDO_ANULADO';
  END IF;
  IF v_pedido.id_mesa IS NOT NULL THEN
    SELECT em.descripcion INTO v_estado_mesa
    FROM public.mesa AS m
    JOIN public.estado_mesa AS em ON em.id_estadomesa = m.id_estadomesa
    WHERE m.id_mesa = v_pedido.id_mesa
    FOR UPDATE OF m;
    IF v_estado_mesa = 'POR COBRAR' THEN
      RAISE EXCEPTION USING MESSAGE = 'MESA_POR_COBRAR';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.pedido_participante
      WHERE id_pedido = p_pedido AND id_cliente = p_cliente
    ) THEN
      RAISE EXCEPTION USING MESSAGE = 'NO_PARTICIPANTE';
    END IF;
  END IF;

  CALL public.usp_agregar_detalle_pedido(p_pedido, p_prod, p_cant, p_nota, p_desc);
  v_detalle := currval('public.detalle_pedido_id_detallepedido_seq'::regclass);
  UPDATE public.detalle_pedido
  SET id_cliente = p_cliente
  WHERE id_detallepedido = v_detalle
    AND id_pedido = p_pedido;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'DETALLE_NO_REGISTRADO';
  END IF;

  -- cuenta ABIERTA propia: se crea si no existe (T12 ya lo hace para el cobro)
  SELECT cp.id INTO v_cuenta_abierta
  FROM public.cuenta_participante AS cp
  WHERE cp.id_pedido = p_pedido
    AND cp.id_cliente = p_cliente
    AND cp.estado_cuenta = 'ABIERTA'
  LIMIT 1;
  IF v_cuenta_abierta IS NULL THEN
    INSERT INTO public.cuenta_participante (id_pedido, id_cliente, estado_cuenta)
    VALUES (p_pedido, p_cliente, 'ABIERTA');
    SELECT cp.id INTO v_cuenta_abierta
    FROM public.cuenta_participante AS cp
    WHERE cp.id_pedido = p_pedido
      AND cp.id_cliente = p_cliente
      AND cp.estado_cuenta = 'ABIERTA'
    LIMIT 1;
  END IF;

  -- Migra una sola vez detalles antiguos del mismo pedido+cliente sin cuenta
  -- (solo si NO hay una cuenta ABIERTA previa que se corresponda), evita
  -- mezclar consumo ya pagado en cuentas cerradas.
  UPDATE public.detalle_pedido AS dp
     SET id_cuenta = v_cuenta_abierta
   WHERE dp.id_pedido = p_pedido
     AND dp.id_cliente = p_cliente
     AND dp.id_cuenta IS NULL
     AND dp.estado = 'A'
     AND dp.estado_preparacion <> 'A';

  -- Este detalle nuevo queda asignado a la cuenta ABIERTA actual
  UPDATE public.detalle_pedido AS dp
     SET id_cuenta = v_cuenta_abierta
   WHERE dp.id_detallepedido = v_detalle;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'DETALLE_NO_REGISTRADO';
  END IF;

END;
$$;

COMMENT ON FUNCTION public.fn_agregar_detalle_pedido_cliente(integer, integer, numeric, character varying, numeric, integer) IS
  'S3:T17a: cada plato de participante se asigna SIEMPRE a su cuenta ABIERTA vigente; el detalle queda ligado para el recibo de esa cuenta y no de la anterior.';

-- ==========================================================================
-- 5) cobro de cuenta individual: scope por cuenta y vinculacion venta<-cuenta
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.fn_cobrar_participante_atomic(
  p_pedido integer,
  p_cliente integer,
  p_usuario integer,
  p_apertura integer,
  p_tipodoc character varying,
  p_pagos jsonb,
  p_empresa_id integer DEFAULT NULL,
  p_documento character varying DEFAULT NULL,
  p_nombre_doc character varying DEFAULT NULL
)
RETURNS TABLE (
  id_cuenta bigint,
  id_venta integer,
  serie character varying,
  numero character varying,
  total numeric,
  vuelto numeric,
  mesa_liquidada boolean
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_pedido public.pedido%ROWTYPE;
  v_estado_mesa character varying;
  v_cuenta public.cuenta_participante%ROWTYPE;
  v_total numeric(12,2);
  v_total_centimos bigint;
  v_subtotal numeric(12,2);
  v_igv numeric(12,2);
  v_pago jsonb;
  v_metodo integer;
  v_metodo_nombre character varying;
  v_metodo_base integer;
  v_afecta_efectivo character(1);
  v_afecta_efectivo_base character(1);
  v_requiere_ref character(1);
  v_monto numeric(12,2);
  v_recibido numeric(12,2);
  v_suma_pagos bigint := 0;
  v_suma_efectivo numeric(12,2) := 0;
  v_vuelto numeric(12,2) := 0;
  v_concepto integer;
  v_serie character varying;
  v_numero character varying;
  v_correlativo integer;
  v_venta_id integer;
  v_liquidada boolean;
BEGIN
  IF jsonb_typeof(p_pagos) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_pagos) = 0
     OR jsonb_array_length(p_pagos) > 20 THEN
    RAISE EXCEPTION USING MESSAGE = 'PAGOS_INVALIDOS';
  END IF;
  IF p_tipodoc IS NULL OR p_tipodoc NOT IN ('01', '03') THEN
    RAISE EXCEPTION USING MESSAGE = 'TIPO_DOCUMENTO_INVALIDO';
  END IF;

  SELECT * INTO v_pedido
  FROM public.pedido
  WHERE id_pedido = p_pedido
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'PEDIDO_NOT_FOUND';
  END IF;
  IF v_pedido.facturado = 'S' OR v_pedido.anulado = 'S' THEN
    RAISE EXCEPTION USING MESSAGE = 'PEDIDO_NO_COBRABLE';
  END IF;

  IF v_pedido.id_mesa IS NOT NULL THEN
    SELECT em.descripcion INTO v_estado_mesa
    FROM public.mesa m
    JOIN public.estado_mesa em ON em.id_estadomesa = m.id_estadomesa
    WHERE m.id_mesa = v_pedido.id_mesa
    FOR UPDATE OF m;
    IF v_estado_mesa IS DISTINCT FROM 'POR COBRAR' THEN
      RAISE EXCEPTION USING MESSAGE = 'PEDIDO_NO_POR_COBRAR';
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.apertura_caja
    WHERE id_aperturacaja = p_apertura AND situacion = 'A'
    FOR UPDATE
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'NO_CAJA_ABIERTA';
  END IF;

  -- cuenta ABIERTA con lock; se autoregistra si falta
  SELECT * INTO v_cuenta
  FROM public.cuenta_participante cp
  WHERE cp.id_pedido = p_pedido
    AND cp.id_cliente = p_cliente
    AND cp.estado_cuenta = 'ABIERTA'
  FOR UPDATE;
  IF NOT FOUND THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.pedido_participante pp
      WHERE pp.id_pedido = p_pedido AND pp.id_cliente = p_cliente
    ) THEN
      RAISE EXCEPTION USING MESSAGE = 'NO_PARTICIPANTE';
    END IF;
    INSERT INTO public.cuenta_participante (id_pedido, id_cliente, estado_cuenta)
    VALUES (p_pedido, p_cliente, 'ABIERTA');
    SELECT * INTO v_cuenta
    FROM public.cuenta_participante cp
    WHERE cp.id_pedido = p_pedido
      AND cp.id_cliente = p_cliente
      AND cp.estado_cuenta = 'ABIERTA'
    FOR UPDATE;
  END IF;

  -- nombres sueltos por si el historico nunca recibio id_cuenta
  UPDATE public.detalle_pedido AS dp
     SET id_cuenta = v_cuenta.id
   WHERE dp.id_pedido = p_pedido
     AND dp.id_cliente = p_cliente
     AND dp.id_cuenta IS NULL
     AND dp.estado = 'A'
     AND dp.estado_preparacion <> 'A';

  -- saldo EXACTO de esa cuenta via id_cuenta
  SELECT COALESCE(SUM(dp.sub_total), 0)
    INTO v_total
  FROM public.detalle_pedido dp
  WHERE dp.id_cuenta = v_cuenta.id
    AND dp.estado = 'A'
    AND dp.estado_preparacion <> 'A';
  v_total := round(v_total, 2);
  IF v_total <= 0 THEN
    RAISE EXCEPTION USING MESSAGE = 'SALDO_CERO';
  END IF;
  v_total_centimos := round(v_total * 100)::bigint;

  -- --- Validaciones de metodos de pago (idem fn_cobrar_pedido_mixto_atomic). ---
  FOR v_pago IN SELECT value FROM jsonb_array_elements(p_pagos)
  LOOP
    IF NOT (v_pago ? 'metodoPagoId')
       OR NOT (v_pago ? 'monto')
       OR (v_pago ->> 'monto')::numeric <= 0 THEN
      RAISE EXCEPTION USING MESSAGE = 'PAGOS_INVALIDOS';
    END IF;
    v_metodo := (v_pago ->> 'metodoPagoId')::integer;
    v_monto := round((v_pago ->> 'monto')::numeric, 2);
    v_recibido := round(COALESCE(NULLIF(v_pago ->> 'montoRecibido', '')::numeric, v_monto), 2);

    SELECT mp.n_metodopago, mp.afecta_efectivo, mp.requiere_referencia
      INTO v_metodo_nombre, v_afecta_efectivo, v_requiere_ref
    FROM public.metodo_pago mp
    WHERE mp.id_metodopago = v_metodo AND mp.estado = 'A';
    IF NOT FOUND THEN
      RAISE EXCEPTION USING MESSAGE = 'METODO_PAGO_INVALIDO';
    END IF;
    IF v_requiere_ref = 'S' AND BTRIM(COALESCE(v_pago ->> 'referencia', '')) = '' THEN
      RAISE EXCEPTION USING MESSAGE = 'REFERENCIA_REQUERIDA';
    END IF;
    IF upper(v_metodo_nombre) LIKE '%TRANSF%' AND BTRIM(COALESCE(v_pago ->> 'banco', '')) = '' THEN
      RAISE EXCEPTION USING MESSAGE = 'BANCO_REQUERIDO';
    END IF;
    IF v_afecta_efectivo = 'S' THEN
      IF v_recibido < v_monto THEN
        RAISE EXCEPTION USING MESSAGE = 'EFECTIVO_INSUFICIENTE';
      END IF;
      v_suma_efectivo := v_suma_efectivo + v_monto;
      v_vuelto := v_vuelto + v_recibido - v_monto;
    ELSIF NULLIF(v_pago ->> 'montoRecibido', '') IS NOT NULL THEN
      RAISE EXCEPTION USING MESSAGE = 'MONTO_RECIBIDO_NO_APLICA';
    END IF;
    IF v_metodo_base IS NULL THEN
      v_metodo_base := v_metodo;
      v_afecta_efectivo_base := v_afecta_efectivo;
    END IF;
    v_suma_pagos := v_suma_pagos + round(v_monto * 100)::bigint;
  END LOOP;

  IF v_suma_pagos <> v_total_centimos THEN
    RAISE EXCEPTION USING MESSAGE = 'SALDO_SIN_CUBRIR';
  END IF;

  IF p_tipodoc = '01' AND p_empresa_id IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'EMPRESA_REQUERIDA';
  END IF;

  v_subtotal := round(v_total / 1.18, 2);
  v_igv := v_total - v_subtotal;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'serie_documento') THEN
    UPDATE public.serie_documento sd
       SET correlativo = sd.correlativo + 1
     WHERE sd.id_serie = (
       SELECT s2.id_serie FROM public.serie_documento s2
       WHERE s2.tipo_documento = p_tipodoc AND s2.estado = 'A'
       ORDER BY s2.id_serie
       LIMIT 1
     )
    RETURNING sd.serie, sd.correlativo INTO v_serie, v_correlativo;
    IF v_serie IS NULL THEN
      RAISE EXCEPTION USING MESSAGE = 'SERIE_NO_EXISTE';
    END IF;
    v_numero := lpad(v_correlativo::text, 8, '0');
  ELSE
    RAISE EXCEPTION USING MESSAGE = 'SERIE_NO_EXISTE';
  END IF;

  INSERT INTO public.venta AS ven (
    id_pedido, id_cliente, id_usuario, id_aperturacaja,
    tipodocumento, subtotal, descuento, servicio, igv,
    total, total_pagado, vuelto
  ) VALUES (
    p_pedido, p_cliente, p_usuario, p_apertura,
    p_tipodoc, v_subtotal, 0, 0, v_igv,
    v_total, v_total, v_vuelto
  )
  RETURNING ven.id_venta INTO v_venta_id;

  IF v_venta_id IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'COBRO_SIN_RESULTADO';
  END IF;

  -- pagos a la venta con el pagador correcto
  FOR v_pago IN SELECT value FROM jsonb_array_elements(p_pagos)
  LOOP
    v_metodo := (v_pago ->> 'metodoPagoId')::integer;
    v_monto := round((v_pago ->> 'monto')::numeric, 2);
    INSERT INTO public.pago_venta (
      id_venta, id_metodopago, monto, referencia, banco, id_cliente_pagador
    ) VALUES (
      v_venta_id, v_metodo, v_monto,
      COALESCE(v_pago ->> 'referencia', ''),
      COALESCE(v_pago ->> 'banco', ''),
      p_cliente
    );
  END LOOP;

  IF p_tipodoc = '03' THEN
    INSERT INTO public.boleta (
      id_venta, serie, numero, cliente_documento, cliente_nombre
    ) VALUES (
      v_venta_id, v_serie, v_numero,
      COALESCE(BTRIM(p_documento), '00000000'),
      COALESCE(BTRIM(p_nombre_doc), 'CLIENTES VARIOS')
    );
  ELSE
    INSERT INTO public.factura (
      id_venta, id_empresa, serie, numero, condicion_pago
    ) VALUES (
      v_venta_id, p_empresa_id, v_serie, v_numero, 'CONTADO'
    );
  END IF;

  -- movimiento caja resumido por metodo (idem anterior: venta vale el total por via)
  v_metodo := v_metodo_base;
  v_afecta_efectivo := v_afecta_efectivo_base;
  SELECT cc.id_concepto INTO v_concepto
  FROM public.concepto_caja cc
  WHERE cc.estado = 'A'
    AND cc.id_tipomovimiento = 1
    AND upper(cc.n_concepto) = CASE
      WHEN v_afecta_efectivo = 'S' THEN 'VENTA AL CONTADO'
      WHEN upper((SELECT mp.n_metodopago FROM public.metodo_pago mp WHERE mp.id_metodopago = v_metodo))
        LIKE ANY (ARRAY['%VISA%', '%MASTER%', '%TARJ%']) THEN 'COBRO CON TARJETA'
      ELSE 'COBRO BILLETERA DIGITAL'
    END
  LIMIT 1;
  IF v_concepto IS NOT NULL THEN
    INSERT INTO public.movimiento_caja (
      id_aperturacaja, id_tipomovimiento, id_concepto, id_metodopago,
      id_usuario, id_pedido, id_venta, numero_operacion, banco,
      descripcion, monto, afecta_efectivo, documento, estado
    ) VALUES (
      p_apertura, 1, v_concepto, v_metodo, p_usuario, p_pedido, v_venta_id,
      NULL, NULL, 'Cobro cuenta participante', v_total,
      v_afecta_efectivo, 'N', 'A'
    );
  ELSE
    RAISE EXCEPTION USING MESSAGE = 'CONCEPTO_COBRO_NO_CONFIGURADO';
  END IF;

  SELECT mp.afecta_efectivo INTO v_afecta_efectivo
  FROM public.metodo_pago mp
  WHERE mp.id_metodopago = v_metodo_base;
  UPDATE public.apertura_caja AS ac
     SET monto_sistema = ac.monto_sistema + v_suma_efectivo
       - (CASE WHEN v_afecta_efectivo = 'S' THEN v_total ELSE 0 END)
   WHERE ac.id_aperturacaja = p_apertura
     AND ac.situacion = 'A';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'NO_CAJA_ABIERTA';
  END IF;

  UPDATE public.cuenta_participante
     SET estado_cuenta = 'PAGADA',
         monto_pagado = v_total,
         serie_comprobante = v_serie,
         numero_comprobante = v_numero,
         id_venta = v_venta_id,
         feccie = CURRENT_TIMESTAMP
   WHERE id = v_cuenta.id;

  SELECT NOT EXISTS (
    SELECT 1 FROM public.cuenta_participante cp2
    WHERE cp2.id_pedido = p_pedido AND cp2.estado_cuenta = 'ABIERTA'
  ) INTO v_liquidada;

  UPDATE public.pedido
     SET mesa_liquidada = v_liquidada,
         facturado = CASE WHEN v_liquidada THEN 'S' ELSE facturado END,
         id_estadopedido = CASE WHEN v_liquidada THEN 4 ELSE id_estadopedido END,
         f_cierre = CASE WHEN v_liquidada THEN CURRENT_TIMESTAMP ELSE f_cierre END
   WHERE id_pedido = p_pedido;

  RETURN QUERY SELECT
    v_cuenta.id, v_venta_id, v_serie, v_numero, v_total, v_vuelto, v_liquidada;
END;
$$;

COMMENT ON FUNCTION public.fn_cobrar_participante_atomic(integer, integer, integer, integer, character varying, jsonb, integer, character varying, character varying) IS
  'S3:T17a: el cobro cubre SOLO detalles ligados (id_cuenta) a la cuenta ABIERTA de ese participante y deja la venta exacta registrada en cuenta_participante.id_venta para el recibo individual. Si sobran detalles sin cuenta se migran una vez a la cuenta vigente; un participante que vuelve a pedir crea OTRA cuenta (comportamiento ya decidido).';

-- ==========================================================================
-- 6) emisor fiscal (fase 1): tabla dedicada
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.emisor_config (
  id bigserial PRIMARY KEY,
  razon_social character varying(150) NOT NULL DEFAULT '',
  nombre_comercial character varying(150) NOT NULL DEFAULT 'YEMHENG',
  ruc character varying(11) NOT NULL DEFAULT '',
  direccion_fiscal character varying(250) NOT NULL DEFAULT '',
  telefono character varying(30) NOT NULL DEFAULT '',
  correo character varying(80) NOT NULL DEFAULT '',
  sitio_web character varying(120) NOT NULL DEFAULT '',
  feccre timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecmod timestamp without time zone,
  usumod character varying(30)
);

COMMENT ON TABLE public.emisor_config IS
  'S12:T17: ficha fiscal del EMISOR (chifa). Fase 1: fase 1 solo printable; hasta haber facturador real y datos SUNAT, los documentos impreso se marcan como representación para uso interno, y hash_cpe placeholder se declara no-valídable fiscalmente.';

ALTER TABLE public.emisor_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.emisor_config FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.emisor_config TO service_role;

INSERT INTO public.emisor_config (razon_social, nombre_comercial, ruc, direccion_fiscal, telefono, correo, sitio_web)
SELECT 'Restaurante Yemheng S.A.C.', 'Chifa Yemheng', '', '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.emisor_config);

COMMENT ON COLUMN public.emisor_config.ruc IS
  'S12 fase 1: vacio hasta que el restaurante cargue su RUC legal; los documentos se imprimen como representacion no fiscal mientras el campo este vacio.';
