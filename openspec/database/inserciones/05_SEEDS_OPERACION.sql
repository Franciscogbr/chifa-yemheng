/* ==================================================================================
   SEEDS NIVEL 5-6 - OPERACION DEL DIA (USUARIO, USUARIO_ROL, APERTURA_CAJA,
   PEDIDO, RESERVA)
   ----------------------------------------------------------------------------------
   Requiere: esquema + base + 08 + 09 + 10 + 11. Idempotente.
   Contenido: 12 usuarios del staff, sus roles, 1 turno abierto y
   10 comandas + 6 reservas simulando el día operativo.
   Claves iniciales: 'chifa123' (hash SHA2-256). Cambiar en producción.
   ================================================================================== */

/* ---------- USUARIO (12) ---------- */
INSERT INTO USUARIO (ID_TipoUsuario, ID_Empleado, Logeo, Clave)
SELECT tu.ID_TipoUsuario, e.ID_Empleado, v.Logeo,
       encode(digest(v.Clave, 'sha256'), 'hex')
FROM (VALUES
  ('COCINA','45000001','j.wong','chifa123'),
  ('COCINA','45000002','r.perez','chifa123'),
  ('MOZO','45000003','p.ramos','chifa123'),
  ('MOZO','45000004','a.flores','chifa123'),
  ('MOZO','45000005','l.garcia','chifa123'),
  ('CAJERO','45000006','c.vargas','chifa123'),
  ('CAJERO','45000007','m.torres','chifa123'),
  ('MOZO','45000008','d.fernandez','chifa123'),
  ('MOZO','45000009','s.mendoza','chifa123'),
  ('DELIVERY','45000010','r.quispe','chifa123'),
  ('DELIVERY','45000011','j.poma','chifa123'),
  ('ALMACEN','45000012','e.nunez','chifa123')
) AS v(Tipo, Doc, Logeo, Clave)
  INNER JOIN TIPO_USUARIO tu ON tu.N_TipoUsuario = v.Tipo
  INNER JOIN PERSONA p ON p.N_Documento = v.Doc
  INNER JOIN EMPLEADO e ON e.ID_Persona = p.ID_Persona
ON CONFLICT (Logeo) DO NOTHING;

/* ---------- USUARIO_ROL ---------- */
INSERT INTO USUARIO_ROL (ID_Usuario, ID_Rol)
SELECT u.ID_Usuario, r.ID_Rol
FROM (VALUES
  ('j.wong','COCINA'),('r.perez','COCINA'),
  ('p.ramos','MOZO'),('a.flores','MOZO'),('l.garcia','MOZO'),
  ('c.vargas','CAJERO'),('m.torres','CAJERO'),
  ('d.fernandez','MOZO'),('s.mendoza','MOZO'),
  ('r.quispe','REPARTIDOR'),('j.poma','REPARTIDOR'),
  ('e.nunez','ALMACENERO')
) AS v(Logeo, Rol)
  INNER JOIN USUARIO u ON u.Logeo = v.Logeo
  INNER JOIN ROL r ON r.N_Rol = v.Rol
WHERE NOT EXISTS (SELECT 1 FROM USUARIO_ROL x
                  WHERE x.ID_Usuario = u.ID_Usuario AND x.ID_Rol = r.ID_Rol);

/* ---------- APERTURA_CAJA: turno abierto en CAJA 01 ---------- */
INSERT INTO APERTURA_CAJA (ID_Caja, ID_Usuario, Numero_Turno,
                           Monto_Inicial, Monto_Sistema, Situacion)
SELECT c.ID_Caja, u.ID_Usuario, 'TURNO-SEED-01', 200.00, 200.00, 'A'
FROM CAJA c CROSS JOIN USUARIO u
WHERE c.N_Caja = 'CAJA 01' AND u.Logeo = 'c.vargas'
  AND NOT EXISTS (SELECT 1 FROM APERTURA_CAJA a
                  WHERE a.ID_Caja = c.ID_Caja AND a.Situacion = 'A');

UPDATE CAJA SET Aperturada = 'S'
WHERE N_Caja = 'CAJA 01' AND Aperturada = 'N';

/* ---------- PEDIDO: 10 comandas del día ---------- */
INSERT INTO PEDIDO (Numero_Pedido, ID_Cliente, ID_Mesa, ID_TipoPedido,
                    ID_EstadoPedido, ID_Usuario, ID_Empleado, N_Comensales,
                    SubTotal, Descuento, Servicio, IGV, Total)
SELECT v.Numero, cli.ID_Cliente, m.ID_Mesa, tp.ID_TipoPedido,
       ep.ID_EstadoPedido, u.ID_Usuario, e.ID_Empleado, v.Pax,
       0, 0, 0, 0, 0
FROM (VALUES
  ('PED-SEED-01','CLI-0003','SALON PRINCIPAL','01','EN SALON','ABIERTO','p.ramos','45000003',3),
  ('PED-SEED-02','CLI-0004','SALON PRINCIPAL','02','EN SALON','EN PREPARACION','a.flores','45000004',2),
  ('PED-SEED-03','CLI-0011','SALON FAMILIAR','F1','EN SALON','ABIERTO','p.ramos','45000003',6),
  ('PED-SEED-04','CLI-0005',NULL,NULL,'PARA LLEVAR','ABIERTO','c.vargas',NULL,2),
  ('PED-SEED-05','CLI-0009',NULL,NULL,'DELIVERY','ABIERTO','c.vargas',NULL,4),
  ('PED-SEED-06','CLI-0006','TERRAZA','T1','EN SALON','SERVIDO','l.garcia','45000005',2),
  ('PED-SEED-07','CLI-0007','BARRA','B1','EN SALON','EN PREPARACION','d.fernandez','45000008',1),
  ('PED-SEED-08','CLI-0015',NULL,NULL,'DELIVERY','ABIERTO','c.vargas',NULL,3),
  ('PED-SEED-09','CLI-0010',NULL,NULL,'PARA LLEVAR','ABIERTO','m.torres',NULL,2),
  ('PED-SEED-10','CLI-1001','SALA VIP','V1','EN SALON','ABIERTO','p.ramos','45000003',8)
) AS v(Numero, CliCod, Ambiente, MesaNum, TipoPed, EstadoPed, UserLog, MozoDoc, Pax)
  INNER JOIN CLIENTE cli ON cli.Codigo_Cliente = v.CliCod
  LEFT JOIN AMBIENTE amb ON amb.N_Ambiente = v.Ambiente
  LEFT JOIN MESA m ON m.ID_Ambiente = amb.ID_Ambiente AND m.Numero = v.MesaNum
  INNER JOIN TIPO_PEDIDO tp ON tp.N_TipoPedido = v.TipoPed
  INNER JOIN ESTADO_PEDIDO ep ON ep.Descripcion = v.EstadoPed
  INNER JOIN USUARIO u ON u.Logeo = v.UserLog
  LEFT JOIN PERSONA pm ON pm.N_Documento = v.MozoDoc
  LEFT JOIN EMPLEADO e ON e.ID_Persona = pm.ID_Persona
WHERE NOT EXISTS (SELECT 1 FROM PEDIDO p WHERE p.Numero_Pedido = v.Numero);

/* Mesas con comanda abierta pasan a OCUPADA */
UPDATE MESA SET ID_EstadoMesa = 2
WHERE ID_Mesa IN (SELECT ID_Mesa FROM PEDIDO
                  WHERE Numero_Pedido LIKE 'PED-SEED-%'
                    AND Facturado = 'N' AND Anulado = 'N'
                    AND ID_Mesa IS NOT NULL)
  AND ID_EstadoMesa = 1;

/* ---------- RESERVA: 6 por los 3 canales ---------- */
INSERT INTO RESERVA (ID_Cliente, ID_Mesa, ID_Usuario, F_Reserva, N_Personas,
                     Adelanto, Situacion, Observacion)
SELECT cli.ID_Cliente, m.ID_Mesa, u.ID_Usuario,
       CURRENT_TIMESTAMP + (v.Dias * INTERVAL '1 day'),
       v.Pax, v.Adelanto, v.Sit, v.Obs
FROM (VALUES
  ('CLI-0011','SALON FAMILIAR','F2','c.vargas',2,4,50.00,'C','Cumpleaños familiar'),
  ('CLI-0009',NULL,NULL,'c.vargas',3,2,0.00,'P','Reserva online sin mesa'),
  ('CLI-0004','SALON PRINCIPAL','03','m.torres',1,3,30.00,'C','Aniversario'),
  ('CLI-0017',NULL,NULL,'c.vargas',5,5,0.00,'P','Reserva telefónica'),
  ('CLI-0005','TERRAZA','T2','a.flores',-1,2,0.00,'A','Atendida ayer'),
  ('CLI-0020','MEZZANINE','M1','m.torres',1,2,0.00,'X','Cancelada por cliente')
) AS v(CliCod, Ambiente, MesaNum, UserLog, Dias, Pax, Adelanto, Sit, Obs)
  INNER JOIN CLIENTE cli ON cli.Codigo_Cliente = v.CliCod
  LEFT JOIN AMBIENTE amb ON amb.N_Ambiente = v.Ambiente
  LEFT JOIN MESA m ON m.ID_Ambiente = amb.ID_Ambiente AND m.Numero = v.MesaNum
  INNER JOIN USUARIO u ON u.Logeo = v.UserLog
WHERE NOT EXISTS (SELECT 1 FROM RESERVA r
                  WHERE r.ID_Cliente = cli.ID_Cliente
                    AND r.Observacion = v.Obs);

/* Mesa de reserva confirmada pasa a RESERVADA (3) */
UPDATE MESA SET ID_EstadoMesa = 3
WHERE ID_Mesa IN (SELECT ID_Mesa FROM RESERVA WHERE Situacion = 'C'
                  AND ID_Mesa IS NOT NULL)
  AND ID_EstadoMesa = 1;

/* ---------- CONTROL ---------- */
SELECT 'USUARIO' AS tabla, COUNT(*) AS total FROM USUARIO
UNION ALL SELECT 'USUARIO_ROL', COUNT(*) FROM USUARIO_ROL
UNION ALL SELECT 'APERTURA_CAJA', COUNT(*) FROM APERTURA_CAJA
UNION ALL SELECT 'PEDIDO', COUNT(*) FROM PEDIDO
UNION ALL SELECT 'RESERVA', COUNT(*) FROM RESERVA;
