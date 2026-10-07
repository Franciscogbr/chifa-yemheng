# add-auth-clave — cambio de clave desde perfil

`fn_cambiar_clave(p_id, p_actual, p_nueva)` espejo de `fn_login`:
sha256 + intentos/bloqueo (`BR-ACC-035`) + auditoría.
La clave nunca se guarda en claro (`p_nueva` se hashea en BD).

## Orden de ejecución

1. `01_fn_cambiar_clave.sql`

```bash
psql -d RESTAURANTEV3 -f "01_fn_cambiar_clave.sql"
```

## Rollback

```sql
DROP FUNCTION IF EXISTS public.fn_cambiar_clave(integer, text, text);
```

## Verificación

```sql
SELECT fn_cambiar_clave(14, 'fran', 'nueva1234');
SELECT fn_cambiar_clave(14, 'mala', 'nueva1234');
SELECT oid::regprocedure FROM pg_proc WHERE proname = 'fn_cambiar_clave';
```
