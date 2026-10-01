# Design: add-crud-categorias

## Mapeo spec ↔ BD (enmiendas documentadas)
| Spec (`categorias.md`) | BD (`CATEGORIA_PRODUCTO`) | Decisión |
|---|---|---|
| Nombre max 100, obligatorio, único | `N_CategoriaProducto varchar(50)`, `UQ_CATEGORIA_PRODUCTO` | Zod `max(50)`; duplicado → 409 `YA_EXISTE`. Manda BD. |
| Descripción max 500, opcional | `Descripcion varchar(100)` | Zod `max(100)`. Manda BD. |
| Estado switch (Activo inicial) | `ESTADO char(1)` default `'A'` | `A`/`I`; eliminar físico prohibido. |
| — (no existe en spec) | `Area_Despacho` NOT NULL default `'COCINA'` | Selector visible COCINA/BARRA/CAJA: lo exige `vw_comanda_cocina` (`yemheng.sql:2643`) para despacho. |
| Orden en modal | `Orden_Carta` NOT NULL default `0` | Numérico; default = max actual + 1. Ordena carta y seed (9/10/11). |
| Tabla: ID, Productos Asociados, Fecha Creación | `ID_CategoriaProducto`, `F_Creacion`, count `PRODUCTO` | Conteo vía join; expone `productosAsociados`. |
| Código REF / iconos / destacada (plantilla Stitch) | Sin columnas | Eliminados (cambios 2-4 de la lista de 15). |
| APIs `/api/categorias` (sin versión) | — | Unificadas a `/api/v1/categorias` (stack §2). |
| Paginación 10/25/50 (plantilla) | — | 20/50/100 (stack: default 20, max 100). |
| Usuario “Carlos Rojas” (plantilla) | `USUARIO` + JWT | Nombre/rol del logueado. |

## Decisiones
1. **Desactivación con productos**: `PATCH /:id/estado` con `{estado:'I'}`
   devuelve 409 `{ error:'TIENE_PRODUCTOS', productosAsociados: N }` si N>0;
   el front muestra confirmación (escenario 5) y reintenta con
   `{estado:'I', confirmar:true}`.
2. **Auditoría**: inserts en `AUDITORIA` (CREAR/EDITAR/ACTIVAR/DESACTIVAR
   categoría) con `ID_Usuario` del JWT.
3. **Guards**: `authGuard + requirePermisos(CAT_VER|CREAR|EDITAR|ELIMINAR)`
   por endpoint; 401 sin token, 403 sin permiso (escenario 4).
4. **Responsive**: `hidden md:table` (tabla desktop, scroll-x en tablet),
   cards `md:hidden` en móvil, modal full-screen en móvil, sidebar
   AdminShell colapsable. Un solo query React Query.
5. **Sidebar AdminShell completo** (Panel, Productos, Categorías, Mesas,
   Personal, Clientes + Cocina, Caja/Ventas, Delivery, Reservas, Reportes,
   Auditoría, Usuarios) con iconos Material Symbols y estado activo.
6. **KPIs**: total, activas (%), productos vinculados, inactivas —
   calculados del mismo endpoint (enhancement sobre la spec, solo lectura).

## Riesgos
- `Area_Despacho`/`Orden_Carta` no están en el modal de la spec: se
  documentan aquí como extensión operativa (cambios 5-6 de la lista).
- Permisos `CAT_*`: si no existen en `ROL_PERMISO` del rol, el admin ve
  403 — se verifica con `fran` y se crea patch SQL si falta.
