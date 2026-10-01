# Spec delta: dashboard — gráficos operativos sin hardcode

## Endpoint (`/api/v1/dashboard/resumen`, `authGuard`, `DASHBOARD_VER`)
- `ventasDia: [{dia, total}]` últimos 14 días incluye hoy (`venta` `anulada=N`;
  días sin venta en `0`). Reemplaza a `linea6Meses` y `ventasHora`.
- `donaPlatos` top5 real 30d por cantidad; `[]` si vacío.
- Sin fallbacks inventados: en vacío/error `ventasHoy {0,0}`, `pedidos {0,0,0,0}`,
  `mesas {0,0}`, `reservas 0`, `actividad []`, `ultimasVentas []`, `stockBajo []`.
- Regla global `openspec/config.yaml`: prohibido hardcodear datos de negocio;
  UI muestra estados vacíos (`Sin ventas en el rango`, `Sin datos de platos`,
  `Sin ventas registradas`, `Sin alertas de stock`).

## Criterios
1. Barras pedidos suman `activos`; gauge `% = ocupadas/total` (`0/0 → 0%`).
2. Ticket `= total/comandas` en KPI (`—` si 0 comandas).
3. Refresh 30s sin skeleton; badge hora + botón manual.
4. Día muestra 14 barras con pico resaltado o vacío real.
5. Dona suma ~100% con top5 o vacío real.
