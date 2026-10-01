# Rendición Delivery

## Información General

### Nombre

Rendición de Delivery

### Ruta

```text
/caja/rendicion
```

### Shell

```text
StaffShell
```

### Feature

```text
features/caja/rendicion
```

### Roles Permitidos

```text
CAJERO
SUPERVISOR
REPARTIDOR
```

### Permisos

```text
REN_VER
REN_REGISTRAR
REN_VALIDAR
```

---

# Objetivo

Permitir la rendición del efectivo recaudado por los repartidores durante sus entregas.

Permite:

- Consultar pedidos pendientes de rendición.
- Registrar efectivo entregado.
- Validar diferencias.
- Generar constancia.
- Cerrar entregas pendientes.
- Incorporar dinero al saldo de caja.

---

# Usuarios Objetivo

- REPARTIDOR
- CAJERO
- SUPERVISOR

---

# Flujo Principal

```text
Pedido Delivery

↓

Repartidor Entrega

↓

Cliente Paga

↓

Pedido Entregado

↓

Pendiente Rendición

↓

Rendición Caja

↓

Validada

↓

Caja Actualizada
```

---

# Layout

## Tipo

```text
Operación Financiera
```

## Estructura General

```text
┌──────────────────────────────────────────────┐
│ Header + Breadcrumb                          │
├──────────────────────────────────────────────┤
│ Repartidor                                   │
├──────────────────────────────────────────────┤
│ Pedidos Pendientes                           │
├──────────────────────────────────────────────┤
│ Resumen Monetario                            │
├──────────────────────────────────────────────┤
│ Validación de Rendición                      │
├──────────────────────────────────────────────┤
│ Observaciones                                │
├──────────────────────────────────────────────┤
│ Acciones                                     │
└──────────────────────────────────────────────┘
```

---

# Estados de Rendición

## P

```text
Pendiente
```

Pedido entregado pero aún no rendido.

---

## R

```text
Rendido
```

Dinero entregado por repartidor.

---

## V

```text
Validado
```

Caja valida la rendición.

---

## O

```text
Observado
```

Existe diferencia o inconsistencia.

---

# Sección 1: Repartidor

## Información

Mostrar:

```text
Código

Nombre

Documento

Estado
```

---

## Indicadores

Mostrar:

```text
Pedidos Entregados

Pendientes de Rendición

Total Recaudado
```

---

# Sección 2: Pedidos Pendientes

## Tabla

| Campo | Descripción |
|---------|---------|
| Pedido | Número |
| Fecha | Entrega |
| Cliente | Cliente |
| Total | Importe |
| Método Pago | Efectivo / Digital |
| Estado | Entregado |
| Rendición | Pendiente / Rendido |

---

# Sección 3: Resumen Monetario

## Total Esperado

```text
Suma de pedidos efectivos.
```

---

## Total Entregado

```text
Monto declarado por repartidor.
```

---

## Diferencia

```text
Total Entregado
-
Total Esperado
```

---

## Resultado

### Cuadrado

```text
Diferencia = 0
```

Color:

```text
Verde
```

---

### Faltante

```text
Diferencia < 0
```

Color:

```text
Rojo
```

---

### Sobrante

```text
Diferencia > 0
```

Color:

```text
Azul
```

---

# Sección 4: Registro de Rendición

## Fecha

Tipo:

```text
Automática
```

---

## Repartidor

Tipo:

```text
Autocomplete
```

---

## Monto Entregado

Tipo:

```text
Decimal
```

Obligatorio:

```text
Sí
```

---

## Observaciones

Tipo:

```text
Textarea
```

Obligatorio cuando:

```text
Existe diferencia.
```

---

# Sección 5: Validación

## Cajero

Puede:

```text
Validar rendición.

Observar rendición.

Solicitar aclaración.
```

---

## Supervisor

Puede:

```text
Aprobar casos observados.

Cerrar diferencias.
```

---

# Acciones Disponibles

## Registrar Rendición

```text
Pendiente → Rendido
```

---

## Validar

```text
Rendido → Validado
```

---

## Observar

```text
Rendido → Observado
```

---

## Imprimir Constancia

```text
Genera PDF.
```

---

## Exportar

```text
Excel

PDF
```

---

# Reglas de Negocio

> Códigos `BR-*` del catálogo. Los anteriores `BR-DEL-*` no existen en el
> catálogo y colisionaban con `delivery-board.md`; mapeo actual a canónicos.
> `VU-*` = validación propia de la pantalla (rendición = estado UI derivado
> de `PEDIDO_DELIVERY E` + `MOVIMIENTO_CAJA`, sin tabla propia).

## BR-ACC-045

```text
Todo pedido delivery en efectivo
debe ser rendido.
(El repartidor entrega el dinero al cajero al regresar.)
```

---

## BR-INF-051 (ref)

```text
Los pagos electrónicos
no generan efectivo por rendir.
(Suman Total_Ingresos, no Monto_Sistema.)
```

---

## VU-DEL-003

```text
La rendición incrementa
el saldo disponible de caja.
(Ingreso consolidado por repartidor, concepto VENTA AL CONTADO,
solo efectivo, vía USP_REGISTRAR_MOVIMIENTO_CAJA.)
```

---

## VU-DEL-004

```text
Las diferencias requieren observación.
```

---

## VU-DEL-005

```text
Un pedido solo puede rendirse una vez.
```

---

## VU-DEL-006

```text
Solo CAJERO o SUPERVISOR pueden validar.
```

---

# Seguridad

## Roles

```text
REPARTIDOR
CAJERO
SUPERVISOR
```

---

## Permisos

### Consultar

```text
REN_VER
```

### Registrar

```text
REN_REGISTRAR
```

### Validar

```text
REN_VALIDAR
```

---

# APIs

## Pedidos Pendientes

```http
GET /api/rendiciones/pendientes
```

---

## Consultar Rendiciones

```http
GET /api/rendiciones
```

---

## Registrar Rendición

```http
POST /api/rendiciones
```

---

## Validar Rendición

```http
PATCH /api/rendiciones/{id}/validar
```

---

## Observar Rendición

```http
PATCH /api/rendiciones/{id}/observar
```

---

## Constancia PDF

```http
GET /api/rendiciones/{id}/pdf
```

---

# Base de Datos

## Tablas

```text
PEDIDO

PEDIDO_DELIVERY (Situacion E entregado en efectivo por rendir)

PAGO_VENTA (para identificar efectivo vs digital)

EMPLEADO (repartidor)

CAJA

APERTURA_CAJA (turno abierto, Situacion='A')

MOVIMIENTO_CAJA (ingreso consolidado por repartidor,
concepto VENTA AL CONTADO, solo efectivo — Archivo 4.7)

AUDITORIA
```

> Corrige versión anterior que citaba `DELIVERY`, `REPARTIDOR`
> y `RENDICION_DELIVERY` como tablas: no existen en `yemheng.sql`.
> `REPARTIDOR` es rol de `EMPLEADO`; la rendición es estado UI
> derivado (`P/R/V/O`) sobre `MOVIMIENTO_CAJA`, no tabla propia.

---

# Auditoría

Registrar:

```text
Crear rendición

Validar rendición

Observar rendición

Modificar observaciones

Imprimir constancia
```

---

# Estados de Pantalla

## Loading

```text
Skeleton resumen.

Skeleton pedidos.
```

---

## Sin Datos

```text
No existen rendiciones pendientes.
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
Pedidos y resumen visibles simultáneamente.
```

---

## Tablet

```text
Bloques verticales.
```

---

## Mobile

```text
Cards por pedido.
```

---

# Casos Especiales

## Diferencia Negativa

```text
Debe registrarse observación obligatoria.
```

---

## Diferencia Positiva

```text
Debe justificarse el excedente.
```

---

## Pagos Digitales

```text
No forman parte de la rendición física.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un repartidor con pedidos entregados en efectivo
When registra una rendición
Then el sistema almacena el monto rendido correctamente
```

---

## Escenario 2

```gherkin
Given una rendición sin diferencias
When el cajero la valida
Then el estado cambia a Validado
```

---

## Escenario 3

```gherkin
Given una diferencia negativa
When se registra la rendición
Then el sistema solicita una observación obligatoria
```

---

## Escenario 4

```gherkin
Given una rendición validada
When se actualiza la caja
Then el efectivo rendido incrementa el saldo disponible
```

---

## Escenario 5

```gherkin
Given un pedido ya rendido
When se intenta rendir nuevamente
Then el sistema rechaza la operación
```