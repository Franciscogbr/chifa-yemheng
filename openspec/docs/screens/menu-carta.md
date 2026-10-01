# Menú Carta

## Información General

### Nombre

Carta / Menú Cliente QR (Solo Lectura)

### Ruta

```text
/carta
```

> Vista pública de la carta. El pedido se arma en
> `cliente-comanda.md` (/cliente/comanda) o `pos-mozo.md`.

### Shell

```text
PublicShell
```

### Feature

```text
features/carta
```

### Roles Permitidos

```text
Público + CLIENTE
```

### Permisos

```text
Sin permiso (PublicGuard).
```

---

# Objetivo

Mostrar lo vendible al cliente por QR, agrupado por categoría.

Permite:

- Ver categorías y productos disponibles con precio e imagen.
- Buscar por nombre.
- Filtrar por categoría.
- Ver detalle (descripción, tiempo preparación).

No permite:

- Agregar al carrito (eso es `cliente-comanda.md`).
- Ver agotados ni insumos.
- Modificar precios o disponibilidad (eso es `productos.md`).

---

# Usuarios Objetivo

- CLIENTE (QR o web)
- Visitante (pre-visualización)

---

# Layout

## Tipo

```text
Catálogo
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header (logo + buscador)                    │
├─────────────────────────────────────────────┤
│ Tabs / chips Categorías                     │
├─────────────────────────────────────────────┤
│ Grilla Productos (foto, nombre, precio)     │
├─────────────────────────────────────────────┤
│ Drawer Detalle                              │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Filtros

## Buscador

Tipo:

```text
Texto (nombre producto)
```

---

## Categoría

Tipo:

```text
Chips / tabs
```

Fuente:

```text
CATEGORIA_PRODUCTO (Estado='A')
```

---

# Sección 2: Grilla Productos

## Tarjeta

Mostrar:

```text
Imagen
Nombre
Precio (IGV incluido)
Tiempo preparación (PRODUCTO.Tiempo_Prep, referencial)
Badge Disponible
```

Ocultar (regla dura):

```text
Estado='I', Disponible='N', stock 0, Tipo_Producto='I' (insumos).
```

Fuente:

```text
PRODUCTO (Estado='A', Disponible='S', Stock_Actual>Stock_Minimo
o Controla_Stock='N', Tipo_Producto IN ('P','B'))
+ CATEGORIA_PRODUCTO
```

Orden:

```text
Por categoría + más vendidos (VW_PRODUCTOS_MAS_VENDIDOS, opcional).
```

---

# Sección 3: Detalle (Drawer)

Mostrar:

```text
Foto grande, descripción, precio, tiempo estimado,
categoría.
Botón [Agregar] solo si viene de /cliente/comanda
(si es /carta aislada, botón lleva a login QR).
```

---

# Reglas de Negocio

## BR-RES-022

```text
Solo se muestran al cliente los productos DISPONIBLES
y con stock (se ocultan agotados e insumos).
```

## BR-RES-011

```text
Solo se agregan productos ACTIVOS y DISPONIBLES a comanda.
Esta pantalla ya pre-filtra para cumplirlo.
```

---

# Seguridad

```text
PublicGuard. Sin JWT requerido.
```

---

# APIs

## Carta

```http
GET /api/carta?categoria=5&texto=chaufa
Response: [{ id, nombre, precio, imagen, tiempoPrep, categoria }]
```

> Backend aplica filtros BR-RES-022, nunca el frontend solo.

---

## Detalle

```http
GET /api/carta/{id}
```

---

# Base de Datos

## Tablas

```text
PRODUCTO (Codigo, Nombre, ID_Categoria, ID_UnidadMedida,
Tipo_Producto P/B/I, Precio, Tiempo_Prep, Controla_Stock,
Stock_Actual, Stock_Minimo, IGV, Disponible S/N, Imagen, Estado)
CATEGORIA_PRODUCTO
UNIDAD_MEDIDA (solo referencia)
```

---

# Auditoría

```text
No audita consulta (alto volumen).
Solo audita si se deriva a pedido (en cliente-comanda.md).
```

---

# Estados de Pantalla

## Loading

```text
Skeleton cards.
```

---

## Sin Datos

```text
No hay productos disponibles en esta categoría.
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
Grilla 4 columnas.
```

---

## Tablet

```text
Grilla 2-3 columnas.
```

---

## Mobile

```text
Lista 1-2 columnas, mobile-first (QR).
Imágenes optimizadas.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given productos activos, agotados e insumos
When el cliente abre /carta
Then solo ve activos disponibles P/B con stock
```

---

## Escenario 2

```gherkin
Given una categoría vacía
When la selecciona
Then ve mensaje sin datos, no error
```

---

## Escenario 3

```gherkin
Given un producto que se agota
When cocina lo marca A o Disponible N
Then desaparece de la carta en siguiente refresh
```
