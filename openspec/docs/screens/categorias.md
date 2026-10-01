# Categorías de Productos

## Información General

### Nombre

Administración de Categorías

### Ruta

```text
/admin/categorias
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/categorias
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
```

### Permisos

```text
CAT_VER
CAT_CREAR
CAT_EDITAR
CAT_ELIMINAR
```

---

# Objetivo

Administrar las categorías utilizadas para clasificar los productos del restaurante.

Permite:

- Crear categorías.
- Editar categorías.
- Activar categorías.
- Desactivar categorías.
- Organizar la carta digital.
- Organizar reportes de ventas por categoría.

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR

---

# Layout

## Tipo

```text
ABM
```

## Estructura

```text
┌────────────────────────────────────────────┐
│ Header + Breadcrumb                        │
├────────────────────────────────────────────┤
│ Filtros                                    │
├────────────────────────────────────────────┤
│ Acciones                                   │
├────────────────────────────────────────────┤
│ Tabla Categorías                           │
├────────────────────────────────────────────┤
│ Paginación                                 │
└────────────────────────────────────────────┘
```

---

# Sección 1: Header

## Componentes

- Título
- Subtítulo
- Breadcrumb

### Ejemplo

```text
Categorías

Inicio / Administración / Categorías
```

---

# Sección 2: Acciones Principales

## Nuevo

```text
Registrar categoría.
```

---

## Exportar

```text
Excel
PDF
```

---

# Sección 3: Filtros

## Nombre

Tipo:

```text
Input Text
```

---

## Estado

Opciones:

```text
Activo
Inactivo
```

---

# Sección 4: Tabla

## Columnas

| Campo | Descripción |
|---------|---------|
| ID | Identificador |
| Nombre | Nombre de categoría |
| Descripción | Detalle |
| Estado | Activo/Inactivo |
| Productos Asociados | Cantidad |
| Fecha Creación | Registro |
| Acciones | Editar / Activar / Desactivar |

---

# Modal Crear Categoría

## Nombre

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

Longitud:

```text
Máximo 100 caracteres
```

---

## Descripción

Tipo:

```text
Textarea
```

Obligatorio:

```text
No
```

Longitud:

```text
Máximo 500 caracteres
```

---

## Estado

Tipo:

```text
Switch
```

Valor inicial:

```text
Activo
```

---

# Acciones Disponibles

## Crear

```text
Registrar categoría.
```

---

## Editar

```text
Actualizar categoría.
```

---

## Activar

```text
Cambiar estado a Activo.
```

---

## Desactivar

```text
Cambiar estado a Inactivo.
```

---

# Validaciones

## Nombre obligatorio

```text
No puede estar vacío.
```

---

## Nombre único

```text
No pueden existir dos categorías con el mismo nombre.
```

---

## Desactivación

```text
Si existen productos asociados,
solicitar confirmación al usuario.
```

---

# Seguridad

## Roles

```text
ADMIN
GERENTE
SUPERVISOR
```

---

## Permisos

### Consultar

```text
CAT_VER
```

### Crear

```text
CAT_CREAR
```

### Editar

```text
CAT_EDITAR
```

### Desactivar

```text
CAT_ELIMINAR
```

---

# APIs

## Listar

```http
GET /api/categorias
```

---

## Obtener

```http
GET /api/categorias/{id}
```

---

## Crear

```http
POST /api/categorias
```

---

## Actualizar

```http
PUT /api/categorias/{id}
```

---

## Cambiar Estado

```http
PATCH /api/categorias/{id}/estado
```

---

# Base de Datos

## Tablas

```text
CATEGORIA_PRODUCTO
PRODUCTO
AUDITORIA
```

---

# Auditoría

Registrar:

```text
Crear categoría

Editar categoría

Activar categoría

Desactivar categoría
```

---

# Estados de Pantalla

## Loading

```text
Skeleton de filtros

Skeleton de tabla
```

---

## Sin Datos

```text
No existen categorías registradas.
```

---

## Error

```text
No fue posible cargar las categorías.
```

---

# Responsive

## Desktop

```text
Tabla completa.
```

---

## Tablet

```text
Tabla con scroll horizontal.
```

---

## Mobile

```text
Cards de categoría.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un usuario con permiso CAT_CREAR
When registra una nueva categoría
Then el sistema almacena la categoría correctamente
```

---

## Escenario 2

```gherkin
Given una categoría activa
When se crea un producto
Then la categoría aparece en el selector
```

---

## Escenario 3

```gherkin
Given una categoría inactiva
When se registra un producto
Then la categoría no aparece como opción seleccionable
```

---

## Escenario 4

```gherkin
Given un usuario sin permiso CAT_EDITAR
When intenta modificar una categoría
Then el sistema deniega la operación
```

---

## Escenario 5

```gherkin
Given una categoría asociada a productos
When el usuario intenta desactivarla
Then el sistema solicita confirmación antes de continuar
```