# Cliente Delivery

## Información General

### Nombre

Pedido Delivery por la App (Solo Digital al Llegar)

### Ruta

```text
/cliente/delivery
```

> Archivo 7.4. El seguimiento vivo es
> `cliente-delivery-seguimiento.md` (/cliente/delivery/:id).
> La creación staff es `pedidos-delivery.md`.

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/delivery
```

### Roles Permitidos

```text
CLIENTE (Gmail + dirección)
```

### Permisos

```text
CLIENTE_PEDIDOS (propuesto)
```

---

# Objetivo

Armar delivery desde la web con pago único digital al llegar.

Permite:

- Ver carta disponible.
- Armar carrito + dirección/distrito.
- Compartir pin opcional (Usar mi ubicación).
- Ver costo envío sugerido por distancia.
- Confirmar y seguir estado P→R→E.

No permite (regla dura 7.4):

- Efectivo contra entrega por web (queda para teléfono + rendición repartidor).
- Múltiples métodos (pago único).
- Exigir GPS.

---

# Layout

```text
┌─────────────────────────────────────────────┐
│ Steps: [Carta] → [Dirección] → [Confirmar]  │
├─────────────────────────────────────────────┤
│ Carta / carrito / mapa pin + costo sugerido │
└─────────────────────────────────────────────┘
```

Mobile-first wizard.

---

# Sección 1: Carta + Carrito

Igual que `menu-carta.md` (solo P/B disponibles) + carrito.

---

# Sección 2: Dirección (+GPS)

Campos:

```text
Direccion* + ID_Distrito* + referencia + teléfono.
[Usar mi ubicación (opcional)] → lat/lng_cliente.
Sin permiso → manual sin error.
```

Sugerencia:

```text
haversine pin ↔ distrito.lat_ref/lng_ref → costo sugerido
(BR-GPS-002). Humano confirma costo_envio (BR-DER-033).
```

---

# Sección 3: Pago y Confirmación

```text
Forma de pago única digital al llegar
(Yape/Plin/tarjeta/transferencia).
Muestra total + envío.
[Confirmar] → PEDIDO + PEDIDO_DELIVERY P + DETALLE.
```

> Efectivo por web: bloqueado con mensaje
> "El efectivo es solo por teléfono".
> (MODULOS_WEB.md 7.4)

---

# Reglas

## BR-RES-021 / BR-ACC-044

```text
App exige Gmail + dirección.
```

## BR-DER-033 + BR-GPS-002

```text
Costo manual por distrito; distancia solo sugiere.
```

## BR-GPS-001

```text
NULL permitido, fallback manual.
```

## BR-DER-030 / BR-ACC-042 (ref)

```text
Pago único; facturación la hace el flujo caja al entregar.
```

---

# APIs

```http
POST /api/cliente/delivery
Body: { items[], direccion, idDistrito, telefono, latCliente?, lngCliente?, metodoDigital }
Response: { idPedidoDelivery, situacion: P, costoEnvio }

GET /api/cliente/delivery/sugerir-costo?lat=&lng=&distrito=
```

---

# BD

```text
PEDIDO + DETALLE_PEDIDO + PEDIDO_DELIVERY
(lat/lng_cliente NULL, costo_envio humano)
DISTRITO (lat_ref/lng_ref/radio_km/costo_base)
USP_ACTUALIZAR_UBICACION_DELIVERY(..., 'CLIENTE')
```

---

# Criterios

```gherkin
Given cliente Gmail sin GPS
When confirma con dirección manual y Yape
Then se crea P con lat NULL y método digital
```

```gherkin
Given pin GPS
When pide sugerencia
Then ve costo sugerido y confirma el final
```

```gherkin
Given intenta efectivo por web
When confirma
Then el sistema rechaza (solo teléfono)
```
