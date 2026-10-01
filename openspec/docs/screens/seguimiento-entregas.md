# Seguimiento Entregas

## Información General

### Nombre

Seguimiento de Entregas (Staff + Mapa Vivo)

### Ruta

```text
/delivery/seguimiento
```

> Vista staff del Archivo 5.2. El kanban legado
> `delivery-board.md` (/repartidor) se mantiene como
> vista del repartidor o se fusiona aquí por tabs.
> La app del repartidor vive en `repartidor-app.md`.

### Shell

```text
StaffShell
```

### Feature

```text
features/delivery/seguimiento
```

### Roles Permitidos

```text
SUPERVISOR
ADMIN
MOZO (consulta)
CAJERO (consulta para rendición)
```

### Permisos

```text
DELIVERY_VER
DELIVERY_DESPACHAR
DELIVERY_ENTREGAR
```

---

# Objetivo

Seguir P→R→E (y P→C) con tiempos y mapa GPS en vivo.

Permite:

- Ver kanban/lista con F_Salida/F_Entrega.
- Iniciar ruta (P→R con F_Salida).
- Confirmar entrega (R→E con F_Entrega) o anular (P→C).
- Ver mapa vivo pin cliente + pin repartidor (polling 30s).
- Funcionar sin GPS (dirección + distrito).

No permite:

- Crear delivery (ver `pedidos-delivery.md`).
- Cobrar ni rendir (ver `caja-cobro.md`, `rendicion-delivery.md`).
- Compartir ubicación manual staff (solo la reporta el repartidor).

---

# Usuarios Objetivo

- SUPERVISOR / ADMIN / MOZO / CAJERO

---

# Layout

## Tipo

```text
Kanban + Mapa
```

## Estructura General

```text
┌────────────────────────────────────────────────────┐
│ Header + filtros + última actualización            │
├────────────────────────────────────────────────────┤
│ KPIs (pendientes, en ruta, entregados, t.promedio) │
├──────────────┬─────────────────────────────────────┤
│ Kanban P/R/E │ Mapa vivo (Leaflet/OSM)             │
│ tarjetas     │ pin cliente + pin repartidor        │
└──────────────┴─────────────────────────────────────┘
```

Actualización:

```text
Polling 30s vía f_ubicacion (BR-GPS-001).
Sin GPS: polling solo estados, sin mapa o mapa con distrito ref.
```

---

# Sección 1: Tarjeta

Mostrar:

```text
Pedido (PED-...), cliente, dirección + distrito,
teléfono, total + costo envío, método pago,
repartidor, tiempos (espera, en ruta),
Situacion P/R/E/C + F_Salida/F_Entrega.
```

Fuente:

```text
PEDIDO_DELIVERY + PEDIDO + CLIENTE + VW_DELIVERY_UBICACION
```

---

# Sección 2: Mapa Vivo (+GPS)

Mostrar:

```text
Pin cliente (lat/lng_cliente)
Pin repartidor (lat/lng_repartidor)
f_ubicacion (último reporte)
```

Fuente:

```text
VW_DELIVERY_UBICACION (situación + 4 coords + f_ubicacion)
```

Sin coords:

```text
Mensaje "Sin ubicación GPS — usando dirección manual"
+ link a dirección en mapa externo opcional.
```

Stack:

```text
Leaflet/OSM solo lectura (igual que cliente).
```

---

# Sección 3: Acciones

## Iniciar Ruta

```text
P → R + F_Salida = NOW()
```

Permiso:

```text
DELIVERY_DESPACHAR
```

## Confirmar Entrega

```text
R → E + F_Entrega = NOW()
```

Permiso:

```text
DELIVERY_ENTREGAR
```

Efecto efectivo:

```text
Si pago en EFECTIVO contra entrega → queda "por rendir"
(ver rendicion-delivery.md). Digitales no generan rendición.
```

## Anular

```text
P → C (Cancelado) con motivo.
```

> C = Cancelado, no Entregado. No existe estado A en BD
> (delivery-board.md legado usa A; corregir a C).

---

# Restricciones

```text
C → * prohibido. E → * prohibido (salvo NC de venta, no de delivery).
R → P prohibido (no des-asigna desde aquí; reasigna en pedidos-delivery).
```

---

# Reglas de Negocio

## BR-ACC-040

```text
Delivery P→R→E, y P→C, con F_Salida/F_Entrega.
```

## BR-DER-033 (ref)

```text
Costo envío ya fijado en creación; aquí solo lectura.
```

## BR-ACC-045 (ref)

```text
Efectivo contra entrega lo rinde el repartidor al cajero.
```

## BR-GPS-001

```text
GPS nunca bloquea; sin coords se opera con dirección+distrito.
```

---

# Seguridad

```text
SUPERVISOR, ADMIN (+ consulta MOZO/CAJERO)
DELIVERY_VER/DESPACHAR/ENTREGAR
```

---

# APIs

## Board

```http
GET /api/delivery/seguimiento?estado=R
```

## Ruta / Entrega / Anular

```http
PATCH /api/delivery/{id}/ruta
PATCH /api/delivery/{id}/entregar
PATCH /api/delivery/{id}/anular
Body anular: { motivo }
```

## Ubicación (lectura)

```http
GET /api/delivery/{id}/ubicacion
Response: VW_DELIVERY_UBICACION row
```

> Escritura de ubicación solo en repartidor-app.md vía
> USP_ACTUALIZAR_UBICACION_DELIVERY.

---

# Base de Datos

```text
PEDIDO_DELIVERY (Situacion P/R/E/C, F_Salida, F_Entrega,
lat/lng_cliente/repartidor, f_ubicacion — ALTER 01)
VW_DELIVERY_UBICACION (ALTER 04)
Nuevo USP delivery brecha REGLAS §6 para P/R/E/C
+ USP_ACTUALIZAR_UBICACION_DELIVERY (ALTER 03, solo lectura aquí)
```

Corrección:

```text
Unificar C=Cancelado. Eliminar A de delivery-board.md
o mapear A→C con migración.
```

---

# Auditoría

Registrar:

```text
Iniciar ruta, entrega, anulación (quién, cuándo, motivo).
```

---

# Estados de Pantalla

```text
Loading kanban / Sin entregas / Error.
Mapa: con/sin GPS (fallback textual).
```

---

# Responsive

```text
Desktop kanban+mapa / Tablet scroll horizontal / Mobile 1 columna + mapa colapsable.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un P asignado
When inicia ruta
Then pasa a R con F_Salida y aparece en mapa si hay GPS
```

---

## Escenario 2

```gherkin
Given un R sin GPS
When lo sigue
Then ve dirección+distrito sin error y sin mapa roto
```

---

## Escenario 3

```gherkin
Given un R en efectivo
When confirma entrega
Then queda marcado por rendir en caja
```
