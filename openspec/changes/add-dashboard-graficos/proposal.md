# Proposal: add-dashboard-graficos

## Por qué
El bloque `Flujo Operativo / Actividades recientes` es lista de auditoría,
no ayuda a decidir. Se pide gráficos operativos en el panel.

## Qué
1. Reemplazar actividades por `Pedidos por etapa` (barras) + `Ocupación` (gauge).
2. Ticket promedio dentro del KPI Ventas del Día.
3. Auto-refresh 30s + badge + botón manual.
4. Ventas hoy por hora (10–23) para picos almuerzo/noche.
5. Dona platos real últimos 30d por cantidad (antes fallback fijo).

## No objetivos
- Desglose por ambiente/turno, tiempo cocina, tendencia vs ayer (fase 2).
- Librerías de gráficos (se mantiene SVG puro Opción A).
