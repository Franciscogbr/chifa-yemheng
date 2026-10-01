# Arqueo de Caja

## Información General

### Nombre

Arqueo de Caja

### Ruta

```text
/caja/arqueo
```

### Shell

```text
StaffShell
```

### Feature

```text
features/caja/arqueo
```

### Roles Permitidos

```text
CAJERO
SUPERVISOR
```

### Permisos

```text
CAJA_ARQUEO
```

---

# Objetivo

Permitir la conciliación entre el dinero físico y los movimientos registrados en el sistema antes del cierre de caja.

Permite:

- Visualizar movimientos del turno.
- Registrar conteo físico.
- Detectar diferencias.
- Justificar diferencias.
- Generar acta de arqueo.
- Enviar arqueo para validación.

---

# Usuarios Objetivo

- CAJERO
- SUPERVISOR

---

# Layout

## Tipo

```text
Operacional Financiero
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Información del Turno                       │
├─────────────────────────────────────────────┤
│ Resumen del Sistema                         │
├─────────────────────────────────────────────┤
│ Conteo Físico                               │
├─────────────────────────────────────────────┤
│ Diferencias                                 │
├─────────────────────────────────────────────┤
│ Observaciones                               │
├─────────────────────────────────────────────┤
│ Acciones                                    │
└─────────────────────────────────────────────┘
```

---

# Información del Turno

## Mostrar

```text
Caja

Usuario

Fecha Apertura

Hora Apertura

Estado
```

### Ejemplo

```text
Caja Principal

Juan Pérez

08:00

ABIERTA
```

---

# Resumen del Sistema

## Ventas Efectivo

Mostrar:

```text
Total efectivo
```

---

## Ventas Tarjeta

Mostrar:

```text
Total tarjetas
```

---

## Ventas Digitales

Mostrar:

```text
Yape

Plin

Transferencia
```

---

## Ingresos

```text
Movimientos positivos
```

---

## Egresos

```text
Movimientos negativos
```

---

## Saldo Esperado

Fórmula:

```text
Apertura
+ Ingresos
- Egresos
= Saldo Esperado
```

---

# Conteo Físico

## Billetes

### S/ 200

```text
Cantidad
Subtotal
```

---

### S/ 100

```text
Cantidad
Subtotal
```

---

### S/ 50

```text
Cantidad
Subtotal
```

---

### S/ 20

```text
Cantidad
Subtotal
```

---

### S/ 10

```text
Cantidad
Subtotal
```

---

# Monedas

## S/ 5

## S/ 2

## S/ 1

## S/ 0.50

## S/ 0.20

## S/ 0.10

---

# Totales

## Total Contado

Calculado automáticamente.

---

## Total Sistema

Calculado automáticamente.

---

## Diferencia

Fórmula:

```text
Total Contado
-
Total Sistema
=
Diferencia
```

---

# Resultado del Arqueo

## Cuadrado

```text
Diferencia = 0
```

Color:

```text
Verde
```

---

## Sobrante

```text
Diferencia > 0
```

Color:

```text
Azul
```

---

## Faltante

```text
Diferencia < 0
```

Color:

```text
Rojo
```

---

# Justificación

Obligatoria cuando:

```text
Diferencia ≠ 0
```

---

## Campo

```text
Observación
```

Tipo:

```text
Textarea
```

---

# Acciones Disponibles

## Guardar Arqueo

```text
Registra el arqueo.
```

---

## Imprimir

```text
Genera constancia.
```

---

## Enviar a Supervisión

```text
Disponible para revisión.
```

---

# Reglas de Negocio

## BR-ACC-046

```text
Todo arqueo debe validarse antes del cierre.
Las diferencias requieren justificación; el supervisor valida
arqueos con diferencia; no se cierra caja sin arqueo registrado.
```

> Absorbe las validaciones de justificación ante diferencias,
> arqueo obligatorio y validación del supervisor
> (antes numeradas como propias de pantalla).

---

## VU-CAJ-001

```text
Un turno solo puede tener un arqueo final.
(Validación propia de pantalla, sin contraparte literal
en el catálogo.)
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
CAJA_ARQUEO
```

---

# APIs

## Obtener Resumen

```http
GET /api/caja/arqueo/resumen
```

---

## Registrar Arqueo

```http
POST /api/caja/arqueo
```

---

## Obtener Arqueo

```http
GET /api/caja/arqueo/{id}
```

---

## Validar Arqueo

```http
PATCH /api/caja/arqueo/{id}/validar
```

---

# Base de Datos

## Tablas

```text
CAJA

ARQUEO_CAJA

MOVIMIENTO_CAJA

VENTA

AUDITORIA
```

---

# Auditoría

Registrar:

```text
Creación de arqueo

Modificación de arqueo

Validación de arqueo

Observaciones registradas
```

---

# Estados (UI derivados de APERTURA_CAJA + VW_ARQUEO_CAJA)

> BD real: `APERTURA_CAJA.Situacion A (abierto) / C (cerrado)` +
> `Diferencia = Monto_Declarado − Monto_Sistema` (BR-DER-032).
> Los estados siguientes son de flujo UI del conteo, no columnas BD.

## Borrador

```text
Pendiente de finalizar.
```

---

## Registrado

```text
Arqueo completado.
```

---

## Validado

```text
Aprobado por supervisor.
```

---

## Observado

```text
Presenta inconsistencias.
```

---

# Responsive

## Desktop

```text
Resumen + conteo simultáneo.
```

---

## Tablet

```text
Bloques verticales.
```

---

## Mobile

```text
Conteo por secciones colapsables.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given una caja abierta
When el cajero realiza el conteo físico
Then el sistema calcula automáticamente la diferencia
```

---

## Escenario 2

```gherkin
Given una diferencia negativa
When el cajero registra el arqueo
Then debe ingresar una justificación obligatoria
```

---

## Escenario 3

```gherkin
Given un arqueo registrado
When el supervisor lo valida
Then el estado cambia a Validado
```

---

## Escenario 4

```gherkin
Given una caja sin arqueo
When se intenta realizar el cierre
Then el sistema impide continuar
```

---

## Escenario 5

```gherkin
Given el efectivo físico coincide con el sistema
When se registra el arqueo
Then el resultado se marca como Cuadrado
```