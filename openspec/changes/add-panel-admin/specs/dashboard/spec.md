# Spec delta: dashboard

## Endpoint (`/api/v1/dashboard/resumen`, `authGuard`)

### GET / — `DASHBOARD_VER`
- Sin query. 401 sin token, 403 sin permiso.
- 200:
```json
{
  "ventasHoy": { "total": 4820.5, "comandas": 42 },
  "pedidos": { "activos": 28, "abiertos": 6, "cocina": 11, "porCobrar": 11 },
  "mesas": { "ocupadas": 16, "total": 25 },
  "reservasPendientes": 5,
  "actividad": [{ "texto": "...", "detalle": "...", "hace": "...", "icono": "...", "tono": "..." }],
  "ultimasVentas": [{ "comprobante": "B003-01492", "cliente": "...", "fecha": "...", "total": 284.0, "estado": "Completada" }],
  "stockBajo": [{ "producto": "...", "actual": "4 botellas", "minimo": "Mín: 15 botellas" }],
  "linea6Meses": [{ "mes": "Ene", "total": 92000 }],
  "donaPlatos": [{ "nombre": "Chaufa Especial", "pct": 25, "color": "#83000f" }]
}
```
- Si una fuente falla o está vacía, el campo usa fallback estático de la
  plantilla (nunca se rompe el panel).

## Criterios (de `dashboard.md`)
1. ADMIN/GERENTE/SUPERVISOR con `DASHBOARD_VER` ve el panel; sin permiso → 403.
2. KPIs = valores reales cuando hay datos (fallback si no).
3. Gráficos renderizan con datos o fallback, responsive apilado en móvil.
4. Timeline = últimas 5 filas de `AUDITORIA` con “hace X”.
5. Tablas con 5 filas + responsive, verificadas con `fran`.
