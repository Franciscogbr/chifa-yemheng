--
-- PostgreSQL database dump
--

\restrict 8IEzshvrk2WgdkiZQWOmUvi1mZAiMPtUp8aIIMbPKAwQ7Has5pDcBY8j5MtdadP

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: fn_total_pedido(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_total_pedido(p_id_pedido integer) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_total NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(Sub_Total), 0) INTO v_total
    FROM DETALLE_PEDIDO
    WHERE ID_Pedido = p_id_pedido
      AND Estado_Preparacion <> 'A'
      AND ESTADO = 'A'
      AND Es_Cortesia = 'N';
    RETURN COALESCE(v_total, 0);
END;
$$;


--
-- Name: trg_producto_auditoria(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_producto_auditoria() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO AUDITORIA(N_Tabla, Accion, ID_Registro, Valor_Nuevo)
        VALUES ('PRODUCTO', 'INSERT', NEW.ID_Producto,
                'Producto=' || NEW.N_Producto || '|Precio=' || NEW.Precio::TEXT
                || '|Estado=' || NEW.ESTADO);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO AUDITORIA(N_Tabla, Accion, ID_Registro, Valor_Anterior)
        VALUES ('PRODUCTO', 'DELETE', OLD.ID_Producto,
                'Producto=' || OLD.N_Producto || '|Precio=' || OLD.Precio::TEXT
                || '|Estado=' || OLD.ESTADO);
        RETURN OLD;
    ELSE
        INSERT INTO AUDITORIA(N_Tabla, Accion, ID_Registro, Valor_Anterior, Valor_Nuevo)
        VALUES ('PRODUCTO', 'UPDATE', NEW.ID_Producto,
                'Producto=' || OLD.N_Producto || '|Precio=' || OLD.Precio::TEXT
                || '|Estado=' || OLD.ESTADO,
                'Producto=' || NEW.N_Producto || '|Precio=' || NEW.Precio::TEXT
                || '|Estado=' || NEW.ESTADO);
        RETURN NEW;
    END IF;
END;
$$;


--
-- Name: trg_venta_auditoria(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_venta_auditoria() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.Total IS DISTINCT FROM OLD.Total
       OR NEW.Anulada IS DISTINCT FROM OLD.Anulada THEN
        INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro,
                              Valor_Anterior, Valor_Nuevo)
        VALUES (NEW.ID_Usuario, 'VENTA', 'UPDATE', NEW.ID_Venta,
                'Total=' || OLD.Total::TEXT || '|Anulada=' || OLD.Anulada,
                'Total=' || NEW.Total::TEXT || '|Anulada=' || NEW.Anulada);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: usp_abrir_pedido(integer, integer, integer, integer, integer, integer, character varying); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_abrir_pedido(IN p_tipo integer, IN p_usuario integer, IN p_mesa integer, IN p_cliente integer, IN p_empleado integer, IN p_comensales integer, IN p_obs character varying, OUT o_id integer, OUT o_num character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_req CHAR(1);
    v_num VARCHAR(15);
    v_id  INT;
    v_seq INT;
BEGIN
    SELECT Requiere_Mesa INTO v_req
    FROM TIPO_PEDIDO WHERE ID_TipoPedido = p_tipo;

    IF v_req IS NULL THEN
        RAISE EXCEPTION 'Tipo de pedido inexistente.';
    END IF;

    IF v_req = 'S' AND p_mesa IS NULL THEN
        RAISE EXCEPTION 'El tipo de pedido exige una mesa.';
    END IF;

    IF p_mesa IS NOT NULL AND EXISTS
       (SELECT 1 FROM PEDIDO pd
          INNER JOIN ESTADO_PEDIDO ep ON ep.ID_EstadoPedido = pd.ID_EstadoPedido
        WHERE pd.ID_Mesa = p_mesa
          AND pd.Anulado = 'N' AND pd.Facturado = 'N'
          AND ep.Descripcion <> 'ANULADO') THEN
        RAISE EXCEPTION 'La mesa ya tiene una comanda abierta.';
    END IF;

    SELECT COUNT(*) INTO v_seq
    FROM PEDIDO WHERE F_Pedido::DATE = CURRENT_DATE;

    v_num := 'PED' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD')
             || LPAD((v_seq + 1)::TEXT, 4, '0');

    INSERT INTO PEDIDO(Numero_Pedido, ID_Cliente, ID_Mesa, ID_TipoPedido,
                       ID_EstadoPedido, ID_Usuario, ID_Empleado,
                       N_Comensales, Observacion)
    VALUES (v_num, p_cliente, p_mesa, p_tipo, 1,
            p_usuario, p_empleado, COALESCE(p_comensales, 1), p_obs)
    RETURNING ID_Pedido INTO v_id;

    IF p_mesa IS NOT NULL THEN
        UPDATE MESA SET ID_EstadoMesa = 2,
            USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
        WHERE ID_Mesa = p_mesa;
    END IF;

    o_id := v_id;
    o_num := v_num;
END;
$$;


--
-- Name: usp_agregar_detalle_pedido(integer, integer, numeric, character varying, numeric); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_agregar_detalle_pedido(IN p_pedido integer, IN p_prod integer, IN p_cant numeric, IN p_nota character varying, IN p_desc numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_precio NUMERIC(10,2);
BEGIN
    IF EXISTS (SELECT 1 FROM PEDIDO
               WHERE ID_Pedido = p_pedido
                 AND (Facturado = 'S' OR Anulado = 'S')) THEN
        RAISE EXCEPTION 'El pedido esta facturado o anulado.';
    END IF;

    SELECT Precio INTO v_precio FROM PRODUCTO
    WHERE ID_Producto = p_prod AND ESTADO = 'A' AND Disponible = 'S';

    IF v_precio IS NULL THEN
        RAISE EXCEPTION 'Producto no disponible.';
    END IF;

    INSERT INTO DETALLE_PEDIDO(ID_Pedido, ID_Producto, Cantidad,
                               Precio_Unitario, Descuento, Nota_Cocina)
    VALUES (p_pedido, p_prod, p_cant, v_precio, COALESCE(p_desc, 0), p_nota);

    CALL usp_recalcular_pedido(p_pedido);
END;
$$;


--
-- Name: usp_anular_pedido(integer, integer, character varying); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_anular_pedido(IN p_pedido integer, IN p_usuario integer, IN p_motivo character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_mesa INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM PEDIDO WHERE ID_Pedido = p_pedido) THEN
        RAISE EXCEPTION 'Pedido inexistente.';
    END IF;

    IF EXISTS (SELECT 1 FROM PEDIDO
               WHERE ID_Pedido = p_pedido AND Facturado = 'S') THEN
        RAISE EXCEPTION 'El pedido ya fue facturado. Use nota de credito.';
    END IF;

    SELECT ID_Mesa INTO v_mesa FROM PEDIDO WHERE ID_Pedido = p_pedido;

    UPDATE PEDIDO SET
        Anulado = 'S', ID_EstadoPedido = 5, Motivo_Anulacion = p_motivo,
        ESTADO = 'I',
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_Pedido = p_pedido;

    UPDATE DETALLE_PEDIDO SET
        Estado_Preparacion = 'A', ESTADO = 'I',
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_Pedido = p_pedido;

    IF v_mesa IS NOT NULL THEN
        UPDATE MESA SET ID_EstadoMesa = 1,
            USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
        WHERE ID_Mesa = v_mesa;
    END IF;

    INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro, Valor_Nuevo)
    VALUES (p_usuario, 'PEDIDO', 'ANULAR', p_pedido, p_motivo);
END;
$$;


--
-- Name: usp_anular_venta_con_nc(integer, integer, character varying); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_anular_venta_con_nc(IN p_id_venta integer, IN p_usuario integer, IN p_motivo character varying, OUT o_id_nc integer, OUT o_serie character varying, OUT o_numero character varying, OUT o_monto numeric, OUT o_mensaje character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_tot   NUMERIC(12,2);
    v_tipodoc VARCHAR(2);
    v_caja  INT;
    v_ape   INT;
    v_serie_id INT;
    v_serie CHAR(4);
    v_corr  INT;
    v_num   CHAR(8);
    v_nc    INT;
    v_tref  CHAR(2);
    v_sref  CHAR(4);
    v_nref  CHAR(8);
    v_metodo INT;
    v_concepto INT;
    v_afecta CHAR(1);
    v_mov   INT;
    v_tiene BOOLEAN;
BEGIN
    SELECT (Total IS NOT NULL AND Anulada = 'N' AND ESTADO = 'A'),
           Total, TipoDocumento
      INTO v_tiene, v_tot, v_tipodoc
    FROM VENTA WHERE ID_Venta = p_id_venta;

    IF v_tiene IS NULL THEN
        RAISE EXCEPTION 'Venta inexistente.';
    END IF;
    IF NOT v_tiene THEN
        RAISE EXCEPTION 'La venta ya esta anulada o inactiva.';
    END IF;
    IF p_motivo IS NULL OR btrim(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo de la nota de credito es obligatorio.';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM USUARIO_ROL ur
          INNER JOIN ROL_PERMISO rp ON rp.ID_Rol = ur.ID_Rol
                                   AND rp.Concedido = 'S' AND rp.ESTADO = 'A'
          INNER JOIN PERMISO pe ON pe.ID_Permiso = rp.ID_Permiso
                               AND pe.Clave = 'VEN_NOTACREDITO'
                               AND pe.ESTADO = 'A'
        WHERE ur.ID_Usuario = p_usuario
          AND ur.Vigente = 'S' AND ur.ESTADO = 'A')
      INTO v_tiene;

    IF NOT v_tiene THEN
        RAISE EXCEPTION 'Requiere permiso VEN_NOTACREDITO (supervisor).';
    END IF;

    /* Comprobante de referencia (boleta o factura de la venta) */
    SELECT '03', Serie, Numero INTO v_tref, v_sref, v_nref
    FROM BOLETA WHERE ID_Venta = p_id_venta;
    IF v_sref IS NULL THEN
        SELECT '01', Serie, Numero INTO v_tref, v_sref, v_nref
        FROM FACTURA WHERE ID_Venta = p_id_venta;
    END IF;
    IF v_sref IS NULL THEN
        SELECT 'TK', NULL, NULL INTO v_tref, v_sref, v_nref;
    END IF;

    /* Serie 07 con bloqueo */
    SELECT ID_Serie INTO v_serie_id
    FROM SERIE_DOCUMENTO
    WHERE Tipo_Documento = '07' AND ESTADO = 'A'
    ORDER BY ID_Serie LIMIT 1 FOR UPDATE;

    IF v_serie_id IS NULL THEN
        RAISE EXCEPTION 'No existe serie activa de nota de credito (07).';
    END IF;

    UPDATE SERIE_DOCUMENTO SET Correlativo = Correlativo + 1
    WHERE ID_Serie = v_serie_id
    RETURNING Serie, Correlativo INTO v_serie, v_corr;

    v_num := LPAD(v_corr::TEXT, 8, '0');

    INSERT INTO NOTA_CREDITO(ID_Venta, Serie, Numero, Tipo_Doc_Referencia,
                             Serie_Referencia, Numero_Referencia,
                             Motivo, Monto)
    VALUES (p_id_venta, v_serie, v_num, v_tref,
            COALESCE(v_sref, v_serie), COALESCE(v_nref, v_num),
            p_motivo, v_tot)
    RETURNING ID_NotaCredito INTO v_nc;

    UPDATE VENTA SET Anulada = 'S',
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_Venta = p_id_venta;

    /* Turno abierto de la misma caja de la venta */
    SELECT ac.ID_Caja INTO v_caja
    FROM VENTA v INNER JOIN APERTURA_CAJA ac
      ON ac.ID_AperturaCaja = v.ID_AperturaCaja
    WHERE v.ID_Venta = p_id_venta;

    SELECT ID_AperturaCaja INTO v_ape
    FROM APERTURA_CAJA
    WHERE ID_Caja = v_caja AND Situacion = 'A'
    ORDER BY ID_AperturaCaja DESC LIMIT 1 FOR UPDATE;

    IF v_ape IS NULL THEN
        RAISE EXCEPTION 'No hay turno abierto en la caja de la venta.';
    END IF;

    /* Método del pago original para la devolución */
    SELECT ID_MetodoPago INTO v_metodo
    FROM PAGO_VENTA WHERE ID_Venta = p_id_venta
    ORDER BY ID_Pago LIMIT 1;

    SELECT cc.ID_Concepto,
           CASE WHEN cc.Afecta_Efectivo = 'S' AND mp.Afecta_Efectivo = 'S'
                THEN 'S' ELSE 'N' END
      INTO v_concepto, v_afecta
    FROM CONCEPTO_CAJA cc
      CROSS JOIN METODO_PAGO mp
    WHERE cc.N_Concepto = 'DEVOLUCION A CLIENTE'
      AND mp.ID_MetodoPago = v_metodo;

    IF v_concepto IS NULL THEN
        RAISE EXCEPTION 'Falta el concepto DEVOLUCION A CLIENTE.';
    END IF;

    INSERT INTO MOVIMIENTO_CAJA(ID_AperturaCaja, ID_TipoMovimiento,
                                ID_Concepto, ID_MetodoPago, ID_Usuario,
                                ID_Venta, Descripcion, Monto, Afecta_Efectivo)
    SELECT v_ape, cc.ID_TipoMovimiento, v_concepto, v_metodo, p_usuario,
           p_id_venta, 'Devolucion NC ' || v_serie || '-' || v_num,
           v_tot, v_afecta
    FROM CONCEPTO_CAJA cc WHERE cc.ID_Concepto = v_concepto
    RETURNING ID_MovimientoCaja INTO v_mov;

    UPDATE APERTURA_CAJA SET
        Total_Egresos = Total_Egresos + v_tot,
        Monto_Sistema = Monto_Sistema + CASE WHEN v_afecta = 'S'
                                            THEN -v_tot ELSE 0 END,
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_AperturaCaja = v_ape;

    INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro,
                          Valor_Nuevo)
    VALUES (p_usuario, 'NOTA_CREDITO', 'INSERT', v_nc,
            'NC ' || v_serie || '-' || v_num || ' anula venta ' ||
            p_id_venta::TEXT || ' por S/ ' || v_tot::TEXT);

    o_id_nc := v_nc;
    o_serie := v_serie;
    o_numero := v_num;
    o_monto := v_tot;
    o_mensaje := 'Nota de credito emitida con devolucion registrada';
END;
$$;


--
-- Name: usp_aperturar_caja(integer, integer, numeric, character varying); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_aperturar_caja(IN p_id_caja integer, IN p_id_usuario integer, IN p_monto numeric, IN p_numero character varying, OUT o_id_apertura integer, OUT o_mensaje character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_num VARCHAR(20);
    v_id  INT;
BEGIN
    IF EXISTS (SELECT 1 FROM APERTURA_CAJA
               WHERE ID_Caja = p_id_caja AND Situacion = 'A') THEN
        RAISE EXCEPTION 'La caja ya tiene un turno abierto.';
    END IF;

    v_num := COALESCE(p_numero,
               TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || p_id_caja::TEXT);

    INSERT INTO APERTURA_CAJA(ID_Caja, ID_Usuario, Numero_Turno,
                              Monto_Inicial, Monto_Sistema, Situacion)
    VALUES (p_id_caja, p_id_usuario, v_num, p_monto, p_monto, 'A')
    RETURNING ID_AperturaCaja INTO v_id;

    UPDATE CAJA SET Aperturada = 'S',
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_Caja = p_id_caja;

    INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro, Valor_Nuevo)
    VALUES (p_id_usuario, 'APERTURA_CAJA', 'INSERT', v_id,
            'Apertura con S/ ' || p_monto::TEXT);

    o_id_apertura := v_id;
    o_mensaje := 'Caja aperturada correctamente';
END;
$$;


--
-- Name: usp_cerrar_caja(integer, integer, numeric, character varying); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_cerrar_caja(IN p_id_apertura integer, IN p_id_cierre integer, IN p_declarado numeric, IN p_obs character varying, OUT o_sistema numeric, OUT o_declarado numeric, OUT o_diferencia numeric, OUT o_resultado character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_caja INT;
    v_sis  NUMERIC(12,2);
BEGIN
    SELECT ID_Caja, Monto_Sistema INTO v_caja, v_sis
    FROM APERTURA_CAJA
    WHERE ID_AperturaCaja = p_id_apertura AND Situacion = 'A';

    IF v_caja IS NULL THEN
        RAISE EXCEPTION 'Turno inexistente o ya cerrado.';
    END IF;

    UPDATE APERTURA_CAJA SET
        ID_UsuarioCierre = p_id_cierre,
        F_Cierre         = CURRENT_TIMESTAMP,
        Monto_Declarado  = p_declarado,
        Diferencia       = p_declarado - v_sis,
        Situacion        = 'C',
        Observacion      = p_obs,
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_AperturaCaja = p_id_apertura;

    UPDATE CAJA SET Aperturada = 'N',
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_Caja = v_caja;

    INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro, Valor_Nuevo)
    VALUES (p_id_cierre, 'APERTURA_CAJA', 'UPDATE', p_id_apertura,
            'Cierre. Sistema: ' || v_sis::TEXT
            || ' Declarado: ' || p_declarado::TEXT);

    SELECT Monto_Sistema, Monto_Declarado, Diferencia,
           CASE WHEN Diferencia = 0 THEN 'CUADRADO'
                WHEN Diferencia > 0 THEN 'SOBRANTE' ELSE 'FALTANTE' END
      INTO o_sistema, o_declarado, o_diferencia, o_resultado
    FROM APERTURA_CAJA
    WHERE ID_AperturaCaja = p_id_apertura;
END;
$$;


--
-- Name: usp_facturar_pedido(integer, integer, integer, character varying, integer, integer, numeric, character varying); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_facturar_pedido(IN p_pedido integer, IN p_usuario integer, IN p_apertura integer, IN p_tipodoc character varying, IN p_cliente integer, IN p_metodo integer, IN p_recibido numeric, IN p_ref character varying, OUT o_id_venta integer, OUT o_serie character varying, OUT o_numero character varying, OUT o_total numeric, OUT o_vuelto numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_sub   NUMERIC(12,2);
    v_desc  NUMERIC(12,2);
    v_serv  NUMERIC(12,2);
    v_igv   NUMERIC(12,2);
    v_tot   NUMERIC(12,2);
    v_mesa  INT;
    v_cli   INT;
    v_emp   INT;
    v_serie_id INT;
    v_serie CHAR(4);
    v_corr  INT;
    v_num   CHAR(8);
    v_venta INT;
    v_concepto INT;
    v_rec   NUMERIC(12,2);
    v_vuelto NUMERIC(12,2);
    v_dummy_id  INT;
    v_dummy_msg VARCHAR;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM PEDIDO
                   WHERE ID_Pedido = p_pedido
                     AND Facturado = 'N' AND Anulado = 'N') THEN
        RAISE EXCEPTION 'El pedido no existe, ya fue facturado o esta anulado.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM APERTURA_CAJA
                   WHERE ID_AperturaCaja = p_apertura AND Situacion = 'A') THEN
        RAISE EXCEPTION 'No hay turno de caja abierto.';
    END IF;

    CALL usp_recalcular_pedido(p_pedido);

    SELECT SubTotal, Descuento, Servicio, IGV, Total, ID_Mesa,
           COALESCE(p_cliente, ID_Cliente)
      INTO v_sub, v_desc, v_serv, v_igv, v_tot, v_mesa, v_cli
    FROM PEDIDO WHERE ID_Pedido = p_pedido;

    IF p_tipodoc = '01' THEN
        SELECT ID_Empresa INTO v_emp
        FROM CLIENTE WHERE ID_Cliente = v_cli;
        IF v_emp IS NULL THEN
            RAISE EXCEPTION 'Para emitir FACTURA el cliente debe estar asociado a una EMPRESA con RUC.';
        END IF;
    END IF;

    v_rec := COALESCE(p_recibido, v_tot);
    v_vuelto := CASE WHEN v_rec > v_tot THEN v_rec - v_tot ELSE 0 END;

    /* 1. Cabecera de venta */
    INSERT INTO VENTA(ID_Pedido, ID_Cliente, ID_Usuario, ID_AperturaCaja,
                      TipoDocumento, SubTotal, Descuento, Servicio, IGV,
                      Total, Total_Pagado, Vuelto)
    VALUES (p_pedido, v_cli, p_usuario, p_apertura,
            p_tipodoc, v_sub, v_desc, v_serv, v_igv,
            v_tot, v_rec, v_vuelto)
    RETURNING ID_Venta INTO v_venta;

    /* 2. Detalle de venta a partir del detalle del pedido */
    INSERT INTO DETALLE_VENTA(ID_Venta, ID_Producto, Cantidad, Precio, Descuento)
    SELECT v_venta, ID_Producto, Cantidad, Precio_Unitario, Descuento
    FROM DETALLE_PEDIDO
    WHERE ID_Pedido = p_pedido
      AND Estado_Preparacion <> 'A' AND ESTADO = 'A' AND Es_Cortesia = 'N';

    /* 3. Correlativo y comprobante (bloqueo de la serie) */
    SELECT ID_Serie INTO v_serie_id
    FROM SERIE_DOCUMENTO
    WHERE Tipo_Documento = p_tipodoc AND ESTADO = 'A'
    ORDER BY ID_Serie LIMIT 1 FOR UPDATE;

    IF v_serie_id IS NULL THEN
        RAISE EXCEPTION 'No existe serie activa para el tipo de documento indicado.';
    END IF;

    UPDATE SERIE_DOCUMENTO SET Correlativo = Correlativo + 1
    WHERE ID_Serie = v_serie_id
    RETURNING Serie, Correlativo INTO v_serie, v_corr;

    v_num := LPAD(v_corr::TEXT, 8, '0');

    IF p_tipodoc = '03' THEN
        INSERT INTO BOLETA(ID_Venta, Serie, Numero, Cliente_Documento, Cliente_Nombre)
        SELECT v_venta, v_serie, v_num, pe.N_Documento,
               TRIM(COALESCE(pe.Nombre, '') || ' '
                    || COALESCE(pe.Ap_Paterno, '') || ' '
                    || COALESCE(pe.Ap_Materno, ''))
        FROM CLIENTE c LEFT JOIN PERSONA pe ON pe.ID_Persona = c.ID_Persona
        WHERE c.ID_Cliente = v_cli;
    ELSIF p_tipodoc = '01' THEN
        INSERT INTO FACTURA(ID_Venta, ID_Empresa, Serie, Numero)
        VALUES (v_venta, v_emp, v_serie, v_num);
    END IF;

    /* 4. Pago */
    INSERT INTO PAGO_VENTA(ID_Venta, ID_MetodoPago, Monto, Referencia)
    VALUES (v_venta, p_metodo, v_tot, p_ref);

    /* 5. Movimiento de caja */
    SELECT CASE WHEN mp.Afecta_Efectivo = 'S' THEN 1
                WHEN mp.N_MetodoPago IN ('YAPE', 'PLIN') THEN 3
                ELSE 2 END
      INTO v_concepto
    FROM METODO_PAGO mp WHERE mp.ID_MetodoPago = p_metodo;

    CALL usp_registrar_movimiento_caja(
        p_apertura, v_concepto, p_metodo, p_usuario, v_tot,
        'Cobro comprobante', p_pedido, v_venta, p_ref, 'N',
        v_dummy_id, v_dummy_msg);

    /* 6. Cerrar pedido y liberar mesa */
    UPDATE PEDIDO SET
        Facturado = 'S', ID_EstadoPedido = 4, F_Cierre = CURRENT_TIMESTAMP,
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_Pedido = p_pedido;

    IF v_mesa IS NOT NULL THEN
        UPDATE MESA SET ID_EstadoMesa = 1,
            USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
        WHERE ID_Mesa = v_mesa;
    END IF;

    INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro, Valor_Nuevo)
    VALUES (p_usuario, 'VENTA', 'INSERT', v_venta,
            'Comprobante ' || v_serie || '-' || v_num
            || ' por S/ ' || v_tot::TEXT);

    o_id_venta := v_venta;
    o_serie := v_serie;
    o_numero := v_num;
    o_total := v_tot;
    o_vuelto := v_vuelto;
END;
$$;


--
-- Name: usp_login(character varying, character varying); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_login(IN p_logeo character varying, IN p_clave character varying, OUT o_id_usuario integer, OUT o_logeo character varying, OUT o_tipo_usuario character varying, OUT o_empleado character varying, OUT o_cargo character varying, OUT o_mensaje character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id   INT;
    v_hash VARCHAR(200);
BEGIN
    SELECT u.ID_Usuario, u.Clave INTO v_id, v_hash
    FROM USUARIO u
    WHERE u.Logeo = p_logeo AND u.ESTADO = 'A' AND u.Bloqueado = 'N';

    IF v_id IS NULL THEN
        INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, Valor_Nuevo)
        VALUES (NULL, 'USUARIO', 'LOGIN_FALLIDO', 'Logeo: ' || p_logeo);
        o_id_usuario := 0; o_logeo := NULL; o_tipo_usuario := NULL;
        o_empleado := NULL; o_cargo := NULL;
        o_mensaje := 'Usuario inexistente, inactivo o bloqueado';
        RETURN;
    END IF;

    IF v_hash IS DISTINCT FROM encode(digest(p_clave, 'sha256'), 'hex') THEN
        UPDATE USUARIO SET
            Intentos  = Intentos + 1,
            Bloqueado = CASE WHEN Intentos + 1 >= 3 THEN 'S' ELSE 'N' END,
            USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
        WHERE ID_Usuario = v_id;

        INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro, Valor_Nuevo)
        VALUES (v_id, 'USUARIO', 'LOGIN_FALLIDO', v_id, 'Clave incorrecta');

        o_id_usuario := 0; o_logeo := NULL; o_tipo_usuario := NULL;
        o_empleado := NULL; o_cargo := NULL;
        o_mensaje := 'Clave incorrecta';
        RETURN;
    END IF;

    UPDATE USUARIO SET Intentos = 0, F_UltimoAcceso = CURRENT_TIMESTAMP
    WHERE ID_Usuario = v_id;

    INSERT INTO AUDITORIA(ID_Usuario, N_Tabla, Accion, ID_Registro, Valor_Nuevo)
    VALUES (v_id, 'USUARIO', 'LOGIN', v_id, 'Acceso correcto');

    SELECT v_id, u.Logeo, tu.N_TipoUsuario,
           pe.Nombre || ' ' || COALESCE(pe.Ap_Paterno, ''),
           ca.N_Cargo, 'Acceso correcto'
      INTO o_id_usuario, o_logeo, o_tipo_usuario, o_empleado, o_cargo, o_mensaje
    FROM USUARIO u
      INNER JOIN TIPO_USUARIO tu ON tu.ID_TipoUsuario = u.ID_TipoUsuario
      INNER JOIN EMPLEADO e      ON e.ID_Empleado     = u.ID_Empleado
      INNER JOIN PERSONA pe      ON pe.ID_Persona      = e.ID_Persona
      INNER JOIN CARGO ca        ON ca.ID_Cargo        = e.ID_Cargo
    WHERE u.ID_Usuario = v_id;
END;
$$;


--
-- Name: usp_permisos_usuario(integer, refcursor); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_permisos_usuario(IN p_id_usuario integer, INOUT p_ref refcursor)
    LANGUAGE plpgsql
    AS $$
BEGIN
    OPEN p_ref FOR
        SELECT DISTINCT m.N_Modulo, m.Orden, pe.Clave, pe.N_Permiso
        FROM USUARIO_ROL ur
          INNER JOIN ROL_PERMISO rp ON rp.ID_Rol = ur.ID_Rol
                                   AND rp.Concedido = 'S' AND rp.ESTADO = 'A'
          INNER JOIN PERMISO pe     ON pe.ID_Permiso = rp.ID_Permiso
                                   AND pe.ESTADO = 'A'
          INNER JOIN MODULO m       ON m.ID_Modulo  = pe.ID_Modulo
                                   AND m.ESTADO = 'A'
        WHERE ur.ID_Usuario = p_id_usuario
          AND ur.Vigente = 'S' AND ur.ESTADO = 'A'
        ORDER BY m.Orden, pe.Clave;
END;
$$;


--
-- Name: usp_recalcular_pedido(integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_recalcular_pedido(IN p_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_bruto NUMERIC(12,2);
    v_desc  NUMERIC(12,2);
    v_serv  NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_igv   NUMERIC(12,2);
BEGIN
    v_bruto := fn_total_pedido(p_id);

    SELECT Descuento INTO v_desc FROM PEDIDO WHERE ID_Pedido = p_id;
    v_desc := COALESCE(v_desc, 0);

    SELECT (v_bruto - v_desc) * COALESCE(tm.Cargo_Servicio, 0) / 100.0
      INTO v_serv
    FROM PEDIDO pd
      LEFT JOIN MESA m      ON m.ID_Mesa = pd.ID_Mesa
      LEFT JOIN TIPO_MESA tm ON tm.ID_TipoMesa = m.ID_TipoMesa
    WHERE pd.ID_Pedido = p_id;

    v_serv := COALESCE(v_serv, 0);

    v_total := v_bruto - v_desc + v_serv;
    v_igv   := v_total - (v_total / 1.18);

    UPDATE PEDIDO SET
        SubTotal = v_total / 1.18,
        Servicio = v_serv,
        IGV      = v_igv,
        Total    = v_total,
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_Pedido = p_id;
END;
$$;


--
-- Name: usp_registrar_movimiento_caja(integer, integer, integer, integer, numeric, character varying, integer, integer, character varying, character); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.usp_registrar_movimiento_caja(IN p_id_apertura integer, IN p_id_concepto integer, IN p_id_metodo integer, IN p_id_usuario integer, IN p_monto numeric, IN p_descripcion character varying, IN p_id_pedido integer, IN p_id_venta integer, IN p_numero_op character varying, IN p_retornar character, OUT o_id_mov integer, OUT o_mensaje character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_tipo   INT;
    v_signo  CHAR(1);
    v_afecta CHAR(1);
    v_id     INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM APERTURA_CAJA
                   WHERE ID_AperturaCaja = p_id_apertura AND Situacion = 'A') THEN
        RAISE EXCEPTION 'El turno de caja no esta abierto.';
    END IF;

    SELECT cc.ID_TipoMovimiento, tm.Signo,
           CASE WHEN cc.Afecta_Efectivo = 'S' AND mp.Afecta_Efectivo = 'S'
                THEN 'S' ELSE 'N' END
      INTO v_tipo, v_signo, v_afecta
    FROM CONCEPTO_CAJA cc
      INNER JOIN TIPO_MOVIMIENTO_CAJA tm ON tm.ID_TipoMovimiento = cc.ID_TipoMovimiento
      CROSS JOIN METODO_PAGO mp
    WHERE cc.ID_Concepto = p_id_concepto
      AND mp.ID_MetodoPago = p_id_metodo;

    IF v_tipo IS NULL THEN
        RAISE EXCEPTION 'Concepto o metodo de pago inexistente.';
    END IF;

    INSERT INTO MOVIMIENTO_CAJA(ID_AperturaCaja, ID_TipoMovimiento, ID_Concepto,
                                ID_MetodoPago, ID_Usuario, ID_Pedido, ID_Venta,
                                Numero_Operacion, Descripcion, Monto, Afecta_Efectivo)
    VALUES (p_id_apertura, v_tipo, p_id_concepto, p_id_metodo,
            p_id_usuario, p_id_pedido, p_id_venta, p_numero_op, p_descripcion,
            p_monto, v_afecta)
    RETURNING ID_MovimientoCaja INTO v_id;

    UPDATE APERTURA_CAJA SET
        Total_Ingresos = Total_Ingresos + CASE WHEN v_signo = '+' THEN p_monto ELSE 0 END,
        Total_Egresos  = Total_Egresos  + CASE WHEN v_signo = '-' THEN p_monto ELSE 0 END,
        Monto_Sistema  = Monto_Sistema  + CASE WHEN v_afecta = 'S'
                                              THEN CASE WHEN v_signo = '+' THEN p_monto ELSE -p_monto END
                                              ELSE 0 END,
        USUMOD = current_user, PCMOD = NULL, FECMOD = CURRENT_TIMESTAMP
    WHERE ID_AperturaCaja = p_id_apertura;

    o_id_mov := v_id;
    o_mensaje := 'Movimiento registrado';
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ambiente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ambiente (
    id_ambiente integer NOT NULL,
    n_ambiente character varying(50) NOT NULL,
    descripcion character varying(100),
    piso integer,
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_ambiente_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: ambiente_id_ambiente_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ambiente ALTER COLUMN id_ambiente ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ambiente_id_ambiente_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: apertura_caja; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apertura_caja (
    id_aperturacaja integer NOT NULL,
    id_caja integer NOT NULL,
    id_usuario integer NOT NULL,
    id_usuariocierre integer,
    numero_turno character varying(20) NOT NULL,
    f_apertura timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    f_cierre timestamp without time zone,
    monto_inicial numeric(12,2) DEFAULT 0 NOT NULL,
    total_ingresos numeric(12,2) DEFAULT 0 NOT NULL,
    total_egresos numeric(12,2) DEFAULT 0 NOT NULL,
    monto_sistema numeric(12,2) DEFAULT 0 NOT NULL,
    monto_declarado numeric(12,2) DEFAULT 0 NOT NULL,
    diferencia numeric(12,2) DEFAULT 0 NOT NULL,
    situacion character(1) DEFAULT 'A'::bpchar NOT NULL,
    observacion character varying(200),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_apecaja_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_apecaja_sit CHECK ((situacion = ANY (ARRAY['A'::bpchar, 'C'::bpchar])))
);


--
-- Name: apertura_caja_id_aperturacaja_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.apertura_caja ALTER COLUMN id_aperturacaja ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.apertura_caja_id_aperturacaja_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    id_auditoria bigint NOT NULL,
    id_usuario integer,
    n_tabla character varying(50) NOT NULL,
    accion character varying(20) NOT NULL,
    id_registro integer,
    valor_anterior text,
    valor_nuevo text,
    f_evento timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip character varying(20),
    terminal character varying(30),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_auditoria_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auditoria ALTER COLUMN id_auditoria ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auditoria_id_auditoria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: boleta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boleta (
    id_boleta integer NOT NULL,
    id_venta integer NOT NULL,
    serie character(4) NOT NULL,
    numero character(8) NOT NULL,
    f_emision timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cliente_documento character varying(15),
    cliente_nombre character varying(200),
    hash_cpe character varying(100),
    estado_sunat character varying(20),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_boleta_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: boleta_id_boleta_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.boleta ALTER COLUMN id_boleta ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.boleta_id_boleta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: caja; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.caja (
    id_caja integer NOT NULL,
    n_caja character varying(50) NOT NULL,
    descripcion character varying(100),
    ubicacion character varying(100),
    serie_terminal character varying(30),
    moneda character(3) DEFAULT 'PEN'::bpchar NOT NULL,
    monto_base numeric(12,2) DEFAULT 0 NOT NULL,
    aperturada character(1) DEFAULT 'N'::bpchar NOT NULL,
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_caja_ape CHECK ((aperturada = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_caja_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: caja_id_caja_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.caja ALTER COLUMN id_caja ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.caja_id_caja_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cargo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    n_cargo character varying(40) NOT NULL,
    area character varying(40),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_cargo_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: cargo_id_cargo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cargo ALTER COLUMN id_cargo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.cargo_id_cargo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categoria_producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_producto (
    id_categoriaproducto integer NOT NULL,
    n_categoriaproducto character varying(50) NOT NULL,
    descripcion character varying(100),
    area_despacho character varying(20) DEFAULT 'COCINA'::character varying NOT NULL,
    orden_carta integer DEFAULT 0 NOT NULL,
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_catprod_area CHECK (((area_despacho)::text = ANY ((ARRAY['COCINA'::character varying, 'BARRA'::character varying])::text[]))),
    CONSTRAINT ck_catprod_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: categoria_producto_id_categoriaproducto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categoria_producto ALTER COLUMN id_categoriaproducto ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.categoria_producto_id_categoriaproducto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    id_cliente integer NOT NULL,
    id_persona integer,
    id_empresa integer,
    codigo_cliente character varying(15),
    tipo_cliente character(1) DEFAULT 'N'::bpchar NOT NULL,
    puntos integer DEFAULT 0 NOT NULL,
    f_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_cliente_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_cliente_tipo CHECK ((tipo_cliente = ANY (ARRAY['N'::bpchar, 'J'::bpchar]))),
    CONSTRAINT ck_cliente_xor CHECK ((((id_persona IS NOT NULL) AND (id_empresa IS NULL)) OR ((id_persona IS NULL) AND (id_empresa IS NOT NULL))))
);


--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cliente ALTER COLUMN id_cliente ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.cliente_id_cliente_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: concepto_caja; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.concepto_caja (
    id_concepto integer NOT NULL,
    id_tipomovimiento integer NOT NULL,
    n_concepto character varying(60) NOT NULL,
    descripcion character varying(150),
    afecta_efectivo character(1) DEFAULT 'S'::bpchar NOT NULL,
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_concaja_afe CHECK ((afecta_efectivo = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_concaja_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: concepto_caja_id_concepto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.concepto_caja ALTER COLUMN id_concepto ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.concepto_caja_id_concepto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: contrato; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contrato (
    id_contrato integer NOT NULL,
    n_contrato character varying(40) NOT NULL,
    descripcion character varying(100),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_contrato_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: contrato_id_contrato_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.contrato ALTER COLUMN id_contrato ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.contrato_id_contrato_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: departamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departamento (
    id_departamento integer NOT NULL,
    n_departamento character varying(30) NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_departamento_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: departamento_id_departamento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.departamento ALTER COLUMN id_departamento ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.departamento_id_departamento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: detalle_pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_pedido (
    id_detallepedido integer NOT NULL,
    id_pedido integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT 0 NOT NULL,
    sub_total numeric(12,2) GENERATED ALWAYS AS (((cantidad * precio_unitario) - descuento)) STORED,
    nota_cocina character varying(150),
    estado_preparacion character(1) DEFAULT 'P'::bpchar NOT NULL,
    es_cortesia character(1) DEFAULT 'N'::bpchar NOT NULL,
    f_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    f_atencion timestamp without time zone,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_detped_can CHECK ((cantidad > (0)::numeric)),
    CONSTRAINT ck_detped_cor CHECK ((es_cortesia = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_detped_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_detped_prep CHECK ((estado_preparacion = ANY (ARRAY['P'::bpchar, 'E'::bpchar, 'S'::bpchar, 'A'::bpchar])))
);


--
-- Name: detalle_pedido_id_detallepedido_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.detalle_pedido ALTER COLUMN id_detallepedido ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.detalle_pedido_id_detallepedido_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: detalle_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_venta (
    id_detalle integer NOT NULL,
    id_venta integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    precio numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT 0 NOT NULL,
    sub_total numeric(12,2) GENERATED ALWAYS AS (((cantidad * precio) - descuento)) STORED,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_detven_can CHECK ((cantidad > (0)::numeric)),
    CONSTRAINT ck_detven_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: detalle_venta_id_detalle_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.detalle_venta ALTER COLUMN id_detalle ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.detalle_venta_id_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: distrito; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.distrito (
    id_distrito integer NOT NULL,
    id_provincia integer NOT NULL,
    d_distrito character varying(40) NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_distrito_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: distrito_id_distrito_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.distrito ALTER COLUMN id_distrito ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.distrito_id_distrito_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: empleado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empleado (
    id_empleado integer NOT NULL,
    id_persona integer NOT NULL,
    id_contrato integer NOT NULL,
    id_cargo integer NOT NULL,
    salario numeric(8,2) DEFAULT 0 NOT NULL,
    turno character varying(18),
    fondo_pension character(3),
    n_hijos character(1),
    essalud character(6),
    f_ingreso date,
    f_cese date,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_empleado_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: empleado_id_empleado_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.empleado ALTER COLUMN id_empleado ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.empleado_id_empleado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresa (
    id_empresa integer NOT NULL,
    id_distrito integer,
    ruc character(11) NOT NULL,
    razon_social character varying(140) NOT NULL,
    nombre_comercial character varying(140),
    direccion character varying(150),
    telefono character varying(15),
    email character varying(50),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_empresa_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: empresa_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.empresa ALTER COLUMN id_empresa ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.empresa_id_empresa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estado_mesa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_mesa (
    id_estadomesa integer NOT NULL,
    descripcion character varying(50) NOT NULL,
    color character varying(10),
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_estmesa_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: estado_mesa_id_estadomesa_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.estado_mesa ALTER COLUMN id_estadomesa ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.estado_mesa_id_estadomesa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estado_pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estado_pedido (
    id_estadopedido integer NOT NULL,
    descripcion character varying(50) NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    color character varying(10),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_estped_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: estado_pedido_id_estadopedido_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.estado_pedido ALTER COLUMN id_estadopedido ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.estado_pedido_id_estadopedido_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: factura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factura (
    id_factura integer NOT NULL,
    id_venta integer NOT NULL,
    id_empresa integer NOT NULL,
    serie character(4) NOT NULL,
    numero character(8) NOT NULL,
    f_emision timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    f_vencimiento date,
    condicion_pago character varying(20) DEFAULT 'CONTADO'::character varying NOT NULL,
    orden_compra character varying(30),
    hash_cpe character varying(100),
    estado_sunat character varying(20),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_factura_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: factura_id_factura_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.factura ALTER COLUMN id_factura ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.factura_id_factura_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mesa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesa (
    id_mesa integer NOT NULL,
    id_estadomesa integer NOT NULL,
    id_ambiente integer NOT NULL,
    id_tipomesa integer NOT NULL,
    numero character varying(5) NOT NULL,
    detalle character varying(100),
    capacidad integer DEFAULT 4 NOT NULL,
    codigo_qr character varying(60),
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_mesa_cap CHECK ((capacidad > 0)),
    CONSTRAINT ck_mesa_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: mesa_id_mesa_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.mesa ALTER COLUMN id_mesa ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mesa_id_mesa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: metodo_pago; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metodo_pago (
    id_metodopago integer NOT NULL,
    n_metodopago character varying(30) NOT NULL,
    afecta_efectivo character(1) DEFAULT 'N'::bpchar NOT NULL,
    requiere_referencia character(1) DEFAULT 'N'::bpchar NOT NULL,
    comision numeric(5,2) DEFAULT 0 NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_metpag_afe CHECK ((afecta_efectivo = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_metpag_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: metodo_pago_id_metodopago_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.metodo_pago ALTER COLUMN id_metodopago ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.metodo_pago_id_metodopago_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modulo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modulo (
    id_modulo integer NOT NULL,
    n_modulo character varying(50) NOT NULL,
    descripcion character varying(100),
    icono character varying(50),
    orden integer DEFAULT 0 NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_modulo_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: modulo_id_modulo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.modulo ALTER COLUMN id_modulo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.modulo_id_modulo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: movimiento_caja; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimiento_caja (
    id_movimientocaja integer NOT NULL,
    id_aperturacaja integer NOT NULL,
    id_tipomovimiento integer NOT NULL,
    id_concepto integer NOT NULL,
    id_metodopago integer NOT NULL,
    id_usuario integer NOT NULL,
    id_pedido integer,
    id_venta integer,
    numero_operacion character varying(30),
    documento character varying(200),
    descripcion character varying(200),
    monto numeric(12,2) NOT NULL,
    afecta_efectivo character(1) DEFAULT 'S'::bpchar NOT NULL,
    f_movimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip character varying(20),
    terminal character varying(30),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_movcaja_afe CHECK ((afecta_efectivo = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_movcaja_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_movcaja_mon CHECK ((monto > (0)::numeric))
);


--
-- Name: movimiento_caja_id_movimientocaja_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.movimiento_caja ALTER COLUMN id_movimientocaja ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.movimiento_caja_id_movimientocaja_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: movimiento_inventario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimiento_inventario (
    id_movimientoinv bigint NOT NULL,
    id_producto integer NOT NULL,
    id_usuario integer NOT NULL,
    id_pedido integer,
    tipo_movimiento character(1) NOT NULL,
    cantidad numeric(12,3) NOT NULL,
    stock_anterior numeric(12,3) NOT NULL,
    stock_nuevo numeric(12,3) NOT NULL,
    costo_unitario numeric(10,2) DEFAULT 0 NOT NULL,
    documento character varying(50),
    observacion character varying(200),
    f_movimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_movinv_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_movinv_tip CHECK ((tipo_movimiento = ANY (ARRAY['E'::bpchar, 'S'::bpchar, 'A'::bpchar, 'M'::bpchar])))
);


--
-- Name: movimiento_inventario_id_movimientoinv_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.movimiento_inventario ALTER COLUMN id_movimientoinv ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.movimiento_inventario_id_movimientoinv_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nota_credito; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nota_credito (
    id_notacredito integer NOT NULL,
    id_venta integer NOT NULL,
    serie character(4) NOT NULL,
    numero character(8) NOT NULL,
    tipo_doc_referencia character(2) NOT NULL,
    serie_referencia character(4) NOT NULL,
    numero_referencia character(8) NOT NULL,
    motivo character varying(200) NOT NULL,
    monto numeric(12,2) NOT NULL,
    f_emision timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado_sunat character varying(20),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_notacre_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: nota_credito_id_notacredito_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.nota_credito ALTER COLUMN id_notacredito ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.nota_credito_id_notacredito_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pago_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pago_venta (
    id_pago integer NOT NULL,
    id_venta integer NOT NULL,
    id_metodopago integer NOT NULL,
    monto numeric(12,2) NOT NULL,
    referencia character varying(50),
    ultimos_digitos character(4),
    f_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_pagven_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_pagven_mon CHECK ((monto > (0)::numeric))
);


--
-- Name: pago_venta_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pago_venta ALTER COLUMN id_pago ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.pago_venta_id_pago_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido (
    id_pedido integer NOT NULL,
    numero_pedido character varying(15) NOT NULL,
    id_cliente integer,
    id_mesa integer,
    id_tipopedido integer NOT NULL,
    id_estadopedido integer NOT NULL,
    id_usuario integer NOT NULL,
    id_empleado integer,
    f_pedido timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    f_cierre timestamp without time zone,
    n_comensales integer DEFAULT 1 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    descuento numeric(12,2) DEFAULT 0 NOT NULL,
    servicio numeric(12,2) DEFAULT 0 NOT NULL,
    igv numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    facturado character(1) DEFAULT 'N'::bpchar NOT NULL,
    anulado character(1) DEFAULT 'N'::bpchar NOT NULL,
    motivo_anulacion character varying(200),
    observacion character varying(200),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_pedido_anu CHECK ((anulado = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_pedido_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_pedido_fac CHECK ((facturado = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_pedido_tot CHECK ((total >= (0)::numeric))
);


--
-- Name: pedido_delivery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_delivery (
    id_pedidodelivery integer NOT NULL,
    id_pedido integer NOT NULL,
    id_distrito integer,
    id_empleado integer,
    direccion_entrega character varying(150) NOT NULL,
    referencia character varying(150),
    telefono_contacto character(9),
    costo_envio numeric(10,2) DEFAULT 0 NOT NULL,
    f_salida timestamp without time zone,
    f_entrega timestamp without time zone,
    situacion character(1) DEFAULT 'P'::bpchar NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_peddel_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_peddel_sit CHECK ((situacion = ANY (ARRAY['P'::bpchar, 'R'::bpchar, 'E'::bpchar, 'C'::bpchar])))
);


--
-- Name: pedido_delivery_id_pedidodelivery_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pedido_delivery ALTER COLUMN id_pedidodelivery ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.pedido_delivery_id_pedidodelivery_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pedido_id_pedido_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pedido ALTER COLUMN id_pedido ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.pedido_id_pedido_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permiso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permiso (
    id_permiso integer NOT NULL,
    id_modulo integer NOT NULL,
    n_permiso character varying(50) NOT NULL,
    clave character varying(50) NOT NULL,
    descripcion character varying(100),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_permiso_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.permiso ALTER COLUMN id_permiso ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.permiso_id_permiso_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: persona; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.persona (
    id_persona integer NOT NULL,
    id_distrito integer,
    id_tipoidentidad integer NOT NULL,
    n_documento character varying(15) NOT NULL,
    nombre character varying(80) NOT NULL,
    ap_paterno character varying(80),
    ap_materno character varying(80),
    f_nacimiento date,
    email character varying(50),
    celular character(9),
    genero character(1),
    direccion character varying(100),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_persona_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_persona_gen CHECK ((genero = ANY (ARRAY['M'::bpchar, 'F'::bpchar, 'O'::bpchar])))
);


--
-- Name: persona_id_persona_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.persona ALTER COLUMN id_persona ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.persona_id_persona_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto (
    id_producto integer NOT NULL,
    id_categoriaproducto integer NOT NULL,
    id_unidad integer NOT NULL,
    codigo character varying(20),
    n_producto character varying(50) NOT NULL,
    detalle character varying(150),
    precio numeric(8,2) NOT NULL,
    costo numeric(8,2) DEFAULT 0 NOT NULL,
    marca character varying(50),
    tipo_producto character(1) DEFAULT 'P'::bpchar NOT NULL,
    tiempo_preparacion integer,
    controla_stock character(1) DEFAULT 'N'::bpchar NOT NULL,
    stock_actual numeric(12,2) DEFAULT 0 NOT NULL,
    stock_minimo numeric(12,2) DEFAULT 0 NOT NULL,
    afecto_igv character(1) DEFAULT 'S'::bpchar NOT NULL,
    disponible character(1) DEFAULT 'S'::bpchar NOT NULL,
    imagen character varying(200),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_producto_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_producto_pre CHECK ((precio >= (0)::numeric)),
    CONSTRAINT ck_producto_tipo CHECK ((tipo_producto = ANY (ARRAY['P'::bpchar, 'B'::bpchar, 'I'::bpchar])))
);


--
-- Name: producto_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.producto ALTER COLUMN id_producto ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.producto_id_producto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: provincia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provincia (
    id_provincia integer NOT NULL,
    id_departamento integer NOT NULL,
    n_provincia character varying(30) NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_provincia_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: provincia_id_provincia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.provincia ALTER COLUMN id_provincia ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.provincia_id_provincia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: receta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receta (
    id_receta integer NOT NULL,
    id_producto integer NOT NULL,
    id_insumo integer NOT NULL,
    cantidad numeric(10,3) NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_receta_can CHECK ((cantidad > (0)::numeric)),
    CONSTRAINT ck_receta_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: receta_id_receta_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.receta ALTER COLUMN id_receta ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.receta_id_receta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reserva; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reserva (
    id_reserva integer NOT NULL,
    id_cliente integer NOT NULL,
    id_mesa integer,
    id_usuario integer NOT NULL,
    f_reserva timestamp without time zone NOT NULL,
    n_personas integer DEFAULT 2 NOT NULL,
    adelanto numeric(10,2) DEFAULT 0 NOT NULL,
    situacion character(1) DEFAULT 'P'::bpchar NOT NULL,
    observacion character varying(200),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_reserva_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_reserva_sit CHECK ((situacion = ANY (ARRAY['P'::bpchar, 'C'::bpchar, 'A'::bpchar, 'X'::bpchar])))
);


--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reserva ALTER COLUMN id_reserva ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reserva_id_reserva_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rol (
    id_rol integer NOT NULL,
    n_rol character varying(50) NOT NULL,
    descripcion character varying(100),
    nivel integer DEFAULT 1 NOT NULL,
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_rol_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rol ALTER COLUMN id_rol ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rol_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol_permiso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rol_permiso (
    id_rolpermiso integer NOT NULL,
    id_rol integer NOT NULL,
    id_permiso integer NOT NULL,
    concedido character(1) DEFAULT 'S'::bpchar NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_rolper_conc CHECK ((concedido = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_rolper_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: rol_permiso_id_rolpermiso_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rol_permiso ALTER COLUMN id_rolpermiso ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rol_permiso_id_rolpermiso_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: serie_documento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.serie_documento (
    id_serie integer NOT NULL,
    id_caja integer,
    tipo_documento character(2) NOT NULL,
    serie character(4) NOT NULL,
    correlativo integer DEFAULT 0 NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_seriedoc_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: serie_documento_id_serie_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.serie_documento ALTER COLUMN id_serie ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.serie_documento_id_serie_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipo_identidad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_identidad (
    id_tipoidentidad integer NOT NULL,
    n_tipoidentidad character varying(20) NOT NULL,
    abreviatura character varying(10) NOT NULL,
    longitud integer NOT NULL,
    codigo_sunat character(1),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_tipoident_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: tipo_identidad_id_tipoidentidad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tipo_identidad ALTER COLUMN id_tipoidentidad ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tipo_identidad_id_tipoidentidad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipo_mesa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_mesa (
    id_tipomesa integer NOT NULL,
    descripcion character varying(80) NOT NULL,
    cargo_servicio numeric(5,2) DEFAULT 0 NOT NULL,
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_tipomesa_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: tipo_mesa_id_tipomesa_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tipo_mesa ALTER COLUMN id_tipomesa ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tipo_mesa_id_tipomesa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipo_movimiento_caja; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_movimiento_caja (
    id_tipomovimiento integer NOT NULL,
    n_tipomovimiento character varying(30) NOT NULL,
    abreviatura character varying(10) NOT NULL,
    signo character(1) NOT NULL,
    f_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_tipmov_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_tipmov_sig CHECK ((signo = ANY (ARRAY['+'::bpchar, '-'::bpchar])))
);


--
-- Name: tipo_movimiento_caja_id_tipomovimiento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tipo_movimiento_caja ALTER COLUMN id_tipomovimiento ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tipo_movimiento_caja_id_tipomovimiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipo_pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_pedido (
    id_tipopedido integer NOT NULL,
    n_tipopedido character varying(30) NOT NULL,
    abreviatura character varying(10) NOT NULL,
    requiere_mesa character(1) DEFAULT 'N'::bpchar NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_tipoped_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_tipoped_mesa CHECK ((requiere_mesa = ANY (ARRAY['S'::bpchar, 'N'::bpchar])))
);


--
-- Name: tipo_pedido_id_tipopedido_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tipo_pedido ALTER COLUMN id_tipopedido ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tipo_pedido_id_tipopedido_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipo_usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_usuario (
    id_tipousuario integer NOT NULL,
    n_tipousuario character varying(50) NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_tipousu_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: tipo_usuario_id_tipousuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tipo_usuario ALTER COLUMN id_tipousuario ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tipo_usuario_id_tipousuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: unidad_medida; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unidad_medida (
    id_unidad integer NOT NULL,
    n_unidad character varying(30) NOT NULL,
    abreviatura character varying(10) NOT NULL,
    codigo_sunat character varying(5),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_unidad_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: unidad_medida_id_unidad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.unidad_medida ALTER COLUMN id_unidad ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.unidad_medida_id_unidad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    id_tipousuario integer NOT NULL,
    id_empleado integer NOT NULL,
    logeo character varying(30) NOT NULL,
    clave character varying(200) NOT NULL,
    intentos integer DEFAULT 0 NOT NULL,
    bloqueado character(1) DEFAULT 'N'::bpchar NOT NULL,
    f_ultimoacceso timestamp without time zone,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_usuario_blq CHECK ((bloqueado = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_usuario_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar])))
);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.usuario ALTER COLUMN id_usuario ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuario_rol; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario_rol (
    id_usuariorol integer NOT NULL,
    id_usuario integer NOT NULL,
    id_rol integer NOT NULL,
    f_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vigente character(1) DEFAULT 'S'::bpchar NOT NULL,
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_usurol_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_usurol_vig CHECK ((vigente = ANY (ARRAY['S'::bpchar, 'N'::bpchar])))
);


--
-- Name: usuario_rol_id_usuariorol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.usuario_rol ALTER COLUMN id_usuariorol ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.usuario_rol_id_usuariorol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venta (
    id_venta integer NOT NULL,
    id_pedido integer NOT NULL,
    id_cliente integer,
    id_usuario integer NOT NULL,
    id_aperturacaja integer NOT NULL,
    f_venta timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipodocumento character(2) NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    descuento numeric(12,2) DEFAULT 0 NOT NULL,
    servicio numeric(12,2) DEFAULT 0 NOT NULL,
    igv numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    total_pagado numeric(12,2) DEFAULT 0 NOT NULL,
    vuelto numeric(12,2) DEFAULT 0 NOT NULL,
    anulada character(1) DEFAULT 'N'::bpchar NOT NULL,
    motivo_anulacion character varying(200),
    usucre character varying(30) DEFAULT CURRENT_USER NOT NULL,
    pccre character varying(30),
    feccre timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usumod character varying(30),
    pcmod character varying(30),
    fecmod timestamp without time zone,
    estado character(1) DEFAULT 'A'::bpchar NOT NULL,
    CONSTRAINT ck_venta_anu CHECK ((anulada = ANY (ARRAY['S'::bpchar, 'N'::bpchar]))),
    CONSTRAINT ck_venta_est CHECK ((estado = ANY (ARRAY['A'::bpchar, 'I'::bpchar, 'E'::bpchar]))),
    CONSTRAINT ck_venta_tdoc CHECK ((tipodocumento = ANY (ARRAY['01'::bpchar, '03'::bpchar, 'TK'::bpchar])))
);


--
-- Name: venta_id_venta_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.venta ALTER COLUMN id_venta ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.venta_id_venta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vw_arqueo_caja; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_arqueo_caja AS
 SELECT ac.id_aperturacaja,
    c.n_caja,
    ac.numero_turno,
    ac.f_apertura,
    ac.f_cierre,
    ua.logeo AS usuario_apertura,
    uc.logeo AS usuario_cierre,
    ac.monto_inicial,
    ac.total_ingresos,
    ac.total_egresos,
    ac.monto_sistema,
    ac.monto_declarado,
    ac.diferencia,
    ac.situacion
   FROM (((public.apertura_caja ac
     JOIN public.caja c ON ((c.id_caja = ac.id_caja)))
     JOIN public.usuario ua ON ((ua.id_usuario = ac.id_usuario)))
     LEFT JOIN public.usuario uc ON ((uc.id_usuario = ac.id_usuariocierre)));


--
-- Name: vw_clientes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_clientes AS
 SELECT c.id_cliente,
    c.codigo_cliente,
    c.tipo_cliente,
        CASE
            WHEN (c.tipo_cliente = 'N'::bpchar) THEN (TRIM(BOTH FROM (((((COALESCE(p.nombre, ''::character varying))::text || ' '::text) || (COALESCE(p.ap_paterno, ''::character varying))::text) || ' '::text) || (COALESCE(p.ap_materno, ''::character varying))::text)))::character varying
            ELSE e.razon_social
        END AS cliente,
        CASE
            WHEN (c.tipo_cliente = 'N'::bpchar) THEN (p.n_documento)::bpchar
            ELSE e.ruc
        END AS documento,
        CASE
            WHEN (c.tipo_cliente = 'N'::bpchar) THEN p.direccion
            ELSE e.direccion
        END AS direccion,
        CASE
            WHEN (c.tipo_cliente = 'N'::bpchar) THEN (p.celular)::character varying
            ELSE e.telefono
        END AS telefono,
    c.puntos,
    c.estado
   FROM ((public.cliente c
     LEFT JOIN public.persona p ON ((p.id_persona = c.id_persona)))
     LEFT JOIN public.empresa e ON ((e.id_empresa = c.id_empresa)));


--
-- Name: vw_comanda_cocina; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_comanda_cocina AS
 SELECT p.id_pedido,
    p.numero_pedido,
    COALESCE(m.numero, 'S/M'::character varying) AS mesa,
    a.n_ambiente,
    cp.area_despacho,
    pr.n_producto,
    dp.cantidad,
    dp.nota_cocina,
    dp.estado_preparacion,
    dp.f_solicitud,
    ((EXTRACT(epoch FROM (CURRENT_TIMESTAMP - (dp.f_solicitud)::timestamp with time zone)) / (60)::numeric))::integer AS minutos_espera
   FROM (((((public.detalle_pedido dp
     JOIN public.pedido p ON ((p.id_pedido = dp.id_pedido)))
     JOIN public.producto pr ON ((pr.id_producto = dp.id_producto)))
     JOIN public.categoria_producto cp ON ((cp.id_categoriaproducto = pr.id_categoriaproducto)))
     LEFT JOIN public.mesa m ON ((m.id_mesa = p.id_mesa)))
     LEFT JOIN public.ambiente a ON ((a.id_ambiente = m.id_ambiente)))
  WHERE ((dp.estado_preparacion = ANY (ARRAY['P'::bpchar, 'E'::bpchar])) AND (p.anulado = 'N'::bpchar));


--
-- Name: vw_mapa_mesas; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_mapa_mesas AS
 SELECT m.id_mesa,
    a.n_ambiente,
    m.numero,
    m.capacidad,
    em.descripcion AS estado_mesa,
    em.color,
    p.id_pedido,
    p.numero_pedido,
    p.total AS consumo_actual
   FROM (((public.mesa m
     JOIN public.ambiente a ON ((a.id_ambiente = m.id_ambiente)))
     JOIN public.estado_mesa em ON ((em.id_estadomesa = m.id_estadomesa)))
     LEFT JOIN public.pedido p ON (((p.id_mesa = m.id_mesa) AND (p.facturado = 'N'::bpchar) AND (p.anulado = 'N'::bpchar))))
  WHERE (m.estado = 'A'::bpchar);


--
-- Name: vw_productos_mas_vendidos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_productos_mas_vendidos AS
 SELECT pr.id_producto,
    pr.n_producto,
    cp.n_categoriaproducto,
    sum(dv.cantidad) AS cantidad_vendida,
    sum(dv.sub_total) AS importe_vendido
   FROM (((public.detalle_venta dv
     JOIN public.venta v ON (((v.id_venta = dv.id_venta) AND (v.anulada = 'N'::bpchar))))
     JOIN public.producto pr ON ((pr.id_producto = dv.id_producto)))
     JOIN public.categoria_producto cp ON ((cp.id_categoriaproducto = pr.id_categoriaproducto)))
  GROUP BY pr.id_producto, pr.n_producto, cp.n_categoriaproducto
  ORDER BY (sum(dv.cantidad)) DESC;


--
-- Name: vw_ventas_diarias; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_ventas_diarias AS
 SELECT (f_venta)::date AS fecha,
    tipodocumento,
    count(*) AS n_comprobantes,
    sum(subtotal) AS subtotal,
    sum(igv) AS igv,
    sum(total) AS total
   FROM public.venta v
  WHERE ((anulada = 'N'::bpchar) AND (estado = 'A'::bpchar))
  GROUP BY ((f_venta)::date), tipodocumento;


--
-- Data for Name: ambiente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ambiente (id_ambiente, n_ambiente, descripcion, piso, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	SALON PRINCIPAL	Área central de atención	1	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	TERRAZA	Área al aire libre	1	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	BARRA	Atención en barra	1	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	SALA VIP	Ambiente privado para eventos	2	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: apertura_caja; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.apertura_caja (id_aperturacaja, id_caja, id_usuario, id_usuariocierre, numero_turno, f_apertura, f_cierre, monto_inicial, total_ingresos, total_egresos, monto_sistema, monto_declarado, diferencia, situacion, observacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	1	20260924-1	2026-09-24 12:34:18.039154	2026-09-24 12:34:18.039154	200.00	129.00	0.00	329.00	329.00	0.00	C	Cierre de prueba	postgres	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	A
\.


--
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auditoria (id_auditoria, id_usuario, n_tabla, accion, id_registro, valor_anterior, valor_nuevo, f_evento, ip, terminal, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	APERTURA_CAJA	INSERT	1	\N	Apertura con S/ 200.00	2026-09-24 12:34:18.039154	\N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	VENTA	INSERT	1	\N	Comprobante B001-00000001 por S/ 129.00	2026-09-24 12:34:18.039154	\N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	APERTURA_CAJA	UPDATE	1	\N	Cierre. Sistema: 329.00 Declarado: 329.00	2026-09-24 12:34:18.039154	\N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: boleta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.boleta (id_boleta, id_venta, serie, numero, f_emision, cliente_documento, cliente_nombre, hash_cpe, estado_sunat, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	B001	00000001	2026-09-24 12:34:18.039154	00000000	CLIENTES VARIOS	\N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: caja; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.caja (id_caja, n_caja, descripcion, ubicacion, serie_terminal, moneda, monto_base, aperturada, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
2	CAJA 02	Caja de barra	Barra	TERM-002	PEN	100.00	N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
1	CAJA 01	Caja principal del salón	Ingreso principal	TERM-001	PEN	200.00	N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	A
\.


--
-- Data for Name: cargo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cargo (id_cargo, n_cargo, area, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	ADMINISTRADOR	Administración	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	CAJERO	Caja	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	MOZO	Salón	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	CHEF	Cocina	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	AYUDANTE DE COCINA	Cocina	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	BARMAN	Barra	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	REPARTIDOR	Delivery	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: categoria_producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categoria_producto (id_categoriaproducto, n_categoriaproducto, descripcion, area_despacho, orden_carta, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	ENTRADAS	Piqueos y entradas frías o calientes	COCINA	1	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	PLATOS DE FONDO	Platos principales de la carta	COCINA	2	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	CRIOLLOS	Comida criolla peruana	COCINA	3	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	MARINOS	Cebiches y platos marinos	COCINA	4	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	BEBIDAS FRIAS	Gaseosas, jugos y refrescos	BARRA	5	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	BEBIDAS CALIENTES	Café, té e infusiones	BARRA	6	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	LICORES	Cervezas, piscos y cócteles	BARRA	7	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	POSTRES	Dulces y postres	COCINA	8	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
9	INSUMOS	Insumos de almacén (no se venden)	COCINA	99	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cliente (id_cliente, id_persona, id_empresa, codigo_cliente, tipo_cliente, puntos, f_registro, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	2	\N	CLI-0001	N	0	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	\N	1	CLI-0002	J	0	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: concepto_caja; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.concepto_caja (id_concepto, id_tipomovimiento, n_concepto, descripcion, afecta_efectivo, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	VENTA AL CONTADO	Cobro de comprobante emitido	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	COBRO CON TARJETA	Cobro con POS	N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	COBRO BILLETERA DIGITAL	Yape / Plin	N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	1	ADELANTO DE RESERVA	Adelanto por reserva de mesa	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	1	FONDO FIJO	Reposición de fondo fijo	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	1	PROPINA	Propina recibida	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	2	COMPRA DE INSUMOS	Compra menor de insumos	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	2	PAGO DE SERVICIOS	Agua, luz, internet	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
9	2	ADELANTO DE PERSONAL	Adelanto de sueldo	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
10	2	DEVOLUCION A CLIENTE	Devolución por anulación	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
11	2	RETIRO A BOVEDA	Traslado de efectivo	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
12	2	GASTO DE MOVILIDAD	Movilidad y delivery	S	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: contrato; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contrato (id_contrato, n_contrato, descripcion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	PLAZO INDETERMINADO	Contrato a plazo indeterminado	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	PLAZO FIJO	Contrato sujeto a modalidad	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	PART TIME	Jornada parcial	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	LOCACION DE SERVICIOS	Recibo por honorarios	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departamento (id_departamento, n_departamento, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	ICA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	LIMA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: detalle_pedido; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.detalle_pedido (id_detallepedido, id_pedido, id_producto, cantidad, precio_unitario, descuento, nota_cocina, estado_preparacion, es_cortesia, f_solicitud, f_atencion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	3	2.00	38.00	0.00	Uno sin cebolla	P	N	2026-09-24 12:34:18.039154	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	7	1.00	35.00	0.00	\N	P	N	2026-09-24 12:34:18.039154	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	10	1.00	18.00	0.00	\N	P	N	2026-09-24 12:34:18.039154	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: detalle_venta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.detalle_venta (id_detalle, id_venta, id_producto, cantidad, precio, descuento, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	3	2.00	38.00	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	7	1.00	35.00	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	10	1.00	18.00	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: distrito; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.distrito (id_distrito, id_provincia, d_distrito, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	ICA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	LA TINGUIÑA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	PARCONA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	1	SUBTANJALLA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	1	SAN JUAN BAUTISTA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	2	CHINCHA ALTA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	3	PISCO	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	4	MIRAFLORES	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: empleado; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empleado (id_empleado, id_persona, id_contrato, id_cargo, salario, turno, fondo_pension, n_hijos, essalud, f_ingreso, f_cese, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	1	3500.00	Partido	AFP	\N	\N	2026-09-24	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empresa (id_empresa, id_distrito, ruc, razon_social, nombre_comercial, direccion, telefono, email, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	20481234567	AGROEXPORTADORA SAMARA S.A.C.	SAMARA	Panamericana Sur Km 300 - Ica	056123456	ventas@samara.pe	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: estado_mesa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estado_mesa (id_estadomesa, descripcion, color, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	LIBRE	#28A745	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	OCUPADA	#DC3545	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	RESERVADA	#FFC107	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	POR COBRAR	#17A2B8	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	FUERA DE SERVICIO	#6C757D	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: estado_pedido; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estado_pedido (id_estadopedido, descripcion, orden, color, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	ABIERTO	1	#0D6EFD	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	EN PREPARACION	2	#FD7E14	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	SERVIDO	3	#20C997	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	FACTURADO	4	#198754	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	ANULADO	5	#DC3545	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: factura; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.factura (id_factura, id_venta, id_empresa, serie, numero, f_emision, f_vencimiento, condicion_pago, orden_compra, hash_cpe, estado_sunat, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
\.


--
-- Data for Name: mesa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mesa (id_mesa, id_estadomesa, id_ambiente, id_tipomesa, numero, detalle, capacidad, codigo_qr, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
2	1	1	1	02	Mesa cuadrada	4	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	1	1	03	Mesa rectangular	6	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	1	1	2	04	Box junto a ventana	6	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	1	2	1	T1	Terraza	4	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	1	2	1	T2	Terraza	4	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	1	3	3	B1	Barra	2	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	1	4	4	V1	Sala VIP	10	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
1	1	1	1	01	Mesa cuadrada	4	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	A
\.


--
-- Data for Name: metodo_pago; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.metodo_pago (id_metodopago, n_metodopago, afecta_efectivo, requiere_referencia, comision, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	EFECTIVO	S	N	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	VISA	N	S	3.50	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	MASTERCARD	N	S	3.50	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	YAPE	N	S	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	PLIN	N	S	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	TRANSFERENCIA	N	S	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	CREDITO EMPRESA	N	N	0.00	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: modulo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modulo (id_modulo, n_modulo, descripcion, icono, orden, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	SEGURIDAD	Usuarios, roles y permisos	shield	1	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	MANTENIMIENTO	Catálogos maestros	database	2	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	CARTA	Categorías y productos	book	3	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	SALON	Ambientes, mesas y reservas	table	4	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	PEDIDOS	Comandas y despacho	clipboard	5	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	VENTAS	Facturación boleta/factura	receipt	6	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	CAJA	Apertura, movimientos y arqueo	cash	7	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	REPORTES	Reportes gerenciales	chart	8	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
9	AUDITORIA	Bitácora del sistema	history	9	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: movimiento_caja; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimiento_caja (id_movimientocaja, id_aperturacaja, id_tipomovimiento, id_concepto, id_metodopago, id_usuario, id_pedido, id_venta, numero_operacion, documento, descripcion, monto, afecta_efectivo, f_movimiento, ip, terminal, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	1	1	1	1	1	\N	\N	Cobro comprobante	129.00	S	2026-09-24 12:34:18.039154	\N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: movimiento_inventario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimiento_inventario (id_movimientoinv, id_producto, id_usuario, id_pedido, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, documento, observacion, f_movimiento, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
\.


--
-- Data for Name: nota_credito; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nota_credito (id_notacredito, id_venta, serie, numero, tipo_doc_referencia, serie_referencia, numero_referencia, motivo, monto, f_emision, estado_sunat, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
\.


--
-- Data for Name: pago_venta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pago_venta (id_pago, id_venta, id_metodopago, monto, referencia, ultimos_digitos, f_pago, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	129.00	\N	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido (id_pedido, numero_pedido, id_cliente, id_mesa, id_tipopedido, id_estadopedido, id_usuario, id_empleado, f_pedido, f_cierre, n_comensales, subtotal, descuento, servicio, igv, total, facturado, anulado, motivo_anulacion, observacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	PED202609240001	1	1	1	4	1	\N	2026-09-24 12:34:18.039154	2026-09-24 12:34:18.039154	3	109.32	0.00	0.00	19.68	129.00	S	N	\N	\N	postgres	\N	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	A
\.


--
-- Data for Name: pedido_delivery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido_delivery (id_pedidodelivery, id_pedido, id_distrito, id_empleado, direccion_entrega, referencia, telefono_contacto, costo_envio, f_salida, f_entrega, situacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
\.


--
-- Data for Name: permiso; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permiso (id_permiso, id_modulo, n_permiso, clave, descripcion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	Gestionar usuarios	SEG_USUARIO	Crear, editar y desactivar usuarios	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	Asignar roles	SEG_ROL	Asignar roles y permisos	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	2	Gestionar catálogos	MAN_CATALOGO	Mantenimiento de tablas maestras	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	3	Gestionar carta	CAR_PRODUCTO	Alta y edición de productos y precios	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	4	Gestionar mesas	SAL_MESA	Configurar ambientes y mesas	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	4	Gestionar reservas	SAL_RESERVA	Registrar y confirmar reservas	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	5	Registrar pedido	PED_REGISTRAR	Crear y modificar comandas	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	5	Anular pedido	PED_ANULAR	Anular comandas registradas	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
9	5	Aplicar descuento	PED_DESCUENTO	Aplicar descuentos y cortesías	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
10	6	Emitir comprobante	VEN_EMITIR	Emitir boleta o factura	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
11	6	Anular venta	VEN_ANULAR	Anular comprobantes y emitir nota de crédito	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
12	7	Aperturar caja	CAJ_APERTURAR	Apertura de turno de caja	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
13	7	Cerrar caja	CAJ_CERRAR	Cierre y arqueo de caja	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
14	7	Registrar egreso	CAJ_EGRESO	Registrar salidas de efectivo	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
15	8	Ver reportes	REP_VER	Consultar reportes gerenciales	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
16	9	Ver auditoría	AUD_VER	Consultar la bitácora del sistema	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: persona; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.persona (id_persona, id_distrito, id_tipoidentidad, n_documento, nombre, ap_paterno, ap_materno, f_nacimiento, email, celular, genero, direccion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	40000001	LUIS ALFREDO	CASTILLON	SIGUAS	\N	admin@restaurante.pe	956000001	M	Av. Los Maestros 100 - Ica	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	1	00000000	CLIENTES	VARIOS		\N	\N	\N	\N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.producto (id_producto, id_categoriaproducto, id_unidad, codigo, n_producto, detalle, precio, costo, marca, tipo_producto, tiempo_preparacion, controla_stock, stock_actual, stock_minimo, afecto_igv, disponible, imagen, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	2	ENT001	Papa a la Huancaína	Porción con salsa huancaína y huevo	14.00	5.00	\N	P	10	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	2	ENT002	Causa Limeña	Causa rellena de pollo	16.00	6.00	\N	P	12	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	2	2	PLF001	Lomo Saltado	Lomo de res con papas fritas y arroz	38.00	15.00	\N	P	20	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	2	2	PLF002	Arroz Chaufa de Pollo	Arroz chaufa estilo criollo	28.00	10.00	\N	P	18	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	3	2	CRI001	Ají de Gallina	Con arroz blanco y papa	30.00	11.00	\N	P	18	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	3	2	CRI002	Seco de Res	Con frejoles y arroz	34.00	13.00	\N	P	25	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	4	2	MAR001	Cebiche de Pescado	Pescado fresco, camote y choclo	35.00	14.00	\N	P	15	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	4	2	MAR002	Chicharrón de Calamar	Porción con salsa criolla	36.00	15.00	\N	P	20	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
9	5	4	BEF001	Chicha Morada Vaso	Vaso 500 ml	7.00	2.00	\N	B	2	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
10	5	3	BEF002	Chicha Morada Jarra	Jarra 1 litro	18.00	5.00	\N	B	3	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
12	6	1	BEC001	Café Americano	Taza	8.00	2.00	\N	B	5	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
14	7	1	LIC002	Pisco Sour	Copa	18.00	6.00	\N	P	6	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
15	8	2	POS001	Suspiro Limeño	Porción	12.00	4.00	\N	P	5	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
16	8	2	POS002	Arroz con Leche	Porción	10.00	3.00	\N	P	5	N	0.00	0.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
11	5	1	BEF003	Inca Kola 500ml	Botella personal	6.00	3.00	\N	B	1	S	48.00	12.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
13	7	1	LIC001	Cerveza Pilsen 620ml	Botella	12.00	7.00	\N	B	1	S	48.00	12.00	S	S	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: provincia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provincia (id_provincia, id_departamento, n_provincia, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	ICA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	CHINCHA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	PISCO	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	2	LIMA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: receta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receta (id_receta, id_producto, id_insumo, cantidad, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
\.


--
-- Data for Name: reserva; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reserva (id_reserva, id_cliente, id_mesa, id_usuario, f_reserva, n_personas, adelanto, situacion, observacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
\.


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rol (id_rol, n_rol, descripcion, nivel, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	ADMINISTRADOR	Acceso total al sistema	1	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	SUPERVISOR	Supervisión de salón y caja	2	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	CAJERO	Facturación y manejo de caja	3	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	MOZO	Registro de comandas	4	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	COCINA	Despacho de pedidos	5	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: rol_permiso; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rol_permiso (id_rolpermiso, id_rol, id_permiso, concedido, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	1	2	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	3	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	1	4	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	1	5	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	1	6	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	1	7	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
8	1	8	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
9	1	9	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
10	1	10	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
11	1	11	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
12	1	12	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
13	1	13	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
14	1	14	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
15	1	15	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
16	1	16	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
17	3	7	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
18	3	10	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
19	3	12	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
20	3	13	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
21	3	14	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
22	3	15	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
23	4	6	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
24	4	7	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
25	5	7	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: serie_documento; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.serie_documento (id_serie, id_caja, tipo_documento, serie, correlativo, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
2	1	01	F001	0	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	1	07	BC01	0	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	1	TK	T001	0	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	2	03	B002	0	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	2	01	F002	0	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
1	1	03	B001	1	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: tipo_identidad; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipo_identidad (id_tipoidentidad, n_tipoidentidad, abreviatura, longitud, codigo_sunat, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	DNI	DNI	8	1	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	RUC	RUC	11	6	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	CARNET EXTRANJERIA	CE	12	4	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	PASAPORTE	PAS	12	7	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: tipo_mesa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipo_mesa (id_tipomesa, descripcion, cargo_servicio, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	MESA ESTANDAR	0.00	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	BOX	0.00	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	BARRA	0.00	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	MESA VIP	10.00	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: tipo_movimiento_caja; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipo_movimiento_caja (id_tipomovimiento, n_tipomovimiento, abreviatura, signo, f_creacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	INGRESO	ING	+	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	EGRESO	EGR	-	2026-09-24 12:34:18.039154	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: tipo_pedido; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipo_pedido (id_tipopedido, n_tipopedido, abreviatura, requiere_mesa, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	EN SALON	SALON	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	PARA LLEVAR	LLEVAR	N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	DELIVERY	DELIV	N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: tipo_usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipo_usuario (id_tipousuario, n_tipousuario, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	ADMINISTRADOR	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	CAJERO	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	MOZO	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	COCINA	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	SUPERVISOR	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: unidad_medida; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.unidad_medida (id_unidad, n_unidad, abreviatura, codigo_sunat, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	UNIDAD	UND	NIU	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
2	PORCION	POR	NIU	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
3	JARRA	JAR	NIU	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
4	VASO	VAS	NIU	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
5	KILOGRAMO	KG	KGM	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
6	LITRO	LT	LTR	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
7	BOTELLA	BOT	NIU	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuario (id_usuario, id_tipousuario, id_empleado, logeo, clave, intentos, bloqueado, f_ultimoacceso, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	admin	240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9	0	N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: usuario_rol; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuario_rol (id_usuariorol, id_usuario, id_rol, f_asignacion, vigente, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	2026-09-24 12:34:18.039154	S	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Data for Name: venta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.venta (id_venta, id_pedido, id_cliente, id_usuario, id_aperturacaja, f_venta, tipodocumento, subtotal, descuento, servicio, igv, total, total_pagado, vuelto, anulada, motivo_anulacion, usucre, pccre, feccre, usumod, pcmod, fecmod, estado) FROM stdin;
1	1	1	1	1	2026-09-24 12:34:18.039154	03	109.32	0.00	0.00	19.68	129.00	150.00	21.00	N	\N	postgres	\N	2026-09-24 12:34:18.039154	\N	\N	\N	A
\.


--
-- Name: ambiente_id_ambiente_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ambiente_id_ambiente_seq', 4, true);


--
-- Name: apertura_caja_id_aperturacaja_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.apertura_caja_id_aperturacaja_seq', 1, true);


--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auditoria_id_auditoria_seq', 3, true);


--
-- Name: boleta_id_boleta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.boleta_id_boleta_seq', 1, true);


--
-- Name: caja_id_caja_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.caja_id_caja_seq', 2, true);


--
-- Name: cargo_id_cargo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cargo_id_cargo_seq', 7, true);


--
-- Name: categoria_producto_id_categoriaproducto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categoria_producto_id_categoriaproducto_seq', 9, true);


--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cliente_id_cliente_seq', 2, true);


--
-- Name: concepto_caja_id_concepto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.concepto_caja_id_concepto_seq', 12, true);


--
-- Name: contrato_id_contrato_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contrato_id_contrato_seq', 4, true);


--
-- Name: departamento_id_departamento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departamento_id_departamento_seq', 2, true);


--
-- Name: detalle_pedido_id_detallepedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detalle_pedido_id_detallepedido_seq', 3, true);


--
-- Name: detalle_venta_id_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detalle_venta_id_detalle_seq', 3, true);


--
-- Name: distrito_id_distrito_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.distrito_id_distrito_seq', 8, true);


--
-- Name: empleado_id_empleado_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empleado_id_empleado_seq', 1, true);


--
-- Name: empresa_id_empresa_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empresa_id_empresa_seq', 1, true);


--
-- Name: estado_mesa_id_estadomesa_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estado_mesa_id_estadomesa_seq', 5, true);


--
-- Name: estado_pedido_id_estadopedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estado_pedido_id_estadopedido_seq', 5, true);


--
-- Name: factura_id_factura_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.factura_id_factura_seq', 1, false);


--
-- Name: mesa_id_mesa_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mesa_id_mesa_seq', 8, true);


--
-- Name: metodo_pago_id_metodopago_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.metodo_pago_id_metodopago_seq', 7, true);


--
-- Name: modulo_id_modulo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.modulo_id_modulo_seq', 9, true);


--
-- Name: movimiento_caja_id_movimientocaja_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimiento_caja_id_movimientocaja_seq', 1, true);


--
-- Name: movimiento_inventario_id_movimientoinv_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimiento_inventario_id_movimientoinv_seq', 1, false);


--
-- Name: nota_credito_id_notacredito_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nota_credito_id_notacredito_seq', 1, false);


--
-- Name: pago_venta_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pago_venta_id_pago_seq', 1, true);


--
-- Name: pedido_delivery_id_pedidodelivery_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_delivery_id_pedidodelivery_seq', 1, false);


--
-- Name: pedido_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_id_pedido_seq', 1, true);


--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permiso_id_permiso_seq', 16, true);


--
-- Name: persona_id_persona_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.persona_id_persona_seq', 2, true);


--
-- Name: producto_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_id_producto_seq', 16, true);


--
-- Name: provincia_id_provincia_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.provincia_id_provincia_seq', 4, true);


--
-- Name: receta_id_receta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.receta_id_receta_seq', 1, false);


--
-- Name: reserva_id_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reserva_id_reserva_seq', 1, false);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rol_id_rol_seq', 5, true);


--
-- Name: rol_permiso_id_rolpermiso_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rol_permiso_id_rolpermiso_seq', 25, true);


--
-- Name: serie_documento_id_serie_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.serie_documento_id_serie_seq', 6, true);


--
-- Name: tipo_identidad_id_tipoidentidad_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_identidad_id_tipoidentidad_seq', 4, true);


--
-- Name: tipo_mesa_id_tipomesa_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_mesa_id_tipomesa_seq', 4, true);


--
-- Name: tipo_movimiento_caja_id_tipomovimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_movimiento_caja_id_tipomovimiento_seq', 2, true);


--
-- Name: tipo_pedido_id_tipopedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_pedido_id_tipopedido_seq', 3, true);


--
-- Name: tipo_usuario_id_tipousuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipo_usuario_id_tipousuario_seq', 5, true);


--
-- Name: unidad_medida_id_unidad_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.unidad_medida_id_unidad_seq', 7, true);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 1, true);


--
-- Name: usuario_rol_id_usuariorol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_rol_id_usuariorol_seq', 1, true);


--
-- Name: venta_id_venta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.venta_id_venta_seq', 1, true);


--
-- Name: ambiente pk_ambiente; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ambiente
    ADD CONSTRAINT pk_ambiente PRIMARY KEY (id_ambiente);


--
-- Name: apertura_caja pk_apertura_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apertura_caja
    ADD CONSTRAINT pk_apertura_caja PRIMARY KEY (id_aperturacaja);


--
-- Name: auditoria pk_auditoria; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT pk_auditoria PRIMARY KEY (id_auditoria);


--
-- Name: boleta pk_boleta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boleta
    ADD CONSTRAINT pk_boleta PRIMARY KEY (id_boleta);


--
-- Name: caja pk_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caja
    ADD CONSTRAINT pk_caja PRIMARY KEY (id_caja);


--
-- Name: cargo pk_cargo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT pk_cargo PRIMARY KEY (id_cargo);


--
-- Name: categoria_producto pk_categoria_producto; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_producto
    ADD CONSTRAINT pk_categoria_producto PRIMARY KEY (id_categoriaproducto);


--
-- Name: cliente pk_cliente; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT pk_cliente PRIMARY KEY (id_cliente);


--
-- Name: concepto_caja pk_concepto_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concepto_caja
    ADD CONSTRAINT pk_concepto_caja PRIMARY KEY (id_concepto);


--
-- Name: contrato pk_contrato; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT pk_contrato PRIMARY KEY (id_contrato);


--
-- Name: departamento pk_departamento; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT pk_departamento PRIMARY KEY (id_departamento);


--
-- Name: detalle_pedido pk_detalle_pedido; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT pk_detalle_pedido PRIMARY KEY (id_detallepedido);


--
-- Name: detalle_venta pk_detalle_venta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT pk_detalle_venta PRIMARY KEY (id_detalle);


--
-- Name: distrito pk_distrito; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.distrito
    ADD CONSTRAINT pk_distrito PRIMARY KEY (id_distrito);


--
-- Name: empleado pk_empleado; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT pk_empleado PRIMARY KEY (id_empleado);


--
-- Name: empresa pk_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT pk_empresa PRIMARY KEY (id_empresa);


--
-- Name: estado_mesa pk_estado_mesa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_mesa
    ADD CONSTRAINT pk_estado_mesa PRIMARY KEY (id_estadomesa);


--
-- Name: estado_pedido pk_estado_pedido; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_pedido
    ADD CONSTRAINT pk_estado_pedido PRIMARY KEY (id_estadopedido);


--
-- Name: factura pk_factura; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT pk_factura PRIMARY KEY (id_factura);


--
-- Name: mesa pk_mesa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesa
    ADD CONSTRAINT pk_mesa PRIMARY KEY (id_mesa);


--
-- Name: metodo_pago pk_metodo_pago; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT pk_metodo_pago PRIMARY KEY (id_metodopago);


--
-- Name: modulo pk_modulo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modulo
    ADD CONSTRAINT pk_modulo PRIMARY KEY (id_modulo);


--
-- Name: movimiento_caja pk_movimiento_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT pk_movimiento_caja PRIMARY KEY (id_movimientocaja);


--
-- Name: movimiento_inventario pk_movimiento_inventario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT pk_movimiento_inventario PRIMARY KEY (id_movimientoinv);


--
-- Name: nota_credito pk_nota_credito; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nota_credito
    ADD CONSTRAINT pk_nota_credito PRIMARY KEY (id_notacredito);


--
-- Name: pago_venta pk_pago_venta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago_venta
    ADD CONSTRAINT pk_pago_venta PRIMARY KEY (id_pago);


--
-- Name: pedido pk_pedido; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pk_pedido PRIMARY KEY (id_pedido);


--
-- Name: pedido_delivery pk_pedido_delivery; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_delivery
    ADD CONSTRAINT pk_pedido_delivery PRIMARY KEY (id_pedidodelivery);


--
-- Name: permiso pk_permiso; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT pk_permiso PRIMARY KEY (id_permiso);


--
-- Name: persona pk_persona; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT pk_persona PRIMARY KEY (id_persona);


--
-- Name: producto pk_producto; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT pk_producto PRIMARY KEY (id_producto);


--
-- Name: provincia pk_provincia; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provincia
    ADD CONSTRAINT pk_provincia PRIMARY KEY (id_provincia);


--
-- Name: receta pk_receta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receta
    ADD CONSTRAINT pk_receta PRIMARY KEY (id_receta);


--
-- Name: reserva pk_reserva; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT pk_reserva PRIMARY KEY (id_reserva);


--
-- Name: rol pk_rol; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT pk_rol PRIMARY KEY (id_rol);


--
-- Name: rol_permiso pk_rol_permiso; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT pk_rol_permiso PRIMARY KEY (id_rolpermiso);


--
-- Name: serie_documento pk_serie_documento; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serie_documento
    ADD CONSTRAINT pk_serie_documento PRIMARY KEY (id_serie);


--
-- Name: tipo_identidad pk_tipo_identidad; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_identidad
    ADD CONSTRAINT pk_tipo_identidad PRIMARY KEY (id_tipoidentidad);


--
-- Name: tipo_mesa pk_tipo_mesa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_mesa
    ADD CONSTRAINT pk_tipo_mesa PRIMARY KEY (id_tipomesa);


--
-- Name: tipo_movimiento_caja pk_tipo_movimiento_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_movimiento_caja
    ADD CONSTRAINT pk_tipo_movimiento_caja PRIMARY KEY (id_tipomovimiento);


--
-- Name: tipo_pedido pk_tipo_pedido; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_pedido
    ADD CONSTRAINT pk_tipo_pedido PRIMARY KEY (id_tipopedido);


--
-- Name: tipo_usuario pk_tipo_usuario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_usuario
    ADD CONSTRAINT pk_tipo_usuario PRIMARY KEY (id_tipousuario);


--
-- Name: unidad_medida pk_unidad_medida; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unidad_medida
    ADD CONSTRAINT pk_unidad_medida PRIMARY KEY (id_unidad);


--
-- Name: usuario pk_usuario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT pk_usuario PRIMARY KEY (id_usuario);


--
-- Name: usuario_rol pk_usuario_rol; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT pk_usuario_rol PRIMARY KEY (id_usuariorol);


--
-- Name: venta pk_venta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT pk_venta PRIMARY KEY (id_venta);


--
-- Name: ambiente uq_ambiente; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ambiente
    ADD CONSTRAINT uq_ambiente UNIQUE (n_ambiente);


--
-- Name: boleta uq_boleta_num; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boleta
    ADD CONSTRAINT uq_boleta_num UNIQUE (serie, numero);


--
-- Name: boleta uq_boleta_venta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boleta
    ADD CONSTRAINT uq_boleta_venta UNIQUE (id_venta);


--
-- Name: caja uq_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.caja
    ADD CONSTRAINT uq_caja UNIQUE (n_caja);


--
-- Name: cargo uq_cargo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT uq_cargo UNIQUE (n_cargo);


--
-- Name: categoria_producto uq_categoria_producto; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_producto
    ADD CONSTRAINT uq_categoria_producto UNIQUE (n_categoriaproducto);


--
-- Name: concepto_caja uq_concepto_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concepto_caja
    ADD CONSTRAINT uq_concepto_caja UNIQUE (n_concepto);


--
-- Name: contrato uq_contrato; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT uq_contrato UNIQUE (n_contrato);


--
-- Name: departamento uq_departamento_nom; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT uq_departamento_nom UNIQUE (n_departamento);


--
-- Name: empleado uq_empleado_persona; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT uq_empleado_persona UNIQUE (id_persona);


--
-- Name: empresa uq_empresa_ruc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT uq_empresa_ruc UNIQUE (ruc);


--
-- Name: estado_mesa uq_estado_mesa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_mesa
    ADD CONSTRAINT uq_estado_mesa UNIQUE (descripcion);


--
-- Name: estado_pedido uq_estado_pedido; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estado_pedido
    ADD CONSTRAINT uq_estado_pedido UNIQUE (descripcion);


--
-- Name: factura uq_factura_num; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT uq_factura_num UNIQUE (serie, numero);


--
-- Name: factura uq_factura_venta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT uq_factura_venta UNIQUE (id_venta);


--
-- Name: mesa uq_mesa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesa
    ADD CONSTRAINT uq_mesa UNIQUE (id_ambiente, numero);


--
-- Name: metodo_pago uq_metodo_pago; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT uq_metodo_pago UNIQUE (n_metodopago);


--
-- Name: modulo uq_modulo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modulo
    ADD CONSTRAINT uq_modulo UNIQUE (n_modulo);


--
-- Name: nota_credito uq_nota_credito; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nota_credito
    ADD CONSTRAINT uq_nota_credito UNIQUE (serie, numero);


--
-- Name: pedido_delivery uq_pedido_delivery; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_delivery
    ADD CONSTRAINT uq_pedido_delivery UNIQUE (id_pedido);


--
-- Name: pedido uq_pedido_num; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT uq_pedido_num UNIQUE (numero_pedido);


--
-- Name: permiso uq_permiso_clave; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT uq_permiso_clave UNIQUE (clave);


--
-- Name: persona uq_persona_doc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT uq_persona_doc UNIQUE (id_tipoidentidad, n_documento);


--
-- Name: producto uq_producto_cod; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT uq_producto_cod UNIQUE (codigo);


--
-- Name: receta uq_receta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receta
    ADD CONSTRAINT uq_receta UNIQUE (id_producto, id_insumo);


--
-- Name: rol uq_rol; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT uq_rol UNIQUE (n_rol);


--
-- Name: rol_permiso uq_rol_permiso; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT uq_rol_permiso UNIQUE (id_rol, id_permiso);


--
-- Name: serie_documento uq_serie_documento; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serie_documento
    ADD CONSTRAINT uq_serie_documento UNIQUE (tipo_documento, serie);


--
-- Name: tipo_identidad uq_tipo_identidad; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_identidad
    ADD CONSTRAINT uq_tipo_identidad UNIQUE (n_tipoidentidad);


--
-- Name: tipo_mesa uq_tipo_mesa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_mesa
    ADD CONSTRAINT uq_tipo_mesa UNIQUE (descripcion);


--
-- Name: tipo_movimiento_caja uq_tipo_movimiento_caja; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_movimiento_caja
    ADD CONSTRAINT uq_tipo_movimiento_caja UNIQUE (n_tipomovimiento);


--
-- Name: tipo_pedido uq_tipo_pedido; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_pedido
    ADD CONSTRAINT uq_tipo_pedido UNIQUE (n_tipopedido);


--
-- Name: tipo_usuario uq_tipo_usuario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_usuario
    ADD CONSTRAINT uq_tipo_usuario UNIQUE (n_tipousuario);


--
-- Name: unidad_medida uq_unidad_medida; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unidad_medida
    ADD CONSTRAINT uq_unidad_medida UNIQUE (n_unidad);


--
-- Name: usuario uq_usuario_logeo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT uq_usuario_logeo UNIQUE (logeo);


--
-- Name: usuario_rol uq_usuario_rol; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT uq_usuario_rol UNIQUE (id_usuario, id_rol);


--
-- Name: ix_auditoria_tabla; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_auditoria_tabla ON public.auditoria USING btree (n_tabla, f_evento);


--
-- Name: ix_detpedido_pedido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_detpedido_pedido ON public.detalle_pedido USING btree (id_pedido) INCLUDE (id_producto, cantidad);


--
-- Name: ix_detventa_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_detventa_producto ON public.detalle_venta USING btree (id_producto) INCLUDE (cantidad, precio);


--
-- Name: ix_movcaja_apertura; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_movcaja_apertura ON public.movimiento_caja USING btree (id_aperturacaja) INCLUDE (monto, id_tipomovimiento);


--
-- Name: ix_pedido_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedido_fecha ON public.pedido USING btree (f_pedido) INCLUDE (total, id_estadopedido);


--
-- Name: ix_pedido_mesa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedido_mesa ON public.pedido USING btree (id_mesa, id_estadopedido);


--
-- Name: ix_persona_ape; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_persona_ape ON public.persona USING btree (ap_paterno, ap_materno, nombre);


--
-- Name: ix_persona_doc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_persona_doc ON public.persona USING btree (n_documento);


--
-- Name: ix_producto_cat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_producto_cat ON public.producto USING btree (id_categoriaproducto) INCLUDE (n_producto, precio, disponible);


--
-- Name: ix_venta_apertura; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_venta_apertura ON public.venta USING btree (id_aperturacaja);


--
-- Name: ix_venta_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_venta_fecha ON public.venta USING btree (f_venta) INCLUDE (total, tipodocumento, anulada);


--
-- Name: uq_apertura_caja_abierta; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_apertura_caja_abierta ON public.apertura_caja USING btree (id_caja) WHERE (situacion = 'A'::bpchar);


--
-- Name: producto tr_producto_auditoria; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_producto_auditoria AFTER INSERT OR DELETE OR UPDATE ON public.producto FOR EACH ROW EXECUTE FUNCTION public.trg_producto_auditoria();


--
-- Name: venta tr_venta_auditoria; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_venta_auditoria AFTER UPDATE ON public.venta FOR EACH ROW EXECUTE FUNCTION public.trg_venta_auditoria();


--
-- Name: apertura_caja fk_aperturacaja_caja; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apertura_caja
    ADD CONSTRAINT fk_aperturacaja_caja FOREIGN KEY (id_caja) REFERENCES public.caja(id_caja);


--
-- Name: apertura_caja fk_aperturacaja_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apertura_caja
    ADD CONSTRAINT fk_aperturacaja_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: apertura_caja fk_aperturacaja_usucierre; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apertura_caja
    ADD CONSTRAINT fk_aperturacaja_usucierre FOREIGN KEY (id_usuariocierre) REFERENCES public.usuario(id_usuario);


--
-- Name: auditoria fk_auditoria_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: boleta fk_boleta_venta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boleta
    ADD CONSTRAINT fk_boleta_venta FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: cliente fk_cliente_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa);


--
-- Name: cliente fk_cliente_persona; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_persona FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona);


--
-- Name: concepto_caja fk_conceptocaja_tipomov; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concepto_caja
    ADD CONSTRAINT fk_conceptocaja_tipomov FOREIGN KEY (id_tipomovimiento) REFERENCES public.tipo_movimiento_caja(id_tipomovimiento);


--
-- Name: detalle_pedido fk_detpedido_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT fk_detpedido_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- Name: detalle_pedido fk_detpedido_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT fk_detpedido_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- Name: detalle_venta fk_detventa_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT fk_detventa_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- Name: detalle_venta fk_detventa_venta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_venta
    ADD CONSTRAINT fk_detventa_venta FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: distrito fk_distrito_provincia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.distrito
    ADD CONSTRAINT fk_distrito_provincia FOREIGN KEY (id_provincia) REFERENCES public.provincia(id_provincia);


--
-- Name: empleado fk_empleado_cargo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT fk_empleado_cargo FOREIGN KEY (id_cargo) REFERENCES public.cargo(id_cargo);


--
-- Name: empleado fk_empleado_contrato; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT fk_empleado_contrato FOREIGN KEY (id_contrato) REFERENCES public.contrato(id_contrato);


--
-- Name: empleado fk_empleado_persona; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT fk_empleado_persona FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona);


--
-- Name: empresa fk_empresa_distrito; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT fk_empresa_distrito FOREIGN KEY (id_distrito) REFERENCES public.distrito(id_distrito);


--
-- Name: factura fk_factura_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT fk_factura_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa);


--
-- Name: factura fk_factura_venta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT fk_factura_venta FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: mesa fk_mesa_ambiente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesa
    ADD CONSTRAINT fk_mesa_ambiente FOREIGN KEY (id_ambiente) REFERENCES public.ambiente(id_ambiente);


--
-- Name: mesa fk_mesa_estadomesa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesa
    ADD CONSTRAINT fk_mesa_estadomesa FOREIGN KEY (id_estadomesa) REFERENCES public.estado_mesa(id_estadomesa);


--
-- Name: mesa fk_mesa_tipomesa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesa
    ADD CONSTRAINT fk_mesa_tipomesa FOREIGN KEY (id_tipomesa) REFERENCES public.tipo_mesa(id_tipomesa);


--
-- Name: movimiento_caja fk_movcaja_apertura; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT fk_movcaja_apertura FOREIGN KEY (id_aperturacaja) REFERENCES public.apertura_caja(id_aperturacaja);


--
-- Name: movimiento_caja fk_movcaja_concepto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT fk_movcaja_concepto FOREIGN KEY (id_concepto) REFERENCES public.concepto_caja(id_concepto);


--
-- Name: movimiento_caja fk_movcaja_metodo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT fk_movcaja_metodo FOREIGN KEY (id_metodopago) REFERENCES public.metodo_pago(id_metodopago);


--
-- Name: movimiento_caja fk_movcaja_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT fk_movcaja_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- Name: movimiento_caja fk_movcaja_tipomov; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT fk_movcaja_tipomov FOREIGN KEY (id_tipomovimiento) REFERENCES public.tipo_movimiento_caja(id_tipomovimiento);


--
-- Name: movimiento_caja fk_movcaja_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT fk_movcaja_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: movimiento_caja fk_movcaja_venta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_caja
    ADD CONSTRAINT fk_movcaja_venta FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: movimiento_inventario fk_movinv_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT fk_movinv_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- Name: movimiento_inventario fk_movinv_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT fk_movinv_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- Name: movimiento_inventario fk_movinv_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT fk_movinv_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: nota_credito fk_notacredito_venta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nota_credito
    ADD CONSTRAINT fk_notacredito_venta FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: pago_venta fk_pagoventa_metodo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago_venta
    ADD CONSTRAINT fk_pagoventa_metodo FOREIGN KEY (id_metodopago) REFERENCES public.metodo_pago(id_metodopago);


--
-- Name: pago_venta fk_pagoventa_venta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pago_venta
    ADD CONSTRAINT fk_pagoventa_venta FOREIGN KEY (id_venta) REFERENCES public.venta(id_venta);


--
-- Name: pedido_delivery fk_peddelivery_distrito; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_delivery
    ADD CONSTRAINT fk_peddelivery_distrito FOREIGN KEY (id_distrito) REFERENCES public.distrito(id_distrito);


--
-- Name: pedido_delivery fk_peddelivery_empleado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_delivery
    ADD CONSTRAINT fk_peddelivery_empleado FOREIGN KEY (id_empleado) REFERENCES public.empleado(id_empleado);


--
-- Name: pedido_delivery fk_peddelivery_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_delivery
    ADD CONSTRAINT fk_peddelivery_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- Name: pedido fk_pedido_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente);


--
-- Name: pedido fk_pedido_empleado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_empleado FOREIGN KEY (id_empleado) REFERENCES public.empleado(id_empleado);


--
-- Name: pedido fk_pedido_estadopedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_estadopedido FOREIGN KEY (id_estadopedido) REFERENCES public.estado_pedido(id_estadopedido);


--
-- Name: pedido fk_pedido_mesa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_mesa FOREIGN KEY (id_mesa) REFERENCES public.mesa(id_mesa);


--
-- Name: pedido fk_pedido_tipopedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_tipopedido FOREIGN KEY (id_tipopedido) REFERENCES public.tipo_pedido(id_tipopedido);


--
-- Name: pedido fk_pedido_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: permiso fk_permiso_modulo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permiso
    ADD CONSTRAINT fk_permiso_modulo FOREIGN KEY (id_modulo) REFERENCES public.modulo(id_modulo);


--
-- Name: persona fk_persona_distrito; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT fk_persona_distrito FOREIGN KEY (id_distrito) REFERENCES public.distrito(id_distrito);


--
-- Name: persona fk_persona_tipoident; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT fk_persona_tipoident FOREIGN KEY (id_tipoidentidad) REFERENCES public.tipo_identidad(id_tipoidentidad);


--
-- Name: producto fk_producto_categoria; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoriaproducto) REFERENCES public.categoria_producto(id_categoriaproducto);


--
-- Name: producto fk_producto_unidad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_producto_unidad FOREIGN KEY (id_unidad) REFERENCES public.unidad_medida(id_unidad);


--
-- Name: provincia fk_provincia_departamento; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provincia
    ADD CONSTRAINT fk_provincia_departamento FOREIGN KEY (id_departamento) REFERENCES public.departamento(id_departamento);


--
-- Name: receta fk_receta_insumo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receta
    ADD CONSTRAINT fk_receta_insumo FOREIGN KEY (id_insumo) REFERENCES public.producto(id_producto);


--
-- Name: receta fk_receta_producto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receta
    ADD CONSTRAINT fk_receta_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- Name: reserva fk_reserva_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente);


--
-- Name: reserva fk_reserva_mesa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_mesa FOREIGN KEY (id_mesa) REFERENCES public.mesa(id_mesa);


--
-- Name: reserva fk_reserva_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: rol_permiso fk_rolpermiso_permiso; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT fk_rolpermiso_permiso FOREIGN KEY (id_permiso) REFERENCES public.permiso(id_permiso);


--
-- Name: rol_permiso fk_rolpermiso_rol; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT fk_rolpermiso_rol FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


--
-- Name: serie_documento fk_seriedoc_caja; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serie_documento
    ADD CONSTRAINT fk_seriedoc_caja FOREIGN KEY (id_caja) REFERENCES public.caja(id_caja);


--
-- Name: usuario fk_usuario_empleado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usuario_empleado FOREIGN KEY (id_empleado) REFERENCES public.empleado(id_empleado);


--
-- Name: usuario fk_usuario_tipousuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usuario_tipousuario FOREIGN KEY (id_tipousuario) REFERENCES public.tipo_usuario(id_tipousuario);


--
-- Name: usuario_rol fk_usuariorol_rol; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT fk_usuariorol_rol FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


--
-- Name: usuario_rol fk_usuariorol_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT fk_usuariorol_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- Name: venta fk_venta_apertura; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_venta_apertura FOREIGN KEY (id_aperturacaja) REFERENCES public.apertura_caja(id_aperturacaja);


--
-- Name: venta fk_venta_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente);


--
-- Name: venta fk_venta_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_venta_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- Name: venta fk_venta_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venta
    ADD CONSTRAINT fk_venta_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- PostgreSQL database dump complete
--

\unrestrict 8IEzshvrk2WgdkiZQWOmUvi1mZAiMPtUp8aIIMbPKAwQ7Has5pDcBY8j5MtdadP

