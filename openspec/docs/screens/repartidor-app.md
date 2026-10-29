# Repartidor App

## Información General

### Nombre

Pantalla del Repartidor (Mis Entregas + GPS + Por Rendir)

### Ruta

```text
/repartidor/mis-entregas
```

> Vista personal del repartidor (Archivo 5.3).
> El kanban global staff vive en `seguimiento-entregas.md`;
> el legado `delivery-board.md` (/repartidor) se repliega a esta vista.

### Shell

```text
RepartidorLayout
```

### Feature

```text
features/repartidor/mis-entregas
```

### Roles Permitidos

```text
REPARTIDOR
DELIVERY
```

### Permisos

```text
DELIVERY_VER
DELIVERY_ENTREGAR (propio)
```

---

# Objetivo

Que el repartidor vea lo suyo, lo entregue y comparta ubicación solo en ruta.

Permite:

- Ver mis pedidos asignados (P asignado a mí + R míos).
- Iniciar ruta / confirmar entrega propios.
- Compartir GPS solo en estado R, cada 10s; es opcional.
- Ver saldo "por rendir" (efectivo no entregado a caja).
- Ver dirección + teléfono + total + método.

No permite:

- Ver entregas de otros.
- Asignarse solo (asigna staff en `pedidos-delivery.md`).
- Rendir aquí (la rendición física es en Caja 4.7).
- Compartir GPS fuera de R (corta en E/C).

---

# Usuarios Objetivo

- REPARTIDOR

---

# Layout

## Tipo

```text
Lista Mis Entregas + Detalle
```

```text
┌─────────────────────────────────────────────┐
│ Header (Hola, repartidor + por rendir)      │
├─────────────────────────────────────────────┤
│ Tabs: [Asignados P] [En ruta R] [Historial] │
├─────────────────────────────────────────────┤
│ Cards (dirección, total, método, tiempo)    │
├─────────────────────────────────────────────┤
│ Detalle + botones + toggle ubicación        │
└─────────────────────────────────────────────┘
```

Mobile-first (trabajo en calle).

---

# Sección 1: Cards

Mostrar por entrega:

```text
N° pedido, cliente, dirección + referencia + distrito,
teléfono, total + costo envío, método (efectivo/digital),
estado P/R, tiempo desde asignación.
```

Fuente:

```text
PEDIDO_DELIVERY (ID_Empleado = yo) + PEDIDO + CLIENTE
```

Las listas se consultan paginadas (20 por página). "Historial" incluye entregas
finalizadas y canceladas; el servidor valida estado, página y límite.

Filtro default:

```text
Solo míos, no entregados primero.
```

---

# Sección 2: Detalle + Acciones

## Iniciar Ruta (P→R propio)

```http
PATCH /api/repartidor/entregas/{id}/ruta
```

Efecto:

```text
F_Salida = NOW(). Activa toggle GPS.
```

## Confirmar Entrega (R→E propio)

```http
PATCH /api/repartidor/entregas/{id}/entregar
```

Efecto:

```text
F_Entrega = NOW(). Corta GPS.
Si efectivo → suma a por rendir.
```

---

# Sección 3: GPS (+GPS)

Comportamiento:

```text
Solo con entrega en estado R, cada 10s.
El GPS se activa al iniciar la ruta o reabrir una entrega R.
En E/C se deja de compartir automáticamente.
Sin permiso → sigue con dirección manual, sin bloquear.
El cliente consulta la ubicación por endpoint autenticado cada 8s mientras está en ruta.
```

Implementación:

```http
POST /api/v1/repartidor/entregas/{id}/ubicacion
Body: { lat, lng }
→ actualiza solo si ID_Empleado coincide y situacion = 'R'
```

Valida:

```text
Rangos lat/lng + ID_Empleado de la sesión + situacion='R' + estado='A'.
Nunca toca situacion ni costo_envio.
```

Columnas:

```text
lat_repartidor / lng_repartidor + f_ubicacion (ALTER 01)
```

---

# Sección 4: Por Rendir

Mostrar:

```text
Total efectivo cobrado contra entrega aún no entregado a caja.
Detalle por pedido (fecha, total, cliente).
Aviso: "Entrégalo en Caja /admpanel/caja/rendicion (4.7)".
```

Fuente cálculo:

```text
PEDIDO_DELIVERY E + PAGO_VENTA efectivo sin MOVIMIENTO rendición.
(La consolidación la hace rendicion-delivery.md)
```

> Aquí solo consulta; el ingreso consolidado lo registra el cajero.

---

# Reglas de Negocio

## BR-ACC-040

```text
P→R→E con F_Salida/F_Entrega (solo propios).
```

## BR-ACC-045

```text
Efectivo contra entrega lo entrega al cajero al regresar;
el cajero registra el ingreso en arqueo.
```

## BR-GPS-001

```text
Sin GPS sigue con dirección+distrito; compartir es opcional.
```

---

# Seguridad

```text
REPARTIDOR/DELIVERY solo ve/opera ID_Empleado = empleado de la sesión (backend lo impone).
SUPERVISOR consulta global en seguimiento-entregas.md.
```

---

# APIs

```http
GET /api/v1/repartidor/entregas?estado=P,R&page=1&limit=20
GET /api/v1/repartidor/entregas/{id}
PATCH /api/v1/repartidor/entregas/{id}/ruta
PATCH /api/v1/repartidor/entregas/{id}/entregar
POST /api/v1/repartidor/entregas/{id}/ubicacion
GET /api/v1/repartidor/por-rendir
```

---

# Base de Datos

```text
PEDIDO_DELIVERY (ID_Empleado=yo, Situacion, F_Salida/F_Entrega,
lat/lng_repartidor, f_ubicacion)
PEDIDO + CLIENTE (dirección, nombre, pagos)
MOVIMIENTO_CAJA (excluir rendido)
Actualización GPS filtrada por empleado asignado y estado en ruta
```

---

# Auditoría

Registrar:

```text
Iniciar ruta / entrega propia + inicio/fin compartir GPS.
```

---

# Estados / Responsive

```text
Loading skeleton / Sin asignadas / Error.
Mobile-first: botones grandes, cards, mapa mini opcional.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un P asignado a mí
When inicio ruta
Then pasa a R con F_Salida y se activa GPS
```

---

## Escenario 2

```gherkin
Given un R mío en efectivo
When confirmo entrega sin GPS
Then pasa a E y suma a mi por rendir sin error
```

---

## Escenario 3

```gherkin
Given un E
When reviso ubicación
Then ya no se comparte (corte en E)
```
