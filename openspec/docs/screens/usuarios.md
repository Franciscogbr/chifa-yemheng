# Usuarios

## Información General

### Nombre

Administración de Usuarios

### Ruta

```text
/admin/usuarios
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/usuarios
```

### Roles Permitidos

```text
ADMIN
GERENTE
```

### Permisos

```text
USR_VER
USR_CREAR
USR_EDITAR
USR_DESBLOQUEAR
USR_RESETPASSWORD
USR_ROLES
```

---

# Objetivo

Administrar los usuarios internos del sistema.

Permite:

- Crear usuarios.
- Editar usuarios.
- Activar o desactivar usuarios.
- Desbloquear usuarios.
- Restablecer contraseñas.
- Asignar roles.
- Revocar roles.
- Consultar estado de acceso.
- Gestionar seguridad del personal.

---

# Usuarios Objetivo

- ADMIN
- GERENTE

---

# Layout

## Tipo

```text
ABM
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Breadcrumb                         │
├─────────────────────────────────────────────┤
│ Filtros                                     │
├─────────────────────────────────────────────┤
│ Acciones                                    │
├─────────────────────────────────────────────┤
│ Tabla Usuarios                              │
├─────────────────────────────────────────────┤
│ Paginación                                  │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Header

## Componentes

- Título
- Breadcrumb

### Ejemplo

```text
Usuarios

Inicio / Seguridad / Usuarios
```

---

# Sección 2: Acciones Principales

## Nuevo Usuario

```text
Registrar usuario.
```

---

## Exportar

Formatos:

```text
Excel
PDF
```

---

# Sección 3: Filtros

## Empleado

Tipo:

```text
Texto
```

---

## Usuario

Tipo:

```text
Texto
```

---

## Rol

Tipo:

```text
Select
```

Fuente:

```text
ROL
```

---

## Estado

Opciones:

```text
Activo
Inactivo
```

---

## Bloqueado

Opciones:

```text
Sí
No
```

---

# Sección 4: Tabla de Usuarios

## Columnas

| Campo | Descripción |
|---------|---------|
| Usuario | Login |
| Empleado | Nombre Completo |
| Tipo Usuario | Tipo configurado |
| Roles | Roles asignados |
| Intentos | Intentos fallidos |
| Bloqueado | Sí / No |
| Estado | Activo/Inactivo |
| Último Acceso | Fecha |
| Acciones | Editar / Desbloquear / Reset |

---

# Modal Crear Usuario

## Empleado

Tipo:

```text
Autocomplete
```

Fuente:

```text
EMPLEADO
PERSONA
```

Obligatorio:

```text
Sí
```

---

## Tipo Usuario

Tipo:

```text
Select
```

Fuente:

```text
TIPO_USUARIO
```

---

## Usuario

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

Validación:

```text
Único
```

---

## Contraseña

Tipo:

```text
Password
```

Obligatorio:

```text
Sí
```

---

## Confirmar Contraseña

Tipo:

```text
Password
```

---

## Estado

Tipo:

```text
Switch
```

---

# Asignación de Roles

## Roles Disponibles

Fuente:

```text
ROL
```

---

## Selección

Tipo:

```text
MultiSelect
```

---

## Ejemplos

```text
ADMIN

GERENTE

SUPERVISOR

CAJERO

MOZO

COCINERO

REPARTIDOR
```

---

# Acciones Disponibles

## Crear

```text
Registrar usuario.
```

---

## Editar

```text
Modificar configuración del usuario.
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

## Desbloquear

```text
Bloqueado = N

Intentos = 0
```

---

## Restablecer Contraseña

```text
Genera nueva contraseña temporal.
```

---

## Gestionar Roles

```text
Asignar roles.

Revocar roles.
```

---

# Política de Contraseñas

## Reglas

```text
Mínimo 8 caracteres.

Al menos una letra.

Al menos un número.

No usar espacios.
```

---

## Primer Acceso

```text
Debe cambiar contraseña.
```

---

# Reglas de Negocio

## BR-EST-003

```text
Todo usuario corresponde a un empleado.
```

---

## BR-ACC-035

```text
Bloqueo automático tras 3 intentos fallidos.
```

---

## BR-ACC-036

```text
Los permisos visibles dependen
de sus roles y permisos asignados.
```

---

# Seguridad

## Roles

```text
ADMIN
GERENTE
```

---

## Permisos

### Consultar

```text
USR_VER
```

### Crear

```text
USR_CREAR
```

### Editar

```text
USR_EDITAR
```

### Desbloquear

```text
USR_DESBLOQUEAR
```

### Restablecer Clave

```text
USR_RESETPASSWORD
```

### Gestionar Roles

```text
USR_ROLES
```

---

# APIs

## Listar Usuarios

```http
GET /api/usuarios
```

---

## Obtener Usuario

```http
GET /api/usuarios/{id}
```

---

## Crear Usuario

```http
POST /api/usuarios
```

---

## Actualizar Usuario

```http
PUT /api/usuarios/{id}
```

---

## Desbloquear Usuario

```http
PATCH /api/usuarios/{id}/desbloquear
```

---

## Restablecer Contraseña

```http
PATCH /api/usuarios/{id}/reset-password
```

---

## Gestionar Roles

```http
PATCH /api/usuarios/{id}/roles
```

---

# Base de Datos

## Tablas

```text
USUARIO
EMPLEADO
PERSONA
TIPO_USUARIO
USUARIO_ROL
ROL
AUDITORIA
```

---

# Auditoría

Registrar:

```text
Crear usuario

Editar usuario

Activar usuario

Desactivar usuario

Desbloquear usuario

Restablecer contraseña

Asignar roles

Revocar roles
```

---

# Estados de Pantalla

## Loading

```text
Skeleton de tabla

Skeleton de formulario
```

---

## Sin Datos

```text
No existen usuarios registrados.
```

---

## Error

```text
No fue posible cargar los usuarios.
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
Cards por usuario.
```

---

# Casos Especiales

## Usuario Bloqueado

Mostrar:

```text
Badge rojo.

Cantidad de intentos.

Fecha último intento.
```

Acción disponible:

```text
Desbloquear
```

---

## Usuario Inactivo

Mostrar:

```text
Badge gris.
```

---

## Usuario Activo

Mostrar:

```text
Badge verde.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un administrador con permiso USR_CREAR
When registra un nuevo usuario
Then el sistema crea correctamente el acceso
```

---

## Escenario 2

```gherkin
Given un usuario realiza tres intentos fallidos
When supera el límite permitido
Then el sistema bloquea automáticamente la cuenta
```

---

## Escenario 3

```gherkin
Given un usuario bloqueado
When un administrador ejecuta desbloquear
Then el sistema restablece los intentos a cero
```

---

## Escenario 4

```gherkin
Given un usuario existente
When se asigna un nuevo rol
Then los permisos efectivos del usuario se actualizan
```

---

## Escenario 5

```gherkin
Given un usuario sin permiso USR_EDITAR
When intenta modificar un usuario
Then el sistema deniega la operación
```