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
StaffShell
```

### Feature

```text
features/repartidor/mis-entregas
```

### Roles Permitidos

```text
REPARTIDOR
SUPERVISOR (consulta)
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
- Compartir GPS solo en turno y en R cada 30s.
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
Solo en turno y en estado R, cada 30s.
Botón [Compartir ubicación] visible solo en R.
En E/C se deja de compartir automáticamente.
Sin permiso → sigue con dirección manual, sin bloquear.
```

Implementación:

```http
POST /api/repartidor/entregas/{id}/ubicacion
Body: { lat, lng }
→ USP_ACTUALIZAR_UBICACION_DELIVERY(id_pedido, lat, lng, 'REPARTIDOR')
```

Valida:

```text
Rangos lat/lng + p_quien='REPARTIDOR' + estado='A'.
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
REPARTIDOR solo ve/opera ID_Empleado = yo (backend lo impone).
SUPERVISOR consulta global en seguimiento-entregas.md.
```

---

# APIs

```http
GET /api/repartidor/entregas?estado=P,R
GET /api/repartidor/entregas/{id}
PATCH /api/repartidor/entregas/{id}/ruta
PATCH /api/repartidor/entregas/{id}/entregar
POST /api/repartidor/entregas/{id}/ubicacion
GET /api/repartidor/por-rendir
```

---

# Base de Datos

```text
PEDIDO_DELIVERY (ID_Empleado=yo, Situacion, F_Salida/F_Entrega,
lat/lng_repartidor, f_ubicacion)
PEDIDO + CLIENTE (dirección)
PAGO_VENTA (para por rendir efectivo)
USP_ACTUALIZAR_UBICACION_DELIVERY (ALTER 03)
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
