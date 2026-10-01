# Design: add-dashboard-graficos

## Contratos
| Campo | Origen | Decisión |
|---|---|---|
| `pedidos {abiertos,cocina,porCobrar}` | ya existe | Solo front `BarrasPedidosChart`. |
| `mesas {ocupadas,total}` | ya existe | Solo front `GaugeOcupacionChart`. |
| ticket | `ventasHoy.total/comandas` | Calculado front, guard ÷0. Dentro del KPI para no romper grid 4. |
| refresh 30s | front `setInterval` + `vivo` + `clear` | Recarga silenciosa, badge hora, botón manual. |
| `ventasHora [{hora,total}]` | nuevo `venta(f_venta,total)` hoy `anulada=N`, buckets 10–23 | Backend `ventasHora()` + `FALLBACK_HORA` ceros. Front `BarrasHoraChart` pico `#A61E22`. |
| `donaPlatos` real | nuevo `detalle_pedido(cantidad,id_producto,estado=A)` 30d + `producto(n_producto)` top5 | `pct=round(cant/topTotal*100)`, paleta fija 5. Fallback anterior si vacío. |

## Decisiones
1. Hora por hora (no turnos) para ver picos 13h/20h.
2. Dona 30d por cantidad (hoy es inestable; revenue sesga a caros).
3. Actividad se elimina del render, se mantiene en API por compat.
