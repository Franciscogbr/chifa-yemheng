# Pedidos Delivery

## Información General

### Nombre

Gestión de Pedidos Delivery (Creación + Asignación)

### Ruta

```text
/admin/delivery
```

> Creación y asignación. El kanban operativo vive en
> `seguimiento-entregas.md`; la app del repartidor en
> `repartidor-app.md`; el tablero legado en `delivery-board.md`
> (a refactorizar o mantener como vista /repartidor).

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/pedidos-delivery
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
MOZO (registro telefónico)
```

### Permisos

```text
DELIVERY_VER
DELIVERY_ASIGNAR
```

> Propuestos (ya usados en delivery-board.md).
> Validar alta en PERMISO/MODULO.

---

# Objetivo

Crear pedidos delivery (app + teléfono) y asignar repartidor.

Permite:

- Crear `PEDIDO` tipo DELIVERY/PARA LLEVAR + `PEDIDO_DELIVERY` 1:1.
- Registrar dirección, distrito, referencia, teléfono, costo envío.
- Guardar pin GPS opcional (botón Usar mi ubicación).
- Sugerir costo por distancia sin imponerlo.
- Asignar primer repartidor disponible.
- Ver saldo por rendir si es efectivo.

No permite:

- Cambiar estados R/E/C (ver `seguimiento-entregas.md`).
- Cobrar aquí (ver `caja-cobro.md`; efectivo contra entrega rinde después).
- Exigir GPS (fallback manual siempre disponible).

---

# Usuarios Objetivo

- ADMIN / GERENTE / SUPERVISOR / MOZO (teléfono)

---

# Layout

## Tipo

```text
Formulario + Asignación
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + [Nuevo delivery]                   │
├─────────────────────────────────────────────┤
│ Filtros (fecha, estado, repartidor)         │
├─────────────────────────────────────────────┤
│ Tabla Pendientes (P sin asignar)            │
├─────────────────────────────────────────────┤
│ Modal Crear (cliente, dirección, GPS, costo)│
└─────────────────────────────────────────────┘
```

---

# Sección 1: Modal Crear

## Cliente*

Tipo:

```text
Autocomplete CLIENTE + opción crear rápido
```

- App: Gmail obligatorio → CLIENTE N existente.
- Teléfono: puede usar CLIENTE genérico o crear N/J.

BR:

```text
BR-RES-021 (app exige Gmail; teléfono no).
```

---

## Dirección / Distrito*

```text
Direccion_Entrega* (texto, NOT NULL en BD)
ID_Distrito* (Select DISTRITO → PROVINCIA → DEPARTAMENTO)
Referencia (texto), Telefono_Contacto (CHAR 9)
```

> Nunca se bloquea por falta de GPS (BR-GPS-001).

---

## GPS Opcional (+GPS)

Campos:

```text
lat_cliente / lng_cliente (NUMERIC 9,6 NULL)
Botón [Usar mi ubicación] → geolocaliza y autocompleta.
Sin permiso → sigue manual sin error.
```

Validación:

```text
ck_peddel_lat_cli (-90/90), ck_peddel_lng_cli (-180/180) o NULL.
```

Sugerencia costo:

```text
Distancia haversine pin ↔ distrito.lat_ref/lng_ref
→ sugiere costo_base; humano confirma costo_envio final.
(BR-GPS-002 + BR-DER-033 intacto)
```

---

## Costo Envío*

```text
Costo_Envio (NUMERIC, default 0, editable humano)
```

BR:

```text
BR-DER-033: asignado manualmente por zona, sugerido por app.
```

---

## Productos*

```text
Selector como pos-mozo.md (solo ACTIVO+DISPONIBLE).
Genera DETALLE_PEDIDO + recalcula + F_Solicitud.
```

---

# Sección 2: Asignación

## Repartidor

Tipo:

```text
Select solo activos (EMPLEADO cargo REPARTIDOR, Estado='A')
```

Regla:

```text
BR-ACC-041: primer repartidor disponible.
El sistema propone; humano confirma o cambia.
```

Efecto:

```text
PEDIDO_DELIVERY.ID_Empleado = repartidor.
Situación sigue P hasta Iniciar ruta (R) en seguimiento.
```

---

# Acciones Disponibles

## Crear Delivery

```text
Transacción: PEDIDO (tipo DELIVERY) + DETALLE_PEDIDO
+ PEDIDO_DELIVERY (Situacion='P').
UQ_ID_Pedido 1:1 (BR-EST-009).
```

## Asignar

```text
P → asignado (sigue P hasta R; R lo marca seguimiento).
```

---

# Restricciones

## No Permitido

```text
Crear sin dirección (Direccion_Entrega NOT NULL).
```

## No Permitido

```text
Imponer costo por GPS sin confirmación humana.
```

→ `BR-GPS-002`.

---

# Reglas de Negocio

## BR-EST-009

```text
Un pedido delivery tiene su registro 1:1 en PEDIDO_DELIVERY.
```

## BR-EST-004

```text
Delivery no requiere mesa (ID_Mesa NULL permitido).
```

## BR-ACC-041

```text
El delivery se asigna al primer repartidor disponible.
```

## BR-DER-033

```text
Costo de envío asignado manualmente por distrito (sugerido por app).
```

## BR-GPS-001

```text
GPS opcional y nunca bloquea: con lat/lng NULL todo sigue
con dirección + distrito manual.
```

## BR-GPS-002

```text
La distancia solo sugiere el costo; el valor final lo confirma
humano en costo_envio.
```

---

# Seguridad

```text
ADMIN, GERENTE, SUPERVISOR, MOZO
DELIVERY_VER, DELIVERY_ASIGNAR
```

---

# APIs

## Crear

```http
POST /api/delivery
Body: { idCliente, items[], direccionEntrega, idDistrito, referencia, telefono, costoEnvio, latCliente?, lngCliente? }
```

## Asignar

```http
PATCH /api/delivery/{id}/asignar
Body: { idRepartidor }
```

## Sugerir Costo (GPS)

```http
GET /api/delivery/sugerir-costo?lat={}&lng={}&distrito={id}
Response: { distanciaKm, fueraRadio: bool, costoSugerido }
```

> Fuera de radio_km = aviso, no bloqueo.

---

# Base de Datos

## Tablas

```text
PEDIDO (ID_TipoPedido DELIVERY, ID_Mesa NULL, ID_Cliente)
DETALLE_PEDIDO
PEDIDO_DELIVERY (ID_Pedido UQ, ID_Distrito, ID_Empleado repartidor,
Direccion_Entrega NOT NULL, Costo_Envio, Situacion P/R/E/C default P,
F_Salida, F_Entrega,
lat_cliente/lng_cliente NULL + CHECKs — ALTER 01)
DISTRITO (lat_ref/lng_ref NULL, radio_km default 5, costo_base — ALTER 02)
CLIENTE / PERSONA / EMPRESA
```

## Procedimientos / Vistas (+GPS)

```text
USP_ABRIR_PEDIDO + USP_AGREGAR_DETALLE_PEDIDO (reutilizados)
USP_ACTUALIZAR_UBICACION_DELIVERY (ALTER 03, para pin cliente)
VW_DELIVERY_UBICACION (ALTER 04, lectura)
```

Scripts:

```text
alter-data/add-geolocalizacion/01_alter_pedido_delivery_gps.sql
02_alter_distrito_gps.sql
```

---

# Auditoría

Registrar:

```text
Crear delivery + asignar repartidor + guardar pin.
```

---

# Estados de Pantalla

```text
Loading skeleton / Sin pendientes / Error carga.
```

---

# Responsive

```text
Desktop tabla+modal / Mobile wizard paso a paso.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un delivery telefónico sin GPS
When lo crea con dirección+distrito
Then se guarda Situacion P con lat/lng NULL
```

---

## Escenario 2

```gherkin
Given pin GPS + distrito con lat_ref
When pide sugerencia
Then ve costo sugerido pero confirma manual el final
```

---

## Escenario 3

```gherkin
Given dos repartidores, uno ocupado
When asigna
Then propone el primer disponible (BR-ACC-041)
```
