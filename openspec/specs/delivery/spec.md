# Spec: delivery — pedidos a domicilio, estados, GPS, tarifas y rendición

## Estado actual

- **Backend:** API completa bajo `/api/v1/delivery` (authGuard + permisos `DELIVERY_*`) con estados `P → R → E / C`, GPS opcional, asignación de repartidor, sugerencia de costo por haversine, y parámetros de negocio (tarifas por distrito).
- **Frontend cliente:** `/cliente/delivery` con wizard real (carta, dirección, destino, confirmación), seguimiento activo, consulta de cobertura y costo sugerido.
- **Frontend staff:** `/staff/delivery` con kanban (Pendiente / En Ruta / Entregado), creación, filtro por estado y paginación.
- **Frontend repartidor:** `/repartidor` con mis entregas, detalle de entrega, iniciar ruta, confirmar entrega, actualizar ubicación, por rendir y push token.
- **DB:** tabla `pedido_delivery` activa, vista `vw_delivery_ubicacion`, función `haversine_km`, tabla `configuracion_negocio`, columnas de distrito (`lat_ref`, `lng_ref`, `radio_km`, `costo_base`, `recargo_km`).
- **Reportes:** `GET /api/v1/reportes/delivery` (permiso `REP_VER`).
- **Rendición:** endpoints bajo `/rendiciones` (ver sección Rendición de caja).

---

## Endpoints backend (`/api/v1/delivery`, `authGuard`)

### GET / — listar entregas
- Query: `page` (def 1), `limit` (def 20), `estado` (`P` | `R` | `E` | `C`).
- Permiso: `DELIVERY_VER`.
- 200 `{ data:[{id, pedidoId, distrito, direccion, referencia, telefono, repartidor, repartidorId, costo, estado, fechaCreacion, fechaSalida, fechaEntrega}], page, limit, total }`.

### POST / — crear entrega (staff por teléfono)
- Body: `{ pedidoId, distritoId?, direccion, referencia?, telefono?, costo, latCliente?, lngCliente? }`.
- Permiso: `DELIVERY_VER`.
- 201 inserta `PEDIDO_DELIVERY` con `situacion='P'`, auditoría `usucre/pc`.

### PATCH /:id/asignar — asignar repartidor
- Body: `{ repartidorId }`.
- Permiso: `DELIVERY_ASIGNAR`.
- 200 actualiza `id_empleado = repartidorId`; `situacion` sigue `P` (el paso a `R` lo marca despachar). Auditoría `usumod`.

### PATCH /:id/despachar — iniciar ruta (P → R)
- Permiso: `DELIVERY_DESPACHAR`.
- 200 `situacion='R'`, `f_salida = NOW()`, push al repartidor, auditoría.

### PATCH /:id/entregar — confirmar entrega (R → E)
- Permiso: `DELIVERY_ENTREGAR`.
- 200 `situacion='E'`, `f_entrega = NOW()`. Si el pago es efectivo, queda "por rendir". GPS se corta (no se sigue tracking). Auditoría.

### PATCH /:id/anular — anular (P → C)
- Permiso: `DELIVERY_VER`.
- Body: `{ motivo }`.
- 200 `situacion='C'`, motivo en auditoría. Transiciones `C → *` y `E → *` prohibidas. `R → P` prohibido.

### GET /sugerir-costo — sugiere costo de envío
- Query: `lat`, `lng`, `distrito`.
- Permiso: `DELIVERY_VER`.
- 200 `{ distanciaKm, fueraRadio: bool, costoSugerido }`. La BD calcula haversine entre el pin y `distrito.lat_ref/lng_ref`, aplica `costo_base` y `fueraRadio` si `> radio_km`. El costo sugerido no bloquea: el humano confirma el valor final.

### GET /parametros — parámetros de negocio de delivery
- Permiso: `DELIVERY_PARAM_VER`.
- 200 configuración de cobertura local (lat/lng local, radio, dirección).

### PUT /parametros — actualizar parámetros
- Permiso: `DELIVERY_PARAM_EDIT`.

### GET /parametros/tarifas — listar tarifas por distrito
- Permiso: `DELIVERY_PARAM_VER`.

### PUT /parametros/tarifas/:id — actualizar tarifa
- Permiso: `DELIVERY_PARAM_EDIT`.

---

## Endpoints cliente (`/api/v1/cliente/delivery`, clienteAuthGuard)

### POST / — crear pedido delivery desde la app del cliente
- Body: `{ items:[{ productoId, cantidad, nota? }], direccion, distritoId, referencia?, telefono?, latCliente?, lngCliente? }`.
- 201 `{ idPedidoDelivery, situacion, costoEnvio, costoConfirmado }`.
- Crea pedido tipo `DELIVERY` y registro en `pedido_delivery` con `situacion='P'`.

### GET / — consulta delivery activo del cliente autenticado
- 200 `{ idPedidoDelivery: number | null }`.

### GET /sugerir-costo — sugiere costo desde el cliente
- Query: `distrito`, `lat?`, `lng?`.
- 200 `{ distanciaKm, fueraRadio, dentroCobertura, costoSugerido }`.

### GET /cobertura — cobertura del local
- 200 `{ latLocal, lngLocal, direccionLocal, radioCoberturaKm }`.

### GET /:id — detalle del delivery
### GET /:id/ubicacion — ubicación para mapa del cliente

---

## Endpoints repartidor (`/api/v1/repartidor/entregas`, authGuard + rol REPARTIDOR)

### GET / — mis entregas
- Query: `estado` (array `P|R|E|C`), `page`, `limit`.

### GET /:id — detalle de entrega

### PATCH /:id/ruta — iniciar ruta (despachar)

### PATCH /:id/entregar — confirmar entrega

### POST /:id/ubicacion — actualizar ubicación GPS del repartidor

### POST /token / DELETE /token — registrar/eliminar push token (web/android/ios)

### GET /por-rendir — entregas `E` en efectivo pendientes de rendición

---

## Endpoints staff seguimiento (`/api/v1/delivery/seguimiento`)

- `GET /delivery/seguimiento` — listado con filtros.
- `GET /delivery/seguimiento/:id` — detalle.
- `PATCH /delivery/seguimiento/:id/ruta` — iniciar ruta (staff).
- `PATCH /delivery/seguimiento/:id/entregar` — entregar (staff).
- `PATCH /delivery/seguimiento/:id/anular` — anular con motivo.
- `GET /delivery/seguimiento/:id/ubicacion` — ubicación para mapa staff.

---

## Estados y máquina de estados

| Código | Nombre | Significado |
|--------|--------|-------------|
| `P` | Pendiente | Delivery creado, sin repartidor asignado o asignado pero no despachado. |
| `R` | En Ruta | Repartidor despachó (`f_salida` seteado). |
| `E` | Entregado | Entrega confirmada (`f_entrega` seteado). Si es efectivo, queda por rendir. |
| `C` | Cancelado | Anulado con motivo. Terminal. |

**Transiciones válidas:** `P → R` (despachar), `P → C` (anular), `R → E` (entregar).

**Transiciones prohibidas:** `R → P`, `E → *`, `C → *`.

Cada transición registra quién y cuándo (auditoría `usumod/fecmod` o `usucre/feccre` según corresponda).

---

## GPS (opcional, nunca bloquea — BR-GPS-001 / BR-GPS-002)

- `lat_cliente` / `lng_cliente` pueden ser `NULL` en creación y actualización.
- Si se envía uno, debe venir el otro (no se permiten coordenadas incompletas).
- Restricciones de rango: latitud `[-90, 90]`, longitud `[-180, 180]`.
- La distancia se usa solo para sugerir `costo_envio`; el valor final lo confirma el humano.
- Sin GPS, se opera con dirección + distrito manual.
- `usp_actualizar_ubicacion_delivery` actualiza solo coordenadas y `f_ubicacion`; no toca `situacion` ni `costo_envio`.

---

## Asignación de repartidor (BR-ACC-041)

- En UI de asignar, se propone el primer `EMPLEADO` con cargo `REPARTIDOR`, `Estado='A'`, sin entregas en `R` activas.
- El humano confirma o cambia el repartidor.

---

## Rendición de caja (entregas efectivo contra entrega)

Los pedidos `E` con pago en efectivo quedan "por rendir" hasta que el cajero registra la rendición.

### Endpoints (`/rendiciones`, authGuard)

| Endpoint | Método | Permiso | Descripción |
|----------|--------|---------|-------------|
| `/rendiciones/repartidores` | GET | — | Lista repartidores con entregas pendientes de rendición. |
| `/rendiciones/pendientes?repartidorId=` | GET | — | Pedidos `E` efectivo sin MOVIMIENTO_CAJA de rendición, agrupados por repartidor. |
| `/rendiciones` | POST | `REN_REGISTRAR` | Registra monto entregado para pedidos seleccionados. |
| `/rendiciones` | GET | — | Historial paginado con filtros (repartidor, estado, desde, hasta). |
| `/rendiciones/:id/validar` | PATCH | `REN_VALIDAR` | Valida rendición `Rendido → Validado` o `Observado → Validado` (supervisor). |
| `/rendiciones/:id/observar` | PATCH | — | Marca rendición como observada con motivo. |
| `/rendiciones/:id/pdf` | GET | — | Genera constancia PDF de la rendición. |

### Estados de rendición

| Código | Nombre | Significado |
|--------|--------|-------------|
| `R` | Pendiente de validación / Rendido | Registrada por cajero, espera validación. |
| `O` | Observada | Hay diferencia (faltante o sobrante) con observación. |
| `V` | Validada | Validada por cajero o aprobada por supervisor. |

### Reglas de rendición

- Solo pedidos con método `EFECTIVO` entran en la rendición física. Pagos digitales (Yape, Plin, tarjeta) no aparecen; solo suman a `Total_Ingresos` (BR-INF-051), no a `Monto_Sistema`.
- `Total Esperado = suma de totales de pedidos seleccionados`.
- `Diferencia = Entregado - Esperado`.
  - `0` → Cuadrado (verde).
  - `< 0` → Faltante (rojo), requiere observación obligatoria.
  - `> 0` → Sobrante (azul), requiere observación obligatoria.
- Crea `MOVIMIENTO_CAJA` concepto `VENTA AL CONTADO` por el monto entregado, incrementa `Monto_Sistema` de la apertura de caja actual.
- Pedido ya rendido → error "Pedido ya rendido".
- Solo roles autorizados pueden validar (`REN_VALIDAR`). Repartidor/Mozo no pueden validar → 403.

---

## Reportes

### GET /api/v1/reportes/delivery
- Permiso: `REP_VER`.
- Query: `desde`, `hasta`, `estado`, `distritoId`, `repartidorId`.
- Retorna pedidos de delivery agrupados por pedido, distrito, repartidor, estado y marcas de tiempo.

---

## Errores comunes

- `400 VALIDATION_ERROR` — body o query inválidos.
- `404 NOT_FOUND` — entrega, repartidor o distrito no encontrado.
- `409` — transición no permitida (ej. `E → C`), pedido ya rendido, mesa ocupada, etc.
- `422` — coordenadas incompletas o fuera de rango, items inválidos, teléfono inválido.

---

## Base de datos implicada

- `PEDIDO_DELIVERY` (id_pedidodelivery, id_pedido, id_distrito, direccion_entrega, referencia, telefono_contacto, costo_envio, costo_envio_confirmado, lat_cliente, lng_cliente, lat_repartidor, lng_repartidor, f_ubicacion, situacion, id_empleado, estado, feccre/usucare/pccre, usumod/pcmod/fecmod).
- `DISTRITO` (lat_ref, lng_ref, radio_km, costo_base, recargo_km).
- `CONFIGURACION_NEGOCIO` (id=1, lat_local, lng_local, direccion_local, radio_cobertura_km).
- `VW_DELIVERY_UBICACION` — vista solo lectura para mapas (sin PII).
- Función `HAVERSINE_KM(lat1, lng1, lat2, lng2)`.
- Función `FN_CREAR_DELIVERY_CLIENTE`.

---

## Frontend

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/cliente/delivery` | Cliente | Wizard de pedido, seguimiento activo, cobertura, costo sugerido. |
| `/staff/delivery` | Staff / Cajero | Kanban P/R/E, creación de entregas, filtro y paginación. |
| `/repartidor/...` | Repartidor | Mis entregas, iniciar ruta, entregar, ubicación, por rendir, push token. |
