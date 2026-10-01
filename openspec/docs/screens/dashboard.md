# Dashboard

## Información General

### Nombre

Dashboard Administrativo

### Ruta

```text
/admin
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/dashboard
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
```

### Permisos

```text
DASHBOARD_VER
```

---

# Objetivo

Centralizar los indicadores clave del negocio para que administradores, gerentes y supervisores puedan monitorear en tiempo real la operación del restaurante.

Permite visualizar:

- Ventas del día
- Estado de mesas
- Pedidos activos
- Estado de cocina
- Reservas pendientes
- Actividad reciente

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR

---

# Layout

## Tipo

```text
Dashboard Ejecutivo
```

## Estructura General

```text
┌────────────────────────────────────────────────────┐
│ Header + Breadcrumb                               │
├────────────────────────────────────────────────────┤
│ KPI Ventas │ KPI Pedidos │ KPI Mesas │ KPI Reserva │
├────────────────────────────────────────────────────┤
│ Ventas del Día      │ Cocina                     │
├────────────────────────────────────────────────────┤
│ Estado de Mesas     │ Reservas Pendientes        │
├────────────────────────────────────────────────────┤
│ Actividad Reciente                              │
└────────────────────────────────────────────────────┘
```

---

# Sección 1: Header

## Componentes

- Título de pantalla
- Breadcrumb
- Fecha actual
- Usuario autenticado

### Ejemplo

```text
Dashboard Administrativo

Inicio / Dashboard

Viernes 25 de Septiembre de 2026

Bienvenido, Carlos Rojas
```

---

# Sección 2: KPIs

## KPI 1 - Ventas del Día

### Mostrar

```text
S/. 4,820.50
```

### Descripción

Monto total vendido durante el día.

### Fuente

```text
VW_VENTAS_DIARIAS
VENTA
```

---

## KPI 2 - Pedidos Activos

### Mostrar

```text
28 Pedidos
```

### Considerar

Estados:

```text
ABIERTO
EN_PREPARACION
SERVIDO
POR_COBRAR
```

### Fuente

```text
PEDIDO
```

---

## KPI 3 - Mesas Ocupadas

### Mostrar

```text
16 / 25
```

### Fuente

```text
VW_MAPA_MESAS
```

---

## KPI 4 - Reservas Pendientes

### Mostrar

```text
5 Reservas
```

### Fuente

```text
RESERVA
```

### Estado

```text
P
```

---

# Sección 3: Resumen de Ventas

## Objetivo

Mostrar el comportamiento comercial del día.

## Información

### Ventas Totales

```text
Monto acumulado del día
```

### Cantidad de Ventas

```text
Número de comprobantes emitidos
```

### Ticket Promedio

```text
Promedio de consumo por venta
```

### Formato Visual

```text
Tarjeta de resumen con indicadores
```

### Fuente

```text
VENTA
VW_VENTAS_DIARIAS
```

---

# Sección 4: Estado de Cocina

## Objetivo

Visualizar la carga operativa de cocina.

### Mostrar

```text
Pendientes
En Proceso
Servidos
Anulados
```

### Ejemplo

```text
Pendientes: 12

En Proceso: 8

Servidos: 34

Anulados: 2
```

### Fuente

```text
VW_COMANDA_COCINA
DETALLE_PEDIDO
```

---

# Sección 5: Estado de Mesas

## Objetivo

Mostrar ocupación actual del restaurante.

### Estados

```text
LIBRE
OCUPADA
RESERVADA
POR_COBRAR
```

### Ejemplo

```text
Libres: 8

Ocupadas: 12

Reservadas: 3

Por Cobrar: 2
```

### Visualización

```text
Badges de estado
```

### Fuente

```text
VW_MAPA_MESAS
```

---

# Sección 6: Reservas Pendientes

## Objetivo

Mostrar reservas que requieren atención.

### Información

```text
Cliente
Fecha
Hora
Personas
Estado
```

### Acciones

```text
Ver Reserva

Ir a Gestión de Reservas
```

### Fuente

```text
RESERVA
CLIENTE
```

---

# Sección 7: Actividad Reciente

## Objetivo

Visualizar eventos relevantes del sistema.

### Mostrar

```text
Ventas registradas

Reservas confirmadas

Pedidos creados

Aperturas de caja

Cierres de caja

Notas de crédito

Cambios de usuarios
```

### Formato

```text
Timeline
```

### Fuente

```text
AUDITORIA
```

---

# Acciones Disponibles

## Ir a Ventas

```text
/admin/ventas
```

---

## Ir a Reservas

```text
/admin/reservas
```

---

## Ir a Caja

```text
/admin/caja
```

---

## Ir a Auditoría

```text
/admin/auditoria
```

---

