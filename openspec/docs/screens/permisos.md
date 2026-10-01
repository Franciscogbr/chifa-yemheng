# Permisos

## Información General

### Nombre

Consulta de Permisos y Módulos (Solo Lectura)

### Ruta

```text
/admin/permisos
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/permisos
```

### Roles Permitidos

```text
ADMIN
GERENTE (solo consulta)
SUPERVISOR (solo consulta)
```

### Permisos

```text
ROL_VER
```

> No requiere ROL_PERMISOS. La concesión/denegación
> vive exclusivamente en roles.md (matriz ROL_PERMISO).

---

# Objetivo

Consultar qué permisos existen y a qué módulo pertenecen, sin modificarlos.

Permite:

- Listar permisos agrupados por módulo.
- Filtrar por módulo, nombre, estado.
- Ver descripción y estado.
- Ver qué roles lo tienen concedido (solo lectura).
- Trazar qué pantalla exige cada permiso.

No permite (restricción dura Archivo 1.5):

- Crear / editar / eliminar permisos.
- Conceder / denegar (eso es `roles.md` matriz).
- Cambiar estado.

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR

---

# Layout

## Tipo

```text
Consulta Agrupada
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Breadcrumb                         │
├─────────────────────────────────────────────┤
│ Filtros (módulo, texto, estado)             │
├─────────────────────────────────────────────┤
│ Grupos por Módulo                           │
│  MODULO → lista PERMISO                     │
├─────────────────────────────────────────────┤
│ Detalle Permiso (drawer)                    │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Header

## Componentes

- Título
- Breadcrumb

### Ejemplo

```text
Permisos y Módulos

Inicio / Seguridad / Permisos
```

---

# Sección 2: Filtros

## Módulo

Tipo:

```text
Select
```

Fuente:

```text
MODULO
```

---

## Texto

Tipo:

```text
Texto (nombre o descripción)
```

---

## Estado

Opciones:

```text
Activo
Inactivo
```

Fuente:

```text
PERMISO.Estado A/I
```

---

# Sección 3: Grupos por Módulo

## Columnas

| Campo | Descripción |
|---------|---------|
| Permiso | Código (ej. VEN_COBRAR) |
| Descripción | Uso funcional |
| Módulo | MODULO al que pertenece |
| Estado | Activo/Inactivo |
| Roles | Cantidad de roles con concedido S |

---

## Ejemplo

```text
Módulo: CAJA
 VEN_COBRAR — Permite cobrar ventas — Activo — 3 roles
 CAJA_ARQUEO — Permite registrar arqueo — Activo — 2 roles

Módulo: VENTAS
 VEN_NOTACREDITO — Solo supervisor emite NC — Activo — 2 roles
```

---

# Sección 4: Detalle (Drawer Solo Lectura)

Mostrar:

```text
Código permiso
Descripción
Módulo
Estado
Roles con Concedido='S' (lista, sin checkbox)
Pantallas que lo exigen (ej. VEN_COBRAR → caja-cobro.md)
```

Sin botones Guardar/Editar.

---

# Acciones Disponibles

## Consultar

```text
Filtrar y paginar.
```

---

## Ver Detalle

```text
Drawer solo lectura.
```

---

## Exportar (opcional)

```text
Excel de matriz solo lectura.
```

---

# Restricciones

## No Permitido

```text
ABM de permisos.
```

---

## No Permitido

```text
Cambiar Concedido S/N desde aquí.
```

Mensaje:

```text
Los permisos se otorgan exclusivamente vía Roles ↔ Permisos.
```

Enlace:

```text
Ir a /admin/roles
```

---

# Reglas de Negocio

## BR-ACC-036

```text
El menú/permiso que ve cada usuario depende de sus roles
y permisos concedidos (RBAC).
Esta pantalla muestra el catálogo, no lo modifica.
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

```text
ROL_VER
```

> Si solo tiene ROL_VER puede ver pero no ir a matriz.
> Ir a matriz exige ROL_PERMISOS (roles.md).

---

# APIs

## Listar Módulos

```http
GET /api/modulos?estado=A
```

---

## Listar Permisos

```http
GET /api/permisos?modulo=CAJA&texto=VEN&estado=A
```

---

## Detalle Permiso

```http
GET /api/permisos/{id}
Response: { permiso, modulo, rolesConcedidos[] }
```

> Sin POST/PUT/PATCH/DELETE.

---

# Base de Datos

## Tablas

```text
PERMISO (N_Permiso, Descripcion, Estado A/I, ID_Modulo → MODULO)
MODULO (N_Modulo, Descripcion, Estado)
ROL_PERMISO (solo lectura Concedido S/N, ID_Rol, ID_Permiso)
ROL (solo lectura para conteo)
```

> Sin INSERT/UPDATE/DELETE desde esta pantalla.

## Seed

```text
openspec/database/permiso_modulo.sql — alta idempotente de MODULO (16)
+ PERMISO (~30 claves: AUD_VER, PED_*, EMP_*, INV_*, REC_*,
CAJA_APERTURA/CIERRE, DELIVERY_*, CLIENTE_*, RES_*, VEN_NOTACREDITO,
SAL_RESERVA, PED_DESCUENTO). Ejecutar con:
psql -d RESTAURANTEV3 -f openspec/database/permiso_modulo.sql
```

---

# Auditoría

Registrar:

```text
Consulta de permisos (usuario, filtro, fecha)
```

> No registra cambios porque no hay cambios.

---

# Estados de Pantalla

## Loading

```text
Skeleton de grupos.
```

---

## Sin Datos

```text
No existen permisos registrados.
```

---

## Error

```text
No fue posible cargar los permisos.
```

---

# Responsive

## Desktop

```text
Grupos expandibles lado a lado + drawer derecha.
```

---

## Tablet

```text
Grupos apilados.
```

---

## Mobile

```text
Acordeón por módulo.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un ADMIN con ROL_VER sin ROL_PERMISOS
When consulta /admin/permisos
Then ve el catálogo pero no puede conceder
```

---

## Escenario 2

```gherkin
Given un usuario que intenta POST /api/permisos
When no tiene permiso de escritura (no existe)
Then el sistema rechaza con 403
```

---

## Escenario 3

```gherkin
Given la matriz roles × permisos
When se consulta un permiso
Then el conteo de roles coincide con ROL_PERMISO Concedido='S'
```
