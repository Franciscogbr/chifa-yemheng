-- =============================================================
-- Patch: permisos CRUD Categorías + Productos (CAT_*, PROD_*)
-- BD: RESTAURANTEV3 — correr en SQL Editor (Run).
-- Idempotente: solo inserta lo que no existe (por clave / par rol-permiso).
-- CAT_* → módulo MANTENIMIENTO (catálogos maestros).
-- PROD_* → módulo CARTA (categorías y productos).
-- Roles: ADMINISTRADOR (acceso total) + SUPERVISOR (según specs).
-- Nota: no existe rol GERENTE en ROL (solo en jerarquía documental);
-- cuando se cree, agregar aquí sus filas.
-- =============================================================

-- ---------- 1. PERMISOS ----------
INSERT INTO public.permiso (id_modulo, n_permiso, clave, descripcion)
SELECT m.id_modulo, v.n_permiso, v.clave, v.descripcion
FROM (VALUES
  ('MANTENIMIENTO', 'Ver categorías',    'CAT_VER',      'Listar categorías (categorias.md)'),
  ('MANTENIMIENTO', 'Crear categorías',  'CAT_CREAR',    'Registrar categoría (categorias.md)'),
  ('MANTENIMIENTO', 'Editar categorías', 'CAT_EDITAR',   'Editar categoría (categorias.md)'),
  ('MANTENIMIENTO', 'Eliminar categorías','CAT_ELIMINAR','Activar/desactivar categoría (categorias.md)'),
  ('CARTA', 'Ver productos',              'PROD_VER',     'Listar productos (productos.md)'),
  ('CARTA', 'Crear productos',            'PROD_CREAR',   'Registrar producto (productos.md)'),
  ('CARTA', 'Editar productos',           'PROD_EDITAR',  'Editar producto (productos.md)'),
  ('CARTA', 'Eliminar productos',         'PROD_ELIMINAR','Activar/desactivar producto (productos.md)')
) AS v(modulo, n_permiso, clave, descripcion)
JOIN public.modulo m ON m.n_modulo = v.modulo
WHERE NOT EXISTS (
  SELECT 1 FROM public.permiso p WHERE p.clave = v.clave
);

-- ---------- 2. MATRIZ ROL_PERMISO ----------
INSERT INTO public.rol_permiso (id_rol, id_permiso, concedido)
SELECT r.id_rol, p.id_permiso, 'S'
FROM public.rol r
CROSS JOIN public.permiso p
WHERE r.n_rol IN ('ADMINISTRADOR', 'SUPERVISOR')
  AND p.clave IN ('CAT_VER','CAT_CREAR','CAT_EDITAR','CAT_ELIMINAR',
                  'PROD_VER','PROD_CREAR','PROD_EDITAR','PROD_ELIMINAR')
  AND NOT EXISTS (
    SELECT 1 FROM public.rol_permiso x
    WHERE x.id_rol = r.id_rol AND x.id_permiso = p.id_permiso
  );

-- ---------- 3. VERIFICACION ----------
-- SELECT clave FROM public.permiso WHERE clave LIKE 'CAT\_%' OR clave LIKE 'PROD\_%';
-- Esperado: 8 filas.
