# Mis Reservas

## Información General

### Nombre

Mis Reservas

### Ruta

```text
/cliente/mis-reservas
```

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/reservas
```

### Roles Permitidos

```text
CLIENTE
```

### Permisos

```text
CLIENTE_RESERVA
```

---

# Objetivo

Permitir que el cliente consulte y gestione sus reservas realizadas desde la aplicación.

Permite:

- Consultar reservas activas.
- Consultar historial de reservas.
- Ver estado de reservas.
- Ver mesa asignada.
- Anular reservas.
- Consultar adelantos realizados.
- Visualizar detalles completos.

---

# Usuarios Objetivo

```text
CLIENTE
```

---

# Contexto de Negocio

## Reserva Online

```text
Toda reserva online requiere:

- Login Gmail obligatorio.
- Asociación a un CLIENTE.
- Estado inicial Pendiente.
- Mesa asignada posteriormente por el personal.
```

---

# Layout

## Tipo

```text
Consulta y Gestión
```

---

## Estructura General

```text
┌──────────────────────────────┐
│ Resumen                      │
├──────────────────────────────┤
│ Reservas Activas             │
├──────────────────────────────┤
│ Historial                    │
├──────────────────────────────┤
│ Detalle Reserva              │
└──────────────────────────────┘
```

---

# Sección 1: Resumen

## Mostrar

```text
Reservas Activas

Reservas Pendientes

Reservas Confirmadas

Reservas Finalizadas
```

---

### Ejemplo

```text
Activas: 2

Pendientes: 1

Confirmadas: 1

Finalizadas: 5
```

---

# Sección 2: Reservas Activas

## Mostrar

```text
Número Reserva

Fecha

Hora

Cantidad Personas

Estado

Mesa
```

---

## Tarjeta Reserva

### Información

```text
Código Reserva

Fecha

Hora

Comensales

Estado Actual
```

---

### Ejemplo

```text
RES-000152

25/09/2026

20:00

4 Personas

Confirmada
```

---

# Estados de Reserva

## P

```text
Pendiente
```

Descripción:

```text
Registrada y esperando confirmación.
```

Color:

```text
Amarillo
```

---

## C

```text
Confirmada
```

Descripción:

```text
Mesa asignada.
```

Color:

```text
Verde
```

---

## X

```text
Cancelada
```

Descripción:

```text
Anulada por cliente o personal.
```

Color:

```text
Rojo
```

---

## A

```text
Atendida
```

Descripción:

```text
Cliente asistió al restaurante.
```

Color:

```text
Azul
```

---

## X

```text
Anulada (incluye No Show)
```

Descripción:

```text
Anulada por cliente o personal. El "cliente no asistió"
(No Show) se registra como X con Observacion='NO SHOW',
no como estado propio (BD: Situacion P/C/A/X, sin N).
```

Color:

```text
Rojo (No Show: Gris en badge de observación)
```

---

# Mesa Asignada

## Mostrar

Cuando exista asignación:

```text
Número Mesa

Capacidad

Ambiente
```

---

### Ejemplo

```text
Mesa 08

4 Personas

Primer Piso
```

---

# Sección 3: Historial

## Mostrar

Reservas:

```text
Atendidas

Canceladas (incluye No Show como X + Observacion='NO SHOW')
```

---

## Filtros

### Fecha

```text
Desde

Hasta
```

---

### Estado

```text
Todos

Pendiente

Confirmada

Atendida

Cancelada (incluye No Show)
```

---

# Tabla Histórica

## Columnas

```text
Código

Fecha

Hora

Comensales

Estado

Fecha Registro
```

---

# Sección 4: Detalle de Reserva

## Información General

Mostrar:

```text
Código

Fecha

Hora

Cantidad Personas

Estado

Canal
```

---

## Canal

Valores:

```text
Online

Presencial

Telefónico
```

---

# Información de Mesa

Mostrar:

```text
Mesa

Capacidad

Ambiente
```

---

# Información Financiera

## Adelanto

Mostrar:

```text
Monto

Fecha Pago

Método Pago
```

---

### Ejemplo

```text
S/. 50.00

22/09/2026

Yape
```

---

# Historial de Estados

## Timeline

### Ejemplo

```text
22/09/2026 14:00

Reserva creada
```

↓

```text
22/09/2026 15:30

Reserva confirmada
```

↓

```text
25/09/2026 20:00

Reserva atendida
```

---

# Acciones Disponibles

## Ver Detalle

```text
Muestra información completa.
```

---

## Anular Reserva

Disponible cuando:

```text
Pendiente

Confirmada
```

---

## Repetir Reserva

```text
Permite iniciar una nueva reserva
con los mismos datos.
```

---

# Anulación de Reserva

## Confirmación

```text
¿Desea anular la reserva?
```

---

## Motivo

Opcional.

Ejemplos:

```text
Cambio de planes

Error de fecha

No asistiré
```

---

## Resultado

```text
Estado = Cancelada
```

---

# Restricciones

## No Permitido

```text
Anular una reserva ya atendida.
```

---

## No Permitido

```text
Modificar una reserva atendida.
```

---

## No Permitido

```text
Visualizar reservas de otros clientes.
```

---

# Reglas de Negocio

## BR-RES-052

```text
La reserva online exige
login Gmail obligatorio.
```

---

## BR-DER-053

```text
El adelanto es opcional.
```

---

## BR-ACC-044

```text
El cliente se autentica
mediante Gmail.
```

---

## BR-RES-021

```text
Toda operación de cliente
requiere identificación.
```

---

# Seguridad

## Rol

```text
CLIENTE
```

---

## Autenticación

```text
OAuth Google obligatorio.
```

---

## Restricción

```text
Solo puede consultar
sus propias reservas.
```

---

# APIs

## Mis Reservas

```http
GET /api/cliente/reservas
```

---

## Detalle Reserva

```http
GET /api/cliente/reservas/{id}
```

---

## Anular Reserva

```http
PATCH /api/cliente/reservas/{id}/anular
```

---

## Historial

```http
GET /api/cliente/reservas/historial
```

---

# Base de Datos

## Tablas

```text
RESERVA

CLIENTE

MESA

MOVIMIENTO_CAJA

AUDITORIA
```

---

# Auditoría

Registrar:

```text
Consulta reservas

Visualización detalle

Anulación reserva

Repetición reserva
```

---

# Estados de Pantalla

## Loading

```text
Skeleton tarjetas.
```

---

## Sin Reservas

```text
No existen reservas registradas.
```

---

## Error

```text
No fue posible cargar la información.
```

---

## Sin Conexión

```text
Verifique su conexión a internet.
```

---

# Responsive

## Desktop

```text
Listado y detalle simultáneos.
```

---

## Tablet

```text
Listado superior.

Detalle inferior.
```

---

## Mobile

```text
Cards por reserva.

Detalle en pantalla independiente.
```

---

# Casos Especiales

## Reserva Pendiente

```text
Puede no tener mesa asignada.
```

---

## Reserva Confirmada

```text
Debe mostrar mesa asignada.
```

---

## Reserva con Adelanto

```text
Mostrar detalles del pago.
```

---

## Reserva Cancelada

```text
Visible solo para consulta histórica.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un cliente autenticado
When accede a Mis Reservas
Then visualiza únicamente sus reservas
```

---

## Escenario 2

```gherkin
Given una reserva confirmada
When consulta el detalle
Then visualiza la mesa asignada
```

---

## Escenario 3

```gherkin
Given una reserva pendiente
When el cliente decide cancelarla
Then el estado cambia a Cancelada
```

---

## Escenario 4

```gherkin
Given una reserva con adelanto
When consulta el detalle
Then visualiza la información del pago realizado
```

---

## Escenario 5

```gherkin
Given una reserva atendida
When intenta anularla
Then el sistema rechaza la operación
```