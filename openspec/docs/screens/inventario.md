# Inventario

## Información General

### Nombre

Gestión de Stock de Insumos

### Ruta

```text
/admin/inventario
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/inventario
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
```

### Permisos

```text
INV_VER
INV_CREAR
INV_KARDEX
```

> Hoy citados en roles.md:406 como huérfanos.
> Este archivo + recetas.md los legitiman.

---

# Objetivo

Controlar stock de insumos (no platos vendibles).

Permite:

- Ver stock actual/mínimo con alertas.
- Ver kardex (movimientos) por insumo.
- Registrar ajustes: entrada (compra) / salida (merma) / regularización.
- Referenciar receta para descuento futuro.
- Filtrar por bajo stock.

No permite:

- Vender insumos (Tipo_Producto='I' nunca en carta).
- Editar receta (ver `recetas.md`).
- Descuento automático (futuro USP brecha, hoy manual).

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR

---

# Layout

## Tipo

```text
Stock + Kardex
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + KPIs (insumos, bajo stock, críticos)│
├─────────────────────────────────────────────┤
│ Filtros + [Nuevo movimiento]                │
├──────────────────────┬──────────────────────┤
│ Tabla Insumos        │ Kardex insumo sel.   │
└──────────────────────┴──────────────────────┘
```

---

# Sección 1: KPIs

Mostrar:

```text
Total insumos activos
Bajo stock (Actual ≤ Mínimo)
Críticos (Actual = 0)
Valorizado (Σ Actual × Costo, si existe)
```

---

# Sección 2: Tabla Insumos

## Columnas

| Campo | Descripción |
|---------|---------|
| Insumo | Nombre PRODUCTO Tipo I |
| Unidad | UNIDAD_MEDIDA |
| Actual | Stock_Actual |
| Mínimo | Stock_Minimo |
| Estado | OK / Bajo / Crítico |
| Disponible | S/N |
| Acciones | Kardex / Ajustar |

Fuente:

```text
PRODUCTO (Tipo_Producto='I', Estado='A')
+ UNIDAD_MEDIDA
```

Filtro destacado:

```text
[Solo bajo stock]
```

---

# Sección 3: Kardex

Columnas:

| Campo | Descripción |
|---------|---------|
| Fecha | F_Movimiento |
| Tipo | E (entrada) / S (salida) |
| Cantidad | > 0 |
| Motivo | Compra / Merma / Ajuste / Receta |
| Usuario | Responsable |
| Saldo | Resultante |

Fuente:

```text
MOVIMIENTO_INVENTARIO (ID_Producto, Tipo E/S,
Cantidad, Motivo, ID_Usuario, Fecha)
```

---

# Sección 4: Nuevo Movimiento (Modal)

Campos:

```text
Insumo* (Select solo Tipo I)
Tipo* (E/S)
Cantidad* (> 0)
Motivo* (COMPRA / MERMA / AJUSTE / CONSUMO_RECETA)
Observación
```

Efecto:

```text
INSERT MOVIMIENTO_INVENTARIO + UPDATE
PRODUCTO.Stock_Actual ± Cantidad.
Con trigger o USP transaccional.
```

Validación:

```text
Salida no deja stock negativo (rechaza o advierte
según política; recomendado rechazar).
```

---

# Reglas de Negocio (brecha §6 REGLAS)

```text
Nuevo USP para descontar insumos por RECETA al servir
(MOVIMIENTO_INVENTARIO tipo 'S').
Hoy: registro manual; futuro: automático al S en cocina.
```

Referencia:

```text
RECETA (recetas.md) como base del descuento.
```

---

# Seguridad

## Roles

```text
ADMIN
GERENTE
SUPERVISOR
```

## Permisos

```text
INV_VER
INV_CREAR (ajustes)
INV_KARDEX (ver kardex)
INV_EDITAR (si se separa corrección)
```

---

# APIs

## Stock

```http
GET /api/inventario?bajoStock=true&texto=arroz
```

---

## Kardex

```http
GET /api/inventario/{idProducto}/kardex
```

---

## Ajuste

```http
POST /api/inventario/movimiento
Body: { idProducto, tipo: E|S, cantidad, motivo, observacion }
```

---

# Base de Datos

## Tablas

```text
PRODUCTO (Tipo_Producto='I', Stock_Actual, Stock_Minimo,
ID_UnidadMedida, Disponible, Estado)
MOVIMIENTO_INVENTARIO (ID_Producto, Tipo E/S, Cantidad>0,
Motivo, ID_Usuario, Fecha)
RECETA (solo referencia, ver recetas.md)
UNIDAD_MEDIDA
```

---

# Auditoría

Registrar:

```text
Todo movimiento (insumo, tipo, cantidad, motivo, usuario).
```

> Crítico: sin auditoría no hay trazabilidad de mermas.

---

# Estados de Pantalla

## Loading / Sin Datos / Error

```text
Skeleton / No existen insumos / No fue posible cargar.
```

Alerta:

```text
Fila Bajo stock en ámbar, Crítico en rojo.
```

---

# Responsive

```text
Desktop tabla+kardex / Mobile tabs Stock | Kardex.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un insumo con Actual 5 Mínimo 10
When abre inventario
Then figura como Bajo stock en ámbar
```

---

## Escenario 2

```gherkin
Given una salida mayor al stock
When intenta registrar
Then el sistema rechaza para no negativizar
```

---

## Escenario 3

```gherkin
Given un ajuste registrado
When consulta kardex
Then ve el movimiento con usuario y saldo resultante
```
