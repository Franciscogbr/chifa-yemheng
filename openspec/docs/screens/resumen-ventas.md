# Resumen Ventas

## Información General

### Nombre

Resumen de Ventas del Día / Período

### Ruta

```text
/caja/resumen
```

> Distinto de `/ventas` (ventas.md: comprobantes + NC)
> y de `/reportes` (reportes.md: BI general).
> Este es el tablero operativo del cajero/supervisor.

### Shell

```text
StaffShell
```

### Feature

```text
features/caja/resumen-ventas
```

### Roles Permitidos

```text
CAJERO
SUPERVISOR
ADMIN
```

### Permisos

```text
VEN_VER
VEN_CONSULTAR (si se separa)
```

---

# Objetivo

Responder en 10 segundos: ¿cuánto vendimos hoy, en qué y cómo nos pagaron?

Permite:

- Ver ventas del día/período, ticket promedio, N comprobantes.
- Ver productos más vendidos.
- Ver totales por método de pago.
- Filtrar por fecha y método.
- Navegar al detalle en ventas.md.

No permite:

- Emitir NC (ver `ventas.md`).
- Cobrar (ver `caja-cobro.md`).
- Exportación BI avanzada (ver `reportes.md`).

---

# Usuarios Objetivo

- CAJERO
- SUPERVISOR
- ADMIN

---

# Layout

## Tipo

```text
Tablero KPIs + Tablas
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Filtros (fecha, método)            │
├─────────────────────────────────────────────┤
│ KPIs: Total | N Ventas | Ticket | Docs      │
├──────────────────────┬──────────────────────┤
│ Ventas diarias       │ Por método pago      │
├──────────────────────┼──────────────────────┤
│ Top productos        │ Link a ventas/reportes│
└──────────────────────┴──────────────────────┘
```

---

# Sección 1: Filtros

## Fecha

```text
Hoy (default) / Rango Desde-Hasta
```

## Método Pago

```text
Todos, Efectivo, Yape, Plin, Tarjeta, Transferencia
```

Fuente:

```text
METODO_PAGO
```

---

# Sección 2: KPIs

Mostrar:

```text
Total vendido (Σ Total, Anulada='N')
N comprobantes
Ticket promedio (Total / N)
Subtotal + IGV desagregados
```

Fuente:

```text
VW_VENTAS_DIARIAS (fecha, tipodocumento, n_comprobantes,
subtotal, igv, total)
```

Solo:

```text
VENTA.Anulada='N'
```

---

# Sección 3: Ventas Diarias (Tabla)

Columnas:

| Campo | Descripción |
|---------|---------|
| Fecha | Día |
| Docs | Boleta/Factura/Ticket |
| N | Cantidad comprobantes |
| Subtotal | Base |
| IGV | 18% |
| Total | Final |

---

# Sección 4: Por Método de Pago

Mostrar:

```text
Efectivo → afecta Monto_Sistema SÍ
Yape/Plin/Tarjeta → afecta Sistema NO, suma Total_Ingresos SÍ
(BR-INF-051 + tabla decisión 4.4)
```

Fuente:

```text
VENTA + PAGO_VENTA + METODO_PAGO
```

Ejemplo:

```text
Efectivo S/. 3,200 (40%) — va a caja física
Yape S/. 2,100 — solo ingreso
```

---

# Sección 5: Top Productos

Columnas:

| Campo | Descripción |
|---------|---------|
| Producto | Nombre + categoría |
| Cantidad | Suma vendida |
| Importe | Suma importe |

Fuente:

```text
VW_PRODUCTOS_MAS_VENDIDOS (cantidad_vendida,
importe_vendido ORDER BY cantidad DESC, Anulada='N')
```

---

# Acciones Disponibles

## Consultar

```text
Aplica filtros.
```

---

## Ver Detalle Venta

```text
Salta a ventas.md con ID.
```

---

# Reglas de Negocio (referencia, no cálculo nuevo)

## BR-EST-005

```text
Toda venta nace de un pedido (el resumen solo agrega ventas).
```

## BR-INF-051

```text
Digitales suman ingreso pero no efectivo físico.
El tablero los separa.
```

## Tabla 4.4

```text
Efectivo SÍ afecta caja / Yape-Plin-Tarjeta NO.
```

---

# Seguridad

## Roles

```text
CAJERO
SUPERVISOR
ADMIN
```

## Permisos

```text
VEN_VER
```

---

# APIs

## Resumen

```http
GET /api/caja/resumen?desde=2026-01-01&hasta=2026-01-31&metodo=EFECTIVO
Response: { kpis, porDia[], porMetodo[], topProductos[] }
```

Fuentes:

```text
VW_VENTAS_DIARIAS + VW_PRODUCTOS_MAS_VENDIDOS
+ agregación PAGO_VENTA
```

---

# Base de Datos

## Tablas / Vistas

```text
VW_VENTAS_DIARIAS
VW_PRODUCTOS_MAS_VENDIDOS
VENTA (Anulada='N')
DETALLE_VENTA
PAGO_VENTA
METODO_PAGO
BOLETA / FACTURA (para tipodocumento 03/01/TK)
```

---

# Auditoría

Registrar:

```text
Consulta resumen (usuario, filtros, fecha) — muestreo.
```

---

# Estados de Pantalla

## Loading

```text
Skeleton KPIs + tablas.
```

---

## Sin Datos

```text
No existen ventas para el período.
```

---

# Responsive

## Desktop

```text
KPIs + 3 tablas simultáneas.
```

---

## Mobile

```text
KPIs apilados + tablas en cards.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given ventas facturadas y una anulada vía NC
When consulta el resumen de hoy
Then la anulada no suma (Anulada='N')
```

---

## Escenario 2

```gherkin
Given pagos en efectivo y Yape
When mira Por método
Then el efectivo figura como caja física y el Yape solo ingreso
```

---

## Escenario 3

```gherkin
Given filtros por rango
When cambia fechas
Then KPIs y top productos recalculan
```
