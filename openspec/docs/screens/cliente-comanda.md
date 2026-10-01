# Comanda Cliente (QR)

## Información General

### Nombre

Carta Digital y Comanda Compartida

### Ruta

```text
/cliente/comanda
```

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/comanda
```

### Roles Permitidos

```text
CLIENTE
```

### Permisos

```text
CLIENTE_QR
```

---

# Objetivo

Permitir que los clientes autenticados mediante QR visualicen la carta digital, agreguen productos y administren la comanda compartida de una mesa.

Permite:

- Explorar categorías.
- Buscar productos.
- Ver detalles de productos.
- Agregar productos a la comanda.
- Registrar observaciones.
- Visualizar participantes.
- Consultar consumo acumulado.
- Enviar productos a cocina.
- Solicitar cuenta.

---

# Usuarios Objetivo

- CLIENTE

---

# Concepto de Negocio

## Comanda Compartida

```text
Una mesa tiene una única comanda activa.

Todos los clientes autenticados mediante
el QR de la misma mesa participan de esa
misma comanda.

Los productos agregados por cualquier
participante se consolidan en una única cuenta.
```

---

# Layout

## Tipo

```text
Carta Digital + Carrito Compartido
```

## Estructura General

```text
┌───────────────────────────────┐
│ Mesa y Participantes          │
├───────────────────────────────┤
│ Buscador                      │
├───────────────────────────────┤
│ Categorías                    │
├───────────────────────────────┤
│ Productos                     │
├───────────────────────────────┤
│ Resumen Comanda               │
├───────────────────────────────┤
│ Acciones                      │
└───────────────────────────────┘
```

---

# Sección 1: Información de Mesa

## Mostrar

```text
Mesa

Ambiente

Estado

Hora Ingreso
```

### Ejemplo

```text
Mesa 12

Primer Piso

OCUPADA

13:15
```

---

# Participantes

## Mostrar

```text
Clientes conectados a la mesa.
```

### Ejemplo

```text
Juan Pérez

María López

Carlos Ramos
```

---

# Indicador

Mostrar:

```text
3 Participantes
```

---

# Sección 2: Buscador

## Campo

Tipo:

```text
Texto
```

Permite buscar por:

```text
Nombre

Categoría
```

---

# Sección 3: Categorías

## Mostrar

```text
Entradas

Sopas

Platos

Bebidas

Postres
```

---

## Componente

```text
Tabs horizontales
```

---

# Sección 4: Productos

## Tarjeta Producto

Mostrar:

```text
Imagen

Nombre

Descripción

Precio

Disponibilidad
```

---

### Ejemplo

```text
Chaufa Especial

Arroz salteado con pollo y cerdo.

S/. 25.00
```

---

# Disponibilidad

## Disponible

```text
Puede agregarse.
```

Color:

```text
Verde
```

---

## Agotado

```text
No disponible.
```

Color:

```text
Rojo
```

---

# Acción

```text
Agregar
```

---

# Modal Agregar Producto

## Información

```text
Nombre

Precio

Descripción
```

---

## Cantidad

Tipo:

```text
Número
```

Mínimo:

```text
1
```

---

## Observaciones

Tipo:

```text
Textarea
```

Ejemplos:

```text
Sin cebolla

Sin ají

Extra salsa
```

---

## Acción

```text
Agregar a comanda
```

---

# Sección 5: Resumen de Comanda

## Objetivo

Mostrar los productos agregados por todos los participantes de la mesa.

---

# Información Visible

| Campo | Descripción |
|---------|---------|
| Producto | Nombre |
| Cantidad | Cantidad |
| Agregado por | Participante |
| Precio | Precio unitario |
| Importe | Subtotal |

---

# Ejemplo

```text
1 Chaufa Especial

Agregado por Juan
```

```text
2 Inka Cola

Agregado por María
```

```text
1 Wantán Frito

Agregado por Carlos
```

---

# Totales

## Cantidad Productos

```text
Total de ítems.
```

---

## Total Mesa

```text
Consumo acumulado.
```

Ejemplo:

```text
S/. 86.00
```

---

# Estados de Ítems

## Pendiente

```text
Aún no enviado a cocina.
```

---

## En Preparación

```text
Cocina trabajando.
```

---

## Servido

```text
Entregado al cliente.
```

---

## Anulado

```text
Cancelado por cocina.
```

---

# Sección 6: Acciones

## Enviar a Cocina

```text
Confirma los productos pendientes.
```

---

## Ver Mi Consumo

Redirige a:

```text
/cliente/mi-consumo
```

---

## Solicitar Cuenta

```text
Solicita la atención de caja.
```

---

# Confirmación de Envío

## Mensaje

```text
¿Desea enviar los productos a cocina?
```

---

## Resultado

```text
Los productos pasan a preparación.
```

---

# Solicitar Cuenta

## Confirmación

```text
¿Desea solicitar la cuenta?
```

---

## Resultado

```text
La mesa cambia a estado POR COBRAR.
```

---

# Restricciones

## No Permitido

```text
Agregar productos cuando la mesa
esté en estado POR COBRAR.
```

---

## No Permitido

```text
Agregar productos agotados.
```

---

## No Permitido

```text
Modificar productos ya enviados
a cocina.
```

---

# Reglas de Negocio

## BR-EST-011

```text
La comanda pertenece a la mesa
y no al cliente individual.
```

---

## BR-EST-012

```text
Todos los clientes autenticados
mediante el mismo QR participan
de la misma comanda activa.
```

---

## BR-EST-013

```text
Una mesa puede tener múltiples
participantes asociados.
```

---

## BR-EST-014

```text
Un cliente participa simultáneamente
en una sola comanda activa por mesa
(ver login-cliente.md: un QR = una comanda).
```

---

## BR-RES-021

```text
El autoconsumo QR requiere
autenticación mediante Gmail.
```

---

## BR-RES-022

```text
Solo se muestran productos
disponibles y con stock.
```

---

## BR-RES-025

```text
Todos los productos agregados por
los participantes de la mesa se
consolidan en una única comanda.
```

---

## BR-RES-026

```text
La solicitud de cuenta afecta
a toda la mesa.
```

---

## BR-RES-029

```text
Una mesa POR COBRAR no admite
nuevos productos.
```

---

## BR-ACC-050

```text
Todos los participantes visualizan
el mismo consumo acumulado.
```

---

## BR-ACC-051

```text
La acción Pedir Cuenta afecta
a todos los participantes.
```

---

# Seguridad

## Rol

```text
CLIENTE
```

---

## Autenticación

```text
OAuth Google obligatorio
```

---

# APIs

## Obtener Comanda

```http
GET /api/cliente/comanda
```

---

## Obtener Categorías

```http
GET /api/categorias
```

---

## Obtener Productos

```http
GET /api/productos
```

---

## Agregar Producto

```http
POST /api/cliente/comanda/detalles
```

---

## Enviar a Cocina

```http
POST /api/cliente/comanda/enviar
```

---

## Solicitar Cuenta

```http
POST /api/cliente/comanda/cuenta
```

---

## Participantes

```http
GET /api/cliente/comanda/participantes
```

---

# Base de Datos

## Tablas

```text
PEDIDO

DETALLE_PEDIDO

CLIENTE

MESA

PRODUCTO

CATEGORIA

AUDITORIA
```

---

# Auditoría

Registrar:

```text
Ingreso a mesa

Agregar producto

Enviar a cocina

Solicitar cuenta
```

---

# Estados de Pantalla

## Loading

```text
Skeleton categorías.

Skeleton productos.
```

---

## Sin Productos

```text
No existen productos disponibles.
```

---

## Sin Conexión

```text
Verifique su conexión a internet.
```

---

## Error

```text
No fue posible cargar la carta.
```

---

# Responsive

## Desktop

```text
Carta y comanda visibles simultáneamente.
```

---

## Tablet

```text
Comanda colapsable lateral.
```

---

## Mobile

```text
Carta optimizada para uso con una mano.

Barra inferior fija con:

- Total Mesa
- Ver Comanda
- Solicitar Cuenta
```

---

# Casos Especiales

## Nuevo Participante

```text
Al escanear el mismo QR,
se incorpora a la comanda existente.
```

---

## Producto Agregado por Otro Participante

```text
Debe aparecer en tiempo real
para todos los integrantes.
```

---

## Mesa en POR COBRAR

```text
Bloquea nuevos pedidos.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given una mesa con una comanda activa
When un nuevo cliente escanea el QR
Then se incorpora a la comanda existente
```

---

## Escenario 2

```gherkin
Given una mesa con varios participantes
When cualquiera agrega productos
Then los productos se muestran para todos
```

---

## Escenario 3

```gherkin
Given una comanda compartida
When un participante envía productos a cocina
Then los productos cambian a estado Pendiente de Preparación
```

---

## Escenario 4

```gherkin
Given una mesa con consumo acumulado
When un participante solicita la cuenta
Then la mesa cambia a estado POR COBRAR
```

---

## Escenario 5

```gherkin
Given una mesa en estado POR COBRAR
When un participante intenta agregar productos
Then el sistema rechaza la operación
```