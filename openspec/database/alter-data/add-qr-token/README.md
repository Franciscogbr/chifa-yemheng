# add-qr-token — QR rotativo por seguridad (misma mesa)

Hoy `codigo_qr = yemheng.pe/m/{NUMERO}` es determinista: regenerar devuelve
lo mismo y no invalida fotos copiadas. Con este cambio pasa a
`yemheng.pe/m/{NUMERO}-{TOKEN8}` (ej. `yemheng.pe/m/M-01-8f3KqZ2a`).
Regenerar cambia solo el token, mantiene `id_mesa` e invalida el impreso anterior.

`varchar(60)` sobra: 13 (`yemheng.pe/m/`) + 5 (numero max) + 1 (`-`) + 8 (token) = 27.

## Orden de ejecución

1. `01_alter_mesa_qr_unique.sql`
2. `02_backfill_mesa_qr.sql`

```bash
psql -d RESTAURANTEV3 -f "01_alter_mesa_qr_unique.sql"
psql -d RESTAURANTEV3 -f "02_backfill_mesa_qr.sql"
```

## Rollback (en orden inverso)

```sql
-- Vuelve a permitir duplicados (no borra datos):
ALTER TABLE public.mesa DROP CONSTRAINT IF EXISTS uq_mesa_codigo_qr;
-- Opcional, solo si quieres revertir el backfill y volver a NULL:
-- UPDATE public.mesa SET codigo_qr = NULL WHERE codigo_qr LIKE 'yemheng.pe/m/%-%';
```

## Verificación

```sql
SELECT conname FROM pg_constraint WHERE conname = 'uq_mesa_codigo_qr';
SELECT id_mesa, numero, codigo_qr, char_length(codigo_qr) FROM public.mesa ORDER BY id_mesa;
-- Sin NULL y sin duplicados:
SELECT count(*) FROM public.mesa WHERE codigo_qr IS NULL;
SELECT codigo_qr, count(*) FROM public.mesa GROUP BY codigo_qr HAVING count(*) > 1;
```
