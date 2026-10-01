    # Movimientos de Caja

## Información General

### Nombre

Movimientos de Caja

### Ruta

```text
/caja/movimientos
```

### Shell

```text
StaffShell
```

### Feature

```text
features/caja/movimientos
```

### Roles Permitidos

```text
CAJERO
SUPERVISOR
```

### Permisos

```text
CAJA_MOVIMIENTO_VER
CAJA_MOVIMIENTO_CREAR
CAJA_MOVIMIENTO_ANULAR
```

---

# Objetivo

Registrar ingresos y egresos de caja que no corresponden directamente a ventas.

Permite:

- Registrar ingresos.
- Registrar egresos.
- Consultar historial.
- Justificar movimientos.
- Controlar el flujo de efectivo.
- Alimentar el arqueo y cierre de caja.

---

# Layout

## Tipo

```text
ABM Operativo
```

## Estructura

```text
┌────────────────────────────────────┐
│ Header + Breadcrumb                │
├────────────────────────────────────┤
│ Resumen de Caja                    │
├────────────────────────────────────┤
│ Filtros                            │
├────────────────────────────────────┤
│ Movimientos                        │
├────────────────────────────────────┤
│ Modal Registro                     │
└────────────────────────────────────┘
```

---

# Resumen de Caja

## Mostrar

```text
Saldo Inicial

Ingresos

Egresos

Saldo Actual
```

---

# Filtros

## Fecha

```text
Desde
Hasta
```

---

## Tipo Movimiento

```text
Ingreso
Egreso
```

---

## Estado

```text
Activo
Anulado
```

---

# Tabla de Movimientos

## Columnas

| Campo | Descripción |
|---------|---------|
| Fecha | Fecha registro |
| Hora | Hora |
| Tipo | Ingreso/Egreso |
| Concepto | Motivo |
| Monto | Importe |
| Usuario | Responsable |
| Estado | Activo/Anulado |
| Acciones | Ver |

---

# Modal Registrar Movimiento

## Tipo

Opciones:

```text
Ingreso
Egreso
```

---

## Concepto

Opciones:

```text
Compra menor
Pago proveedor
Gasto operativo
Ingreso extraordinario
Reposición
Otros
```

---

## Descripción

Tipo:

```text
Textarea
```

Obligatorio:

```text
Sí
```

---

## Monto

Tipo:

```text
Decimal
```

Validación:

```text
Mayor a cero
```

---

## Evidencia

Tipo:

```text
Adjunto
```

Formatos:

```text
PDF
JPG
PNG
```

---

# Acciones

## Crear

```text
Registrar movimiento.
```

---

## Consultar

```text
Ver detalle.
```

---

## Anular

```text
Solo Supervisor.
```

---

# Reglas de Negocio

> `VU-*` = validación propia de la pantalla, sin contraparte literal
> en el catálogo (`REGLAS_DE_NEGOCIO.md`).

## VU-CAJ-005

```text
Todo movimiento debe tener justificación.
```

---

## VU-CAJ-006

```text
Todo movimiento afecta el saldo de caja.
(Implementación: USP_REGISTRAR_MOVIMIENTO_CAJA acumula
Total_Ingresos/Egresos y Monto_Sistema según Afecta_Efectivo;
ver BR-INF-051 para digitales.)
```

---

## VU-CAJ-007

```text
Los egresos no pueden exceder
el saldo disponible.
```

---

## VU-CAJ-008

```text
La anulación genera auditoría.
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

```text
CAJA_MOVIMIENTO_VER
CAJA_MOVIMIENTO_CREAR
CAJA_MOVIMIENTO_ANULAR
```

---

# APIs

## Listar

```http
GET /api/caja/movimientos
```

---

## Registrar

```http
POST /api/caja/movimientos
```

---

## Obtener

```http
GET /api/caja/movimientos/{id}
```

---

## Anular

```http
PATCH /api/caja/movimientos/{id}/anular
```

---

# Base de Datos

## Tablas

```text
MOVIMIENTO_CAJA
CAJA
USUARIO
AUDITORIA
```

---

# Auditoría

Registrar:

```text
Crear movimiento

Anular movimiento

Modificar observaciones
```

---

# Estados

## Activo

```text
Movimiento válido.
```

---

## Anulado

```text
Movimiento invalidado.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given una caja abierta
When el cajero registra un egreso
Then el saldo disponible disminuye
```

---

## Escenario 2

```gherkin
Given un egreso mayor al saldo
When intenta registrarse
Then el sistema rechaza la operación
```

---

## Escenario 3

```gherkin
Given un movimiento registrado
When el supervisor lo anula
Then el sistema registra auditoría
```

---

## Escenario 4

```gherkin
Given un ingreso extraordinario
When se registra
Then incrementa el saldo de caja
```

---

## Escenario 5

```gherkin
Given un movimiento sin concepto
When intenta registrarse
Then el sistema valida el campo obligatorio
```