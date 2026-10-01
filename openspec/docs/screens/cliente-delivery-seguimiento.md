# Cliente Delivery Seguimiento

## Información General

### Nombre

Seguimiento en Vivo del Delivery (Solo Lectura + Mapa)

### Ruta

```text
/cliente/delivery/:id
```

> Archivo 7.5. Creación en `cliente-delivery.md`;
> gestión staff en `seguimiento-entregas.md`.

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/delivery-seguimiento
```

### Roles Permitidos

```text
CLIENTE (dueño del pedido)
```

### Permisos

```text
CLIENTE_PEDIDOS
```

---

# Objetivo

Ver estado P/R/E/C + repartidor + tiempo estimado + mapa.

Permite:

- Ver timeline P→R→E (o C).
- Ver repartidor asignado.
- Ver mapa solo lectura (pin cliente + repartidor).
- Polling suave.

No permite:

- Cambiar estado.
- Ver entregas ajenas.
- Editar dirección post-confirmación (pide por teléfono).

---

# Layout

```text
┌─────────────────────────────────────────────┐
│ Timeline P → R → E (+ hora)                 │
├─────────────────────────────────────────────┤
│ Repartidor + tiempo estimado                │
├─────────────────────────────────────────────┤
│ Mapa Leaflet/OSM solo lectura               │
└─────────────────────────────────────────────┘
```

---

# Secciones

## Timeline

```text
P Pendiente → R En ruta → E Entregado (verde)
C Cancelado (rojo, con motivo).
Muestra F_Salida / F_Entrega si existen.
```

Fuente:

```text
PEDIDO_DELIVERY.Situacion + F_Salida/F_Entrega
```

## Repartidor

```text
Nombre (EMPLEADO) + tiempo estimado.
Sin PII sensible.
```

## Mapa (+GPS)

```text
Leaflet/OSM: pin cliente + pin repartidor + f_ubicacion.
Sin GPS → mensaje + dirección textual.
Polling 30s.
```

Fuente:

```text
VW_DELIVERY_UBICACION (solo mis filas; backend filtra por dueño).
```

---

# Reglas

```text
BR-ACC-040 (P/R/E/C + fechas), BR-GPS-001 (fallback),
solo lectura (sin transición desde aquí).
```

---

# APIs

```http
GET /api/cliente/delivery/{id}
GET /api/cliente/delivery/{id}/ubicacion
Response: { situacion, fSalida, fEntrega, repartidor,
latCliente, lngCliente, latRepartidor, lngRepartidor, fUbicacion }
```

> Backend impone `ID_Cliente = yo`.

---

# BD

```text
PEDIDO_DELIVERY + VW_DELIVERY_UBICACION (ALTER 04)
+ EMPLEADO repartidor (nombre).
```

---

# Criterios

```gherkin
Given mi delivery en R con GPS
When abro /cliente/delivery/:id
Then veo timeline en R + mapa con ambos pines
```

```gherkin
Given mi delivery sin GPS
When lo sigo
Then veo estado + dirección sin mapa roto
```

```gherkin
Given delivery ajeno
When intento verlo
Then recibo 403
```
