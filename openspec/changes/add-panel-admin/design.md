# Design: add-panel-admin

## Mapeo sección ↔ fuente (solo lectura)
| Sección | Fuente primaria | Fallback |
|---|---|---|
| Ventas del día (total + comandas) | `VW_VENTAS_DIARIAS` | `VENTA` del día (suma + conteo) |
| Pedidos activos (abiertos/cocina/por cobrar) | `PEDIDO` por estado | — |
| Mesas ocupadas (16/25) | `VW_MAPA_MESAS` | `MESA` + `ESTADO_MESA` |
| Reservas pendientes | `RESERVA` estado `P` | — |
| Actividad reciente (5) | `AUDITORIA` últimas | — |
| Últimas ventas (5) | `VENTA` + `CLIENTE` + comprobante | — |
| Stock bajo | `PRODUCTO` (`Controla_Stock=S`, `Stock ≤ Mínimo`) | — |
| Línea 6 meses | `VENTA` por mes | Valores estáticos plantilla si no hay historia |
| Dona top platos | ventas por categoría | Valores estáticos plantilla si no hay historia |

Si una vista `VW_*` no existe en la BD viva, el repositorio usa tablas
base (se documenta cuál en el código con comentario `FALLBACK`).

## Decisiones
1. **Un solo endpoint agregado**: `GET /api/v1/dashboard/resumen`
   (permiso `DASHBOARD_VER`) devuelve todo el panel de una vez (7 lecturas
   en paralelo, sin N+1).
2. **Sin librería de gráficos**: componentes SVG data-driven con los
   mismos paths de la plantilla; etiquetas como valores; `role="img"`.
3. **Hero con usuario real** (`useAuth`), fecha actual en español.
4. **Guards**: `authGuard + requirePermisos('DASHBOARD_VER')`; ruta
   ADMIN/GERENTE/SUPERVISOR.
5. **`DASHBOARD_VER`**: entra al patch de permisos del bloque final
   (igual que `MESA_*/CLI_*/EMP_*`).
