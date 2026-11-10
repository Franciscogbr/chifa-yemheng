# Reducir estados de preparación de cocina a 2 (Pendiente / Listo)

Objective: Simplificar el tablero de cocina de 4 estados (Pendiente, En preparación, Servido, Anulado) a 2 estados (Pendiente, Listo) para mayor agilidad operativa. El cliente debe ver reflejado el mismo cambio en su pantalla de seguimiento.

Branch: `feat/caja-shared-accounts` · Delivery: `ask-on-risk` · Checks: frontend typecheck/build.

## Specs

### S1 — Dos estados de preparación de plato
User requirement: “quiero reducir los estados para cocina me parece mucho debe ser rapido, para cliente debe verse reflejado tambien”
- Cada plato tiene exactamente dos estados de preparación: `P` (Pendiente) o `L` (Listo).
- Eliminar `E` (En preparación) y `S` (Servido) como estados de preparación; `S` se reemplaza por `L` (Listo para entregar).
- Mantener `A` (Anulado) para cancelar platos.

### S2 — Tablero de cocina con 2 columnas
- `cocina-page.tsx` muestra 2 columnas: Pendiente y Listo (en lugar de 4).
- Contadores y chips solo para P y L.

### S3 — Cliente ve estados reflejados
- `pedido-tracking-page.tsx` muestra solo Pendiente o Listo por plato.
- `EstadoBadge.tsx` (shared) soporta solo 2 estados con colores simples.

### S4 — Admin pedidos actualizado
- `pedidos-page.tsx` muestra solo P y L en `ESTADOS_PREPARACION` y `TONOS_PREPARACION`.

### S5 — Caja y mozo actualizados
- `caja-page.tsx` muestra Pendiente o Listo por detalle.
- `mozo-page.tsx` usa `EstadoBadge` con los 2 estados.

## Tasks

- T1 — Actualizar tipos `EstadoPreparacion` en `staff-service.ts` y `pedidos-service.ts` a `'P' | 'L' | 'A'`; estado inicial de detalles nuevos = `'P'`; cobro/anulación no cambia.
- T2 — Actualizar `EstadoBadge.tsx` para 2 estados con colores simples (amarillo pendiente, verde listo, rojo anulado).
- T3 — Actualizar `cocina-page.tsx`: 2 columnas (Pendiente, Listo), contadores y chips solo P/L.
- T4 — Actualizar `pedidos-page.tsx` admin: `ESTADOS_PREPARACION` y `TONOS_PREPARACION` solo P/L/A.
- T5 — Actualizar `caja-page.tsx`: texto de estado solo Pendiente/Listo/Anulado.
- T6 — Actualizar `mozo-page.tsx`: usa `EstadoBadge` con 2 estados.
- T7 — Actualizar `pedido-tracking-page.tsx` cliente: tipo `estadoPreparacion` y `pasoDeEstado` para 2 estados.
- T8 — Verificar `tsc --noEmit` y `npm run build` frontend: 0 errores.
- T9 — Informar al usuario que requiere migración SQL en Supabase para convertir estados existentes `E`→`P`, `S`→`L` (el asistente no tiene acceso a BD).

## Log

- L1 (2026-11-05): User request, verbatim: “quiero reducir los estados para cocina me parece mucho debe ser rapido, para cliente debe verse reflejado tambien”
- L2 (2026-11-05): User selected 2-estado option via UI: “2 estados: Pendiente → Listo”
