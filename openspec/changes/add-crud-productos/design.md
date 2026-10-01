# Design: add-crud-productos

## Mapeo spec+plantilla ↔ BD (`PRODUCTO`, creacion:577-609)
| Origen | BD | Decisión |
|---|---|---|
| Nombre* | `N_Producto varchar(50)` NOT NULL | Zod max 50. |
| Categoría* (selector) | `ID_CategoriaProducto` NOT NULL, FK | Opciones de `GET /api/v1/categorias?estado=A` (CRUD 1). |
| Tipo Plato/Insumo (plantilla, 2 opciones) | `Tipo_Producto char(1)` CHECK `P/B/I` | **3 opciones**: Preparado/Bebida/Insumo (`BR-EST-010`: receta exige `P`↔`I`). |
| Precio* ≥0 | `Precio decimal(8,2)`, `CK_PRODUCTO_PRE` | Zod number ≥0. |
| Unidad (plantilla lo omite) | `ID_Unidad` NOT NULL, FK | **Selector obligatorio** (rollback: sin él el INSERT falla). |
| Stock/Raciones | `Controla_Stock` + `Stock_Actual` + `Stock_Minimo` | Switch controla + 2 numéricos (default N/0/0). |
| Tiempo min | `Tiempo_Preparacion` NULL | Numérico opcional. |
| Disponible/En Carta switch | `Disponible` default `'S'` | Switch (independiente de `ESTADO`). |
| Imagen drag&drop | `Imagen varchar(200)` NULL | v1: campo URL texto; upload Storage diferido. Hotlinks con `onError` fallback. |
| Detalle/Descripción | `Detalle varchar(150)` | Zod max 150. |
| Costo, Marca, Afecto IGV | defaults 0/NULL/'S' | Costo editable, resto defaults (sección avanzada colapsable). |
| REF PRD-xxx (plantilla) | `Codigo varchar(20)` NULL + `UQ_PRODUCTO_COD` | Campo Código opcional; si se llena, único → 409 `YA_EXISTE`. |
| Botón Eliminar (plantilla) | — | **Eliminado**: solo toggle Activo/Inactivo (`CAT_ELIMINAR`→`PROD_ELIMINAR` cubre el cambio de estado). |
| Exportar (plantilla) | — | Diferido. Plan/Licencia/Carlos/role-switcher: eliminados (igual que categorías). |

## Decisiones
1. **Doble bandera**: `ESTADO` (existe en carta) vs `Disponible` (hay stock/temporada).
   `BR-RES-011/022`: solo `A` + `S` entran a comandas y carta.
2. **Guards**: `authGuard + requirePermisos(PROD_*)`; 401/403/404/409 iguales
   al molde de categorías.
3. **Auditoría** `AUDITORIA` (CREAR/EDITAR/ACTIVAR/DESACTIVAR producto).
4. **KPIs**: total, disponibles (%), insumos, fuera de carta — calculados.
5. **Responsive**: mismo patrón categorías.
6. **Permisos `PROD_*`**: verificar en `ROL_PERMISO`; si faltan, patch SQL
   (igual que posible caso `CAT_*`).

## Riesgos
- `ID_Unidad` sin endpoint de unidades: v1 usa lista fija desde
  `UNIDAD_MEDIDA` (Unidad, Porción, Jarra, Kilogramo, Litro + seeds 02);
  endpoint propio queda como mejora (no bloquea).
- Imágenes remotas bloqueadas en esta red: fallback con degradado.
