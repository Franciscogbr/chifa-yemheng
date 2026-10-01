/* ==================================================================================
   SEEDS NIVEL 1b - CARTA DEL CHIFA (MESA, PRODUCTO, SERIE_DOCUMENTO, RECETA)
   ----------------------------------------------------------------------------------
   Requiere: esquema + base + 08 + 09. Idempotente (ON CONFLICT / NOT EXISTS).
   Contenido: 9 mesas nuevas, ~20 platos/bebidas + 12 insumos, series de
   CAJA 03 y ~30 recetas de los platos bandera.
   ================================================================================== */

/* ---------- MESA (+9) ---------- */
INSERT INTO MESA (ID_EstadoMesa, ID_Ambiente, ID_TipoMesa, Numero, Capacidad, Detalle)
SELECT e.ID_EstadoMesa, a.ID_Ambiente, t.ID_TipoMesa, v.Numero, v.Capacidad, v.Detalle
FROM (VALUES
  ('SALON FAMILIAR','MESA FAMILIAR','F1',8,'Mesa familiar junto a ventana'),
  ('SALON FAMILIAR','MESA FAMILIAR','F2',8,'Mesa familiar'),
  ('MEZZANINE','MESA ESTANDAR','M1',4,'Mezzanine vista salón'),
  ('MEZZANINE','MESA ESTANDAR','M2',4,'Mezzanine vista salón'),
  ('SALON PRINCIPAL','MESA ESTANDAR','05',4,'Mesa cuadrada'),
  ('SALON PRINCIPAL','MESA ESTANDAR','06',4,'Mesa cuadrada'),
  ('TERRAZA','MESA ESTANDAR','T3',4,'Terraza'),
  ('BARRA','BARRA','B2',2,'Barra'),
  ('SALA VIP','MESA REDONDA GIRATORIA','V2',10,'Mesa redonda giratoria')
) AS v(Ambiente, TipoMesa, Numero, Capacidad, Detalle)
  INNER JOIN AMBIENTE a ON a.N_Ambiente = v.Ambiente
  INNER JOIN TIPO_MESA t ON t.Descripcion = v.TipoMesa
  CROSS JOIN ESTADO_MESA e
WHERE e.Descripcion = 'LIBRE'
  AND NOT EXISTS (SELECT 1 FROM MESA m
                  WHERE m.ID_Ambiente = a.ID_Ambiente AND m.Numero = v.Numero);

/* ---------- PRODUCTO: platos y bebidas chifa (+20) ---------- */
INSERT INTO PRODUCTO (ID_CategoriaProducto, ID_Unidad, Codigo, N_Producto, Detalle,
                      Precio, Costo, Tipo_Producto, Tiempo_Preparacion)
SELECT c.ID_CategoriaProducto, u.ID_Unidad, v.Codigo, v.N_Producto, v.Detalle,
       v.Precio, v.Costo, v.Tipo, v.Tiempo
FROM (VALUES
  ('SOPAS ORIENTALES','TAZON','SOP001','Sopa Wantán','Wantán, pollo y verduras chinas',12.00,4.00,'P',12),
  ('SOPAS ORIENTALES','TAZON','SOP002','Min Pao','Sopa con min pao relleno de chancho',14.00,5.00,'P',15),
  ('SOPAS ORIENTALES','TAZON','SOP003','Sopa de Pollo Oriental','Pollo, kion y sillao',13.00,4.50,'P',15),
  ('PLATOS CHIFA','PORCION','CHF001','Tallarín Saltado de Pollo','Salteado al wok con verduras',30.00,11.00,'P',18),
  ('PLATOS CHIFA','PORCION','CHF002','Tallarín Saltado de Carne','Lomo fino salteado al wok',32.00,12.00,'P',18),
  ('PLATOS CHIFA','PORCION','CHF003','Arroz Chaufa Especial','Pollo, chancho, huevo y sillao',34.00,12.00,'P',18),
  ('PLATOS CHIFA','PORCION','CHF004','Chi Jau Kay','Pollo crocante en salsa de ostión',36.00,13.00,'P',20),
  ('PLATOS CHIFA','PORCION','CHF005','Kam Lu Wantán','Chancho agridulce con wantán frito',34.00,12.00,'P',20),
  ('PLATOS CHIFA','PORCION','CHF006','Pollo Ti Pa Kay','Pollo dorado en salsa ti pa kay',35.00,13.00,'P',20),
  ('PLATOS CHIFA','PORCION','CHF007','Chaufa de Mariscos','Arroz chaufa con mariscos',38.00,15.00,'P',20),
  ('PLATOS CHIFA','PORCION','CHF008','Aeropuerto','Chaufa con tallarín y tortilla',32.00,11.00,'P',18),
  ('ENTRADAS','PORCION','ENT003','Wantán Frito','8 unidades con salsa de tamarindo',12.00,3.50,'P',10),
  ('ENTRADAS','PORCION','ENT004','Enrollado Primavera','2 unidades con salsa agridulce',13.00,4.00,'P',10),
  ('BEBIDAS ORIENTALES','TAZA','BEO001','Té Jazmín','Taza de té de jazmín',6.00,1.50,'B',3),
  ('BEBIDAS ORIENTALES','TAZA','BEO002','Té Verde','Taza de té verde',6.00,1.50,'B',3),
  ('BEBIDAS FRIAS','BOTELLA','BEF004','Inca Kola 1LT','Botella familiar',10.00,5.50,'B',1),
  ('BEBIDAS FRIAS','BOTELLA','BEF005','Agua Mineral 625ml','Botella personal',4.00,2.00,'B',1)
) AS v(Categoria, Unidad, Codigo, N_Producto, Detalle, Precio, Costo, Tipo, Tiempo)
  INNER JOIN CATEGORIA_PRODUCTO c ON c.N_CategoriaProducto = v.Categoria
  INNER JOIN UNIDAD_MEDIDA u ON u.N_Unidad = v.Unidad
ON CONFLICT (Codigo) DO NOTHING;

/* Stock para embotellados nuevos */
UPDATE PRODUCTO SET Controla_Stock = 'S', Stock_Actual = 24, Stock_Minimo = 6
WHERE Codigo IN ('BEF004','BEF005') AND Controla_Stock = 'N';

/* ---------- PRODUCTO: insumos de almacén (+12) ---------- */
INSERT INTO PRODUCTO (ID_CategoriaProducto, ID_Unidad, Codigo, N_Producto, Detalle,
                      Precio, Costo, Tipo_Producto, Controla_Stock,
                      Stock_Actual, Stock_Minimo)
SELECT c.ID_CategoriaProducto, u.ID_Unidad, v.Codigo, v.N_Producto, v.Detalle,
       0, v.Costo, 'I', 'S', v.Stock, v.Minimo
FROM (VALUES
  ('KILOGRAMO','INS001','Arroz Grano Largo','Saco de arroz superior',4.50,50,10),
  ('KILOGRAMO','INS002','Pollo Entero','Pollo fresco eviscerado',9.00,30,5),
  ('LITRO','INS003','Sillao','Sillao superior por litro',12.00,10,2),
  ('KILOGRAMO','INS004','Kion','Kion fresco',8.00,5,1),
  ('LITRO','INS005','Aceite Vegetal','Aceite para wok',7.00,20,4),
  ('UNIDAD','INS006','Huevo','Huevo pardo',0.50,200,30),
  ('KILOGRAMO','INS007','Masa Wantán','Láminas para wantán y min pao',10.00,8,2),
  ('KILOGRAMO','INS008','Fideo Tallarín','Tallarín grueso oriental',6.00,15,3),
  ('KILOGRAMO','INS009','Verduras Chinas','Col china, cebolla china y holantao',5.00,12,2),
  ('KILOGRAMO','INS010','Carne de Res','Lomo fino',24.00,15,3),
  ('KILOGRAMO','INS011','Carne de Chancho','Pierna de chancho',16.00,12,2),
  ('KILOGRAMO','INS012','Azúcar','Azúcar rubia',3.50,25,5)
) AS v(Unidad, Codigo, N_Producto, Detalle, Costo, Stock, Minimo)
  INNER JOIN CATEGORIA_PRODUCTO c ON c.N_CategoriaProducto = 'INSUMOS'
  INNER JOIN UNIDAD_MEDIDA u ON u.N_Unidad = v.Unidad
ON CONFLICT (Codigo) DO NOTHING;

/* ---------- SERIE_DOCUMENTO de CAJA 03 (+2) ---------- */
INSERT INTO SERIE_DOCUMENTO (ID_Caja, Tipo_Documento, Serie, Correlativo)
SELECT c.ID_Caja, v.Tipo, v.Serie, 0
FROM (VALUES ('03','B003'),('01','F003')) AS v(Tipo, Serie)
  INNER JOIN CAJA c ON c.N_Caja = 'CAJA 03'
WHERE NOT EXISTS (SELECT 1 FROM SERIE_DOCUMENTO s
                  WHERE s.Tipo_Documento = v.Tipo AND s.Serie = v.Serie);

/* ---------- RECETA: insumos de 10 platos bandera (30 filas) ---------- */
INSERT INTO RECETA (ID_Producto, ID_Insumo, Cantidad)
SELECT pr.ID_Producto, ins.ID_Producto, v.Cantidad
FROM (VALUES
  ('CHF003','INS001',0.250),('CHF003','INS002',0.200),('CHF003','INS006',2.000),
  ('CHF001','INS008',0.250),('CHF001','INS002',0.200),('CHF001','INS009',0.100),
  ('CHF004','INS002',0.300),('CHF004','INS009',0.100),('CHF004','INS003',0.020),
  ('SOP001','INS007',0.100),('SOP001','INS002',0.100),('SOP001','INS009',0.050),
  ('ENT003','INS007',0.120),('ENT003','INS011',0.080),('ENT003','INS005',0.050),
  ('CHF005','INS007',0.100),('CHF005','INS011',0.150),('CHF005','INS003',0.020),
  ('CHF006','INS002',0.300),('CHF006','INS012',0.030),('CHF006','INS005',0.050),
  ('CHF007','INS001',0.250),('CHF007','INS009',0.100),('CHF007','INS005',0.050),
  ('SOP002','INS007',0.080),('SOP002','INS011',0.100),('SOP002','INS002',0.050),
  ('CHF008','INS001',0.200),('CHF008','INS008',0.100),('CHF008','INS006',1.000)
) AS v(Plato, Insumo, Cantidad)
  INNER JOIN PRODUCTO pr ON pr.Codigo = v.Plato
  INNER JOIN PRODUCTO ins ON ins.Codigo = v.Insumo
WHERE NOT EXISTS (SELECT 1 FROM RECETA r
                  WHERE r.ID_Producto = pr.ID_Producto
                    AND r.ID_Insumo = ins.ID_Producto);

/* ---------- CONTROL ---------- */
SELECT 'MESA' AS tabla, COUNT(*) AS total FROM MESA
UNION ALL SELECT 'PRODUCTO', COUNT(*) FROM PRODUCTO
UNION ALL SELECT 'SERIE_DOCUMENTO', COUNT(*) FROM SERIE_DOCUMENTO
UNION ALL SELECT 'RECETA', COUNT(*) FROM RECETA;
