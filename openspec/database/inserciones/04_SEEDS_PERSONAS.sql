/* ==================================================================================
   SEEDS NIVEL 3-4 - PERSONAS DEL CHIFA (PERSONA, EMPRESA, CLIENTE, EMPLEADO)
   ----------------------------------------------------------------------------------
   Requiere: esquema + base + 08 + 09 + 10. Idempotente.
   Contenido: 12 trabajadores (chef oriental, mozos, cajeros, repartidores...),
   20 clientes naturales y 4 empresas con RUC.
   ================================================================================== */

/* ---------- PERSONA: staff (12) ---------- */
INSERT INTO PERSONA (ID_Distrito, ID_TipoIdentidad, N_Documento, Nombre,
                     Ap_Paterno, Ap_Materno, EMAIL, Celular, Genero, Direccion)
SELECT d.ID_Distrito, t.ID_TipoIdentidad, v.Doc, v.Nombre, v.ApPat, v.ApMat,
       v.Email, v.Cel, v.Gen, v.Dir
FROM (VALUES
  ('ICA','ICA','ICA','DNI','45000001','JUAN CARLOS','WONG','CHONG','jwong@chifa.pe','951000001','M','Av. San Martin 123'),
  ('ICA','ICA','PARCONA','DNI','45000002','ROSA','PEREZ','QUISPE','rperez@chifa.pe','951000002','F','Calle Lima 456'),
  ('ICA','ICA','ICA','DNI','45000003','PEDRO','RAMOS','TORRES','pramos@chifa.pe','951000003','M','Urb. San Miguel B-12'),
  ('ICA','ICA','LA TINGUIÑA','DNI','45000004','ANA','FLORES','MENDOZA','aflores@chifa.pe','951000004','F','Av. Tinguina 789'),
  ('ICA','ICA','SUBTANJALLA','DNI','45000005','LUIS','GARCIA','HUAMAN','lgarcia@chifa.pe','951000005','M','Calle Arequipa 321'),
  ('ICA','ICA','ICA','DNI','45000006','CARMEN','VARGAS','RIOS','cvargas@chifa.pe','951000006','F','Jr. Bolivar 654'),
  ('ICA','ICA','SAN JUAN BAUTISTA','DNI','45000007','MIGUEL','TORRES','PAREDES','mtorres@chifa.pe','951000007','M','Av. Principal 987'),
  ('ICA','ICA','ICA','DNI','45000008','DIEGO','FERNANDEZ','SALAS','dfernandez@chifa.pe','951000008','M','Calle Callao 147'),
  ('ICA','ICA','ICA','DNI','45000009','SOFIA','MENDOZA','CASTRO','smendoza@chifa.pe','951000009','F','Urb. Las Casuarinas C-3'),
  ('ICA','ICA','PUEBLO NUEVO','DNI','45000010','RAUL','QUISPE','MAMANI','rquispe@chifa.pe','951000010','M','Av. Pueblo Nuevo 258'),
  ('ICA','ICA','SANTIAGO','DNI','45000011','JORGE','POMA','LIMA','jpoma@chifa.pe','951000011','M','Calle Santiago 369'),
  ('ICA','ICA','ICA','DNI','45000012','ELENA','NUNEZ','VEGA','enunez@chifa.pe','951000012','F','Jr. Ica 741')
) AS v(Dep, Prov, Dist, TipoDoc, Doc, Nombre, ApPat, ApMat, Email, Cel, Gen, Dir)
  INNER JOIN DEPARTAMENTO dep ON dep.N_Departamento = v.Dep
  INNER JOIN PROVINCIA prv ON prv.ID_Departamento = dep.ID_Departamento
                           AND prv.N_Provincia = v.Prov
  INNER JOIN DISTRITO d ON d.ID_Provincia = prv.ID_Provincia
                         AND d.D_Distrito = v.Dist
  INNER JOIN TIPO_IDENTIDAD t ON t.Abreviatura = v.TipoDoc
ON CONFLICT ON CONSTRAINT uq_persona_doc DO NOTHING;

/* ---------- EMPLEADO: puestos del staff (12) ---------- */
INSERT INTO EMPLEADO (ID_Persona, ID_Contrato, ID_Cargo, Salario, Turno,
                      Fondo_Pension, F_Ingreso)
SELECT p.ID_Persona, ct.ID_Contrato, ca.ID_Cargo,
       v.Salario, v.Turno, v.Fondo, v.Ingreso::DATE
FROM (VALUES
  ('45000001','PLAZO INDETERMINADO','CHEF',4200.00,'Partido','AFP','2022-03-01'),
  ('45000002','PLAZO FIJO','AYUDANTE DE COCINA',1600.00,'Partido','ONP','2023-06-15'),
  ('45000003','PLAZO FIJO','MOZO',1300.00,'Partido','AFP','2023-02-01'),
  ('45000004','PLAZO FIJO','MOZO',1300.00,'Partido','ONP','2023-02-01'),
  ('45000005','PART TIME','MOZO',700.00,'Noche','ONP','2024-01-10'),
  ('45000006','PLAZO INDETERMINADO','CAJERO',1800.00,'Partido','AFP','2022-08-01'),
  ('45000007','PLAZO FIJO','CAJERO',1700.00,'Partido','AFP','2023-09-01'),
  ('45000008','PLAZO FIJO','BARMAN',1500.00,'Noche','ONP','2023-05-01'),
  ('45000009','PLAZO FIJO','ANFITRIONA',1400.00,'Partido','AFP','2024-02-01'),
  ('45000010','PLAZO FIJO','REPARTIDOR',1300.00,'Partido','ONP','2023-11-01'),
  ('45000011','PLAZO FIJO','REPARTIDOR',1300.00,'Partido','ONP','2024-03-01'),
  ('45000012','PLAZO FIJO','ALMACENERO',1600.00,'Mañana','AFP','2023-07-01')
) AS v(Doc, Contrato, Cargo, Salario, Turno, Fondo, Ingreso)
  INNER JOIN PERSONA p ON p.N_Documento = v.Doc
  INNER JOIN CONTRATO ct ON ct.N_Contrato = v.Contrato
  INNER JOIN CARGO ca ON ca.N_Cargo = v.Cargo
ON CONFLICT (ID_Persona) DO NOTHING;

/* ---------- PERSONA: clientes naturales (20) ---------- */
INSERT INTO PERSONA (ID_Distrito, ID_TipoIdentidad, N_Documento, Nombre,
                     Ap_Paterno, Ap_Materno, EMAIL, Celular, Genero, Direccion)
SELECT d.ID_Distrito, t.ID_TipoIdentidad, v.Doc, v.Nombre, v.ApPat, v.ApMat,
       v.Email, v.Cel, v.Gen, v.Dir
FROM (VALUES
  ('ICA','ICA','ICA','DNI','46000001','CARLOS','HUAMAN','FLORES','chuaman@gmail.com','952000001','M','Av. Grau 111'),
  ('ICA','ICA','ICA','DNI','46000002','PATRICIA','QUISPE','RAMOS','pquispe@gmail.com','952000002','F','Calle Tacna 222'),
  ('ICA','ICA','PARCONA','DNI','46000003','JORGE','MENDOZA','TORRES','jmendoza@gmail.com','952000003','M','Av. Parcona 333'),
  ('ICA','ICA','LA TINGUIÑA','DNI','46000004','LUCIA','FERNANDEZ','VEGA','lfernandez@gmail.com','952000004','F','Calle Real 444'),
  ('ICA','ICA','SUBTANJALLA','DNI','46000005','MIGUEL','CASTRO','POMA','mcastro@gmail.com','952000005','M','Urb. El Carmen 555'),
  ('ICA','CHINCHA','CHINCHA ALTA','DNI','46000006','ROSA','CHONG','LUNA','rchong@gmail.com','952000006','F','Av. Chincha 666'),
  ('ICA','PISCO','PISCO','DNI','46000007','DANIEL','SALAS','RIOS','dsalas@gmail.com','952000007','M','Jr. Pisco 777'),
  ('ICA','NASCA','NASCA','DNI','46000008','ELENA','PAREDES','LIMA','eparedes@gmail.com','952000008','F','Av. Nasca 888'),
  ('LIMA','LIMA','MIRAFLORES','DNI','46000009','FERNANDO','WONG','LIU','fwong@gmail.com','953000001','M','Av. Larco 999'),
  ('LIMA','LIMA','SAN ISIDRO','DNI','46000010','GABRIELA','LIU','CHEN','gliu@gmail.com','953000002','F','Calle Las Flores 101'),
  ('LIMA','LIMA','SANTIAGO DE SURCO','DNI','46000011','RICARDO','VARGAS','MORALES','rvargas@gmail.com','953000003','M','Av. Encalada 202'),
  ('LIMA','LIMA','JESUS MARIA','DNI','46000012','SANDRA','TORRES','AGUILAR','storres@gmail.com','953000004','F','Jr. Huiracocha 303'),
  ('LIMA','LIMA','SAN MIGUEL','DNI','46000013','OSCAR','RAMIREZ','CAMPOS','oramirez@gmail.com','953000005','M','Av. La Marina 404'),
  ('LIMA','LIMA','PUEBLO LIBRE','DNI','46000014','CARMEN','AGUIRRE','SOTO','caguirre@gmail.com','953000006','F','Av. Sucre 505'),
  ('CALLAO','CALLAO','CALLAO','DNI','46000015','JUAN','SOTO','VILLANUEVA','jsoto@gmail.com','954000001','M','Jr. Callao 606'),
  ('CALLAO','CALLAO','VENTANILLA','DNI','46000016','MARIA','VILLANUEVA','PAREDES','mvillanueva@gmail.com','954000002','F','Av. Ventanilla 707'),
  ('ICA','ICA','SANTIAGO','DNI','46000017','PEDRO','LEON','CHAVEZ','pleon@gmail.com','952000009','M','Calle Santiago 808'),
  ('ICA','ICA','OCUCAJE','DNI','46000018','JUANA','CHAVEZ','DIAZ','jchavez@gmail.com','952000010','F','Av. Ocucaje 909'),
  ('LIMA','LIMA','BARRANCO','DNI','46000019','ALBERTO','DIAZ','FUENTES','adiaz@gmail.com','953000007','M','Jr. Barranco 110'),
  ('LIMA','LIMA','LINCE','DNI','46000020','TERESA','FUENTES','REYES','tfuentes@gmail.com','953000008','F','Av. Arequipa 220')
) AS v(Dep, Prov, Dist, TipoDoc, Doc, Nombre, ApPat, ApMat, Email, Cel, Gen, Dir)
  INNER JOIN DEPARTAMENTO dep ON dep.N_Departamento = v.Dep
  INNER JOIN PROVINCIA prv ON prv.ID_Departamento = dep.ID_Departamento
                           AND prv.N_Provincia = v.Prov
  INNER JOIN DISTRITO d ON d.ID_Provincia = prv.ID_Provincia
                         AND d.D_Distrito = v.Dist
  INNER JOIN TIPO_IDENTIDAD t ON t.Abreviatura = v.TipoDoc
ON CONFLICT ON CONSTRAINT uq_persona_doc DO NOTHING;

/* ---------- CLIENTE natural (20) ---------- */
INSERT INTO CLIENTE (ID_Persona, Codigo_Cliente, Tipo_Cliente)
SELECT p.ID_Persona, v.Codigo, 'N'
FROM (VALUES
  ('46000001','CLI-0003'),('46000002','CLI-0004'),('46000003','CLI-0005'),
  ('46000004','CLI-0006'),('46000005','CLI-0007'),('46000006','CLI-0008'),
  ('46000007','CLI-0009'),('46000008','CLI-0010'),('46000009','CLI-0011'),
  ('46000010','CLI-0012'),('46000011','CLI-0013'),('46000012','CLI-0014'),
  ('46000013','CLI-0015'),('46000014','CLI-0016'),('46000015','CLI-0017'),
  ('46000016','CLI-0018'),('46000017','CLI-0019'),('46000018','CLI-0020'),
  ('46000019','CLI-0021'),('46000020','CLI-0022')
) AS v(Doc, Codigo)
  INNER JOIN PERSONA p ON p.N_Documento = v.Doc
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE c WHERE c.ID_Persona = p.ID_Persona);

/* ---------- EMPRESA (4 clientes jurídicos) ---------- */
INSERT INTO EMPRESA (ID_Distrito, RUC, Razon_Social, Nombre_Comercial,
                     Direccion, Telefono, EMAIL)
SELECT d.ID_Distrito, v.RUC, v.Razon, v.Comercial, v.Dir, v.Tel, v.Email
FROM (VALUES
  ('ICA','ICA','ICA','20123456789','TRANSPORTES ICA S.A.C.','TRANSICA','Av. Panamericana 100','056345678','contacto@transica.pe'),
  ('ICA','ICA','ICA','20234567890','AGROVIA S.A.C.','AGROVIA','Fundo Santa Rosa s/n','056456789','logistica@agrovia.pe'),
  ('LIMA','LIMA','SAN ISIDRO','20345678901','HOTEL LAS DALIAS S.A.C.','LAS DALIAS','Av. Camino Real 200','016789012','reservas@lasdalias.pe'),
  ('CALLAO','CALLAO','CALLAO','20456789012','OPERADOR LOGISTICO CALLAO S.A.C.','OLC','Av. Argentina 300','015678901','facturacion@olc.pe')
) AS v(Dep, Prov, Dist, RUC, Razon, Comercial, Dir, Tel, Email)
  INNER JOIN DEPARTAMENTO dep ON dep.N_Departamento = v.Dep
  INNER JOIN PROVINCIA prv ON prv.ID_Departamento = dep.ID_Departamento
                           AND prv.N_Provincia = v.Prov
  INNER JOIN DISTRITO d ON d.ID_Provincia = prv.ID_Provincia
                         AND d.D_Distrito = v.Dist
ON CONFLICT (RUC) DO NOTHING;

/* ---------- CLIENTE jurídico (4) ---------- */
INSERT INTO CLIENTE (ID_Empresa, Codigo_Cliente, Tipo_Cliente)
SELECT e.ID_Empresa, v.Codigo, 'J'
FROM (VALUES
  ('20123456789','CLI-1001'),('20234567890','CLI-1002'),
  ('20345678901','CLI-1003'),('20456789012','CLI-1004')
) AS v(RUC, Codigo)
  INNER JOIN EMPRESA e ON e.RUC = v.RUC
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE c WHERE c.ID_Empresa = e.ID_Empresa);

/* ---------- CONTROL ---------- */
SELECT 'PERSONA' AS tabla, COUNT(*) AS total FROM PERSONA
UNION ALL SELECT 'EMPRESA', COUNT(*) FROM EMPRESA
UNION ALL SELECT 'CLIENTE', COUNT(*) FROM CLIENTE
UNION ALL SELECT 'EMPLEADO', COUNT(*) FROM EMPLEADO;
