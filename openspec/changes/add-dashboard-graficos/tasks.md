# Tasks: add-dashboard-graficos

- [x] T1 Backend tipos: `models/dashboard.ts` (`PuntoDia`, `ventasDia`; sin `PuntoSerie/PuntoHora/linea6Meses/ventasHora`)
- [x] T2 Backend datos: `repositories/dashboard-repository.ts` (cero fallbacks → 0/[]; `ventasPorDia()` 14d; `donaPlatos()` real 30d top5)
- [x] T3 Frontend tipos: `dashboard-types.ts` (`PuntoDia`, `ventasDia`)
- [x] T4 Frontend panel: ticket en KPI, refresh 30s + badge + manual, reemplazo actividad por `BarrasPedidosChart` + `GaugeOcupacionChart`, `BarrasDiaChart` 14 días con vacío real, `DonaChart`/`Últimas` con vacíos
- [x] T5 Regla global: `openspec/config.yaml` prohibido hardcodear datos (0/[] + estado vacío)
- [x] T6 Verificación: typecheck backend OK, build backend OK, tsc/vite build front OK (193 módulos). Manual pendiente contra Supabase
