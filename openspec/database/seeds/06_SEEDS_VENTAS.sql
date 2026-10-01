es/* ==================================================================================
   SEEDS NIVEL 7-8 - VENTAS DEL CHIFA (DETALLE_PEDIDO, VENTA, comprobantes,
   pagos, caja, delivery, inventario, NOTA_CREDITO)
   ----------------------------------------------------------------------------------
   Requiere: esquema + base + 08 + 09 + 10 + 11 + 12, con el turno
   TURNO-SEED-01 ABIERTO. Idempotente (cada historia se salta si ya existe).
   Contenido: 8 ventas normales + 2 con NC (vía USP_ANULAR_VENTA_CON_NC),
   2 deliverys, 10 movimientos de inventario.
   ================================================================================== */

/* ---------- PEDIDO_DELIVERY de los pedidos delivery ---------- */
INSERT INTO PEDIDO_DELIVERY (ID_Pedido, ID_Distrito, ID_Empleado,
                             Direccion_Entrega, Referencia, Telefono_Contacto,
                             Costo_Envio, F_Salida, F_Entrega, Situacion)
SELECT pd.ID_Pedido, d.ID_Distrito, e.ID_Empleado,
       'Av. Larco 999', 'Frente al parque Kennedy', '953000001',
       8.00, CURRENT_TIMESTAMP, NULL, 'R'
FROM PEDIDO pd
  INNER JOIN DISTRITO d ON d.D_Distrito = 'MIRAFLORES'
  INNER JOIN PROVINCIA pr ON pr.ID_Provincia = d.ID_Provincia
                          AND pr.N_Provincia = 'LIMA'
  INNER JOIN PERSONA pm ON pm.N_Documento = '45000010'
  INNER JOIN EMPLEADO e ON e.ID_Persona = pm.ID_Persona
WHERE pd.Numero_Pedido = 'PED-SEED-05'
ON CONFLICT (ID_Pedido) DO NOTHING;

INSERT INTO PEDIDO_DELIVERY (ID_Pedido, ID_Distrito, ID_Empleado,
                             Direccion_Entrega, Referencia, Telefono_Contacto,
                             Costo_Envio, F_Salida, F_Entrega, Situacion)
SELECT pd.ID_Pedido, d.ID_Distrito, e.ID_Empleado,
       'Jr. Callao 606', 'Puerta verde', '954000001',
       10.00, CURRENT_TIMESTAMP - INTERVAL '2 hours',
       CURRENT_TIMESTAMP - INTERVAL '1 hour', 'E'
FROM PEDIDO pd
  INNER JOIN DISTRITO d ON d.D_Distrito = 'CALLAO'
  INNER JOIN PROVINCIA pr ON pr.ID_Provincia = d.ID_Provincia
                          AND pr.N_Provincia = 'CALLAO'
  INNER JOIN PERSONA pm ON pm.N_Documento = '45000011'
  INNER JOIN EMPLEADO e ON e.ID_Persona = pm.ID_Persona
WHERE pd.Numero_Pedido = 'PED-SEED-08'
ON CONFLICT (ID_Pedido) DO NOTHING;

/* ---------- HISTORIAS DE VENTA (8 normales + 2 con NC) ---------- */
DO $$
DECLARE
    v_ape     INT;
    v_cajero  INT;
    v_pid     INT;
    v_prod    INT;
    v_venta   INT;
    v_serie   VARCHAR;
    v_numero  VARCHAR;
    v_total   NUMERIC;
    v_vuelto  NUMERIC;
    v_nc      INT;
    v_nserie  VARCHAR;
    v_nnumero VARCHAR;
    v_nmonto  NUMERIC;
    v_nmsg    VARCHAR;
BEGIN
    SELECT ID_AperturaCaja INTO v_ape FROM APERTURA_CAJA
    WHERE Numero_Turno = 'TURNO-SEED-01' AND Situacion = 'A';
    IF v_ape IS NULL THEN
        RAISE NOTICE 'Sin turno TURNO-SEED-01 abierto: se omite facturación.';
        RETURN;
    END IF;
    SELECT ID_Usuario INTO v_cajero FROM USUARIO WHERE Logeo = 'c.vargas';

    /* S1: mesa 01, boleta en efectivo con vuelto */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-01';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF003';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, 'Uno sin cebolla', 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'SOP001';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'BEO001';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 1,
                                 100.00, NULL,
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S1 venta % %-% total % vuelto %',
            v_venta, v_serie, v_numero, v_total, v_vuelto;
    END IF;

    /* S2: para llevar, Yape exacto */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-04';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF001';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'ENT003';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 4,
                                 NULL, 'YAP-99881',
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S2 venta % total %', v_venta, v_total;
    END IF;

    /* S3: delivery Miraflores, efectivo */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-05';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF003';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'BEF004';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 1,
                                 60.00, NULL,
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S3 venta % total %', v_venta, v_total;
    END IF;

    /* S4: VIP empresa, FACTURA con transferencia */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-10';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF004';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 4, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF006';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'BEO001';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 4, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '01', NULL, 6,
                                 NULL, 'TRF-44551',
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S4 factura % %-% total %', v_venta, v_serie, v_numero, v_total;
    END IF;

    /* S5: mesa 02, Visa */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-02';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'PLF001';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'MAR001';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 2,
                                 NULL, 'OP-88231',
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S5 venta % total %', v_venta, v_total;
    END IF;

    /* S6: terraza, Plin */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-06';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'SOP002';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF008';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 5,
                                 NULL, 'PLN-11223',
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S6 venta % total %', v_venta, v_total;
    END IF;

    /* S7: delivery Callao, efectivo */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-08';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'ENT003';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'BEF005';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 1,
                                 25.00, NULL,
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S7 venta % total %', v_venta, v_total;
    END IF;

    /* S8: para llevar, Mastercard */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-09';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF002';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 3,
                                 NULL, 'OP-88232',
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        RAISE NOTICE 'S8 venta % total %', v_venta, v_total;
    END IF;

    /* N1: familiar F1, boleta en efectivo + NC por inconformidad (admin) */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-03';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF003';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 2, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'CHF005';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'BEO002';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 3, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 1,
                                 150.00, NULL,
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        CALL usp_anular_venta_con_nc(v_venta, 1,
            'Cliente inconforme con el pedido familiar',
            v_nc, v_nserie, v_nnumero, v_nmonto, v_nmsg);
        RAISE NOTICE 'N1 NC % %-% monto %', v_nc, v_nserie, v_nnumero, v_nmonto;
    END IF;

    /* N2: barra, Yape + NC por cobro duplicado (admin) */
    SELECT ID_Pedido INTO v_pid FROM PEDIDO WHERE Numero_Pedido = 'PED-SEED-07';
    IF v_pid IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM VENTA WHERE ID_Pedido = v_pid) THEN
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'SOP003';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        SELECT ID_Producto INTO v_prod FROM PRODUCTO WHERE Codigo = 'ENT004';
        CALL usp_agregar_detalle_pedido(v_pid, v_prod, 1, NULL, 0);
        CALL usp_facturar_pedido(v_pid, v_cajero, v_ape, '03', NULL, 4,
                                 NULL, 'YAP-99882',
                                 v_venta, v_serie, v_numero, v_total, v_vuelto);
        CALL usp_anular_venta_con_nc(v_venta, 1, 'Cobro duplicado por Yape',
            v_nc, v_nserie, v_nnumero, v_nmonto, v_nmsg);
        RAISE NOTICE 'N2 NC % %-% monto %', v_nc, v_nserie, v_nnumero, v_nmonto;
    END IF;
END;
$$;

/* ---------- MOVIMIENTO_INVENTARIO (10: compras y consumos) ---------- */
INSERT INTO MOVIMIENTO_INVENTARIO (ID_Producto, ID_Usuario, ID_Pedido,
                                   Tipo_Movimiento, Cantidad, Stock_Anterior,
                                   Stock_Nuevo, Costo_Unitario, Documento,
                                   Observacion)
SELECT pr.ID_Producto, 1, NULL, v.Tipo, v.Cant, v.Ant, v.Nuevo,
       pr.Costo, v.Doc, v.Obs
FROM (VALUES
  ('INS001','E',25.000,50.000,75.000,'SEED-INV-01','Compra semanal de arroz'),
  ('INS001','S',5.000,75.000,70.000,'SEED-INV-02','Consumo del fin de semana'),
  ('INS002','E',20.000,30.000,50.000,'SEED-INV-03','Compra de pollo'),
  ('INS002','S',3.000,50.000,47.000,'SEED-INV-04','Consumo por recetas'),
  ('INS005','E',12.000,20.000,32.000,'SEED-INV-05','Compra de aceite'),
  ('INS005','S',1.000,32.000,31.000,'SEED-INV-06','Consumo en wok'),
  ('INS007','S',2.000,8.000,6.000,'SEED-INV-07','Wantanes del día'),
  ('INS006','S',30.000,200.000,170.000,'SEED-INV-08','Huevos para chaufa'),
  ('INS010','E',10.000,15.000,25.000,'SEED-INV-09','Compra de lomo fino'),
  ('INS010','S',2.000,25.000,23.000,'SEED-INV-10','Tallarines de carne')
) AS v(Cod, Tipo, Cant, Ant, Nuevo, Doc, Obs)
  INNER JOIN PRODUCTO pr ON pr.Codigo = v.Cod
WHERE NOT EXISTS (SELECT 1 FROM MOVIMIENTO_INVENTARIO x
                  WHERE x.Documento = v.Doc);

/* ---------- CONTROL ---------- */
SELECT 'DETALLE_PEDIDO' AS tabla, COUNT(*) AS total FROM DETALLE_PEDIDO
UNION ALL SELECT 'PEDIDO_DELIVERY', COUNT(*) FROM PEDIDO_DELIVERY
UNION ALL SELECT 'VENTA', COUNT(*) FROM VENTA
UNION ALL SELECT 'DETALLE_VENTA', COUNT(*) FROM DETALLE_VENTA
UNION ALL SELECT 'BOLETA', COUNT(*) FROM BOLETA
UNION ALL SELECT 'FACTURA', COUNT(*) FROM FACTURA
UNION ALL SELECT 'NOTA_CREDITO', COUNT(*) FROM NOTA_CREDITO
UNION ALL SELECT 'PAGO_VENTA', COUNT(*) FROM PAGO_VENTA
UNION ALL SELECT 'MOVIMIENTO_CAJA', COUNT(*) FROM MOVIMIENTO_CAJA
UNION ALL SELECT 'MOVIMIENTO_INVENTARIO', COUNT(*) FROM MOVIMIENTO_INVENTARIO;
