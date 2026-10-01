-- =============================================================
-- Seed: MODULO + PERMISO parejo a openspec/docs/screens/
-- BD: RESTAURANTEV3 (PostgreSQL) — yemheng.sql
-- Tablas: public.modulo(id_modulo IDENTITY, n_modulo, descripcion,
--           icono, orden, estado)
--         public.permiso(id_permiso IDENTITY, id_modulo,
--           n_permiso, clave, descripcion, estado)
-- Uso: psql -d RESTAURANTEV3 -f openspec/database/permiso_modulo.sql
-- Idempotente: solo inserta lo que no existe (por n_modulo/clave).
-- =============================================================

-- ---------- 1. MODULOS ----------
INSERT INTO public.modulo (n_modulo, descripcion, orden)
SELECT v.n_modulo, v.descripcion, v.orden
FROM (VALUES
  ('SEGURIDAD',       'Autenticación, usuarios y auditoría',      10),
  ('ROLES',           'Roles y matriz de permisos',               20),
  ('MESAS',           'Ambientes, mesas y mapa operativo',        30),
  ('CARTA',           'Carta pública solo lectura',               40),
  ('MOZO',            'POS mozo y comandas',                      50),
  ('COCINA',          'Preparación por ítem',                     60),
  ('CAJA',            'Turnos, movimientos y arqueo',             70),
  ('VENTAS',          'Cobro, comprobantes y notas de crédito',   80),
  ('DELIVERY',        'Pedidos, seguimiento y reparto',           90),
  ('CLIENTE',         'Zona cliente QR / reservas / delivery',   100),
  ('RESERVAS',        'Reservas de mesa 3 canales',              110),
  ('PERSONAL',        'Recursos humanos (empleados)',            120),
  ('INVENTARIO',      'Stock de insumos y kardex',               130),
  ('RECETAS',         'Recetas plato → insumos',                 140),
  ('REPORTES',        'Reportes y tableros',                     150),
  ('AUDITORIA',       'Consulta de auditoría',                   160)
) AS v(n_modulo, descripcion, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM public.modulo m WHERE m.n_modulo = v.n_modulo
);

-- ---------- 2. PERMISOS (clave = código usado en screens/*.md) ----------
-- Estructura: (id_modulo por n_modulo, n_permiso visible, clave, descripcion)

INSERT INTO public.permiso (id_modulo, n_permiso, clave, descripcion)
SELECT m.id_modulo, v.n_permiso, v.clave, v.descripcion
FROM (VALUES
  -- SEGURIDAD / AUDITORIA
  ('SEGURIDAD', 'Ver auditoría',            'AUD_VER',             'Consulta AUDITORIA (auditoria.md)'),
  -- MOZO / comandas (propuestos Lote 2)
  ('MOZO',      'Ver pedidos',              'PED_VER',             'Ver comanda y pedidos por mesa (comanda.md)'),
  ('MOZO',      'Crear pedidos',            'PED_CREAR',           'Abrir comanda y agregar tandas (pos-mozo.md)'),
  ('MOZO',      'Editar pedidos',           'PED_EDITAR',          'Agregar tanda / pedir cuenta (comanda.md)'),
  ('MOZO',      'Descuentos y cortesías',   'PED_DESCUENTO',       'Solo mozo/supervisor, nunca QR (BR-RES-019)'),
  -- PERSONAL (propuestos Lote 3, base usuarios.md)
  ('PERSONAL',  'Ver personal',             'EMP_VER',             'Listar empleados (recursos-humanos.md)'),
  ('PERSONAL',  'Crear personal',           'EMP_CREAR',           'Crear PERSONA+EMPLEADO (recursos-humanos.md)'),
  ('PERSONAL',  'Editar personal',          'EMP_EDITAR',          'Editar/activar personal (recursos-humanos.md)'),
  -- INVENTARIO (legitima huérfanos de roles.md)
  ('INVENTARIO','Ver inventario',           'INV_VER',             'Ver stock insumos (inventario.md)'),
  ('INVENTARIO','Ajustar inventario',       'INV_CREAR',           'Registrar movimientos E/S (inventario.md)'),
  ('INVENTARIO','Ver kardex',               'INV_KARDEX',          'Ver kardex por insumo (inventario.md)'),
  ('INVENTARIO','Editar inventario',        'INV_EDITAR',          'Corregir movimientos (inventario.md)'),
  -- RECETAS (propuestos Lote 3)
  ('RECETAS',   'Ver recetas',              'REC_VER',             'Listar recetas (recetas.md)'),
  ('RECETAS',   'Crear recetas',            'REC_CREAR',           'Crear receta P→I (recetas.md)'),
  ('RECETAS',   'Editar recetas',           'REC_EDITAR',          'Editar/desactivar receta (recetas.md)'),
  -- CAJA (formaliza citados en roles.md)
  ('CAJA',      'Aperturar caja',           'CAJA_APERTURA',       'Abrir turno USP_APERTURAR_CAJA (caja-turno.md)'),
  ('CAJA',      'Cerrar caja',              'CAJA_CIERRE',         'Cerrar turno USP_CERRAR_CAJA (caja-turno.md)'),
  ('CAJA',      'Arqueo de caja',           'CAJA_ARQUEO',         'Declarar y validar arqueo (arque-caja.md)'),
  ('CAJA',      'Rendición delivery',       'CAJA_RENDICION',      'Rendir efectivo repartidor (rendicion-delivery.md)'),
  -- DELIVERY (ya usados en delivery-board.md, se formalizan)
  ('DELIVERY',  'Ver delivery',             'DELIVERY_VER',        'Ver pedidos y seguimiento (pedidos-delivery.md)'),
  ('DELIVERY',  'Asignar delivery',         'DELIVERY_ASIGNAR',    'Asignar repartidor (BR-ACC-041)'),
  ('DELIVERY',  'Despachar delivery',       'DELIVERY_DESPACHAR',  'Iniciar ruta P→R (seguimiento-entregas.md)'),
  ('DELIVERY',  'Entregar delivery',        'DELIVERY_ENTREGAR',   'Confirmar entrega R→E (repartidor-app.md)'),
  -- CLIENTE (zona /cliente/...)
  ('CLIENTE',   'Consumo QR',               'CLIENTE_QR',          'Autoconsumo QR compartido (cliente-comanda.md)'),
  ('CLIENTE',   'Reservas cliente',         'CLIENTE_RESERVA',     'Reservar y mis reservas (cliente-reservar.md)'),
  ('CLIENTE',   'Pedidos cliente',          'CLIENTE_PEDIDOS',     'Delivery y mis pedidos (cliente-delivery.md)'),
  -- RESERVAS staff (ya usados en reservas.md, se aseguran)
  ('RESERVAS',  'Ver reservas',             'RES_VER',             'Listar reservas (reservas.md)'),
  ('RESERVAS',  'Crear reservas',           'RES_CREAR',           'Registrar presencial/telefónica (reservas.md)'),
  ('RESERVAS',  'Confirmar reservas',       'RES_CONFIRMAR',       'Confirmar online con mesa libre + SAL_RESERVA'),
  ('RESERVAS',  'Anular reservas',          'RES_ANULAR',          'Anular P/C → X (reservas.md)'),
  -- Permisos canónicos de negocio (Anexo REGLAS, por si faltan)
  ('VENTAS',    'Emitir nota de crédito',   'VEN_NOTACREDITO',     'Solo supervisor, USP_ANULAR_VENTA_CON_NC'),
  ('RESERVAS',  'Confirmar reserva online', 'SAL_RESERVA',         'Confirma online asignando mesa (BR-RES-052)')
) AS v(modulo, n_permiso, clave, descripcion)
JOIN public.modulo m ON m.n_modulo = v.modulo
WHERE NOT EXISTS (
  SELECT 1 FROM public.permiso p WHERE p.clave = v.clave
);

-- ---------- 3. VERIFICACION ----------
-- Todo permiso citado en screens/*.md debe aparecer aquí o en el dump base:
-- SELECT clave FROM public.permiso ORDER BY clave;
