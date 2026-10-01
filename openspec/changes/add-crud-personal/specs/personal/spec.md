# Spec delta: personal

## Endpoints (`/api/v1/personal`, protegidos con `authGuard`)

### GET / — `EMP_VER`
- Query: `page` (def 1), `limit` (1..100, def 20), `buscar`
  (nombres/documento/celular), `cargo` (id), `turno` (texto libre),
  `estado` (`A`|`I`).
- 200: `{ data: [{ id, nombres, apPaterno, apMaterno, documento, tipoDoc,
  telefono, correo, direccion, cargoId, cargo, area, contratoId, contrato,
  turno, fIngreso, fCese, sueldo, estado }], page, limit, total }`.

### GET /:id — `EMP_VER` · 404 si no existe.

### POST / — `EMP_CREAR`
- Body Zod: `{ nombres[1..80], apPaterno[..80], apMaterno[..80],
  tipoDoc: 'DNI'|'CE'|'PASAPORTE', documento (DNI 8 / CE-PAS 1..15),
  telefono[9], correo email[..50]?, direccion[..100]?,
  cargoId int, contratoId int, turno[..18]?, fIngreso fecha?,
  sueldo ≥0 (def 0) }`.
- 201 objeto; 400 validación; 409 `YA_EXISTE` (documento duplicado).

### PUT /:id — `EMP_EDITAR` (parcial + `fCese` fecha?; sin cambio de
documento; 404; 409).

### PATCH /:id/estado — `EMP_ELIMINAR`
- Body `{ estado:'A'|'I' }`. 200 objeto. No toca `USUARIO`.

## Criterios (de `recursos-humanos.md`)
1. `EMP_CREAR` con datos PERSONA+EMPLEADO → se almacena y lista con búsqueda.
2. Editar contrato/turno/ingreso/cese → se refleja y audita.
3. Cesado → excluido de futuros usuarios y listados de activos.
4. Sin `EMP_EDITAR` → 403.
5. “Crear usuario” no crea nada en v1 (solo tooltip al futuro módulo).
