# Roles

## Información General

### Nombre

Administración de Roles

### Ruta

```text
/admin/roles
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/roles
```

### Roles Permitidos

```text
ADMIN
```

### Permisos

```text
ROL_VER
ROL_CREAR
ROL_EDITAR
ROL_PERMISOS
```

---

# Objetivo

Administrar los roles del sistema y su matriz de permisos.

Permite:

- Crear roles.
- Editar roles.
- Activar o desactivar roles.
- Asignar permisos.
- Revocar permisos.
- Gestionar matriz ROL_PERMISO.
- Controlar accesos del sistema.

---

# Usuarios Objetivo

- ADMIN

---

# Layout

## Tipo

```text
Maestro - Detalle
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Breadcrumb                         │
├─────────────────────────────────────────────┤
│ Filtros                                     │
├─────────────────────────────────────────────┤
│ Lista de Roles                              │
├─────────────────────────────────────────────┤
│ Matriz de Permisos                          │
├─────────────────────────────────────────────┤
│ Detalle de Permisos Asignados               │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Header

## Componentes

- Título
- Subtítulo
- Breadcrumb

### Ejemplo

```text
Roles y Permisos

Inicio / Seguridad / Roles
```

---

# Sección 2: Filtros

## Nombre

Tipo:

```text
Texto
```

---

## Estado

Opciones:

```text
Activo
Inactivo
```

---

# Sección 3: Lista de Roles

## Columnas

| Campo | Descripción |
|---------|---------|
| Código | Código del rol |
| Nombre | Nombre del rol |
| Descripción | Descripción funcional |
| Usuarios | Usuarios asignados |
| Estado | Activo/Inactivo |
| Acciones | Editar / Permisos / Activar / Desactivar |

---

# Roles Base del Sistema

## ADMIN

```text
Acceso total al sistema.
```

---

## GERENTE

```text
Supervisión operacional y comercial.
```

---

## SUPERVISOR

```text
Supervisión de operaciones diarias.
```

---

## CAJERO

```text
Administración de caja y cobranza.
```

---

## MOZO

```text
Gestión de comandas y atención.
```

---

## COCINERO

```text
Gestión de preparación de pedidos.
```

---

## REPARTIDOR

```text
Gestión de entregas delivery.
```

---

## CLIENTE

```text
Consumo QR, reservas y delivery.
```

---

# Modal Crear Rol

## Código

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

Ejemplo:

```text
CAJERO
MARKETING
ALMACENERO
```

---

## Nombre

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
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

---

## Estado

Tipo:

```text
Switch
```

---

# Sección 4: Matriz de Permisos

## Objetivo

Administrar permisos asignados a cada rol.

---

## Layout

```text
               CREAR  EDITAR  ELIMINAR  VER

PRODUCTOS       ✔       ✔        ✔      ✔

CATEGORÍAS      ✔       ✔        ✔      ✔

USUARIOS        ✔       ✔        ✖      ✔

CAJA            ✖       ✖        ✖      ✔
```

---

# Agrupación de Permisos

## Seguridad

```text
USR_VER
USR_CREAR
USR_EDITAR
USR_DESBLOQUEAR
USR_RESETPASSWORD
```

---

## Roles

```text
ROL_VER
ROL_CREAR
ROL_EDITAR
ROL_PERMISOS
```

---

## Productos

```text
PROD_VER
PROD_CREAR
PROD_EDITAR
PROD_ELIMINAR
```

---

## Categorías

```text
CAT_VER
CAT_CREAR
CAT_EDITAR
CAT_ELIMINAR
```

---

## Mesas

```text
MESA_VER
MESA_CREAR
MESA_EDITAR
MESA_ELIMINAR
```

---

## Clientes

```text
CLI_VER
CLI_CREAR
CLI_EDITAR
CLI_ELIMINAR
```

---

## Reservas

```text
RES_VER
RES_CONFIRMAR
RES_ANULAR
```

---

## Caja

```text
CAJA_APERTURA
CAJA_CIERRE
CAJA_ARQUEO
CAJA_RENDICION
```

---

## Ventas

```text
VEN_COBRAR
VEN_NOTACREDITO
VEN_VER
```

---

## Inventario

```text
INV_VER
INV_CREAR
INV_EDITAR
INV_KARDEX
```

---

## Auditoría

```text
AUD_VER
```

---

# Asignación de Permisos

## Selección

Tipo:

```text
Checkbox
```

---

## Acción

```text
Guardar cambios.
```

---

## Validación

```text
Debe existir al menos un permiso
asignado para activar un rol.
```

---

# Acciones Disponibles

## Crear Rol

```text
Registrar nuevo rol.
```

---

## Editar Rol

```text
Modificar datos del rol.
```

---

## Activar Rol

```text
Estado = Activo
```

---

## Desactivar Rol

```text
Estado = Inactivo
```

---

## Gestionar Permisos

```text
Asignar permisos.

Revocar permisos.
```

---

## Ver Usuarios Asociados

```text
Mostrar usuarios asignados al rol.
```

---

# Reglas de Negocio

## BR-ACC-036

```text
Los permisos efectivos de un usuario
son la unión de los permisos de todos
sus roles activos.
```

---

## BR-ACC-038

```text
Todo acceso requiere validación de
JWT + Rol + Permiso.
```

---

## BR-ACC-039

```text
La eliminación física de roles
no está permitida.
```

---

## BR-ACC-040

```text
Los roles solo pueden ser desactivados.
```

---

# Seguridad

## Roles

```text
ADMIN
```

---

## Permisos

### Consultar

```text
ROL_VER
```

---

### Crear

```text
ROL_CREAR
```

---

### Modificar

```text
ROL_EDITAR
```

---

### Gestionar Permisos

```text
ROL_PERMISOS
```

---

# APIs

## Listar Roles

```http
GET /api/roles
```

---

## Obtener Rol

```http
GET /api/roles/{id}
```

---

## Crear Rol

```http
POST /api/roles
```

---

## Actualizar Rol

```http
PUT /api/roles/{id}
```

---

## Cambiar Estado

```http
PATCH /api/roles/{id}/estado
```

---

## Obtener Permisos

```http
GET /api/roles/{id}/permisos
```

---

## Actualizar Permisos

```http
PATCH /api/roles/{id}/permisos
```

---

# Base de Datos

## Tablas

```text
ROL
PERMISO
ROL_PERMISO
USUARIO_ROL
AUDITORIA
```

---

# Auditoría

Registrar:

```text
Crear rol

Editar rol

Activar rol

Desactivar rol

Asignar permisos

Revocar permisos
```

---

# Estados de Pantalla

## Loading

```text
Skeleton de roles

Skeleton de matriz
```

---

## Sin Datos

```text
No existen roles registrados.
```

---

## Error

```text
No fue posible cargar los roles.
```

---

# Responsive

## Desktop

```text
Lista y matriz visibles simultáneamente.
```

---

## Tablet

```text
Lista arriba.

Permisos abajo.
```

---

## Mobile

```text
Roles en cards.

Permisos agrupados por módulo.
```

---

# Casos Especiales

## Rol Asignado a Usuarios

Mostrar:

```text
Cantidad de usuarios vinculados.
```

---

## Rol del Sistema

Mostrar:

```text
No editable.
```

Ejemplos:

```text
ADMIN
CLIENTE
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un administrador con permiso ROL_CREAR
When registra un nuevo rol
Then el sistema almacena correctamente el rol
```

---

## Escenario 2

```gherkin
Given un rol activo
When se asignan permisos
Then los usuarios heredan dichos permisos
```

---

## Escenario 3

```gherkin
Given un rol utilizado por usuarios
When se desactiva
Then los accesos asociados quedan restringidos
```

---

## Escenario 4

```gherkin
Given un usuario con múltiples roles
When inicia sesión
Then el sistema calcula la unión de permisos
```

---

## Escenario 5

```gherkin
Given un usuario sin permiso ROL_PERMISOS
When intenta modificar la matriz
Then el sistema deniega la operación
```