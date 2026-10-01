# Proposal: add-crud-categorias

## Por qué
Las categorías son la base del catálogo: sin ellas no hay productos
(escenarios 2-3 de `categorias.md`) ni carta ordenada. Es el CRUD más
simple (3 campos + área/orden) y deja el molde ABM que reutilizan los
otros 4 CRUDs (paginación, filtros, modal, confirmación, 403).

## Qué
ABM de categorías (`/admin/categorias`, `features/admin/categorias`)
según `openspec/docs/screens/categorias.md`:
- Tabla: ID, Nombre, Descripción, Estado, Productos Asociados,
  Fecha Creación, Acciones (ver/editar/activar-desactivar).
- Modal: Nombre* (max 50), Descripción (max 500→100), Área
  (COCINA/BARRA/CAJA), Orden, Estado switch. Sin código REF, sin
  iconos, sin destacada (no existen en BD).
- Filtros nombre + estado, paginación 20/50/100, responsive
  (tabla desktop / scroll tablet / cards móvil).
- Desactivar con productos → confirmación con conteo (escenario 5).
- Auditoría crear/editar/activar/desactivar. Eliminar = estado `I`.
- Roles ADMIN/GERENTE/SUPERVISOR, permisos `CAT_VER/CREAR/EDITAR/ELIMINAR`.

## No objetivos
- Exportar Excel/PDF (diferido a change propio).
- Iconos por categoría / destacadas (sin columna en BD).
- Botón “Reordenar Carta” (el orden se edita por fila).
- Productos (siguiente CRUD).
