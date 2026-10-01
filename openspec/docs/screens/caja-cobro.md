# Cobro de Venta

## Información General

### Nombre

Cobro de Venta

### Ruta

```text
/caja/cobro
```

### Shell

```text
StaffShell
```

### Feature

```text
features/caja/cobro
```

### Roles Permitidos

```text
CAJERO
SUPERVISOR
```

### Permisos

```text
VEN_COBRAR
VEN_VER
```

---

# Objetivo

Permitir el cobro de pedidos pendientes de pago.

La pantalla es responsable de:

- Consultar consumos pendientes.
- Identificar cliente.
- Seleccionar comprobante.
- Registrar medio de pago.
- Generar venta.
- Emitir comprobante.
- Liberar mesa.
- Registrar auditoría.

---

# Usuarios Objetivo

- CAJERO
- SUPERVISOR

---

# Layout

## Tipo

```text
POS Cobranza
```

## Estructura General

```text
┌──────────────────────────────────────────────┐
│ Buscar Mesa / Pedido                         │
├──────────────────────────────────────────────┤
│ Datos Cliente                                │
├──────────────────────────────────────────────┤
│ Detalle Consumo                              │
├──────────────────────────────────────────────┤
│ Resumen Monetario                            │
├──────────────────────────────────────────────┤
│ Comprobante                                  │
├──────────────────────────────────────────────┤
│ Medio de Pago                                │
├──────────────────────────────────────────────┤
│ Acciones                                     │
└──────────────────────────────────────────────┘
```

---

# Flujo Principal

```text
Mesa

↓

Pedido

↓

Por Cobrar

↓

Caja

↓

Venta

↓

Comprobante

↓

Mesa Libre
```

---

# Sección 1: Búsqueda

## Buscar por Mesa

Tipo:

```text
Autocomplete
```

Ejemplo:

```text
Mesa 01
Mesa 02
Mesa 15
```

---

## Buscar por Pedido

Tipo:

```text
Texto
```

---

## Buscar por Cliente

Tipo:

```text
Autocomplete
```

---

# Sección 2: Información del Cliente

## Tipo Documento

Mostrar:

```text
DNI

RUC

CE

Pasaporte
```

---

## Documento

Solo lectura.

---

## Nombre / Razón Social

Solo lectura.

---

## Correo

Editable.

---

# Sección 3: Detalle del Consumo

## Información

| Campo | Descripción |
|---------|---------|
| Cantidad | Unidades |
| Producto | Producto vendido |
| Precio Unitario | Precio |
| Importe | Subtotal |
| Observación | Comentarios |

---

## Ejemplo

```text
2x Arroz Chaufa         S/ 40.00

1x Wantán Frito         S/ 18.00

2x Inka Cola            S/ 12.00
```

---

# Sección 4: Resumen Monetario

## Subtotal

```text
Importe sin impuestos
```

---

## IGV

```text
18%
```

---

## Descuento

```text
Si aplica
```

---

## Total

```text
Monto final a cobrar
```

---

# Sección 5: Comprobante

## Tipo Comprobante

Opciones:

```text
Boleta

Factura
```

---

## Reglas

### Boleta

```text
Cliente natural.
```

---

### Factura

```text
Requiere RUC válido.
```

---

# Sección 6: Medio de Pago

## Opciones

```text
Efectivo

Tarjeta Débito

Tarjeta Crédito

Yape

Plin

Transferencia
```

---

## Monto Recibido

Visible para:

```text
Efectivo
```

---

## Vuelto

Calculado automáticamente.

---

# Sección 7: Acciones

## Cobrar

```text
Genera venta y comprobante.
```

---

## Cancelar

```text
Regresa al listado.
```

---

## Imprimir

```text
Imprime comprobante.
```

---

## Reenviar Correo

```text
Envía comprobante por email.
```

---

# Estados del Pedido

## POR_COBRAR

```text
Disponible para caja.
```

---

## COBRADO

```text
Venta registrada.
```

---

# Reglas de Negocio

> Códigos `BR-*` del catálogo (`REGLAS_DE_NEGOCIO.md`).
> `VU-*` = validación propia de la pantalla.

## BR-ACC-043

```text
Solo CAJERO puede realizar cobros.
(El cajero lo ejecuta/autoriza en terminal; el cliente
desde la app solo solicita la cuenta.)
```

---

## BR-EST-005 (ref)

```text
Un pedido solo puede cobrarse una vez.
(1 venta → 1 pedido; ver BR-RES-028: un único comprobante.)
```

---

## BR-EST-006

```text
Toda venta genera un comprobante.
```

---

## VU-COB-004

```text
Toda venta genera auditoría.
(Validación propia de pantalla; el cobro se audita
junto a USP_FACTURAR_PEDIDO.)
```

---

## BR-ACC-037

```text
Al finalizar el cobro la mesa vuelve
a estado LIBRE.
```

---

## BR-RES-016

```text
Factura requiere RUC válido.
(Solo a EMPRESA con RUC; si no, BOLETA.)
```

---

## BR-RES-018 (ref)

```text
No se permiten montos negativos.
(Cantidades, precios y montos > 0.)
```

---

## VU-COB-008

```text
El total debe coincidir con el consumo.
(Chequeo UI contra FN_TOTAL_PEDIDO antes de cobrar.)
```

---

## BR-ACC-052 (referencia)

```text
Al facturarse la comanda se finalizan todas las sesiones QR
asociadas a la mesa y la mesa vuelve a LIBRE
(ver comanda.md).
```

---

# Seguridad

## Roles

```text
CAJERO
SUPERVISOR
```

---

## Permisos

### Cobrar

```text
VEN_COBRAR
```

### Consultar

```text
VEN_VER
```

---

# APIs

## Consultar Consumo

```http
GET /api/caja/cobro/{pedidoId}
```

---

## Registrar Cobro

```http
POST /api/caja/cobro
```

---

## Generar Comprobante

```http
POST /api/comprobantes
```

---

## Reenviar Comprobante

```http
POST /api/comprobantes/{id}/reenviar
```

---

## Imprimir

```http
GET /api/comprobantes/{id}/pdf
```

---

# Base de Datos

## Tablas

```text
PEDIDO
DETALLE_PEDIDO
VENTA
COMPROBANTE
CLIENTE
CAJA
AUDITORIA
```

---

# Auditoría

Registrar:

```text
Cobro realizado

Generación de comprobante

Reimpresión

Reenvío de comprobante

Anulación posterior (si aplica)
```

---

# Validaciones

## Factura

```text
RUC obligatorio.
```

---

## Efectivo

```text
Monto recibido >= Total.
```

---

## Tarjetas

```text
Requieren aprobación del POS.
```

---

## Yape / Plin

```text
Requieren confirmación de pago.
```

---

# Estados de Pantalla

## Loading

```text
Skeleton consumo.

Skeleton resumen.
```

---

## Sin Datos

```text
No existen consumos pendientes.
```

---

## Error

```text
No fue posible procesar el cobro.
```

---

# Responsive

## Desktop

```text
Dos columnas:

Consumo | Resumen
```

---

## Tablet

```text
Secciones apiladas.
```

---

## Mobile

```text
Flujo vertical.
```

---

# Casos Especiales

## Cliente sin registro

```text
Permitir crear cliente rápido.
```

---

## Factura

```text
Validar RUC antes de emitir.
```

---

## Mesa compartida

```text
No soportado.

El cobro es único por pedido.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un pedido en estado POR_COBRAR
When el cajero registra el pago
Then el sistema genera la venta y el comprobante
```

---

## Escenario 2

```gherkin
Given una venta pagada
When finaliza el proceso de cobro
Then la mesa cambia a estado LIBRE
```

---

## Escenario 3

```gherkin
Given un comprobante tipo Factura
When el cliente no tiene RUC válido
Then el sistema rechaza la emisión
```

---

## Escenario 4

```gherkin
Given un pago en efectivo
When el monto recibido es mayor al total
Then el sistema calcula correctamente el vuelto
```

---

## Escenario 5

```gherkin
Given un usuario sin permiso VEN_COBRAR
When intenta procesar una venta
Then el sistema deniega la operación
```