# Reservas

## Información General

### Nombre

Gestión de Reservas

### Ruta

```text
/admin/reservas
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/reservas
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
MOZO
```

### Permisos

```text
RES_VER
RES_CREAR
RES_CONFIRMAR
RES_ANULAR
```

---

# Objetivo

Administrar las reservas del restaurante.

Permite:

- Registrar reservas.
- Confirmar reservas online.
- Asignar mesas.
- Reprogramar reservas.
- Anular reservas.
- Controlar aforo.
- Consultar historial de reservas.

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR
- MOZO

---

# Layout

## Tipo

```text
Gestión Operativa
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Breadcrumb                         │
├─────────────────────────────────────────────┤
│ KPIs de Reservas                            │
├─────────────────────────────────────────────┤
│ Filtros                                     │
├─────────────────────────────────────────────┤
│ Calendario / Lista                          │
├─────────────────────────────────────────────┤
│ Tabla de Reservas                           │
├─────────────────────────────────────────────┤
│ Detalle Reserva                             │
└─────────────────────────────────────────────┘
```

---

# Estados de Reserva

## P

```text
Pendiente
```

Reserva creada y esperando confirmación.

---

## C

```text
Confirmada
```

Reserva validada y mesa asignada.

---

## A

```text
Atendida
```

Cliente llegó y ocupó la mesa.

---

## X

```text
Anulada
```

Reserva cancelada.

---

# Sección 1: Header

## Componentes

- Título
- Breadcrumb
- Fecha actual

### Ejemplo

```text
Reservas

Inicio / Operaciones / Reservas
```

---

# Sección 2: KPIs

## Reservas Hoy

Mostrar:

```text
Cantidad total
```

---

## Pendientes

Mostrar:

```text
Cantidad pendiente de confirmar
```

---

## Confirmadas

Mostrar:

```text
Cantidad confirmada
```

---

## Anuladas

Mostrar:

```text
Cantidad anulada
```

---

# Sección 3: Filtros

## Fecha

Tipo:

```text
DatePicker
```

---

## Estado

Opciones:

```text
Pendiente
Confirmada
Atendida
Anulada
```

---

## Cliente

Tipo:

```text
Autocomplete
```

---

## Mesa

Tipo:

```text
Autocomplete
```

---

## Ambiente

Tipo:

```text
Select
```

---

## Cantidad Personas

Tipo:

```text
Número
```

---

# Sección 4: Calendario

## Objetivo

Visualizar reservas por fecha y hora.

### Vista

```text
Día

Semana

Mes
```

### Mostrar

```text
Hora

Cliente

Mesa

Cantidad Personas

Estado
```

---

# Sección 5: Tabla de Reservas

## Columnas

| Campo | Descripción |
|---------|---------|
| Código | Número de reserva |
| Fecha | Fecha reserva |
| Hora | Hora reserva |
| Cliente | Cliente |
| Personas | Cantidad |
| Mesa | Mesa asignada |
| Estado | Estado actual |
| Origen | Web, QR, Presencial |
| Acciones | Ver, Confirmar, Reprogramar |

---

# Modal Crear Reserva

## Cliente

Tipo:

```text
Autocomplete
```

Obligatorio:

```text
Sí
```

---

## Fecha

Tipo:

```text
DatePicker
```

Obligatorio:

```text
Sí
```

---

## Hora

Tipo:

```text
TimePicker
```

Obligatorio:

```text
Sí
```

---

## Cantidad Personas

Tipo:

```text
Número
```

Obligatorio:

```text
Sí
```

Validación:

```text
Mayor a cero
```

---

## Observaciones

Tipo:

```text
Textarea
```

---

# Confirmación de Reserva

## Asignar Mesa

Tipo:

```text
Select
```

Fuente:

```text
MESA
```

Condición:

```text
Solo mesas libres
```

---

## Observación Confirmación

Tipo:

```text
Textarea
```

---

# Reprogramación

## Permitir cambiar

```text
Fecha

Hora

Mesa

Cantidad Personas
```

---

# Acciones Disponibles

## Crear

```text
Registrar reserva.
```

---

## Confirmar

```text
P -> C
```

---

## Atender

```text
C -> A
```

---

## Anular

```text
P -> X

C -> X
```

---

## Reprogramar

```text
Modificar fecha y hora.
```

---

## Ver Historial

```text
Mostrar trazabilidad.
```

---

# Reglas de Negocio

> Las validaciones numeradas 001..009 de versiones previas no existen
> en el catálogo (`REGLAS_DE_NEGOCIO.md`); mapeo actual a canónicos.
> `VU-*` = validación propia de la pantalla.

## VU-RES-001 — Datos mínimos

```text
Toda reserva debe tener cliente asociado e indicar
cantidad de personas mayor a cero.
(Cubre los anteriores RES-001/002/003.)
```

---

## BR-RES-052 (ref)

```text
Las reservas online requieren confirmación manual:
nacen Pendiente (P) sin mesa y solo personal con SAL_RESERVA
las confirma asignando una mesa libre (→ RESERVADA).
(Cubre los anteriores RES-004/005/008.)
```

---

## VU-RES-006

```text
Una mesa no puede ser reservada
dos veces para el mismo horario.
```

---

## VU-RES-007

```text
Confirmar una reserva cambia su estado a C.
```

---

## VU-RES-009

```text
Una reserva anulada no puede reactivarse.
```

---

# Flujo Principal

```text
Reserva Online

PENDIENTE
   ↓
CONFIRMADA
   ↓
ATENDIDA
```

---

# Flujo Alterno

```text
PENDIENTE
   ↓
ANULADA
```

o

```text
CONFIRMADA
   ↓
ANULADA
```

---

# Seguridad

## Roles

```text
ADMIN
GERENTE
SUPERVISOR
MOZO
```

---

## Permisos

### Consultar

```text
RES_VER
```

### Crear

```text
RES_CREAR
```

### Confirmar

```text
RES_CONFIRMAR
```

### Anular

```text
RES_ANULAR
```

---

# APIs

## Listar

```http
GET /api/reservas
```

---

## Obtener

```http
GET /api/reservas/{id}
```

---

## Crear

```http
POST /api/reservas
```

---

## Confirmar

```http
PATCH /api/reservas/{id}/confirmar
```

---

## Atender

```http
PATCH /api/reservas/{id}/atender
```

---

## Anular

```http
PATCH /api/reservas/{id}/anular
```

---

## Reprogramar

```http
PATCH /api/reservas/{id}/reprogramar
```

---

# Base de Datos

## Tablas

```text
RESERVA
CLIENTE
MESA
AMBIENTE
AUDITORIA
```

---

# Auditoría

Registrar:

```text
Crear reserva

Confirmar reserva

Asignar mesa

Reprogramar reserva

Atender reserva

Anular reserva
```

---

# Notificaciones

## Confirmación

Enviar:

```text
Correo

Notificación App (futuro)
```

---

## Reprogramación

Enviar:

```text
Correo al cliente
```

---

## Anulación

Enviar:

```text
Correo al cliente
```

---

# Estados de Pantalla

## Loading

```text
Skeleton de calendario

Skeleton de tabla
```

---

## Sin Datos

```text
No existen reservas registradas.
```

---

## Error

```text
No fue posible cargar las reservas.
```

---

# Responsive

## Desktop

```text
Calendario y tabla simultáneos.
```

---

## Tablet

```text
Calendario arriba.

Tabla abajo.
```

---

## Mobile

```text
Vista agenda tipo cards.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un cliente registra una reserva online
When la reserva se almacena
Then se crea con estado Pendiente
```

---

## Escenario 2

```gherkin
Given una reserva pendiente
When el supervisor la confirma
Then se asigna una mesa libre y cambia a Confirmada
```

---

## Escenario 3

```gherkin
Given una mesa ya reservada para una fecha y hora
When se intenta asignar nuevamente
Then el sistema rechaza la operación
```

---

## Escenario 4

```gherkin
Given una reserva confirmada
When el cliente llega al restaurante
Then la reserva cambia a estado Atendida
```

---

## Escenario 5

```gherkin
Given una reserva pendiente
When el usuario la anula
Then el sistema registra la anulación y actualiza el estado
```