# Proposal: add-crud-productos

## Por qué
Segundo CRUD por dependencias: cada producto exige categoría
(`FK_PRODUCTO_CATEGORIA`) y unidad (`FK_PRODUCTO_UNIDAD`). Los
escenarios 2-3 de categorías (selector con activas) se verifican aquí.
Base de comandas, carta y cocina (`BR-RES-011/022`, `BR-EST-010`).

## Qué
ABM de productos (`/admin/productos`, `features/admin/productos`)
según `openspec/docs/screens/productos.md` + plantilla
`design/productos-template.html` (con los cambios aprobados):
- Tabla: Foto, Nombre+Código, Categoría, Precio, Stock, Cocción,
  En Carta (Disponible), Estado, Acciones (ver/editar/toggle).
- Modal: Nombre* (50), Categoría* (selector API CRUD 1),
  Tipo P/B/I, Precio* (≥0), Unidad* (selector), Stock, Stock mín,
  Controla stock, Tiempo min, Disponible switch, Imagen (URL v1),
  Detalle (150), Costo, Marca, Afecto IGV. Sin botón Eliminar.
- Filtros: buscar, categoría, estado, disponibilidad. Paginación 20/50/100.
- Desactivar = estado `I`. Auditoría crear/editar/activar/desactivar.
- Roles ADMIN/GERENTE/SUPERVISOR (`PROD_VER/CREAR/EDITAR/ELIMINAR`).
- Responsive tabla/scroll/cards + modal full-screen móvil.

## No objetivos
- Exportar Carta (diferido), upload real de imágenes (URL en v1,
  Storage en change propio), recetas/insumos por plato (`recetas.md`),
  control de stock por movimientos (solo visualización de saldos).
