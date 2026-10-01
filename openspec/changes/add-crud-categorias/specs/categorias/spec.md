# Spec delta: categorias

## Endpoints (`/api/v1/categorias`, protegidos con `authGuard`)

### GET / — `CAT_VER`
- Query Zod: `page` (≥1, default 1), `limit` (1..100, default 20),
  `nombre` (opcional, ilike), `estado` (`A`|`I`, opcional).
- 200: `{ data: [{ id, nombre, descripcion, area, orden, estado,
  productosAsociados, fCreacion }], page, limit, total }`.

### GET /:id — `CAT_VER`
- 200: objeto; 404 `{ error:'NOT_FOUND' }`.

### POST / — `CAT_CREAR`
- Body Zod: `{ nombre: string[1..50], descripcion?: string[..100],
  area: 'COCINA'|'BARRA'|'CAJA' (default COCINA),
  orden?: int ≥0 (default max+1), estado?: 'A'|'I' (default 'A') }`.
- 201 objeto; 400 validación; 409 `{ error:'YA_EXISTE' }` si nombre duplicado.

### PUT /:id — `CAT_EDITAR`
- Mismo body (parcial opcional salvo validaciones); 404 si no existe;
  409 si el nombre choca con otra.

### PATCH /:id/estado — `CAT_ELIMINAR`
- Body: `{ estado: 'A'|'I', confirmar?: boolean }`.
- A `I` con productos y sin `confirmar:true` → 409
  `{ error:'TIENE_PRODUCTOS', productosAsociados: N }`.
- 200 objeto actualizado; auditoría ACTIVO/DESACTIVO.

## Criterios de aceptación (Gherkin, de `categorias.md`)
1. Usuario con `CAT_CREAR` registra → se almacena correctamente.
2. Categoría activa + nuevo producto → aparece en el selector.
3. Categoría inactiva + nuevo producto → no aparece como opción.
4. Usuario sin `CAT_EDITAR` intenta modificar → 403 denegado.
5. Categoría con productos + desactivar → confirmación antes de continuar.
