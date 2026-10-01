# Auditoría

## Información General

### Nombre

Consulta de Auditoría

### Ruta

```text
/admin/auditoria
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/auditoria
```

### Roles Permitidos

```text
ADMIN
GERENTE (consulta)
SUPERVISOR (consulta)
```

### Permisos

```text
AUD_VER (propuesto, validar alta en PERMISO/MODULO)
```

> Hoy citado en roles.md:417 como AUD_VER pero sin spec.
> Este archivo lo formaliza. Sin AUD_VER → 403.

---

# Objetivo

Consultar el historial auditable del sistema (quién hizo qué, cuándo, dónde, antes/después).

Permite:

- Filtrar por usuario, fecha, tabla, acción, terminal/IP.
- Ver detalle anterior/nuevo.
- Exportar filtrado.
- Trazar LOGIN, ventas, NC, caja, reservas, roles.

No permite:

- Editar / eliminar registros (inmutable).
- Limpiar historial.

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR

---

# Layout

## Tipo

```text
Consulta + Drawer Detalle
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header + Breadcrumb                         │
├─────────────────────────────────────────────┤
│ Filtros                                     │
├─────────────────────────────────────────────┤
│ Tabla Auditoría                             │
├─────────────────────────────────────────────┤
│ Drawer Detalle (anterior/nuevo)             │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Header

### Ejemplo

```text
Auditoría

Inicio / Seguridad / Auditoría
```

---

# Sección 2: Filtros

## Usuario

Tipo:

```text
Autocomplete
```

Fuente:

```text
USUARIO
```

---

## Fecha

```text
Desde / Hasta (DateTime)
```

Fuente:

```text
AUDITORIA.Fecha
```

---

## Tabla

Tipo:

```text
Select
```

Opciones:

```text
Todas, USUARIO, VENTA, PEDIDO, DETALLE_PEDIDO,
CAJA, APERTURA_CAJA, MOVIMIENTO_CAJA,
RESERVA, PEDIDO_DELIVERY, ROL, PRODUCTO, CLIENTE
```

---

## Acción

Tipo:

```text
Select
```

Opciones:

```text
Todas, LOGIN, LOGOUT, LOGIN_FALLIDO, BLOQUEO,
CREAR, EDITAR, ANULAR, FACTURAR, NOTA_CREDITO,
APERTURA, CIERRE, ARQUEO, RENDICION,
ASIGNAR_ROL, CONFIRMAR_RESERVA
```

---

## Terminal / IP

Tipo:

```text
Texto
```

Fuente:

```text
AUDITORIA IP / Terminal / PC
```

---

# Sección 3: Tabla

## Columnas

| Campo | Descripción |
|---------|---------|
| Fecha | Fecha/hora acción |
| Usuario | Logeo responsable |
| Tabla | Tabla afectada |
| Acción | Tipo acción |
| Registro | ID afectado |
| IP/Terminal | Origen |
| Acciones | Ver detalle |

Orden default:

```text
Fecha DESC
```

---

# Sección 4: Detalle (Drawer)

Mostrar:

```text
ID auditoría
Fecha
Usuario (logeo + empleado)
Tabla + ID registro
Acción
IP / Terminal / PC
Valor anterior (JSON)
Valor nuevo (JSON)
```

Origen BD:

```text
AUDITORIA (ID_Auditoria, ID_Usuario, Fecha, Tabla, Accion,
ID_Registro, IP, Terminal, ValorAnterior, ValorNuevo)
+ triggers trg_producto_auditoria, trg_venta_auditoria
+ inserts explícitos en USP_LOGIN, USP_FACTURAR_PEDIDO,
  USP_ANULAR_PEDIDO, USP_ANULAR_VENTA_CON_NC,
  USP_APERTURAR_CAJA, USP_CERRAR_CAJA
```

---

# Acciones Disponibles

## Filtrar

```text
Aplica filtros + paginación server-side.
```

---

## Ver Detalle

```text
Drawer con anterior/nuevo.
```

---

## Exportar

```text
Excel/PDF de filtrado actual.
```

Permiso:

```text
AUD_VER (exporta) — si se separa, REP_EXPORTAR.
```

---

# Restricciones

## No Permitido

```text
Modificar o eliminar registros de auditoría.
```

---

## No Permitido

```text
Ver sin AUD_VER.
```

→ 403.

---

# Reglas de Negocio

## BR-ACC-044 (trazabilidad login)

```text
Login/cierre cliente y personal se audita en AUDITORIA.
```

---

## BR-ACC-055 (trazabilidad NC)

```text
Cada NC se audita (quién, qué venta, motivo).
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
AUD_VER
```

---

# APIs

## Listar

```http
GET /api/auditoria?usuario=5&desde=2026-01-01&hasta=2026-12-31&tabla=VENTA&accion=FACTURAR&page=1
```

---

## Detalle

```http
GET /api/auditoria/{id}
```

---

## Exportar

```http
GET /api/auditoria/export/excel?usuario=5&tabla=VENTA
```

---

# Base de Datos

## Tablas

```text
AUDITORIA (inmutable, sin UPDATE/DELETE app)
USUARIO (para filtro y join)
```

## Triggers verificados en yemheng.sql

```text
trg_producto_auditoria → audita INSERT/UPDATE/DELETE producto
trg_venta_auditoria → audita cambio total/anulada en venta
```

## Inserts USP

```text
USP_LOGIN, USP_APERTURAR_CAJA, USP_CERRAR_CAJA,
USP_ABRIR_PEDIDO, USP_FACTURAR_PEDIDO,
USP_ANULAR_PEDIDO, USP_ANULAR_VENTA_CON_NC,
USP_REGISTRAR_MOVIMIENTO_CAJA
```

---

# Auditoría (meta)

> Esta pantalla es la que muestra auditoría; su propia
> consulta también se registra como `CONSULTA_AUDITORIA`.

---

# Estados de Pantalla

## Loading

```text
Skeleton tabla.
```

---

## Sin Datos

```text
No existen registros para los filtros aplicados.
```

---

## Error

```text
No fue posible cargar la auditoría.
```

---

# Responsive

## Desktop

```text
Tabla completa + drawer derecha.
```

---

## Tablet

```text
Tabla resumida + drawer full.
```

---

## Mobile

```text
Cards por registro + detalle full-screen.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given registros de auditoría existentes
When filtra por usuario y rango de fechas
Then ve solo los coincidentes paginados
```

---

## Escenario 2

```gherkin
Given una venta facturada
When abre su registro de auditoría
Then ve anterior/nuevo con total y usuario cajero
```

---

## Escenario 3

```gherkin
Given un usuario sin AUD_VER
When accede a /admin/auditoria
Then recibe 403
```

---

## Escenario 4

```gherkin
Given un LOGIN cliente Gmail
When consulta AUDITORIA
Then existe fila Accion='LOGIN' con CLIENTE/EMAIL e IP
```
