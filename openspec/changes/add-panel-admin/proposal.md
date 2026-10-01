# Proposal: add-panel-admin

## Por qué
El panel es el landing tras el login (`rutaInicial: /admin`) y hoy muestra
un placeholder. Centraliza los indicadores que ya especifican
`dashboard.md` y visualizan los CRUDs construidos (ventas, pedidos, mesas,
reservas, auditoría, stock).

## Qué
Dashboard de solo lectura (`/admin`, `features/admin/dashboard`) según
`dashboard.md` + plantilla `design/dashboard-template.html`:
- Hero con nombre real del logueado + botón Ver reportes (futuro).
- 4 KPIs: ventas del día, pedidos activos, mesas ocupadas, reservas pendientes.
- Gráficos SVG inline data-driven (Opción A, sin librerías): línea 6 meses
  + dona top platos, con fallback estático.
- Timeline de `AUDITORIA` (5 eventos) + tablas últimas ventas + stock bajo.
- Responsive: KPIs 4→2→1, gráficos apilados, tablas scroll/cards.
- Roles ADMIN/GERENTE/SUPERVISOR (`DASHBOARD_VER`).

## No objetivos
- Interactividad de gráficos (tooltips/zoom: change futuro con librería).
- Módulos Ventas/Reportes/Auditoría (sus links quedan como texto).
- Exportar, planes, role-switcher (eliminados como en CRUDs).
- Escrituras: ningún endpoint muta datos.
