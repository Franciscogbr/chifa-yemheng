# Spec delta: productos

## Endpoints (`/api/v1/productos`, protegidos con `authGuard`)

### GET / — `PROD_VER`
- Query: `page` (≥1, def 1), `limit` (1..100, def 20), `nombre` (ilike),
  `categoria` (id), `estado` (`A`|`I`), `disponible` (`S`|`N`).
- 200: `{ data: [{ id, nombre, codigo, categoriaId, categoria, tipo,
  precio, costo, unidadId, unidad, stock, stockMin, controlaStock,
  tiempo, disponible, imagen, detalle, estado }], page, limit, total }`.

### GET /:id — `PROD_VER` · 404 si no existe.

### POST / — `PROD_CREAR`
- Body Zod: `{ nombre[1..50], categoriaId int, unidadId int,
  tipo: 'P'|'B'|'I' (def P), precio ≥0, costo ≥0 (def 0),
  stock ≥0 (def 0), stockMin ≥0 (def 0), controlaStock bool (def false),
  tiempo?: int ≥0, disponible bool (def true), imagen?: url/string[..200],
  detalle?: string[..150], afectoIgv bool (def true),
  codigo?: string[..20], estado?: 'A'|'I' (def 'A') }`.
- Categoría debe existir y estar `A` → 422 `CATEGORIA_INVALIDA` si no.
- 201 objeto; 400 validación; 409 `YA_EXISTE` si `codigo` duplicado.

### PUT /:id — `PROD_EDITAR` (parcial; mismas reglas; 404; 409 código).

### PATCH /:id/estado — `PROD_ELIMINAR`
- Body `{ estado: 'A'|'I' }`. 200 objeto. Sin confirmación con conteo
  (los productos no tienen hijos en este alcance).

## Criterios (de `productos.md` + plantilla)
1. `PROD_CREAR` registra con categoría activa → 201 y aparece en lista.
2. Categoría inactiva → 422 al intentar asignarla.
3. Sin `PROD_EDITAR` → 403 al modificar.
4. `Disponible=N` o `Estado=I` → excluido de carta/comandas (`BR-RES-022`).
5. Filtros + paginación + responsive verificados con `fran`.
