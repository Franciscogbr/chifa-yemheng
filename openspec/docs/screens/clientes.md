# Clientes

## Información General

### Nombre

Administración de Clientes

### Ruta

```text
/admin/clientes
```

### Shell

```text
AdminShell
```

### Feature

```text
features/admin/clientes
```

### Roles Permitidos

```text
ADMIN
GERENTE
SUPERVISOR
CAJERO
```

### Permisos

```text
CLI_VER
CLI_CREAR
CLI_EDITAR
CLI_ELIMINAR
```

---

# Objetivo

Administrar los clientes del restaurante.

Permite:

- Registrar clientes naturales.
- Registrar clientes empresa.
- Actualizar datos de contacto.
- Gestionar direcciones de delivery.
- Consultar historial.
- Administrar puntos de fidelidad.
- Asociar clientes provenientes de Gmail.
- Utilizar clientes para ventas, reservas y delivery.

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR
- CAJERO

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
│ Tabla Clientes                              │
├─────────────────────────────────────────────┤
│ Paginación                                  │
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
Clientes

Inicio / Administración / Clientes
```

---

# Sección 2: Acciones Principales

## Nuevo Cliente

```text
Registrar cliente.
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

## Tipo Cliente

Opciones:

```text
Natural
Empresa
```

---

## Documento

Tipo:

```text
Texto
```

---

## Nombre / Razón Social

Tipo:

```text
Texto
```

---

## Correo

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

# Sección 4: Tabla de Clientes

## Columnas

| Campo | Descripción |
|---------|---------|
| Código | Identificador |
| Tipo | Natural / Empresa |
| Documento | DNI o RUC |
| Cliente | Nombre o Razón Social |
| Correo | Email |
| Celular | Contacto |
| Puntos | Programa de fidelidad |
| Estado | Activo/Inactivo |
| Acciones | Ver / Editar / Desactivar |

---

# Modal Crear Cliente

## Tipo Cliente

Opciones:

```text
Natural
Empresa
```

Obligatorio:

```text
Sí
```

---

# Cliente Natural

## Tipo Documento

Fuente:

```text
TIPO_IDENTIDAD
```

Ejemplo:

```text
DNI
CE
PASAPORTE
```

---

## Número Documento

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

---

## Nombres

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

---

## Apellidos

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

---

## Correo Electrónico

Tipo:

```text
Email
```

Obligatorio:

```text
No
```

---

## Celular

Tipo:

```text
Texto
```

---

# Cliente Empresa

## RUC

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
11 dígitos
```

---

## Razón Social

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

---

## Correo

Tipo:

```text
Email
```

---

## Teléfono

Tipo:

```text
Texto
```

---

# Dirección

## Departamento

Tipo:

```text
Select
```

Fuente:

```text
DEPARTAMENTO
```

---

## Provincia

Tipo:

```text
Select
```

Fuente:

```text
PROVINCIA
```

---

## Distrito

Tipo:

```text
Select
```

Fuente:

```text
DISTRITO
```

---

## Dirección

Tipo:

```text
Texto
```

---

## Referencia

Tipo:

```text
Textarea
```

---

# Fidelización

## Puntos Acumulados

Solo lectura.

```text
0
```

---

## Nivel Cliente

Derivado.

Ejemplos:

```text
Bronce

Plata

Oro
```

---

# Información Adicional

## Última Compra

Solo lectura.

---

## Total de Pedidos

Solo lectura.

---

## Total Consumido

Solo lectura.

---

# Cliente Gmail

## Identificación

Clientes provenientes de:

```text
OAuth Google
```

---

## Indicador

Mostrar:

```text
Cliente Gmail
```

---

## Restricción

```text
No debe existir más de un cliente
con el mismo correo electrónico.
```

---

# Acciones Disponibles

## Crear

```text
Registrar cliente.
```

---

## Editar

```text
Actualizar información.
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

## Ver Historial

Abrir detalle de:

```text
Pedidos

Reservas

Ventas

Puntos
```

---

# Historial del Cliente

## Pestaña Pedidos

Mostrar:

```text
Fecha

Tipo

Estado

Total
```

---

## Pestaña Reservas

Mostrar:

```text
Fecha

Mesa

Personas

Estado
```

---

## Pestaña Delivery

Mostrar:

```text
Pedido

Dirección

Estado

Costo Envío
```

---

# Reglas de Negocio

## BR-EST-001

```text
Un cliente puede ser persona natural
o empresa, nunca ambos.
```

---

## BR-INF-050

```text
Cliente frecuente identificado por Gmail.
```

---

## BR-ACC-044

```text
Clientes QR deben autenticarse mediante Gmail.
```

---

## BR-RES-021

```text
Autoconsumo QR requiere identificación Gmail.
```

---

# Seguridad

## Roles

```text
ADMIN
GERENTE
SUPERVISOR
CAJERO
```

---

## Permisos

### Consultar

```text
CLI_VER
```

---

### Crear

```text
CLI_CREAR
```

---

### Editar

```text
CLI_EDITAR
```

---

### Desactivar

```text
CLI_ELIMINAR
```

---

# APIs

## Listar

```http
GET /api/clientes
```

---

## Obtener

```http
GET /api/clientes/{id}
```

---

## Crear

```http
POST /api/clientes
```

---

## Actualizar

```http
PUT /api/clientes/{id}
```

---

## Cambiar Estado

```http
PATCH /api/clientes/{id}/estado
```

---

## Historial

```http
GET /api/clientes/{id}/historial
```

---

# Base de Datos

## Tablas

```text
CLIENTE
PERSONA
EMPRESA
TIPO_IDENTIDAD
DISTRITO
PROVINCIA
DEPARTAMENTO
PEDIDO
RESERVA
VENTA
AUDITORIA
```

---

# Auditoría

Registrar:

```text
Crear cliente

Editar cliente

Activar cliente

Desactivar cliente

Actualizar correo

Actualizar datos de contacto
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
No existen clientes registrados.
```

---

## Error

```text
No fue posible cargar los clientes.
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
Cards por cliente.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un usuario con permiso CLI_CREAR
When registra un cliente natural
Then el sistema almacena correctamente la información
```

---

## Escenario 2

```gherkin
Given un cliente empresa con RUC válido
When se registra
Then puede utilizarse para emitir facturas
```

---

## Escenario 3

```gherkin
Given un cliente autenticado mediante Gmail
When realiza un pedido QR
Then el sistema asocia el pedido a su registro de cliente
```

---

## Escenario 4

```gherkin
Given un correo ya registrado
When se intenta crear otro cliente con el mismo correo
Then el sistema rechaza la operación
```

---

## Escenario 5

```gherkin
Given un cliente con historial de compras
When se consulta su detalle
Then el sistema muestra pedidos, reservas y consumo acumulado
```