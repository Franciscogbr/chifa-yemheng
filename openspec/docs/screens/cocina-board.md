# Cocina Board

## Información General

### Nombre

Panel de Cocina

### Ruta

```text
/cocina
```

### Shell

```text
StaffShell
```

### Feature

```text
features/cocina
```

### Roles Permitidos

```text
COCINERO
SUPERVISOR
```

### Permisos

```text
COCINA_VER
COCINA_ATENDER
COCINA_ANULAR
```

---

# Objetivo

Gestionar la preparación de pedidos en cocina.

Permite:

- Visualizar pedidos pendientes.
- Iniciar preparación.
- Marcar pedidos como servidos.
- Anular detalles de pedido.
- Monitorear tiempos de preparación.
- Priorizar pedidos.

---

# Usuarios Objetivo

- COCINERO
- SUPERVISOR

---

# Tipo de Pantalla

```text
Kanban Operativo
```

---

# Actualización de Información

## Método

```text
Polling
```

## Intervalo

```text
5 segundos
```

## Actualización

```text
Automática
```

No requiere recargar pantalla.

---

# Layout

## Estructura General

```text
┌──────────────────────────────────────────────────────────┐
│ Header                                                   │
├──────────────────────────────────────────────────────────┤
│ Indicadores de Cocina                                    │
├──────────────────────────────────────────────────────────┤
│ PENDIENTE │ EN PROCESO │ SERVIDO │ ANULADO              │
│           │            │         │                      │
│  Tarjeta  │  Tarjeta   │ Tarjeta │ Tarjeta              │
│  Tarjeta  │  Tarjeta   │ Tarjeta │ Tarjeta              │
└──────────────────────────────────────────────────────────┘
```

---

# Estados Permitidos

## P

```text
Pendiente
```

Pedido recién registrado.

Color:

```text
Gris
```

---

## E

```text
En Proceso
```

Pedido en preparación.

Color:

```text
Naranja
```

---

## S

```text
Servido
```

Pedido terminado.

Color:

```text
Verde
```

---

## A

```text
Anulado
```

Pedido anulado.

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
E
↓
S
```

---

## Flujo Alternativo

```text
P
↓
A
```

---

# Restricciones

## No Permitido

```text
S → E

S → P

A → P

A → E

A → S
```

---

# Sección 1: Header

## Componentes

- Título
- Hora actual
- Última actualización

### Ejemplo

```text
Panel de Cocina

Última actualización:
17:25:05
```

---

# Sección 2: Indicadores

## Pedidos Pendientes

Mostrar:

```text
Cantidad
```

---

## Pedidos En Proceso

Mostrar:

```text
Cantidad
```

---

## Pedidos Servidos

Mostrar:

```text
Cantidad
```

---

## Tiempo Promedio

Mostrar:

```text
Minutos promedio de preparación
```

---

# Sección 3: Columna Pendiente

## Mostrar

Pedidos en estado:

```text
P
```

---

## Orden

```text
Más antiguos primero
```

---

## Acción Disponible

```text
Iniciar Preparación
```

Transición:

```text
P → E
```

---

# Sección 4: Columna En Proceso

## Mostrar

Pedidos en estado:

```text
E
```

---

## Acción Disponible

```text
Marcar Servido
```

Transición:

```text
E → S
```

---

# Sección 5: Columna Servido

## Mostrar

Pedidos en estado:

```text
S
```

---

## Información

Solo lectura.

---

# Sección 6: Columna Anulado

## Mostrar

Pedidos en estado:

```text
A
```

---

## Información

Motivo de anulación.

---

# Tarjeta de Pedido

## Información Visible

### Mesa

```text
Mesa 12
```

o

```text
Delivery
```

---

### Cliente

```text
Juan Pérez
```

---

### Hora Registro

```text
13:22
```

---

### Tiempo Transcurrido

```text
18 minutos
```

---

### Estado

```text
Pendiente
En Proceso
Servido
Anulado
```

---

### Total de Ítems

```text
5 productos
```

---

# Detalle del Pedido

## Productos

Mostrar:

```text
Cantidad

Producto

Observación
```

---

### Ejemplo

```text
2x Arroz Chaufa

Sin cebolla
```

```text
1x Wantán Frito

Extra salsa
```

---

# Indicador de Prioridad

## Normal

```text
Verde
```

---

## Atención

```text
Amarillo
```

Más de 15 minutos.

---

## Crítico

```text
Rojo
```

Más de 30 minutos.

---

# Acciones Disponibles

## Iniciar Preparación

```text
P → E
```

---

## Marcar Como Servido

```text
E → S
```

---

## Anular

```text
P → A
```

---

## Ver Detalle

```text
Abre modal completo.
```

---

# Modal Detalle Pedido

## Información

```text
Número Pedido

Mesa

Cliente

Hora

Productos

Observaciones

Estado
```

---

## Historial

Mostrar:

```text
Creado

En Proceso

Servido

Anulado
```

---

# Reglas de Negocio

## BR-INF-047

```text
Un pedido pendiente puede
cambiar a En Proceso.
```

---

## BR-INF-048

```text
Un pedido en proceso puede
cambiar a Servido.
```

---

## BR-INF-051

```text
Solo cocina puede cambiar
estados de producción.
```

---

## BR-INF-052

```text
Mozo no puede cambiar
estados P/E/S.
```

---

## BR-INF-053

```text
Pedido servido ya no puede
volver a preparación.
```

---

# Seguridad

## Roles

```text
COCINERO
SUPERVISOR
```

---

## Permisos

### Consultar

```text
COCINA_VER
```

### Atender

```text
COCINA_ATENDER
```

### Anular

```text
COCINA_ANULAR
```

---

# APIs

## Board Cocina

```http
GET /api/cocina/board
```

---

## Iniciar Preparación

```http
PATCH /api/cocina/{id}/en-proceso
```

---

## Marcar Servido

```http
PATCH /api/cocina/{id}/servido
```

---

## Anular

```http
PATCH /api/cocina/{id}/anular
```

---

## Detalle

```http
GET /api/cocina/{id}
```

---

# Base de Datos

## Tablas

```text
PEDIDO
DETALLE_PEDIDO
COMANDA
PRODUCTO
AUDITORIA
```

---

## Vistas

```text
VW_COMANDA_COCINA
```

---

# Auditoría

Registrar:

```text
P → E

E → S

P → A
```

---

# Estados de Pantalla

## Loading

```text
Skeleton Kanban
```

---

## Sin Datos

```text
No existen pedidos pendientes.
```

---

## Error

```text
No fue posible cargar la información de cocina.
```

---

# Responsive

## Desktop

```text
4 columnas visibles.
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
When el cocinero inicia preparación
Then el pedido cambia a estado En Proceso
```

---

## Escenario 2

```gherkin
Given un pedido en estado En Proceso
When el cocinero finaliza la preparación
Then el pedido cambia a estado Servido
```

---

## Escenario 3

```gherkin
Given un pedido pendiente
When el cocinero registra una anulación
Then el pedido cambia a estado Anulado
```

---

## Escenario 4

```gherkin
Given un usuario con rol MOZO
When intenta modificar estados de cocina
Then el sistema deniega la operación
```

---

## Escenario 5

```gherkin
Given existen pedidos en preparación
When el tablero se refresca