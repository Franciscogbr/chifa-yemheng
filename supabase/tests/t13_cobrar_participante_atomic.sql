-- =====================================================================
-- T13 — Pruebas de reglas de fn_cobrar_participante_atomic (S3)
-- Ejecutar el archivo COMPLETO una sola vez (SQL Editor de Supabase).
-- Envuelto en BEGIN ... ROLLBACK: no deja datos en la base.
-- Requisitos: T11 y T12 aplicadas en el proyecto linkeado.
-- Éxito: "- T13 OK n -" en los Notices. Falta: "FALLO_T13_<n>".
-- =====================================================================

BEGIN;

DO $outer$
DECLARE
  v_pedido integer;
  v_cliente1 integer;
  v_cliente2 integer;
  v_usuario integer := 1;
  v_producto integer;
  v_metodo_efectivo integer;
  v_apertura integer;
  v_mesa integer;
  v_tipopedido integer;
  v_precio_unit numeric;
  v_saldo1 numeric;
  v_saldo2 numeric;
  v_new_detalle integer;
  v_id_cuenta bigint;
  v_estado text;
  v_id_venta integer;
  v_serie text;
  v_numero text;
  v_vuelto numeric;
  v_total numeric;
  v_pagos jsonb;
  v_liquidada boolean;
  v_cuenta_state text;
  v_cuentas integer;
  v_movimientos integer;
  v_mesa_por_cobrar integer;
BEGIN
  ------------------------------------------------------------------
  -- FIXTURES EXISTENTES (no inventa datos maestros)
  ------------------------------------------------------------------
  SELECT id_producto, precio INTO v_producto, v_precio_unit
  FROM public.producto WHERE estado = 'A' AND precio > 0
  ORDER BY id_producto LIMIT 1;
  IF v_producto IS NULL THEN
    RAISE EXCEPTION 'FALLO_T13_FIXTURE: no hay producto activo con precio';
  END IF;

  SELECT id_tipopedido INTO v_tipopedido
  FROM public.tipo_pedido WHERE estado = 'A' ORDER BY id_tipopedido LIMIT 1;
  IF v_tipopedido IS NULL THEN
    RAISE EXCEPTION 'FALLO_T13_FIXTURE: no existe tipo_pedido activo';
  END IF;

  SELECT min(id_cliente), max(id_cliente) INTO v_cliente1, v_cliente2
  FROM public.cliente WHERE estado = 'A';
  IF v_cliente1 IS NULL OR v_cliente2 IS NULL OR v_cliente1 = v_cliente2 THEN
    RAISE EXCEPTION 'FALLO_T13_FIXTURE: se necesitan 2 clientes activos';
  END IF;

  SELECT id_aperturacaja INTO v_apertura
  FROM public.apertura_caja WHERE situacion = 'A'
  ORDER BY id_aperturacaja DESC LIMIT 1;
  IF v_apertura IS NULL THEN
    SELECT COALESCE(max(id_usuario), 1) INTO v_usuario FROM public.pedido;
    BEGIN
      INSERT INTO public.apertura_caja (id_caja, id_usuario, monto_inicial, situacion, estado)
      SELECT 1, v_usuario, 0, 'A', 'A'
      WHERE NOT EXISTS (SELECT 1 FROM public.apertura_caja WHERE id_caja = 1 AND situacion = 'A')
      RETURNING id_aperturacaja INTO v_apertura;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'FALLO_T13_FIXTURE: no se pudo abrir caja de prueba (%)', SQLERRM;
    END;
  ELSE
    SELECT id_usuario INTO v_usuario FROM public.apertura_caja WHERE id_aperturacaja = v_apertura;
  END IF;

  SELECT id_estadomesa INTO v_mesa_por_cobrar
  FROM public.estado_mesa WHERE descripcion = 'POR COBRAR' AND estado = 'A' LIMIT 1;
  IF v_mesa_por_cobrar IS NULL THEN
    RAISE EXCEPTION 'FALLO_T13_FIXTURE: estado_mesa POR COBRAR no existe';
  END IF;

  SELECT id_mesa INTO v_mesa FROM public.mesa WHERE estado = 'A' ORDER BY id_mesa LIMIT 1;
  IF v_mesa IS NULL THEN
    RAISE EXCEPTION 'FALLO_T13_FIXTURE: no hay mesa activa';
  END IF;
  UPDATE public.mesa SET id_estadomesa = v_mesa_por_cobrar WHERE id_mesa = v_mesa;

  SELECT id_metodopago INTO v_metodo_efectivo
  FROM public.metodo_pago WHERE afecta_efectivo = 'S' AND estado = 'A' LIMIT 1;
  IF v_metodo_efectivo IS NULL THEN
    RAISE EXCEPTION 'FALLO_T13_FIXTURE: no hay metodo de pago en efectivo';
  END IF;

  ------------------------------------------------------------------
  -- Pedido POR_CONSUMO + 2 participantes
  ------------------------------------------------------------------
  INSERT INTO public.pedido (
    numero_pedido, id_tipopedido, id_mesa, id_cliente, id_usuario,
    n_comensales, canal_origen, modo_pago_mesa
  ) VALUES (
    'T13-' || to_char(clock_timestamp(), 'HH24MISS'), v_tipopedido, v_mesa, v_cliente1, v_usuario,
    2, 'QR', 'POR_CONSUMO'
  ) RETURNING id_pedido INTO v_pedido;

  INSERT INTO public.pedido_participante (id_pedido, id_cliente, es_organizador)
  VALUES (v_pedido, v_cliente1, true), (v_pedido, v_cliente2, false);

  -- Cliente1: 2 platos; Cliente2: 1 plato (SP real del sistema)
  CALL public.usp_agregar_detalle_pedido(v_pedido, v_producto, 2, 'T13', 0);
  UPDATE public.detalle_pedido SET id_cliente = v_cliente1
  WHERE id_pedido = v_pedido AND id_cliente IS NULL;

  CALL public.usp_agregar_detalle_pedido(v_pedido, v_producto, 1, 'T13', 0);
  SELECT id_detallepedido INTO v_new_detalle
  FROM public.detalle_pedido
  WHERE id_pedido = v_pedido AND id_cliente IS NULL
  ORDER BY id_detallepedido DESC LIMIT 1;
  UPDATE public.detalle_pedido SET id_cliente = v_cliente2
  WHERE id_detallepedido = v_new_detalle;

  RAISE NOTICE 'T13 FIXTURE - pedido %, clientes % y %, apertura %, producto %', v_pedido, v_cliente1, v_cliente2, v_apertura, v_producto;

  ------------------------------------------------------------------
  -- T13-1: saldos separados por participante
  ------------------------------------------------------------------
  SELECT estado_cuenta, consumo_abierto, platos
    INTO v_estado, v_saldo1, v_pagos
  FROM public.fn_saldo_participante(v_pedido, v_cliente1);
  IF v_estado <> 'ABIERTA' OR v_saldo1 <= 0 THEN
    RAISE EXCEPTION 'FALLO_T13_1: saldo de cliente1 invalido (estado %, saldo %)', v_estado, v_saldo1;
  END IF;

  SELECT estado_cuenta, consumo_abierto, platos
    INTO v_estado, v_saldo2, v_pagos
  FROM public.fn_saldo_participante(v_pedido, v_cliente2);
  IF v_estado <> 'ABIERTA' OR v_saldo2 <= 0 OR v_saldo2 >= v_saldo1 THEN
    RAISE EXCEPTION 'FALLO_T13_1b: saldo de cliente2 invalido (saldo %, esperado menor que %)', v_saldo2, v_saldo1;
  END IF;
  RAISE NOTICE 'T13 OK 1 - saldos separados: cli1 (%) cli2 (%)', v_saldo1, v_saldo2;

  ------------------------------------------------------------------
  -- T13-2: pago MENOR al saldo -> SALDO_SIN_CUBRIR
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(
    jsonb_build_object('metodoPagoId', v_metodo_efectivo,
                       'monto', v_saldo1 - 10, 'montoRecibido', v_saldo1 - 10));
  BEGIN
    SELECT id_cuenta INTO v_id_cuenta
    FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente1, v_usuario, v_apertura, '03', v_pagos);
    RAISE EXCEPTION 'FALLO_T13_2: acepto pago menor al saldo';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%SALDO_SIN_CUBRIR%' THEN
      RAISE EXCEPTION 'FALLO_T13_2: error inesperado: %', SQLERRM;
    END IF;
  END;
  RAISE NOTICE 'T13 OK 2 - rechazo pago menor con SALDO_SIN_CUBRIR';

  ------------------------------------------------------------------
  -- T13-3: pago MAYOR al saldo -> SALDO_SIN_CUBRIR
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(
    jsonb_build_object('metodoPagoId', v_metodo_efectivo,
                       'monto', v_saldo1 + 5, 'montoRecibido', v_saldo1 + 5));
  BEGIN
    SELECT id_cuenta INTO v_id_cuenta
    FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente1, v_usuario, v_apertura, '03', v_pagos);
    RAISE EXCEPTION 'FALLO_T13_3: acepto pago mayor al saldo';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%SALDO_SIN_CUBRIR%' THEN
      RAISE EXCEPTION 'FALLO_T13_3: error inesperado: %', SQLERRM;
    END IF;
  END;
  RAISE NOTICE 'T13 OK 3 - rechazo pago mayor con SALDO_SIN_CUBRIR';

  ------------------------------------------------------------------
  -- T13-4: FACTURA sin empresa -> EMPRESA_REQUERIDA
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(
    jsonb_build_object('metodoPagoId', v_metodo_efectivo,
                       'monto', v_saldo1, 'montoRecibido', v_saldo1));
  BEGIN
    SELECT id_cuenta INTO v_id_cuenta
    FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente1, v_usuario, v_apertura, '01', v_pagos);
    RAISE EXCEPTION 'FALLO_T13_4: acepto FACTURA sin id de empresa';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%EMPRESA_REQUERIDA%' THEN
      RAISE EXCEPTION 'FALLO_T13_4: error inesperado: %', SQLERRM;
    END IF;
  END;
  RAISE NOTICE 'T13 OK 4 - rechazo FACTURA sin empresa con EMPRESA_REQUERIDA';

  ------------------------------------------------------------------
  -- T13-5: BOLETA cobro completo cliente1 con vuelto
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(
    jsonb_build_object('metodoPagoId', v_metodo_efectivo,
                       'monto', v_saldo1, 'montoRecibido', v_saldo1 + 5));
  SELECT id_cuenta, id_venta, serie, numero, total, vuelto, mesa_liquidada
    INTO v_id_cuenta, v_id_venta, v_serie, v_numero, v_total, v_vuelto, v_liquidada
  FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente1, v_usuario, v_apertura, '03', v_pagos);

  IF v_liquidada THEN
    RAISE EXCEPTION 'FALLO_T13_5: mesa liquidada de mas (cliente2 sin pagar)';
  END IF;
  IF v_serie IS NULL OR v_numero IS NULL OR v_id_venta IS NULL THEN
    RAISE EXCEPTION 'FALLO_T13_5b: serie/numero/venta nulos';
  END IF;
  SELECT estado_cuenta INTO v_estado
  FROM public.cuenta_participante WHERE id = v_id_cuenta;
  IF v_estado <> 'PAGADA' THEN
    RAISE EXCEPTION 'FALLO_T13_5c: cuenta cliente1 no quedo PAGADA (%),', v_estado;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.boleta
                 WHERE id_venta = v_id_venta AND serie = v_serie AND numero = v_numero) THEN
    RAISE EXCEPTION 'FALLO_T13_5d: boleta no registrada para venta %', v_id_venta;
  END IF;
  SELECT count(*) INTO v_movimientos
  FROM public.movimiento_caja WHERE id_pedido = v_pedido AND id_venta = v_id_venta;
  IF v_movimientos = 0 THEN
    RAISE EXCEPTION 'FALLO_T13_5e: falta movimiento_caja del cobro';
  END IF;
  IF v_vuelto <> 5 THEN
    RAISE EXCEPTION 'FALLO_T13_5f: vuelto esperado 5 y fue %', v_vuelto;
  END IF;
  RAISE NOTICE 'T13 OK 5 - cliente1 pago: venta % %-% vuelto %', v_id_venta, v_serie, v_numero, v_vuelto;

  ------------------------------------------------------------------
  -- T13-6: vuelve a pedir Y PAGA -> cuenta nueva
  ------------------------------------------------------------------
  CALL public.usp_agregar_detalle_pedido(v_pedido, v_producto, 1, 'T13b', 0);
  UPDATE public.detalle_pedido SET id_cliente = v_cliente1
  WHERE id_pedido = v_pedido AND id_cliente IS NULL;

  -- fn_saldo_participante no devuelve linea si no existe cuenta ABIERTA
  -- (el cobro auto-crea la cuenta nueva; assertion secundaria en T13-6b).
  v_saldo1 := v_precio_unit;

  v_pagos := jsonb_build_array(
    jsonb_build_object('metodoPagoId', v_metodo_efectivo,
                       'monto', v_saldo1, 'montoRecibido', v_saldo1 + 5));
  SELECT mesa_liquidada INTO v_liquidada
  FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente1, v_usuario, v_apertura, '03', v_pagos);

  SELECT count(*) INTO v_cuentas
  FROM public.cuenta_participante
  WHERE id_pedido = v_pedido AND id_cliente = v_cliente1 AND estado_cuenta = 'PAGADA';
  IF v_cuentas <> 2 THEN
    RAISE EXCEPTION 'FALLO_T13_6b: esperaba 2 cuentas pagadas de cliente1, hay %', v_cuentas;
  END IF;
  SELECT count(*) INTO v_cuentas
  FROM public.cuenta_participante
  WHERE id_pedido = v_pedido AND id_cliente = v_cliente1 AND estado_cuenta = 'ABIERTA';
  IF v_cuentas <> 0 THEN
    RAISE EXCEPTION 'FALLO_T13_6c: quedo cuenta ABIERTA de cliente1';
  END IF;
  RAISE NOTICE 'T13 OK 6 - segundo pago abrio cuenta nueva (2 pagadas para cliente1)';

  ------------------------------------------------------------------
  -- T13-7: el ultimo participante (cliente2) liquida la mesa
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(
    jsonb_build_object('metodoPagoId', v_metodo_efectivo,
                       'monto', v_saldo2, 'montoRecibido', v_saldo2 + 5));
  SELECT id_cuenta INTO v_id_cuenta
  FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente2, v_usuario, v_apertura, '03', v_pagos);

  SELECT mesa_liquidada INTO v_liquidada FROM public.pedido WHERE id_pedido = v_pedido;
  IF NOT v_liquidada THEN
    RAISE EXCEPTION 'FALLO_T13_7: mesa_liquidada no quedo TRUE';
  END IF;
  IF (SELECT facturado FROM public.pedido WHERE id_pedido = v_pedido) <> 'S' THEN
    RAISE EXCEPTION 'FALLO_T13_7b: facturado no quedo S';
  END IF;
  SELECT count(*) INTO v_cuentas
  FROM public.cuenta_participante WHERE id_pedido = v_pedido AND estado_cuenta = 'ABIERTA';
  IF v_cuentas <> 0 THEN
    RAISE EXCEPTION 'FALLO_T13_7c: quedaron cuentas ABIERTAS tras liquidar';
  END IF;
  RAISE NOTICE 'T13 OK 7 - mesa liquidada (facturado S, sin cuentas abiertas)';

  ------------------------------------------------------------------
  -- T13-8: no se puede volver a cobrar una cuenta ya pagada
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(
    jsonb_build_object('metodoPagoId', v_metodo_efectivo,
                       'monto', v_precio_unit));
  BEGIN
    SELECT id_cuenta INTO v_id_cuenta
    FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente1, v_usuario, v_apertura, '03', v_pagos);
    RAISE EXCEPTION 'FALLO_T13_8: acepto cobrar cliente1 sin saldo (pagado)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%SALDO_CERO%' THEN
      RAISE EXCEPTION 'FALLO_T13_8: error inesperado: %', SQLERRM;
    END IF;
  END;
  RAISE NOTICE 'T13 OK 8 - rechazo cobrar cuenta pagada (SALDO_CERO)';

  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'T13 COMPLETA: 8 casos OK. Se hace ROLLBACK a continuacion.';
  RAISE NOTICE '====================================================';

EXCEPTION WHEN OTHERS THEN
  RAISE;
END $outer$;

ROLLBACK;
