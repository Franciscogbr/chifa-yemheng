/* ==================================================================================
   SEEDS NIVEL 0b - CATALOGOS DEL CHIFA (tablas fuertes restantes + nivel 1/2 base)
   ----------------------------------------------------------------------------------
   Requiere: esquema + seeds base. Idempotente (ON CONFLICT / WHERE NOT EXISTS).
   Contenido: CARGO, TIPO_USUARIO, MODULO, ROL, AMBIENTE, TIPO_MESA,
   UNIDAD_MEDIDA, CATEGORIA_PRODUCTO, CAJA, PERMISO y matriz ROL_PERMISO
   (incluye VEN_NOTACREDITO solo para ADMINISTRADOR y SUPERVISOR).
   ================================================================================== */

/* ---------- CARGO (+4) ---------- */
INSERT INTO CARGO (N_Cargo, Area) VALUES
 ('COCINERO ORIENTAL','Cocina'),
 ('ANFITRIONA','Salón'),
 ('ALMACENERO','Almacén'),
 ('MOTORIZADO','Delivery')
ON CONFLICT (N_Cargo) DO NOTHING;

/* ---------- TIPO_USUARIO (+2) ---------- */
INSERT INTO TIPO_USUARIO (N_TipoUsuario) VALUES
 ('DELIVERY'),
 ('ALMACEN')
ON CONFLICT (N_TipoUsuario) DO NOTHING;

/* ---------- MODULO (+1 Inventario: existen RECETA/MOVIMIENTO_INVENTARIO) ---------- */
INSERT INTO MODULO (N_Modulo, Descripcion, Icono, Orden) VALUES
 ('INVENTARIO','Stock de insumos y recetas','archive',10)
ON CONFLICT (N_Modulo) DO NOTHING;

/* ---------- ROL (+2) ---------- */
INSERT INTO ROL (N_Rol, Descripcion, Nivel) VALUES
 ('REPARTIDOR','Reparto delivery y rendición de efectivo',6),
 ('ALMACENERO','Control de insumos y stock',6)
ON CONFLICT (N_Rol) DO NOTHING;

/* ---------- AMBIENTE (+2) ---------- */
INSERT INTO AMBIENTE (N_Ambiente, Descripcion, Piso) VALUES
 ('SALON FAMILIAR','Mesas grandes para grupos familiares',1),
 ('MEZZANINE','Segundo nivel con vista al salón',2)
ON CONFLICT (N_Ambiente) DO NOTHING;

/* ---------- TIPO_MESA (+2) ---------- */
INSERT INTO TIPO_MESA (Descripcion, Cargo_Servicio) VALUES
 ('MESA FAMILIAR',0),
 ('MESA REDONDA GIRATORIA',10)
ON CONFLICT (Descripcion) DO NOTHING;

/* ---------- UNIDAD_MEDIDA (+4) ---------- */
INSERT INTO UNIDAD_MEDIDA (N_Unidad, Abreviatura, Codigo_SUNAT) VALUES
 ('TAZA','TZA','NIU'),
 ('TAZON','TZN','NIU'),
 ('CAJA','CAJ','NIU'),
 ('SACO','SAC','NIU')
ON CONFLICT (N_Unidad) DO NOTHING;

/* ---------- CATEGORIA_PRODUCTO (+3 carta chifa) ---------- */
INSERT INTO CATEGORIA_PRODUCTO (N_CategoriaProducto, Descripcion, Area_Despacho, Orden_Carta) VALUES
 ('SOPAS ORIENTALES','Sopa wantán, min pao, sopa de pollo oriental','COCINA',9),
 ('PLATOS CHIFA','Chaufa, tallarines y saltados orientales','COCINA',10),
 ('BEBIDAS ORIENTALES','Té jazmín y bebidas asiáticas','BARRA',11)
ON CONFLICT (N_CategoriaProducto) DO NOTHING;

/* ---------- CAJA (+1 delivery) ---------- */
INSERT INTO CAJA (N_Caja, Descripcion, Ubicacion, Serie_Terminal, Moneda, Monto_Base) VALUES
 ('CAJA 03','Caja de delivery y reparto','Módulo de despacho','TERM-003','PEN',50.00)
ON CONFLICT (N_Caja) DO NOTHING;

/* ---------- PERMISO (+4 flujo chifa + NC) ---------- */
INSERT INTO PERMISO (ID_Modulo, N_Permiso, Clave, Descripcion)
SELECT m.ID_Modulo, 'Emitir nota de crédito', 'VEN_NOTACREDITO',
       'Anular venta facturada con NC y devolución (solo supervisor)'
FROM MODULO m WHERE m.N_Modulo = 'VENTAS'
AND NOT EXISTS (SELECT 1 FROM PERMISO p WHERE p.Clave = 'VEN_NOTACREDITO');

INSERT INTO PERMISO (ID_Modulo, N_Permiso, Clave, Descripcion)
SELECT m.ID_Modulo, 'Actualizar estado de cocina', 'PED_COCINA',
       'Cambiar preparación P/E/S/A de los ítems'
FROM MODULO m WHERE m.N_Modulo = 'PEDIDOS'
AND NOT EXISTS (SELECT 1 FROM PERMISO p WHERE p.Clave = 'PED_COCINA');

INSERT INTO PERMISO (ID_Modulo, N_Permiso, Clave, Descripcion)
SELECT m.ID_Modulo, 'Gestionar entregas delivery', 'PED_DELIVERY',
       'Asignar repartidor y actualizar P/R/E/C'
FROM MODULO m WHERE m.N_Modulo = 'PEDIDOS'
AND NOT EXISTS (SELECT 1 FROM PERMISO p WHERE p.Clave = 'PED_DELIVERY');

INSERT INTO PERMISO (ID_Modulo, N_Permiso, Clave, Descripcion)
SELECT m.ID_Modulo, 'Registrar movimientos de inventario', 'INV_AJUSTE',
       'Entradas, salidas, ajustes y mermas de insumos'
FROM MODULO m WHERE m.N_Modulo = 'INVENTARIO'
AND NOT EXISTS (SELECT 1 FROM PERMISO p WHERE p.Clave = 'INV_AJUSTE');

/* ---------- ROL_PERMISO: completar matriz ---------- */
/* ADMINISTRADOR: todo lo nuevo */
INSERT INTO ROL_PERMISO (ID_Rol, ID_Permiso, Concedido)
SELECT r.ID_Rol, p.ID_Permiso, 'S'
FROM ROL r CROSS JOIN PERMISO p
WHERE r.N_Rol = 'ADMINISTRADOR'
  AND p.Clave IN ('VEN_NOTACREDITO','PED_COCINA','PED_DELIVERY','INV_AJUSTE')
  AND NOT EXISTS (SELECT 1 FROM ROL_PERMISO x
                  WHERE x.ID_Rol = r.ID_Rol AND x.ID_Permiso = p.ID_Permiso);

/* SUPERVISOR: supervisión total del salón, caja y NC */
INSERT INTO ROL_PERMISO (ID_Rol, ID_Permiso, Concedido)
SELECT r.ID_Rol, p.ID_Permiso, 'S'
FROM ROL r CROSS JOIN PERMISO p
WHERE r.N_Rol = 'SUPERVISOR'
  AND p.Clave IN ('PED_REGISTRAR','PED_ANULAR','PED_DESCUENTO','SAL_RESERVA',
                  'VEN_EMITIR','VEN_ANULAR','VEN_NOTACREDITO',
                  'CAJ_APERTURAR','CAJ_CERRAR','CAJ_EGRESO',
                  'REP_VER','AUD_VER')
  AND NOT EXISTS (SELECT 1 FROM ROL_PERMISO x
                  WHERE x.ID_Rol = r.ID_Rol AND x.ID_Permiso = p.ID_Permiso);

/* MOZO: descuento (con autorización) */
INSERT INTO ROL_PERMISO (ID_Rol, ID_Permiso, Concedido)
SELECT r.ID_Rol, p.ID_Permiso, 'S'
FROM ROL r CROSS JOIN PERMISO p
WHERE r.N_Rol = 'MOZO' AND p.Clave = 'PED_DESCUENTO'
  AND NOT EXISTS (SELECT 1 FROM ROL_PERMISO x
                  WHERE x.ID_Rol = r.ID_Rol AND x.ID_Permiso = p.ID_Permiso);

/* COCINA: estados de preparación */
INSERT INTO ROL_PERMISO (ID_Rol, ID_Permiso, Concedido)
SELECT r.ID_Rol, p.ID_Permiso, 'S'
FROM ROL r CROSS JOIN PERMISO p
WHERE r.N_Rol = 'COCINA' AND p.Clave = 'PED_COCINA'
  AND NOT EXISTS (SELECT 1 FROM ROL_PERMISO x
                  WHERE x.ID_Rol = r.ID_Rol AND x.ID_Permiso = p.ID_Permiso);

/* REPARTIDOR: comandas y entregas */
INSERT INTO ROL_PERMISO (ID_Rol, ID_Permiso, Concedido)
SELECT r.ID_Rol, p.ID_Permiso, 'S'
FROM ROL r CROSS JOIN PERMISO p
WHERE r.N_Rol = 'REPARTIDOR' AND p.Clave IN ('PED_REGISTRAR','PED_DELIVERY')
  AND NOT EXISTS (SELECT 1 FROM ROL_PERMISO x
                  WHERE x.ID_Rol = r.ID_Rol AND x.ID_Permiso = p.ID_Permiso);

/* ALMACENERO: catálogos e inventario */
INSERT INTO ROL_PERMISO (ID_Rol, ID_Permiso, Concedido)
SELECT r.ID_Rol, p.ID_Permiso, 'S'
FROM ROL r CROSS JOIN PERMISO p
WHERE r.N_Rol = 'ALMACENERO' AND p.Clave IN ('MAN_CATALOGO','INV_AJUSTE')
  AND NOT EXISTS (SELECT 1 FROM ROL_PERMISO x
                  WHERE x.ID_Rol = r.ID_Rol AND x.ID_Permiso = p.ID_Permiso);

/* ---------- CONTROL ---------- */
SELECT 'CARGO' AS tabla, COUNT(*) AS total FROM CARGO
UNION ALL SELECT 'TIPO_USUARIO', COUNT(*) FROM TIPO_USUARIO
UNION ALL SELECT 'MODULO', COUNT(*) FROM MODULO
UNION ALL SELECT 'ROL', COUNT(*) FROM ROL
UNION ALL SELECT 'AMBIENTE', COUNT(*) FROM AMBIENTE
UNION ALL SELECT 'TIPO_MESA', COUNT(*) FROM TIPO_MESA
UNION ALL SELECT 'UNIDAD_MEDIDA', COUNT(*) FROM UNIDAD_MEDIDA
UNION ALL SELECT 'CATEGORIA_PRODUCTO', COUNT(*) FROM CATEGORIA_PRODUCTO
UNION ALL SELECT 'CAJA', COUNT(*) FROM CAJA
UNION ALL SELECT 'PERMISO', COUNT(*) FROM PERMISO
UNION ALL SELECT 'ROL_PERMISO', COUNT(*) FROM ROL_PERMISO;
