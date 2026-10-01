# Detalle Ítem Cocina

## Información General

### Nombre

Gestión de Estado por Ítem (P→E→S/A)

### Ruta

```text
/cocina/item/:id
```

> Detalle del Archivo 3.2. El kanban general vive en
> `cocina-board.md`; este archivo opera un ítem.

### Shell

```text
StaffShell
```

### Feature

```text
features/cocina/detalle-item
```

### Roles Permitidos

```text
COCINERO
SUPERVISOR
```

### Permisos

```text
COCINA_VER
COCINA_ATENDER
COCINA_ANULAR
```

---

# Objetivo

Cambiar el estado de preparación de un ítem, solo por cocina.

Permite:

- Ver detalle del ítem (plato, cantidad, nota, mesa, tiempos).
- Marcar En Proceso (P→E).
- Marcar Servido (E→S).
- Anular por agotado (P→A).
- Ver tiempos de espera/preparación calculados.

No permite:

- Cambiar a mozo/cajero/repartidor (solo COCINA).
- Revertir S→E/P ni A→*.
- Agregar ítems (eso es comanda/pos-mozo).

---

# Usuarios Objetivo

- COCINERO (CHEF / AYUDANTE)
- SUPERVISOR

---

# Layout

## Tipo

```text
Detalle Operativo
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header (N° Pedido + Mesa + Prioridad)       │
├─────────────────────────────────────────────┤
│ Plato + cantidad + nota cocina              │
├─────────────────────────────────────────────┤
│ Estado actual P/E/S/A + tiempos             │
├─────────────────────────────────────────────┤
│ Acciones: [En Proceso] [Servido] [Anular]   │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Detalle

Mostrar:

```text
N° Pedido + Mesa + Ambiente
Producto + Categoría + Área despacho
Cantidad
Nota_Cocina ("sin ají")
F_Solicitud + minutos espera (ahora − F_Solicitud)
F_Atencion + tiempo preparación (F_Atencion − F_Solicitud)
Estado_Preparacion actual
```

Fuente:

```text
DETALLE_PEDIDO + PEDIDO + PRODUCTO + CATEGORIA_PRODUCTO
+ MESA + VW_COMANDA_COCINA
```

Prioridad visual (igual que cocina-board.md):

```text
Normal / Atención >15m / Crítico >30m
```

---

# Sección 2: Acciones

## En Proceso

```text
P → E
```

Condición:

```text
Estado actual = P.
```

Efecto:

```text
F_Atencion = NOW(). Comanda puede pasar a EN_PREPARACION
si es el primer ítem (BR-INF-047).
```

---

## Servido

```text
E → S
```

Condición:

```text
Estado actual = E.
```

Efecto:

```text
Si todos los ítems en S → pedido SERVIDO (BR-INF-048).
El mozo lleva el plato a la mesa.
```

---

## Anular (Agotado)

```text
P → A
```

Condición:

```text
Solo desde P, con motivo (agotado).
```

Efecto:

```text
Excluye de FN_TOTAL_PEDIDO y de VW_COMANDA_COCINA.
Ya no se ofrece (disponibilidad).
```

Permiso:

```text
COCINA_ANULAR
```

---

# Restricciones

## No Permitido

```text
S → E / S → P / A → cualquier estado.
```

---

## No Permitido

```text
Cambio por rol distinto a COCINA.
```

→ `BR-RES-020`. El backend debe rechazar aunque se invoque directo.

---

# Reglas de Negocio

## BR-ACC-038

```text
Transiciones del ítem: P→E→S, y P→A si se descarta por agotado.
```

## BR-RES-020

```text
El estado de preparación solo lo cambia personal de COCINA
(CHEF / AYUDANTE).
```

## BR-INF-047

```text
La comanda está EN_PREPARACION si al menos un ítem está en E.
```

## BR-INF-048

```text
La comanda está SERVIDO si TODOS sus ítems están en S.
```

## BR-DER-034

```text
Tiempo preparación = F_Atencion − F_Solicitud;
espera = ahora − F_Solicitud (calculado, no almacenado).
```

---

# Seguridad

## Roles

```text
COCINERO
SUPERVISOR
```

## Permisos

```text
COCINA_VER
COCINA_ATENDER
COCINA_ANULAR
```

---

# APIs

## Detalle Ítem

```http
GET /api/cocina/items/{id}
```

---

## Cambiar Estado

```http
PATCH /api/cocina/items/{id}/estado
Body: { estado: E | S | A, motivo? }
```

> Nuevo USP brecha REGLAS §6 (hoy update directo + autorización por rol).

---

# Base de Datos

## Tablas

```text
DETALLE_PEDIDO (Estado_Preparacion P/E/S/A, F_Solicitud, F_Atencion,
Nota_Cocina, Cantidad, ID_Pedido, ID_Producto)
PEDIDO (para derivar estado cabecera)
PRODUCTO
```

## Procedimiento (a crear, brecha)

```text
USP_CAMBIAR_ESTADO_ITEM (valida rol COCINA + transición legal)
USP_DERIVAR_ESTADO_PEDIDO (EN_PREPARACION / SERVIDO por ítems)
```

Mientras no exista USP:

```text
UPDATE controlado + check rol + auditoría.
```

---

# Auditoría

Registrar:

```text
P→E, E→S, P→A (ítem, pedido, usuario cocina, fecha, motivo)
```

---

# Estados de Pantalla

## Loading

```text
Skeleton detalle.
```

---

## Error

```text
No fue posible cargar el ítem.
```

---

# Responsive

## Desktop

```text
Detalle + tiempos lado a lado.
```

---

## Tablet (cocina)

```text
Botones grandes táctiles, polling 5s.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un ítem en P
When cocina marca En Proceso
Then pasa a E con F_Atencion registrada
```

---

## Escenario 2

```gherkin
Given un ítem en E y resto en S
When marca Servido
Then el pedido deriva a SERVIDO
```

---

## Escenario 3

```gherkin
Given un mozo sin rol COCINA
When intenta cambiar P→E
Then el sistema rechaza 403 (BR-RES-020)
```

---

## Escenario 4

```gherkin
Given un ítem en S
When intenta revertir a E
Then el sistema rechaza transición ilegal
```
