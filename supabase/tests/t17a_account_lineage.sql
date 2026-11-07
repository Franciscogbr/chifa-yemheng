-- =====================================================================
-- T17a — linaje cuenta↔detalles↔venta (S3/S11/S12)
-- Requiere: T11/T12 aplicadas y LUEGO aplicar 20261106161000 primero.
-- Ejecutar el archivo COMPLETO una sola vez. BEGIN..ROLLBACK: sin datos.
-- Éxito: "T17a OK n -" en Notices. Falta: "FALLO_T17A_x".
-- =====================================================================

BEGIN;

DO $outer$
DECLARE
  v_pedido integer;
  v_cliente1 integer;
  v_cliente2 integer;
  v_usuario integer;
  v_producto integer;
  v_metodo_efectivo integer;
  v_apertura integer;
  v_mesa integer;
  v_tipopedido integer;
  v_estado_pedido integer;
  v_precio numeric;
  v_saldo1 numeric;
  v_saldo2 numeric;
  v_id_cuenta1 bigint;
  v_id_cuenta2 bigint;
  v_id_venta1 integer;
  v_id_venta2 integer;
  v_serie1 text;
  v_numero1 text;
  v_serie2 text;
  v_numero2 text;
  v_total_cobro1 numeric;
  v_total_cobro2 numeric;
  v_vuelto1 numeric;
  v_vuelto2 numeric;
  v_liquidada boolean;
  v_pagos jsonb;
  v_cuenta_state text;
  v_conteo integer;
  v_unidades integer;
  v_venta_guard bigint;
  v_venta_total numeric;
  v_mesa_por_cobrar integer;
BEGIN
  ------------------------------------------------------------------
  -- FIXTURES
  ------------------------------------------------------------------
  SELECT id_producto, precio INTO v_producto, v_precio
  FROM public.producto WHERE estado = 'A' AND precio > 0
  ORDER BY id_producto LIMIT 1;
  IF v_producto IS NULL THEN
    RAISE EXCEPTION 'FALLO_T17A_FIXTURE: no hay producto activo con precio';
  END IF;

  SELECT id_tipopedido INTO v_tipopedido
  FROM public.tipo_pedido WHERE estado = 'A' ORDER BY id_tipopedido LIMIT 1;
  IF v_tipopedido IS NULL THEN
    RAISE EXCEPTION 'FALLO_T17A_FIXTURE: no existe tipo_pedido activo';
  END IF;

  SELECT id_estadopedido INTO v_estado_pedido
  FROM public.estado_pedido WHERE estado = 'A' ORDER BY id_estadopedido LIMIT 1;
  IF v_estado_pedido IS NULL THEN
    RAISE EXCEPTION 'FALLO_T17A_FIXTURE: no existe estado_pedido activo';
  END IF;

  SELECT min(id_cliente), max(id_cliente) INTO v_cliente1, v_cliente2
  FROM public.cliente WHERE estado = 'A';
  IF v_cliente1 IS NULL OR v_cliente2 IS NULL OR v_cliente1 = v_cliente2 THEN
    RAISE EXCEPTION 'FALLO_T17A_FIXTURE: se necesitan 2 clientes activos';
  END IF;

  SELECT ac.id_aperturacaja, ac.id_usuario INTO v_apertura, v_usuario
  FROM public.apertura_caja ac
  WHERE ac.situacion = 'A'
  ORDER BY ac.id_aperturacaja DESC LIMIT 1;
  IF v_apertura IS NULL THEN
    SELECT COALESCE(min(id_caja), 1) INTO v_apertura FROM public.caja WHERE estado = 'A' LIMIT 1;
    SELECT COALESCE((SELECT id_usuario FROM public.apertura_caja LIMIT 1), 1) INTO v_usuario;
    INSERT INTO public.apertura_caja (id_caja, id_usuario, numero_turno, monto_inicial, situacion, estado)
    VALUES (v_apertura, v_usuario, 'T17A-' || to_char(clock_timestamp(), 'HH24MISS'), 0.00, 'A', 'A')
    RETURNING id_aperturacaja INTO v_apertura;
  END IF;

  SELECT id_estadomesa INTO v_mesa_por_cobrar
  FROM public.estado_mesa WHERE descripcion = 'POR COBRAR' AND estado = 'A' LIMIT 1;
  IF v_mesa_por_cobrar IS NULL THEN
    RAISE EXCEPTION 'FALLO_T17A_FIXTURE: estado POR COBRAR no existe';
  END IF;
  SELECT id_mesa INTO v_mesa FROM public.mesa WHERE estado = 'A' ORDER BY id_mesa LIMIT 1;
  IF v_mesa IS NULL THEN
    RAISE EXCEPTION 'FALLO_T17A_FIXTURE: no hay mesa activa';
  END IF;
  -- La mesa pasa a POR COBRAR solo al final, después de todos los pedidos/cobros.

  SELECT id_metodopago INTO v_metodo_efectivo
  FROM public.metodo_pago WHERE afecta_efectivo = 'S' AND estado = 'A' LIMIT 1;
  IF v_metodo_efectivo IS NULL THEN
    RAISE EXCEPTION 'FALLO_T17A_FIXTURE: no hay metodo de pago de efectivo';
  END IF;

  ------------------------------------------------------------------
  -- Pedido POR_CONSUMO: cliente1 pide 2 platos, cliente2 pide 1 plato
  ------------------------------------------------------------------
  INSERT INTO public.pedido (
    numero_pedido, id_tipopedido, id_mesa, id_cliente, id_usuario, id_estadopedido,
    n_comensales, canal_origen, modo_pago_mesa
  ) VALUES (
    'T17A-' || to_char(clock_timestamp(), 'HH24MISS'), v_tipopedido, v_mesa, v_cliente1, v_usuario, v_estado_pedido,
    2, 'QR', 'POR_CONSUMO'
  ) RETURNING id_pedido INTO v_pedido;

  INSERT INTO public.pedido_participante (id_pedido, id_cliente, es_organizador)
  VALUES (v_pedido, v_cliente1, true), (v_pedido, v_cliente2, false);

  -- cliente1: 2 platos; cliente2: 1 plato
  PERFORM public.fn_agregar_detalle_pedido_cliente(v_pedido, v_producto, 2, 'T17A', 0, v_cliente1);
  PERFORM public.fn_agregar_detalle_pedido_cliente(v_pedido, v_producto, 1, 'T17A', 0, v_cliente2);

  RAISE NOTICE 'T17A FIXTURE - pedido %, clientes % y %, apertura %, producto %', v_pedido, v_cliente1, v_cliente2, v_apertura, v_producto;

  ------------------------------------------------------------------
  -- T17A-1: los platos quedaron ligados a la cuenta ABIERTA correcta
  ------------------------------------------------------------------
  SELECT cp.id INTO v_id_cuenta1
  FROM public.cuenta_participante cp
  WHERE cp.id_pedido = v_pedido AND cp.id_cliente = v_cliente1 AND cp.estado_cuenta = 'ABIERTA';
  IF v_id_cuenta1 IS NULL THEN
    RAISE EXCEPTION 'FALLO_T17A_1: cliente1 sin cuenta ABIERTA al pedir';
  END IF;
  SELECT count(*), COALESCE(sum(cantidad), 0)::integer INTO v_conteo, v_unidades
  FROM public.detalle_pedido WHERE id_cuenta = v_id_cuenta1 AND estado = 'A';
  IF v_conteo = 0 OR v_unidades <> 2 THEN
    RAISE EXCEPTION 'FALLO_T17A_1b: cliente1 con % linea(s) y % unidades ligadas, esperaba al menos 1 linea con total 2 unidades', v_conteo, v_unidades;
  END IF;
  -- platos del cliente2 NO deben estar en la cuenta de cliente1
  SELECT count(*) INTO v_conteo
  FROM public.detalle_pedido dp
  JOIN public.cuenta_participante cp2 ON cp2.id = dp.id_cuenta
  WHERE cp2.id_cliente = v_cliente2 AND dp.id_cuenta = v_id_cuenta1;
  IF v_conteo <> 0 THEN
    RAISE EXCEPTION 'FALLO_T17A_1c: platos de cliente2 ligados a cuenta de cliente1';
  END IF;
  RAISE NOTICE 'T17A OK 1 - platos ligados a SU cuenta (sin contaminacion entre clientes)';

  ------------------------------------------------------------------
  -- T17A-2: saldo usa solo SUS platos de SU cuenta
  ------------------------------------------------------------------
  SELECT estado_cuenta, consumo_abierto, platos
    INTO v_cuenta_state, v_saldo1, v_pagos
  FROM public.fn_saldo_participante(v_pedido, v_cliente1);
  IF v_saldo1 <> 2 * v_precio THEN
    RAISE EXCEPTION 'FALLO_T17A_2: saldo cliente1 = %, esperaba %', v_saldo1, 2 * v_precio;
  END IF;
  SELECT estado_cuenta, consumo_abierto, platos
    INTO v_cuenta_state, v_saldo2, v_pagos
  FROM public.fn_saldo_participante(v_pedido, v_cliente2);
  IF v_saldo2 <> v_precio THEN
    RAISE EXCEPTION 'FALLO_T17A_2b: saldo cliente2 = %, esperaba %', v_saldo2, v_precio;
  END IF;
  RAISE NOTICE 'T17A OK 2 - saldos aislados por cuenta: cli1 (%) cli2 (%)', v_saldo1, v_saldo2;

  -- La mesa pasa a POR COBRAR antes del primer cobro (requisito de fn_cobrar_participante_atomic)
  UPDATE public.mesa SET id_estadomesa = v_mesa_por_cobrar WHERE id_mesa = v_mesa;

  ------------------------------------------------------------------
  -- T17A-3: cobro cliente1 -> cuenta queda ligada a LA venta exacta
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(jsonb_build_object(
    'metodoPagoId', v_metodo_efectivo, 'monto', v_saldo1, 'montoRecibido', v_saldo1 + 5));
  SELECT id_cuenta, id_venta, serie, numero, total, vuelto, mesa_liquidada
    INTO v_id_cuenta1, v_id_venta1, v_serie1, v_numero1, v_total_cobro1, v_vuelto1, v_liquidada
  FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente1, v_usuario, v_apertura, '03', v_pagos);
  IF v_liquidada THEN
    RAISE EXCEPTION 'FALLO_T17A_3: mesa liquidada con cliente2 pendiente';
  END IF;

  SELECT cp.id_venta INTO v_venta_guard
  FROM public.cuenta_participante cp WHERE cp.id = v_id_cuenta1;
  IF v_venta_guard IS DISTINCT FROM v_id_venta1 THEN
    RAISE EXCEPTION 'FALLO_T17A_3b: cuenta apunta a venta % no a %', v_venta_guard, v_id_venta1;
  END IF;
  SELECT total INTO v_venta_total FROM public.venta WHERE id_venta = v_id_venta1;
  IF round(v_venta_total, 2) <> round(2 * v_precio, 2) THEN
    RAISE EXCEPTION 'FALLO_T17A_3c: venta % total %, esperaba %', v_id_venta1, v_venta_total, 2 * v_precio;
  END IF;
  RAISE NOTICE 'T17A OK 3 - cuenta ligada a venta % %-%', v_id_venta1, v_serie1, v_numero1;

  ------------------------------------------------------------------
  -- T17A-4: cobro cliente2 -> mesa liquidada (todos pagaron)
  ------------------------------------------------------------------
  v_pagos := jsonb_build_array(jsonb_build_object(
    'metodoPagoId', v_metodo_efectivo, 'monto', v_saldo2, 'montoRecibido', v_saldo2));
  PERFORM * FROM public.fn_cobrar_participante_atomic(v_pedido, v_cliente2, v_usuario, v_apertura, '03', v_pagos);

  IF (SELECT mesa_liquidada FROM public.pedido WHERE id_pedido = v_pedido) IS NOT TRUE THEN
    RAISE EXCEPTION 'FALLO_T17A_4: mesa_liquidada no quedo TRUE tras liquidar todas las cuentas';
  END IF;
  SELECT count(*) INTO v_conteo
  FROM public.cuenta_participante WHERE id_pedido = v_pedido AND estado_cuenta = 'ABIERTA';
  IF v_conteo <> 0 THEN
    RAISE EXCEPTION 'FALLO_T17A_4b: quedaron cuentas ABIERTAS tras liquidar';
  END IF;
  SELECT count(*) INTO v_conteo
  FROM public.pago_venta pv
  WHERE pv.id_cliente_pagador = v_cliente1
    AND EXISTS (SELECT 1 FROM public.cuenta_participante cp WHERE cp.id_venta = pv.id_venta AND cp.id_cliente = v_cliente1);
  IF v_conteo < 1 THEN
    RAISE EXCEPTION 'FALLO_T17A_4c: pago de cliente1 mal registrado (encontrados %)', v_conteo;
  END IF;
  RAISE NOTICE 'T17A OK 4 - mesa liquidada y pagos con pagador por cada venta';

  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'T17A COMPLETA: todos OK. Se hace ROLLBACK a continuacion.';
  RAISE NOTICE '====================================================';

EXCEPTION WHEN OTHERS THEN
  RAISE;
END $outer$;

ROLLBACK;
