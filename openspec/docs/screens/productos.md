# Productos

## Información General

### Nombre

Administración de Productos

### Ruta

```text
/admin/productos
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/productos
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
```

### Permisos

```text
PROD_VER
PROD_CREAR
PROD_EDITAR
PROD_ELIMINAR
```

---

# Objetivo

Administrar los productos comercializados por el restaurante.

Permite:

- Crear productos.
- Editar productos.
- Activar o desactivar productos.
- Gestionar disponibilidad.
- Gestionar stock.
- Gestionar precios.
- Gestionar imágenes.
- Gestionar tiempos de preparación.

---

# Usuarios Objetivo

- Administrador
- Gerente
- Supervisor

---

# Layout

## Tipo

```text
ABM (Alta, Baja y Modificación)
```

## Estructura General

```text
┌────────────────────────────────────────────────────┐
│ Header + Breadcrumb                               │
├────────────────────────────────────────────────────┤
│ Filtros                                            │
├────────────────────────────────────────────────────┤
│ Acciones                                           │
├────────────────────────────────────────────────────┤
│ Tabla de Productos                                │
├────────────────────────────────────────────────────┤
│ Paginación                                         │
└────────────────────────────────────────────────────┘
```

---

# Sección 1: Header

## Componentes

- Título
- Subtítulo
- Breadcrumb

### Ejemplo

```text
Productos

Inicio / Administración / Productos
```

---

# Sección 2: Acciones Principales

## Botón Nuevo Producto

### Acción

```text
Abrir modal de registro.
```

---

## Botón Exportar

### Acción

```text
Exportar listado de productos.
```

Formato:

```text
Excel
PDF
```

---

# Sección 3: Filtros

## Filtro Nombre

Tipo:

```text
Input Text
```

---

## Filtro Categoría

Tipo:

```text
Select
```

Fuente:

```text
CATEGORIA_PRODUCTO
```

---

## Filtro Estado

Opciones:

```text
Activo
Inactivo
```

---

## Filtro Disponibilidad

Opciones:

```text
Disponible
No Disponible
```

---

## Botón Buscar

Ejecuta la búsqueda.

---

## Botón Limpiar

Limpia filtros.

---

# Sección 4: Tabla de Productos

## Columnas

| Campo | Descripción |
|---------|---------|
| Código | Código interno |
| Imagen | Foto del producto |
| Nombre | Nombre comercial |
| Categoría | Categoría asociada |
| Tipo | P, B o I |
| Precio | Precio de venta |
| Stock Actual | Existencias |
| Stock Mínimo | Mínimo permitido |
| Disponible | Sí / No |
| Estado | Activo / Inactivo |
| Tiempo Preparación | Minutos |
| Acciones | Editar / Activar / Desactivar |

---

# Tipos de Producto

## P

```text
Producto Preparado
```

Ejemplo:

```text
Arroz Chaufa
Aeropuerto
Tallarín Saltado
```

---

## B

```text
Bebida
```

Ejemplo:

```text
Inka Cola
Coca Cola
Agua Mineral
```

---

## I

```text
Insumo
```

Ejemplo:

```text
Arroz
Pollo
Aceite
```

---

# Modal Crear Producto

## Datos Generales

### Código

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

---

### Nombre

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

---

### Categoría

Tipo:

```text
Select
```

Fuente:

```text
CATEGORIA_PRODUCTO
```

Obligatorio:

```text
Sí
```

---

### Tipo Producto

Opciones:

```text
P = Preparado
B = Bebida
I = Insumo
```

Obligatorio:

```text
Sí
```

---

### Unidad de Medida

Tipo:

```text
Select
```

Fuente:

```text
UNIDAD_MEDIDA
```

Obligatorio:

```text
Sí
```

---

# Datos Comerciales

### Precio

Tipo:

```text
Decimal
```

Validación:

```text
Mayor a cero
```

---

### IGV

Tipo:

```text
Decimal
```

Valor por defecto:

```text
18%
```

---

### Disponible

Tipo:

```text
Switch
```

---

# Inventario

### Controla Stock

Tipo:

```text
Switch
```

---

### Stock Actual

Tipo:

```text
Número
```

---

### Stock Mínimo

Tipo:

```text
Número
```

---

# Operación

### Tiempo de Preparación

Tipo:

```text
Número
```

Unidad:

```text
Minutos
```

---

# Multimedia

### Imagen

Tipo:

```text
Upload
```

Formatos:

```text
jpg
jpeg
png
webp
```

---

# Acciones Disponibles

## Crear

```text
Registrar nuevo producto.
```

---

## Editar

```text
Actualizar información.
```

---

## Activar

```text
Cambiar ESTADO a Activo.
```

---

## Desactivar

```text
Cambiar ESTADO a Inactivo.
```

---

## Cambiar Disponibilidad

```text
Disponible
No Disponible
```

---

# Reglas de Negocio

## BR-RES-011

```text
Solo se agregan productos activos y disponibles a una comanda.
```

---

## BR-RES-022

```text
Solo se muestran productos disponibles y con stock.
```

---

## BR-RES-018

```text
Precio y cantidades deben ser mayores a cero.
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
PROD_VER
```

### Crear

```text
PROD_CREAR
```

### Editar

```text
PROD_EDITAR
```

### Desactivar

```text
PROD_ELIMINAR
```

---

# APIs

## Listar Productos

```http
GET /api/productos
```

---

## Obtener Producto

```http
GET /api/productos/{id}
```

---

## Crear Producto

```http
POST /api/productos
```

---

## Actualizar Producto

```http
PUT /api/productos/{id}
```

---

## Activar / Desactivar

```http
PATCH /api/productos/{id}/estado
```

---

## Cambiar Disponibilidad

```http
PATCH /api/productos/{id}/disponibilidad
```

---

# Base de Datos

## Tablas

```text
PRODUCTO
CATEGORIA_PRODUCTO
UNIDAD_MEDIDA
AUDITORIA
```

---

# Auditoría

Generar auditoría para:

```text
Crear producto

Editar producto

Activar producto

Desactivar producto

Cambiar disponibilidad

Modificar precio

Modificar stock
```

---

# Estados de Pantalla

## Loading

Mostrar:

```text
Skeleton de filtros

Skeleton de tabla
```

---

## Sin Datos

```text
No existen productos registrados.
```

---

## Error

```text
No fue posible cargar los productos.
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
Cards por producto.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un usuario con permiso PROD_CREAR
When registra un nuevo producto
Then el sistema almacena el producto correctamente
```

---

## Escenario 2

```gherkin
Given un producto activo y disponible
When un cliente consulta la carta
Then el producto aparece en el listado
```

---

## Escenario 3

```gherkin
Given un producto no disponible
When un cliente consulta la carta
Then el producto no aparece en la carta pública
```

---

## Escenario 4

```gherkin
Given un usuario sin permiso PROD_EDITAR
When intenta modificar un producto
Then el sistema deniega la operación
```

---

## Escenario 5

```gherkin
Given un producto con stock menor al mínimo
When se visualiza el listado
Then el sistema muestra una alerta visual de stock bajo
```