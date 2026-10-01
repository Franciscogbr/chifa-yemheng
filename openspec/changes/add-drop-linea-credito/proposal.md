# Proposal: add-drop-linea-credito

## Por qué
`cliente.linea_credito` es columna dormida: default 0, cero referencias en
backend/frontend, ningún flujo/BR la consume y las ventas son de pago único.
Dejarla acumula deuda de esquema.

## Qué
- Migración `ALTER TABLE public.cliente DROP COLUMN IF EXISTS linea_credito`
  (ejecuta el dueño en Supabase con backup previo).
- Limpieza de definiciones: `creacion-bd-yemheng-postgres.sql` y `yemheng.sql`
  (definición + COPY + 2 filas).

## No objetivos
- Tocar otra tabla/columna. Solo `cliente.linea_credito`.
- Cambios de código (no hay referencias: grep = 0).
