# add-geolocalizacion — GPS opcional delivery

GPS **opcional** (BR-GPS-001). Si es NULL, todo sigue con `direccion_entrega + distrito` manual.
No rompe `P/R/E/C`, `costo_envio`, ni cobro/cierre.

## Orden de ejecución
1. `01_alter_pedido_delivery_gps.sql`
2. `02_alter_distrito_gps.sql`
3. `03_usp_actualizar_ubicacion.sql`
4. `04_vw_delivery_ubicacion.sql`

```bash
psql -d RESTAURANTEV3 -f "01_alter_pedido_delivery_gps.sql"
psql -d RESTAURANTEV3 -f "02_alter_distrito_gps.sql"
psql -d RESTAURANTEV3 -f "03_usp_actualizar_ubicacion.sql"
psql -d RESTAURANTEV3 -f "04_vw_delivery_ubicacion.sql"
```

## Rollback (en orden inverso)
```sql
DROP VIEW IF EXISTS public.vw_delivery_ubicacion;
DROP FUNCTION IF EXISTS public.usp_actualizar_ubicacion_delivery(integer, numeric, numeric, character varying);
ALTER TABLE public.distrito
  DROP CONSTRAINT IF EXISTS ck_distrito_radio,
  DROP CONSTRAINT IF EXISTS ck_distrito_costo,
  DROP COLUMN IF EXISTS costo_base,
  DROP COLUMN IF EXISTS radio_km,
  DROP COLUMN IF EXISTS lng_ref,
  DROP COLUMN IF EXISTS lat_ref;
ALTER TABLE public.pedido_delivery
  DROP CONSTRAINT IF EXISTS ck_peddel_lng_rep,
  DROP CONSTRAINT IF EXISTS ck_peddel_lat_rep,
  DROP CONSTRAINT IF EXISTS ck_peddel_lng_cli,
  DROP CONSTRAINT IF EXISTS ck_peddel_lat_cli,
  DROP COLUMN IF EXISTS f_ubicacion,
  DROP COLUMN IF EXISTS lng_repartidor,
  DROP COLUMN IF EXISTS lat_repartidor,
  DROP COLUMN IF EXISTS lng_cliente,
  DROP COLUMN IF EXISTS lat_cliente;
```

## Verificación
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name IN ('pedido_delivery','distrito') AND column_name LIKE '%lat%' OR column_name LIKE '%lng%';
SELECT * FROM public.vw_delivery_ubicacion LIMIT 1;
SELECT public.usp_actualizar_ubicacion_delivery(1, -13.52, -76.01, 'CLIENTE');
```
