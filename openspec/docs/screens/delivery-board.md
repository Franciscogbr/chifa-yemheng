# Delivery Board

> **LEGACY — Vista consolidada anterior.**
> Canónicos actuales: `pedidos-delivery.md` (5.1 creación),
> `seguimiento-entregas.md` (5.2 staff + mapa vivo),
> `repartidor-app.md` (5.3 app repartidor).
> Esta pantalla se mantiene como referencia del kanban `/repartidor`
> y debe leerse con la corrección BD: `Situacion P/R/E/C`
> (`C=Cancelado`, sin estado `A`) y tablas `PEDIDO_DELIVERY`
> (no `DELIVERY/DIRECCION_CLIENTE/RENDICION_DELIVERY`).

## Información General

### Nombre

Panel de Delivery

### Ruta

```text
/repartidor
```

### Shell

```text
StaffShell
```

### Feature

```text
features/delivery
```

### Roles Permitidos

```text
REPARTIDOR
SUPERVISOR
ADMIN
```

### Permisos

```text
DELIVERY_VER
DELIVERY_ASIGNAR
DELIVERY_DESPACHAR
DELIVERY_ENTREGAR
```

---

# Objetivo

Gestionar la operación de reparto de pedidos delivery.

Permite:

- Visualizar pedidos delivery.
- Asignar repartidores.
- Iniciar reparto.
- Confirmar entregas.
- Registrar incidencias.
- Consultar historial de entregas.
- Monitorear pedidos en tránsito.

---

# Usuarios Objetivo

- REPARTIDOR
- SUPERVISOR
- ADMIN

---

# Tipo de Pantalla

```text
Kanban Operativo
```

---

# Layout

## Estructura General

```text
┌────────────────────────────────────────────────────────────┐
│ Header                                                    │
├────────────────────────────────────────────────────────────┤
│ Indicadores Delivery                                      │
├────────────────────────────────────────────────────────────┤
│ PENDIENTE │ ASIGNADO │ EN RUTA │ ENTREGADO │ ANULADO      │
│           │          │          │           │             │
│ Tarjetas  │ Tarjetas │ Tarjetas │ Tarjetas  │ Tarjetas    │
└────────────────────────────────────────────────────────────┘
```

---

# Actualización

## Método

```text
Polling
```

## Intervalo

```text
5 segundos
```

---

# Estados Delivery

## P

```text
Pendiente
```

Pedido listo para despacho.

Color:

```text
Gris
```

---

## R

```text
En Ruta
```

Pedido asignado y en camino al cliente
(BD: Situacion='R'; incluye asignación, no hay estado intermedio separado).

Color:

```text
Azul
```

---

## E

```text
Entregado
```

Pedido entregado exitosamente (BD: Situacion='E', con F_Entrega).

Color:

```text
Verde
```

---

## C

```text
Cancelado
```

Pedido cancelado (BD: Situacion='C'. Corrige versión anterior
que usaba 'A=Anulado' y 'C=Entregado': migrar A→C).

Color:

```text
Rojo
```

---

# Flujo de Estados

## Flujo Principal

```text
P
↓
R
↓
E
```

---

## Flujo Alternativo

```text
P
↓
C
```

Migración:

```text
Todo registro legado en 'A' pasa a 'C'.
```

---

# Restricciones

## No Permitido

```text
E → R

E → P

C → P

C → R

C → E
```

---

# Sección 1: Header

## Componentes

- Título
- Fecha
- Última actualización

### Ejemplo

```text
Panel Delivery

Última actualización:
17:45:22
```

---

# Sección 2: Indicadores

## Pendientes

```text
Cantidad de pedidos pendientes.
```

---

## En Ruta

```text
Cantidad de pedidos en reparto.
```

---

## Entregados

```text
Cantidad de pedidos entregados.
```

---

## Tiempo Promedio

```text
Promedio de entrega.
```

---

# Tarjeta Delivery

## Información Visible

### Pedido

```text
PED-2026-00054
```

---

### Cliente

```text
Juan Pérez
```

---

### Dirección

```text
Av. Los Maestros 123
```

---

### Teléfono

```text
999999999
```

---

### Total

```text
S/. 78.00
```

---

### Método Pago

```text
Efectivo

Yape

Plin

Tarjeta
```

---

### Repartidor

```text
Pedro Gómez
```

---

### Tiempo

```text
25 minutos
```

---

# Detalle Pedido

## Mostrar

```text
Productos

Cantidades

Observaciones

Monto Delivery

Total
```

---

# Asignación de Repartidor

## Tipo

```text
Select
```

Fuente:

```text
REPARTIDOR
```

---

## Regla

```text
Solo repartidores activos.
```

---

# Acciones Disponibles

## Asignar

```text
P → R
```

---

## Iniciar Ruta

```text
R → E
```

---

## Confirmar Entrega

```text
E → C
```

---

## Anular

```text
P → A
```

---

## Ver Detalle

```text
Visualizar pedido completo.
```

---

# Geolocalización (implementada vía ALTER GPS, no Fase 2)

> Mapa vivo con `VW_DELIVERY_UBICACION` (pin cliente + pin repartidor,
> polling 30s vía `f_ubicacion`). Sin coords → fallback
> `dirección + distrito` manual (BR-GPS-001). Detalle en
> `seguimiento-entregas.md` y `repartidor-app.md`.

## Mapa

Mostrar:

```text
Ubicación repartidor

Ubicación cliente

Ruta sugerida
```

---

## Tracking

Estados:

```text
Asignado

En Ruta

Entregado
```

---

# Incidencias

## Tipos

```text
Cliente ausente

Dirección incorrecta

Pedido rechazado

Accidente

Otro
```

---

## Observación

Tipo:

```text
Textarea
```

---

# Reglas de Negocio

> Pantalla LEGACY: los códigos `BR-DEL-*` anteriores no existen en el
> catálogo y tenían doble texto con `rendicion-delivery.md`.
> Mapeo actual a canónicos; el detalle vive en `pedidos-delivery.md`
> (BR-ACC-041), `seguimiento-entregas.md` (BR-ACC-040) y
> `repartidor-app.md` / `rendicion-delivery.md` (BR-ACC-045).
> `VU-*` = validación propia de la pantalla.

## BR-ACC-041

```text
Todo pedido delivery requiere repartidor asignado.
(Se asigna al primer repartidor disponible.)
```

---

## BR-ACC-040 (ref)

```text
Estados P→R→E (y P→C cancelado) con F_Salida/F_Entrega.
Un pedido entregado pasa a estado E; la cancelación es C.
(Corrige el texto anterior que decía "entregado pasa a C".)
```

---

## BR-ACC-045 (ref)

```text
Los pedidos en efectivo generan rendición.
(El repartidor rinde el efectivo al cajero; ver rendicion-delivery.md.)
```

---

## VU-DEL-004

```text
Solo repartidores activos pueden recibir asignaciones.
```

---

## VU-DEL-005

```text
Un pedido solo puede entregarse una vez.
```

---

## VU-DEL-006

```text
Las incidencias deben registrarse con observación.
```

---

# Seguridad

## Roles

```text
REPARTIDOR
SUPERVISOR
ADMIN
```

---

## Permisos

### Consultar

```text
DELIVERY_VER
```

### Asignar

```text
DELIVERY_ASIGNAR
```

### Iniciar Ruta

```text
DELIVERY_DESPACHAR
```

### Confirmar Entrega

```text
DELIVERY_ENTREGAR
```

---

# APIs

## Board Delivery

```http
GET /api/delivery/board
```

---

## Asignar Repartidor

```http
PATCH /api/delivery/{id}/asignar
```

---

## Iniciar Ruta

```http
PATCH /api/delivery/{id}/ruta
```

---

## Confirmar Entrega

```http
PATCH /api/delivery/{id}/entregar
```

---

## Registrar Incidencia

```http
POST /api/delivery/{id}/incidencia
```

---

## Detalle

```http
GET /api/delivery/{id}
```

---

# Base de Datos

## Tablas

```text
PEDIDO

PEDIDO_DELIVERY (Situacion P/R/E/C, F_Salida, F_Entrega,
lat/lng_cliente/repartidor, f_ubicacion — ALTER GPS 01)

USUARIO

CLIENTE

PAGO_VENTA

MOVIMIENTO_CAJA (rendición consolidada en Caja 4.7)

AUDITORIA

VW_DELIVERY_UBICACION (ALTER GPS 04, lectura mapa)
```

> Corrige versión anterior que citaba `DELIVERY`,
> `DIRECCION_CLIENTE` y `RENDICION_DELIVERY`: no existen en
> `yemheng.sql`. La rendición vive en `rendicion-delivery.md`
> como `MOVIMIENTO_CAJA` consolidado por repartidor.

---

# Auditoría

Registrar:

```text
Asignación repartidor

Cambio de estado

Inicio ruta

Entrega realizada

Incidencia registrada

Anulación
```

---

# Estados de Pantalla

## Loading

```text
Skeleton kanban.
```

---

## Sin Datos

```text
No existen pedidos delivery.
```

---

## Error

```text
No fue posible cargar la información.
```

---

# Responsive

## Desktop

```text
5 columnas visibles.
```

---

## Tablet

```text
Scroll horizontal.
```

---

## Mobile

```text
Una columna por vez.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un pedido en estado Pendiente
When se asigna un repartidor
Then el pedido cambia a estado Asignado
```

---

## Escenario 2

```gherkin
Given un pedido asignado
When el repartidor inicia la ruta
Then el pedido cambia a estado En Ruta
```

---

## Escenario 3

```gherkin
Given un pedido en ruta
When el repartidor confirma la entrega
Then el pedido cambia a estado Entregado
```

---

## Escenario 4

```gherkin
Given un pedido pagado en efectivo
When es entregado
Then queda disponible para rendición en caja
```

---

## Escenario 5

```gherkin
Given un pedido con incidencia
When el repartidor registra el problema
Then el sistema almacena la incidencia y genera auditoría
```