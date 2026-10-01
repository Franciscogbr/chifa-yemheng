# Recursos Humanos

## Información General

### Nombre

Administración del Personal (Empleados)

### Ruta

```text
/admin/personal
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/personal
```

### Roles Permitidos

```text
ADMIN
GERENTE
```

### Permisos

```text
EMP_VER (propuesto)
EMP_CREAR (propuesto)
EMP_EDITAR (propuesto)
```

> Base para usuarios.md (USUARIO.ID_Empleado).
> Si no se dan de alta, mapear a USR_VER/CREAR/EDITAR
> con nota de desdoble futuro.

---

# Objetivo

Registrar al personal, base para crear usuarios del sistema.

Permite:

- Listar empleados con búsqueda.
- Crear/editar con datos PERSONA + EMPLEADO.
- Activar/desactivar.
- Vincular como usuario (salto a usuarios.md).
- Controlar contrato, turno, ingreso/cese.

No permite:

- Crear USUARIO directamente (ver `usuarios.md`).
- Gestionar roles (ver `roles.md`).
- Registrar CLIENTE (ver `clientes.md`).

---

# Usuarios Objetivo

- ADMIN
- GERENTE

---

# Layout

## Tipo

```text
ABM Maestro
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Breadcrumb                         │
├─────────────────────────────────────────────┤
│ Filtros + [Nuevo empleado]                  │
├─────────────────────────────────────────────┤
│ Tabla Empleados                             │
├─────────────────────────────────────────────┤
│ Modal Crear/Editar (2 secciones)            │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Filtros

## Texto

```text
Nombre, apellido, documento, email.
```

## Cargo

```text
Select desde CARGO.
```

## Estado

```text
Activo / Inactivo (EMPLEADO.Estado + PERSONA.Estado).
```

---

# Sección 2: Tabla

## Columnas

| Campo | Descripción |
|---------|---------|
| Empleado | Nombres + apellidos |
| Documento | Tipo + número |
| Cargo | CARGO |
| Contrato | CONTRATO |
| Turno | Turno |
| Ingreso | F_Ingreso |
| Estado | Activo/Inactivo |
| Usuario | Vinculado S/N + link |
| Acciones | Editar / Activar / Crear usuario |

Fuente:

```text
EMPLEADO + PERSONA + CARGO + CONTRATO + DISTRITO
```

---

# Sección 3: Modal (2 bloques)

## Bloque A — PERSONA

```text
Nombres*, Apellido_Paterno*, Apellido_Materno,
Tipo_Identidad* (Select TIPO_IDENTIDAD: DNI/CE/RUC),
N_Documento* (único, validar longitud),
Email (único, formato), Celular (9 dígitos),
ID_Distrito (Select DEPARTAMENTO→PROVINCIA→DISTRITO),
Dirección.
```

## Bloque B — EMPLEADO

```text
ID_Cargo* (Select CARGO: CAJERO/MOZO/COCINERO/REPARTIDOR...),
ID_Contrato (Select CONTRATO),
Salario (> 0), Turno (Mañana/Tarde/Noche),
F_Ingreso* (default hoy), F_Cese (nullable, ≥ ingreso),
Estado (Switch A/I).
```

Obligatorios marcados `*`.

---

# Acciones Disponibles

## Crear

```text
Crea PERSONA + EMPLEADO en transacción.
Valida documento/email únicos.
```

---

## Editar

```text
Actualiza ambos bloques + auditoría.
```

---

## Activar / Desactivar

```text
Estado lógico A/I, nunca DELETE físico.
Si tiene USUARIO activo, advierte.
```

---

## Vincular como Usuario

```text
Botón [Crear usuario] → /admin/usuarios con
ID_Empleado precargado (BR-EST-003).
```

---

# Reglas de Negocio

## BR-EST-002

```text
PERSONA es la base; de ella derivan CLIENTE y EMPLEADO.
```

## BR-EST-003

```text
Todo USUARIO es personal (empleado).
Sin EMPLEADO no hay USUARIO.
```

## Validaciones app (brecha §6 REGLAS)

```text
Unicidad EMAIL y documento.
Longitud documento según tipo.
```

---

# Seguridad

## Roles

```text
ADMIN
GERENTE
```

## Permisos

```text
EMP_VER
EMP_CREAR
EMP_EDITAR
```

---

# APIs

## Listar

```http
GET /api/personal?texto=juan&cargo=MOZO&estado=A
```

---

## Crear

```http
POST /api/personal
Body: { persona: {...}, empleado: {...} }
```

---

## Actualizar / Estado

```http
PUT /api/personal/{id}
PATCH /api/personal/{id}/estado
```

---

# Base de Datos

## Tablas

```text
PERSONA (Nombres, Apellidos, ID_TipoIdentidad → TIPO_IDENTIDAD,
N_Documento UNIQUE, Email UNIQUE, Celular, ID_Distrito → DISTRITO,
Direccion, Estado)
EMPLEADO (ID_Persona → PERSONA, ID_Cargo → CARGO,
ID_Contrato → CONTRATO, Salario, Turno, F_Ingreso, F_Cese, Estado)
CARGO
CONTRATO
DISTRITO (+ PROVINCIA + DEPARTAMENTO para ubigeo)
TIPO_IDENTIDAD (catálogo desplegable, sin página propia)
```

---

# Auditoría

Registrar:

```text
Crear/editar/activar/desactivar empleado.
```

---

# Estados de Pantalla

## Loading / Sin Datos / Error

```text
Skeleton tabla / No existen empleados / No fue posible cargar.
```

---

# Responsive

## Desktop / Mobile

```text
Tabla completa / Cards + modal full-screen.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given datos PERSONA+EMPLEADO válidos
When crea empleado
Then se insertan ambas filas vinculadas
```

---

## Escenario 2

```gherkin
Given EMAIL existente
When intenta crear
Then rechaza por unicidad
```

---

## Escenario 3

```gherkin
Given un empleado sin usuario
When pulsa Crear usuario
Then navega a usuarios.md con empleado precargado
```
