# Spec delta: clientes

## Endpoints (`/api/v1/clientes`, protegidos con `authGuard`)

### GET / — `CLI_VER`
- Query: `page` (def 1), `limit` (1..100, def 20), `buscar` (nombre/razón/
  documento/correo, ilike), `tipo` (`N`|`J`), `estado` (`A`|`I`),
  `orden` (`puntos`|`alpha`|`recientes`, def `recientes`).
- 200: `{ data: [{ id, tipo, nombre, documento, tipoDoc, telefono,
  correo, distrito, direccion, puntos, estado }], page, limit, total }`.

### GET /:id — `CLI_VER` · 404 si no existe.

### POST / — `CLI_CREAR`
- Body discriminado: `{ tipo:'N', nombres, apPaterno?, apMaterno?,
  dni[8 dígitos], telefono[9], correo email?, distritoId?, direccion? }`
  | `{ tipo:'J', razonSocial[..140], ruc[11 dígitos], telefono[..15],
  correo email?, distritoId?, direccion? }`.
- 201 objeto; 400 validación; 409 `YA_EXISTE` (DNI/RUC duplicado).

### PUT /:id — `CLI_EDITAR` (mismo tipo, sin cambio N↔J; 404; 409).

### PATCH /:id/estado — `CLI_ELIMINAR`
- Body `{ estado:'A'|'I' }`. 200 objeto. Sin confirmación con conteo.

## Criterios (de `clientes.md`)
1. `CLI_CREAR` natural con Gmail → se almacena y asocia (futura reserva QR).
2. Empresa con RUC → habilitada para FACTURA (`BR-RES-016`).
3. Sin `CLI_EDITAR` → 403.
4. Cliente inactivo → excluido de selectores de venta/reserva/delivery.
5. Filtros + tabs + responsive verificados con `fran`.
