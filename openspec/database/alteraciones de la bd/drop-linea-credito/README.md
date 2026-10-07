# DROP linea_credito

1. Respaldo de Supabase (Database → Backups) antes de todo.
2. Correr `01_drop_linea_credito.sql` en el SQL Editor.
3. Verificación (debe devolver 0 filas):

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cliente'
  AND column_name = 'linea_credito';
```

4. Archivos de definición ya limpiados en el repo:
   - `seeds/creacion-bd-yemheng-postgres.sql` (CREATE TABLE CLIENTE)
   - `yemheng.sql` (definición + COPY + 2 filas de datos)
