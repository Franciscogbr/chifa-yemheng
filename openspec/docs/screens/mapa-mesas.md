# Mapa Mesas

## Información General

### Nombre

Mapa Visual de Mesas por Ambiente

### Ruta

```text
/mozo/mapa
```

> Alias operativo: `/mesas/mapa`. No confundir con
> `/admin/mesas` (mesas.md, ABM de ambientes/mesas).

### Shell

```text
StaffShell
```

### Feature

```text
features/mozo/mapa-mesas
```

### Roles Permitidos

```text
MOZO
CAJERO
SUPERVISOR
ADMIN
```

### Permisos

```text
MESA_VER
PED_VER (propuesto, si se separa lectura de comandas)
```

> Reutiliza MESA_VER existente. No exige MESA_CREAR/EDITAR
> (eso es mesas.md ABM).

---

# Objetivo

Vista operativa en tiempo real del salón para atender, no para configurar.

Permite:

- Ver mapa de mesas por ambiente con estado y capacidad.
- Filtrar por ambiente y estado.
- Seleccionar mesa y ver su comanda activa.
- Abrir comanda si está LIBRE.
- Pedir cuenta (pasar a POR COBRAR) vía comanda.
- Polling para cambios de estado.

No permite:

- Crear/editar ambientes o mesas (ver `mesas.md`).
- Cobrar (ver `caja-cobro.md`).
- Cambiar estados de cocina (ver `cocina-board.md`).

---

# Usuarios Objetivo

- MOZO
- CAJERO
- SUPERVISOR

---

# Layout

## Tipo

```text
Mapa Operativo + Panel Lateral
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header (Mapa de Mesas + hora)               │
├─────────────────────────────────────────────┤
│ Filtros (ambiente, estado)                  │
├──────────────────────────────┬──────────────┤
│ Grilla Mesas por Ambiente    │ Detalle Mesa │
│  [M01 LIBRE] [M02 OCUPADA]   │  seleccionada│
│  [M03 POR_COBRAR] ...        │  + comanda   │
└──────────────────────────────┴──────────────┘
```

Actualización:

```text
Polling 10s + refresh manual.
```

---

# Sección 1: Filtros

## Ambiente

Tipo:

```text
Select / Tabs
```

Fuente:

```text
AMBIENTE (Estado='A')
```

---

## Estado Mesa

Opciones:

```text
Todas
LIBRE (verde)
OCUPADA (naranja)
POR_COBRAR (azul)
RESERVADA (morado)
```

Fuente:

```text
ESTADO_MESA + VW_MAPA_MESAS.estado_mesa
```

---

# Sección 2: Tarjeta Mesa

Mostrar:

```text
Número (MESA.Numero)
Ambiente
Capacidad (N comensales)
Estado con color
Consumo actual (si OCUPADA/POR_COBRAR)
N° pedido activo
Tiempo ocupada
```

Ejemplo:

```text
M12 — Terraza — Cap 4
OCUPADA — Pedido PED-2026-00145 — S/. 58.00 — 25 min
[Ver comanda]
```

Fuente:

```text
VW_MAPA_MESAS (mesa, ambiente, estado_mesa, color,
id_pedido, numero_pedido, consumo_actual=total)
```

---

# Sección 3: Detalle Lateral

Si LIBRE:

```text
Botón [Abrir comanda] → pos-mozo.md / comanda.md
Botón [Ver reservas] si RESERVADA → reservas.md
```

Si OCUPADA / POR_COBRAR:

```text
N° comanda, cliente(s) participantes (QR compartida),
total acumulado, estado pedido,
Botón [Ver comanda] → /mozo/comanda/:id
```

---

# Acciones Disponibles

## Seleccionar Mesa

```text
Resalta + carga detalle lateral.
```

---

## Abrir Comanda

```text
Solo si LIBRE y sin comanda activa.
Invoca USP_ABRIR_PEDIDO → mesa pasa a OCUPADA.
```

---

## Ver Comanda

```text
Navega a comanda.md.
```

---

# Restricciones

## No Permitido

```text
Abrir segunda comanda en mesa OCUPADA.
```

Validación:

```text
USP_ABRIR_PEDIDO rechaza si existe comanda
no facturada ni anulada (BR-EST-007).
```

---

## No Permitido

```text
Agregar ítems si mesa en POR_COBRAR.
```

→ `BR-RES-029`, se bloquea en comanda.md.

---

# Reglas de Negocio

## BR-EST-007

```text
Una mesa solo puede tener una comanda abierta a la vez.
```

---

## BR-RES-013

```text
Una mesa solo puede tener una comanda activa
(no facturada ni anulada).
```

---

## BR-ACC-037

```text
Al abrir una comanda la mesa pasa a OCUPADA;
al facturar o anular vuelve a LIBRE.
```

---

## BR-INF-052

```text
Si existe una comanda activa asociada a una mesa,
la mesa se considera OCUPADA.
```

---

## BR-INF-053

```text
Si la comanda activa está en POR COBRAR,
la mesa se considera POR COBRAR.
```

---

## BR-RES-052 (referencia)

```text
Reserva confirmada asigna mesa libre → RESERVADA.
El mapa debe mostrar RESERVADA y bloquear apertura
en horario reservado.
```

---

# Seguridad

## Roles

```text
MOZO
CAJERO
SUPERVISOR
ADMIN
```

## Permisos

```text
MESA_VER
```

---

# APIs

## Mapa

```http
GET /api/mesas/mapa?ambiente=1&estado=OCUPADA
Response: [{ idMesa, numero, ambiente, capacidad, estadoMesa, color, idPedido, numeroPedido, consumoActual }]
```

Fuente:

```text
VW_MAPA_MESAS
```

---

## Detalle Mesa

```http
GET /api/mesas/{id}
Response: { mesa, ambiente, estado, comandaActiva? }
```

---

# Base de Datos

## Tablas / Vistas

```text
VW_MAPA_MESAS (mesa+ambiente+estado_mesa LEFT pedido abierto)
MESA (Numero, Capacidad, ID_Ambiente, ID_EstadoMesa, Codigo_QR)
AMBIENTE
ESTADO_MESA
PEDIDO (para comanda activa)
```

## Procedimientos

```text
USP_ABRIR_PEDIDO (apertura desde LIBRE)
```

---

# Auditoría

Registrar:

```text
Apertura de comanda desde mapa
Consulta de mapa (opcional, muestreo)
```

---

# Estados de Pantalla

## Loading

```text
Skeleton grilla mesas.
```

---

## Sin Datos

```text
No existen mesas para el filtro aplicado.
```

---

## Error

```text
No fue posible cargar el mapa de mesas.
```

---

# Responsive

## Desktop

```text
Grilla + lateral simultáneos.
```

---

## Tablet

```text
Grilla arriba, detalle abajo.
```

---

## Mobile

```text
Lista de mesas por ambiente + bottom-sheet detalle.
Prioritario para mozo en salón.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given mesas LIBRE y OCUPADA
When el mozo abre el mapa
Then ve cada una con su color y consumo actual
```

---

## Escenario 2

```gherkin
Given una mesa LIBRE sin comanda activa
When pulsa Abrir comanda
Then se crea PEDIDO y la mesa pasa a OCUPADA
```

---

## Escenario 3

```gherkin
Given una mesa OCUPADA
When intenta abrir otra comanda
Then el sistema rechaza (BR-EST-007)
```

---

## Escenario 4

```gherkin
Given una comanda en POR COBRAR
When mira el mapa
Then la mesa figura POR_COBRAR y no admite nuevos ítems
```
