-- T12 (S3): cobro atómico de la cuenta individual de un participante.
-- Aditiva: solo crea una función nueva. No ejecuta DROP/DELETE/TRUNCATE/GRANT/REVOKE.
-- Reutiliza los patrones existentes: venta (caja-repository.ts), boleta/factura,
-- movimiento_caja, ajuste de monto_sistema y correlativo de serie_documento.

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
  v_id_venta integer;
  v_liquidada boolean;
BEGIN
  -- --- Un solo participante por comprobante; lista de pagos valida. ---
  IF jsonb_typeof(p_pagos) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_pagos) = 0
     OR jsonb_array_length(p_pagos) > 20 THEN
    RAISE EXCEPTION USING MESSAGE = 'PAGOS_INVALIDOS';
  END IF;
  IF p_tipodoc IS NULL OR p_tipodoc NOT IN ('01', '03') THEN
    RAISE EXCEPTION USING MESSAGE = 'TIPO_DOCUMENTO_INVALIDO';
  END IF;

  -- --- Pedido activo con lock. ---
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

  -- --- Apertura de caja abierta con lock. ---
  IF NOT EXISTS (
    SELECT 1 FROM public.apertura_caja
    WHERE id_aperturacaja = p_apertura AND situacion = 'A'
    FOR UPDATE
  ) THEN
    RAISE EXCEPTION USING MESSAGE = 'NO_CAJA_ABIERTA';
  END IF;

  -- --- Cuenta ABIERTA del participante con lock; se autoregistra si falta ---
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

  -- --- Saldo de la cuenta: solo sus platos activos. ---
  SELECT COALESCE(SUM(dp.sub_total), 0)
    INTO v_total
  FROM public.detalle_pedido dp
  WHERE dp.id_pedido = p_pedido
    AND dp.id_cliente = p_cliente
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

  -- S3: cada participante paga SU CUENTA COMPLETA en una sola operacion.
  IF v_suma_pagos <> v_total_centimos THEN
    RAISE EXCEPTION USING MESSAGE = 'SALDO_SIN_CUBRIR';
  END IF;

  -- --- Factura de empresa: exige cliente de negocio cargado por el backend. ---
  IF p_tipodoc = '01' AND p_empresa_id IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'EMPRESA_REQUERIDA';
  END IF;

  v_subtotal := round(v_total / 1.18, 2);
  v_igv := v_total - v_subtotal;

  -- --- Serie y correlativo atomicos del tipo de documento. ---
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

  -- --- Venta (idem caja-repository.ts cobroPresencialService). ---
  INSERT INTO public.venta (
    id_pedido, id_cliente, id_usuario, id_aperturacaja,
    tipodocumento, subtotal, descuento, servicio, igv,
    total, total_pagado, vuelto
  ) VALUES (
    p_pedido, p_cliente, p_usuario, p_apertura,
    p_tipodoc, v_subtotal, 0, 0, v_igv,
    v_total, v_total, v_vuelto
  )
  RETURNING id_venta INTO v_id_venta;

  IF v_id_venta IS NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'COBRO_SIN_RESULTADO';
  END IF;

  -- --- Comprobante individual (boleta o factura, idem caja-repository). ---
  IF p_tipodoc = '03' THEN
    INSERT INTO public.boleta (
      id_venta, serie, numero, cliente_documento, cliente_nombre
    ) VALUES (
      v_id_venta, v_serie, v_numero,
      COALESCE(BTRIM(p_documento), '00000000'),
      COALESCE(BTRIM(p_nombre_doc), 'CLIENTES VARIOS')
    );
  ELSE
    INSERT INTO public.factura (
      id_venta, id_empresa, serie, numero, condicion_pago
    ) VALUES (
      v_id_venta, p_empresa_id, v_serie, v_numero, 'CONTADO'
    );
  END IF;

  -- --- Movimiento de caja por cada pago (idem mixto). ---
  FOR v_pago IN SELECT value FROM jsonb_array_elements(p_pagos)
  LOOP
    v_metodo := (v_pago ->> 'metodoPagoId')::integer;
    v_monto := round((v_pago ->> 'monto')::numeric, 2);

    SELECT cc.id_concepto INTO v_concepto
    FROM public.concepto_caja AS cc
    WHERE cc.estado = 'A'
      AND cc.id_tipomovimiento = 1
      AND upper(cc.n_concepto) = (
        CASE
          WHEN (SELECT mp.afecta_efectivo FROM public.metodo_pago mp
                WHERE mp.id_metodopago = v_metodo) = 'S'
            THEN 'VENTA AL CONTADO'
          WHEN upper((SELECT mp.n_metodopago FROM public.metodo_pago mp
                WHERE mp.id_metodopago = v_metodo)) LIKE ANY (ARRAY['%VISA%', '%MASTER%', '%TARJ%'])
            THEN 'COBRO CON TARJETA'
          ELSE 'COBRO BILLETERA DIGITAL'
        END
      )
    LIMIT 1;
    IF v_concepto IS NULL THEN
      RAISE EXCEPTION USING MESSAGE = 'CONCEPTO_COBRO_NO_CONFIGURADO';
    END IF;

    INSERT INTO public.movimiento_caja (
      id_aperturacaja, id_tipomovimiento, id_concepto, id_metodopago,
      id_usuario, id_pedido, id_venta, numero_operacion, banco,
      descripcion, monto, afecta_efectivo, documento, estado
    )
    VALUES (
      p_apertura, 1, v_concepto, v_metodo,
      p_usuario, p_pedido, v_id_venta,
      LEFT(COALESCE(v_pago ->> 'referencia', ''), 30),
      COALESCE(v_pago ->> 'banco', ''),
      'Cobro cuenta participante',
      v_monto,
      (SELECT mp.afecta_efectivo FROM public.metodo_pago mp
       WHERE mp.id_metodopago = v_metodo),
      'N', 'A'
    );
  END LOOP;

  -- --- Efectivo del turno (idem fn_cobrar_pedido_mixto_atomic). ---
  SELECT mp.afecta_efectivo INTO v_afecta_efectivo
  FROM public.metodo_pago mp
  WHERE mp.id_metodopago = v_metodo_base;
  UPDATE public.apertura_caja
     SET monto_sistema = monto_sistema + v_suma_efectivo
       - (CASE WHEN v_afecta_efectivo = 'S' THEN v_total ELSE 0 END)
   WHERE id_aperturacaja = p_apertura AND situacion = 'A';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'NO_CAJA_ABIERTA';
  END IF;

  -- --- Cierra la cuenta con el comprobante emitido. ---
  UPDATE public.cuenta_participante
     SET estado_cuenta = 'PAGADA',
         monto_pagado = v_total,
         serie_comprobante = v_serie,
         numero_comprobante = v_numero,
         feccie = CURRENT_TIMESTAMP
   WHERE id = v_cuenta.id;

  -- --- Ultimo participante del pedido: cierra mesa y marca liquidada. ---
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
    v_cuenta.id,
    v_id_venta,
    v_serie,
    v_numero,
    v_total,
    v_vuelto,
    v_liquidada;
END;
$$;

COMMENT ON FUNCTION public.fn_cobrar_participante_atomic(integer, integer, integer, integer, character varying, jsonb, integer, character varying, character varying) IS
  'S3: cobra la cuenta ABIERTA del participante en una sola transaccion (venta + pago/comprobante + movimiento de caja + cierre de cuenta). El documento es BOLETA (03) o FACTURA (01); FACTURA exige p_empresa_id. Cada participante paga su cuenta completa (sin saldo ni sobrepago) en el momento que quiera: puede pagar en turnos distintos (cada cobro lo recibe la apertura activa de ese turno). Cuando nadie tiene cuenta ABIERTA en la mesa, marca pedido.mesa_liquidada y cierra el pedido. El comprobante consolidado de cierre se decide en fase de emision (T17).';
