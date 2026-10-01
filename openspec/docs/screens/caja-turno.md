# Caja Turno

## Información General

### Nombre

Administración del Turno de Caja

### Ruta

```text
/caja/turno
```

### Shell

```text
StaffShell
```

### Feature

```text
features/caja/turno
```

### Roles Permitidos

```text
CAJERO
SUPERVISOR
ADMIN
```

### Permisos

```text
CAJA_APERTURA (propuesto, ver roles.md:385)
CAJA_CIERRE (propuesto)
CAJA_ARQUEO
```

> `CAJA_APERTURA/CIERRE` hoy citados en roles.md pero sin spec.
> Este archivo los formaliza. El cierre exige validación
> supervisor si hay diferencia (BR-ACC-046).

---

# Objetivo

Abrir y cerrar turnos de caja. Un turno = período con un cajero a cargo en una caja.

Permite:

- Ver estado del turno (abierto/cerrado), caja, cajero, monto inicial.
- Ver ingresos/egresos del turno en vivo.
- Abrir turno (USP_APERTURAR_CAJA).
- Iniciar cierre: declarar monto → arqueo → validación supervisor → USP_CERRAR_CAJA.
- Impedir doble turno abierto en la misma caja.

No permite:

- Cobrar ventas (ver `caja-cobro.md`).
- Registrar movimientos sueltos (ver `movimientos-caja.md`).
- Cerrar sin arqueo (ver `arque-caja.md`).

---

# Usuarios Objetivo

- CAJERO
- SUPERVISOR (valida cierre)
- ADMIN

---

# Layout

## Tipo

```text
Panel de Turno
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header (Caja + Estado ABIERTO/CERRADO)      │
├─────────────────────────────────────────────┤
│ Tarjetas: Monto Inicial | Ingresos | Egresos│
│           Monto Sistema | Declarado | Dif.  │
├─────────────────────────────────────────────┤
│ Turno actual (cajero, apertura, caja)       │
├─────────────────────────────────────────────┤
│ Historial turnos                            │
├─────────────────────────────────────────────┤
│ Acciones: [Abrir turno] [Iniciar cierre]    │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Turno Actual

Mostrar:

```text
Caja (CAJA)
Cajero (USUARIO + EMPLEADO)
F_Apertura / F_Cierre
Monto_Inicial
Total_Ingresos / Total_Egresos (acumulados USP_REGISTRAR_MOVIMIENTO_CAJA)
Monto_Sistema (solo efectivo físico)
Monto_Declarado + Diferencia + Situación (si en cierre)
Situacion A (abierto) / C (cerrado)
```

Fuente:

```text
APERTURA_CAJA + CAJA + USUARIO (apertura/cierre)
+ VW_ARQUEO_CAJA
```

---

# Sección 2: Historial

Columnas:

| Campo | Descripción |
|---------|---------|
| Caja | Nombre caja |
| Apertura | Fecha/hora |
| Cierre | Fecha/hora |
| Cajero | Responsable |
| Inicial | Monto inicial |
| Sistema | Monto sistema al cierre |
| Declarado | Declarado por cajero |
| Dif. | Diferencia + clase |
| Situación | A/C |

---

# Sección 3: Abrir Turno (Modal)

Campos:

```text
Caja (Select, solo cajas sin turno abierto)
Monto_Inicial (> 0)
Observación (opcional)
```

Implementación:

```text
USP_APERTURAR_CAJA: valida una caja = un turno abierto,
crea APERTURA_CAJA Situacion='A'.
```

Error típico:

```text
La caja ya tiene un turno abierto (BR-EST-008).
```

---

# Sección 4: Iniciar Cierre

Flujo:

```text
1. Cajero pulsa Iniciar cierre → va a arque-caja.md,
   declara Monto_Declarado.
2. Sistema calcula Diferencia = Declarado − Sistema (BR-DER-032).
3. Si diferencia = 0 → supervisor confirma directo.
4. Si ≠ 0 → exige justificación + validación supervisor (BR-ACC-046).
5. USP_CERRAR_CAJA cierra (Situacion='C').
```

> El cálculo vive en arque-caja.md; aquí solo estado y disparo.

---

# Restricciones

## No Permitido

```text
Dos turnos abiertos en la misma caja.
```

→ `BR-EST-008`.

## No Permitido

```text
Facturar sin turno abierto.
```

→ `BR-RES-017`. `USP_FACTURAR_PEDIDO` exige `ID_AperturaCaja` con `Situacion='A'`.

---

# Reglas de Negocio

## BR-EST-008

```text
Toda venta pertenece a un turno de caja abierto.
Una caja solo puede tener un turno abierto a la vez.
```

## BR-RES-017

```text
Toda venta requiere un turno de caja ABIERTO.
```

## BR-ACC-046

```text
El cierre lo inicia el cajero (declara el monto);
un supervisor/administrador valida y confirma el cierre.
```

## BR-DER-032 (referencia)

```text
Diferencia = Monto_Declarado − Monto_Sistema.
```

## BR-INF-049 (referencia)

```text
Cuadrado (0) / Sobrante (>0) / Faltante (<0).
```

## BR-INF-051 (referencia)

```text
Pagos digitales suman Total_Ingresos pero no Monto_Sistema.
El turno muestra ambos separados.
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
CAJA_APERTURA
CAJA_CIERRE
CAJA_ARQUEO
```

---

# APIs

## Estado Actual

```http
GET /api/caja/turno-actual?caja={id}
```

---

## Abrir

```http
POST /api/caja/turno/abrir
Body: { idCaja, montoInicial, observacion? }
```

---

## Cerrar (tras arqueo validado)

```http
PATCH /api/caja/turno/{id}/cerrar
Body: { montoDeclarado, justificacion? }
```

Implementación:

```text
USP_CERRAR_CAJA
```

---

# Base de Datos

## Tablas

```text
CAJA (N_Caja, Estado)
APERTURA_CAJA (ID_Caja, ID_UsuarioApertura, ID_UsuarioCierre,
F_Apertura, F_Cierre, Monto_Inicial, Total_Ingresos,
Total_Egresos, Monto_Sistema, Monto_Declarado, Diferencia,
Situacion A/C, Observacion)
MOVIMIENTO_CAJA (para ingresos/egresos en vivo)
```

## Procedimientos / Vistas

```text
USP_APERTURAR_CAJA
USP_CERRAR_CAJA
VW_ARQUEO_CAJA
```

---

# Auditoría

Registrar:

```text
Apertura turno (caja, cajero, monto inicial, fecha)
Inicio cierre + cierre confirmado (quién validó)
```

---

# Estados de Pantalla

## Loading

```text
Skeleton tarjetas + tabla.
```

---

## Sin Datos

```text
No hay turno abierto. [Abrir turno]
```

---

## Error

```text
No fue posible cargar el turno.
```

---

# Responsive

## Desktop

```text
Tarjetas + historial simultáneos.
```

---

## Mobile

```text
Tarjetas apiladas + historial en cards.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given una caja sin turno abierto
When el cajero abre con monto inicial > 0
Then se crea APERTURA_CAJA Situacion A
```

---

## Escenario 2

```gherkin
Given una caja con turno abierto
When intenta abrir otro
Then el sistema rechaza (BR-EST-008)
```

---

## Escenario 3

```gherkin
Given un turno abierto
When se factura una venta
Then la VENTA queda atada a ese ID_AperturaCaja
```

---

## Escenario 4

```gherkin
Given cierre con diferencia ≠ 0
When el cajero declara sin supervisor
Then el cierre queda pendiente de validación (BR-ACC-046)
```
