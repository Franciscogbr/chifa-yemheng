# Mesas y Ambientes

## Información General

### Nombre

Administración de Mesas y Ambientes

### Ruta

```text
/admin/mesas
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/mesas
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
```

### Permisos

```text
MESA_VER
MESA_CREAR
MESA_EDITAR
MESA_ELIMINAR
```

---

# Objetivo

Administrar los ambientes y mesas del restaurante.

Permite:

- Registrar ambientes.
- Registrar mesas.
- Configurar capacidad.
- Configurar tipo de mesa.
- Gestionar disponibilidad.
- Activar o desactivar mesas.
- Generar la estructura física utilizada por:
  - Mapa de mesas
  - Comandas
  - Reservas
  - QR de autoservicio

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR

---

# Layout

## Tipo

```text
ABM Maestro-Detalle
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Breadcrumb                         │
├─────────────────────────────────────────────┤
│ Filtros                                     │
├─────────────────────────────────────────────┤
│ Lista de Ambientes                          │
├─────────────────────────────────────────────┤
│ Mesas del Ambiente Seleccionado             │
├─────────────────────────────────────────────┤
│ Formulario / Modal                          │
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
Mesas y Ambientes

Inicio / Administración / Mesas
```

---

# Sección 2: Filtros

## Ambiente

Tipo:

```text
Select
```

Fuente:

```text
AMBIENTE
```

---

## Estado Mesa

Opciones:

```text
LIBRE
OCUPADA
RESERVADA
POR_COBRAR
```

---

## Estado Registro

Opciones:

```text
Activo
Inactivo
```

---

## Capacidad

Tipo:

```text
Rango Numérico
```

---

# Sección 3: Ambientes

## Objetivo

Administrar las áreas físicas del restaurante.

### Ejemplos

```text
Primer Piso

Segundo Piso

Terraza

VIP

Patio
```

---

## Columnas

| Campo | Descripción |
|---------|---------|
| Nombre | Nombre del ambiente |
| Estado | Activo/Inactivo |
| Mesas | Cantidad de mesas |
| Acciones | Editar / Desactivar |

---

# Modal Ambiente

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

---

## Estado

Tipo:

```text
Switch
```

---

# Sección 4: Mesas

## Objetivo

Administrar las mesas pertenecientes a un ambiente.

---

## Columnas

| Campo | Descripción |
|---------|---------|
| Número | Identificador visible |
| Ambiente | Ambiente asociado |
| Capacidad | Personas |
| Tipo Mesa | Tipo configurado |
| Estado Mesa | Libre/Ocupada/Reservada/Por Cobrar |
| QR | Código asociado |
| Estado Registro | Activo/Inactivo |
| Acciones | Editar / Activar / Desactivar |

---

# Modal Mesa

## Número

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
M01
M02
M03
```

---

## Ambiente

Tipo:

```text
Select
```

Fuente:

```text
AMBIENTE
```

Obligatorio:

```text
Sí
```

---

## Capacidad

Tipo:

```text
Número
```

Obligatorio:

```text
Sí
```

Validación:

```text
Mayor a cero
```

---

## Tipo de Mesa

Tipo:

```text
Select
```

Fuente:

```text
TIPO_MESA
```

---

## Estado

Tipo:

```text
Switch
```

---

## Código QR

Tipo:

```text
Generado automáticamente
```

Formato:

```text
/cliente/mesa/{idMesa}
```

---

# Vista QR

## Objetivo

Permitir descargar o imprimir el QR de cada mesa.

### Información

```text
Número de Mesa

Ambiente

Código QR

URL Generada
```

### Acciones

```text
Descargar PNG

Descargar PDF

Imprimir
```

---

# Acciones Disponibles

## Crear Ambiente

```text
Registrar ambiente.
```

---

## Crear Mesa

```text
Registrar mesa.
```

---

## Editar

```text
Actualizar ambiente o mesa.
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

## Generar QR

```text
Generar QR de acceso para autoservicio.
```

---

# Reglas de Negocio

## BR-EST-007

```text
Una mesa solo puede tener una comanda abierta.
```

---

## BR-RES-013

```text
Una mesa solo puede tener una comanda activa.
```

---

## BR-ACC-037

```text
Al abrir una comanda la mesa pasa a OCUPADA.

Al facturar o anular vuelve a LIBRE.
```

---

## BR-RES-052

```text
Las reservas online se confirman asignando una mesa libre.
```

---

## BR-RES-018

```text
La capacidad debe ser mayor a cero.
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
MESA_VER
```

### Crear

```text
MESA_CREAR
```

### Editar

```text
MESA_EDITAR
```

### Eliminar

```text
MESA_ELIMINAR
```

---

# APIs

## Ambientes

### Listar

```http
GET /api/ambientes
```

### Crear

```http
POST /api/ambientes
```

### Actualizar

```http
PUT /