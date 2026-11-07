# Spec: rendición de caja — entregas delivery en efectivo contra entrega

## Estado actual

- **Backend:** `backend/src/controllers/rendicion-controller.ts`, `backend/src/routes/rendiciones.ts`, `backend/src/services/rendicion-service.ts`, `backend/src/repositories/rendicion-repository.ts`.
- **Frontend:** `frontend/src/features/caja/rendicion/RendicionPage.tsx`.
- **API client:** `frontend/src/shared/services/api-client.ts` (métodos `getRepartidoresRendicion`, `getPendientesRendicion`, `registrarRendicion`, `getRendiciones`, `validarRendicion`, `observarRendicion`, `getRendicionPdf`).
- **DB:** función wrapper `fn_registrar_movimiento_caja` sobre `usp_registrar_movimiento_caja`; migración `rendicion_fn_registrar_movimiento_caja.sql`.
- **Permisos:** `REN_REGISTRAR` (cajero registra), `REN_VALIDAR` (cajero o supervisor valida).
- **Referencia cruzada:** reglas de negocio `BR-ACC-045`, `BR-INF-051`, `VU-DEL-005`, `VU-DEL-006`.

---

## Objetivo

El repartidor entrega dinero al cajero al regresar de entregas `E` con pago en efectivo. El cajero registra el ingreso consolidado en `MOVIMIENTO_CAJA` (concepto `VENTA AL CONTADO`), valida diferencias (cuadrado / faltante / sobrante), y un supervisor aprueba los casos observados.

---

## Endpoints (`/rendiciones`, `authGuard`)

### GET /rendiciones/repartidores — listar repartidores con pendientes
- 200 `RepartidorRendicion[]` con `{ id, nombre }`.
- Usado para llenar el selector de repartidor en la UI.

### GET /rendiciones/pendientes?repartidorId= — pedidos por rendir
- Query: `repartidorId` (obligatorio).
- 200 `PedidoPendienteRendicion[]` con `{ idPedidoDelivery, pedidoId, cliente, direccion, metodoPago, total }`.
- Solo pedidos `E` (entregados) con método `EFECTIVO` que no tienen `MOVIMIENTO_CAJA` de rendición asociado.
- Si no hay pendientes: lista vacía (la UI muestra "No existen rendiciones pendientes para este repartidor").

### POST /rendiciones — registrar rendición
- Permiso: `REN_REGISTRAR`.
- Body: `{ repartidorId, pedidoIds: number[], montoEntregado: number, observaciones?: string }`.
- Reglas:
  - Al menos un pedido seleccionado.
  - `montoEntregado` >= 0.
  - Si `diferencia = montoEntregado - totalEsperado` ≠ 0, `observaciones` es obligatoria.
  - Pedido ya rendido → error "Pedido ya rendido".
- 200 `RendicionRegistroResultado` con `{ id, estado, totalEsperado, montoEntregado, diferencia }`.
- Crea `MOVIMIENTO_CAJA` ingreso (`VENTA AL CONTADO`) por `montoEntregado`; incrementa `Monto_Sistema` de la `APERTURA_CAJA` actual.
- Estado resultante:
  - `diferencia = 0` → `Rendido`.
  - `diferencia ≠ 0` → `Observado`.

### GET /rendiciones — historial paginado
- Query: `repartidorId?`, `estado?` (`R` | `O` | `V`), `desde?`, `hasta?`, `page` (def 1), `limit` (def 200).
- 200 `{ data: RendicionHistorial[], page, limit, total, hasMore }`.
- `RendicionHistorial`: `{ id, fecha, repartidor, estado, montoEsperado, montoEntregado, diferencia, pedidos:[{pedidoId, totalEsperado}], observaciones?, validadorId?, fechaValidacion? }`.

### PATCH /rendiciones/:id/validar — validar rendición
- Permiso: `REN_VALIDAR`.
- Transiciones permitidas:
  - `Rendido → Validado` (diferencia = 0).
  - `Observado → Validado` (solo supervisor aprueba; cajero no puede validar observados sin diferencia cero).
- 200 `{ ok: true }`.
- Repartidor o Mozo intentan validar → 403 Forbidden.

### PATCH /rendiciones/:id/observar — marcar como observada
- Body: `{ motivo }`.
- Usado cuando hay diferencia y se quiere dejar constancia antes de validar.

### GET /rendiciones/:id/pdf — constancia PDF
- 200 `RendicionHistorial` con datos completos para generar PDF (repartidor, fecha, pedidos, montos, diferencia, validador, observaciones).

---

## Estados de rendición

| Código | Nombre | Significado | Transición |
|--------|--------|-------------|------------|
| `R` | Pendiente de validación | Registrada por cajero, espera validación. | `→ V` (validar). |
| `O` | Observada | Hay diferencia con observación. | `→ V` (supervisor aprueba). |
| `V` | Validada | Validada y contabilizada en caja. | Terminal. |

---

## Resumen monetario (calculado en tiempo real en UI)

| Campo | Cálculo |
|-------|---------|
| Total Esperado | Suma de `total` de pedidos seleccionados. |
| Total Entregado | Monto declarado por el cajero (`montoEntregado`). |
| Diferencia | `Entregado - Esperado`. |
| Clasificación | `0` = Cuadrado (verde); `< 0` = Faltante (rojo); `> 0` = Sobrante (azul). |

---

## Reglas de negocio

- **Solo efectivo en rendición física.** Pedidos con pago digital (Yape, Plin, tarjeta) se excluyen automáticamente. Suman a `Total_Ingresos` (BR-INF-051), no a `Monto_Sistema`.
- **Pedido ya rendido** → error (VU-DEL-005).
- **Solo roles autorizados validan.** Repartidor y Mozo no pueden validar → 403 (VU-DEL-006).
- **Diferencia ≠ 0 requiere observación obligatoria** justificando faltante o sobrante.
- **MOVIMIENTO_CAJA** se crea con concepto `VENTA AL CONTADO`, signo `+` (ingreso), por el monto entregado (no por el esperado).
- **Monto_Sistema** de la apertura de caja actual se incrementa con el monto entregado.
- **Arqueo de caja** incluye este ingreso en el saldo físico esperado.

---

## Errores

| Código | HTTP | Significado |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Body/query inválido o diferencia sin observación. |
| `NOT_FOUND` | 404 | Repartidor, pedido o rendición no encontrado. |
| `Pedido ya rendido` | 409 | El pedido ya tiene MOVIMIENTO_CAJA de rendición (VU-DEL-005). |
| `403` | 403 | Rol no autorizado para validar (VU-DEL-006). |

---

## Frontend

| Ruta | Permiso | Descripción |
|------|---------|-------------|
| `/caja/rendicion` | `REN_REGISTRAR` / `REN_VALIDAR` | Selector de repartidor, tabla de pedidos pendientes, resumen esperado/entregado/diferencia, registro de rendición, historial con filtros, validar, exportar PDF/Excel. |
