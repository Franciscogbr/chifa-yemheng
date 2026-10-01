# Spec delta: mesas

## Endpoints (`/api/v1/mesas` y `/api/v1/ambientes`, `authGuard`)

### GET /mesas — `MESA_VER`
- Query: `page` (def 1), `limit` (1..100, def 20), `ambiente` (id),
  `estado` (`A`|`I`), `buscar` (número/detalle, ilike).
- 200: `{ data: [{ id, numero, ambienteId, ambiente, capacidad, tipoId,
  tipo, cargoServicio, estadoOperativoId, estadoOperativo, color,
  detalle, qr, estado }], page, limit, total }`.

### GET /mesas/:id — `MESA_VER` · 404.

### POST /mesas — `MESA_CREAR`
- Body: `{ ambienteId int, numero[1..5], capacidad int 1..99,
  tipoId int, detalle? [..100], estado? 'A'|'I' (def 'A') }`.
- QR auto: `yemheng.pe/m/{NUMERO}`; operativo inicial LIBRE.
- 201; 400; 409 `YA_EXISTE` (duplicado por ambiente); 422 `AMBIENTE_INVALIDO`.

### PUT /mesas/:id — `MESA_EDITAR` (parcial; si cambia número/ambiente y
choca → 409; si cambia número se regenera QR).

### PATCH /mesas/:id/estado — `MESA_ELIMINAR`
- Body `{ estado:'A'|'I' }`. 200. Sin confirmación con conteo.

### Ambientes — `MESA_*` (mismos guards)
- `GET /ambientes` (con conteo de mesas), `POST` (`{nombre[1..50],
  descripcion?[..100], piso?}`), `PUT /:id`, `PATCH /:id/estado`.

## Criterios (de `mesas.md`)
1. `MESA_CREAR` con ambiente/tipo válidos → 201 con QR generado.
2. Número duplicado en el ambiente → 409.
3. Mapa refleja estados operativos y colores oficiales.
4. Sin `MESA_EDITAR` → 403.
5. Ambientes ABM funcional (base de las mesas).
