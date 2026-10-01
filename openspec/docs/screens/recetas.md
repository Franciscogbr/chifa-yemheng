# Recetas

## Información General

### Nombre

Administración de Recetas (Plato → Insumos)

### Ruta

```text
/admin/recetas
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/recetas
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
```

### Permisos

```text
REC_VER (propuesto)
REC_CREAR (propuesto)
REC_EDITAR (propuesto)
```

> Si no se dan de alta, mapear a PROD_VER/CREAR/EDITAR
> con nota de desdoble (receta ≠ producto).

---

# Objetivo

Definir qué insumos y en qué cantidad lleva cada plato preparado.

Permite:

- Listar recetas por plato.
- Crear/editar receta (plato + N insumos + cantidad).
- Activar/desactivar receta e insumos de receta.
- Validar que el plato sea P y los insumos I.
- Servir de base a inventario para descuento futuro.

No permite:

- Mover stock (ver `inventario.md`).
- Vender insumos.
- Cambiar precio del plato (ver `productos.md`).

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR

---

# Layout

## Tipo

```text
Maestro-Detalle (Plato → Insumos)
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + [Nueva receta]                     │
├─────────────────────────────────────────────┤
│ Filtros (plato, insumo)                     │
├──────────────────────┬──────────────────────┤
│ Lista Platos con     │ Insumos del plato    │
│ receta               │ + cantidades         │
└──────────────────────┴──────────────────────┘
```

---

# Sección 1: Lista Platos

Columnas:

| Campo | Descripción |
|---------|---------|
| Plato | PRODUCTO Tipo P |
| Insumos | N distintos |
| Estado | Activa/Inactiva |
| Acciones | Ver / Editar / Desactivar |

Fuente:

```text
RECETA agrupado por ID_ProductoPlato + PRODUCTO P
```

---

# Sección 2: Detalle Receta

Columnas:

| Campo | Descripción |
|---------|---------|
| Insumo | PRODUCTO Tipo I |
| Cantidad | > 0 + Unidad |
| Estado | Activo/Inactivo |

Ejemplo:

```text
Chaufa Especial (P)
 → Arroz cocido (I) 0.30 kg
 → Pollo (I) 0.15 kg
 → Huevo (I) 1 und
```

---

# Sección 3: Modal Crear/Editar

## Plato

Tipo:

```text
Select, solo PRODUCTO Tipo_Producto='P', Estado='A'
```

Validación:

```text
Un plato = una receta activa (UQ plato).
Si ya existe, edita, no duplica.
```

---

## Insumos (líneas dinámicas)

Por línea:

```text
Insumo* (Select solo Tipo_Producto='I')
Cantidad* (> 0)
Unidad (heredada de insumo, UNIDAD_MEDIDA, solo lectura)
```

Validaciones:

```text
Insumo ≠ plato.
Sin duplicados en la misma receta.
Cantidad > 0.
```

---

# Acciones Disponibles

## Crear / Editar / Desactivar

```text
Transacción cabecera + líneas.
Desactivar = lógico, nunca DELETE si tiene kardex.
```

---

# Reglas de Negocio

## BR-EST-010

```text
Una RECETA vincula un plato preparado (Tipo_Producto='P')
con uno o más insumos (Tipo_Producto='I') y la cantidad requerida.
(FK a PRODUCTO ×2, UQ plato)
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
REC_VER
REC_CREAR
REC_EDITAR
```

---

# APIs

## Listar

```http
GET /api/recetas?plato=chaufa
```

---

## Detalle

```http
GET /api/recetas/{idPlato}
```

---

## Guardar

```http
POST /api/recetas
PUT /api/recetas/{idPlato}
Body: { idPlato, insumos: [{ idInsumo, cantidad }] }
```

---

## Estado

```http
PATCH /api/recetas/{idPlato}/estado
```

---

# Base de Datos

## Tablas

```text
RECETA (ID_ProductoPlato → PRODUCTO P,
ID_ProductoInsumo → PRODUCTO I,
Cantidad > 0, ID_UnidadMedida → UNIDAD_MEDIDA,
Estado A/I, UQ(ID_ProductoPlato, ID_ProductoInsumo))
PRODUCTO (ambos roles P e I)
UNIDAD_MEDIDA (catálogo desplegable)
```

Checks:

```text
CK_RECETA_CANTIDAD (Cantidad > 0)
CK_RECETA_DISTINTO (plato ≠ insumo)
UQ plato+insumo
```

---

# Auditoría

Registrar:

```text
Crear/editar/desactivar receta (plato, líneas, usuario).
```

---

# Estados de Pantalla

## Loading / Sin Datos / Error

```text
Skeleton / No existen recetas / No fue posible cargar.
```

Caso:

```text
Plato P sin receta → badge "Sin receta" + [Crear].
```

---

# Responsive

```text
Desktop maestro-detalle / Mobile tabs Plato | Insumos.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un plato P y dos insumos I
When crea la receta con cantidades > 0
Then queda activa y visible en lista
```

---

## Escenario 2

```gherkin
Given una receta existente
When intenta usar un insumo Tipo P
Then el sistema rechaza (BR-EST-010)
```

---

## Escenario 3

```gherkin
Given una receta con insumo duplicado
When guarda
Then rechaza por UQ
```
