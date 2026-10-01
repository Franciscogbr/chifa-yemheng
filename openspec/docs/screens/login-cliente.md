# Login Cliente

## Información General

### Nombre

Identificación del Cliente (Autoconsumo QR)

### Ruta

```text
/cliente/login
```

### Shell

```text
PublicShell
```

### Feature

```text
features/cliente/login
```

### Roles Permitidos

```text
CLIENTE (tras OAuth Google)
```

### Permisos

```text
CLIENTE_QR (propuesto, validar contra tabla PERMISO)
CLIENTE_RESERVA (propuesto)
CLIENTE_PEDIDOS (propuesto)
```

---

# Objetivo

Identificar al cliente en autoconsumo QR y zona cliente con Gmail obligatorio.

Permite:

- Ingresar con Gmail (OAuth Google).
- Asociar o reutilizar CLIENTE por EMAIL.
- Mostrar perfil cargado (nombre/email).
- Mostrar mesas disponibles si entró por QR.
- Registrar auditoría LOGIN.
- Acumular puntos e historial (cliente frecuente).

No permite:

- Login con usuario/clave de personal (ver `login.md`).
- Pedir sin identificarse (Gmail es obligatorio en QR).
- Crear USUARIO (el cliente nunca es USUARIO).

---

# Usuarios Objetivo

- CLIENTE

---

# Layout

## Tipo

```text
Formulario Centrado + OAuth
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Logo + Bienvenida                           │
├─────────────────────────────────────────────┤
│ [Ingresar con Gmail] (OAuth)                │
├─────────────────────────────────────────────┤
│ Perfil cargado (nombre/email/avatar)        │
├─────────────────────────────────────────────┤
│ Mesas disponibles (si vino por QR)          │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Botón Gmail

## Tipo

```text
OAuth Google
```

Obligatorio:

```text
Sí en autoconsumo QR y zona /cliente/...
Excepción: flujo presencial por mozo (pos-mozo.md)
no exige login del cliente.
```

Validación:

```text
EMAIL único en PERSONA. Si existe → reutiliza CLIENTE.
Si no existe → crea PERSONA + CLIENTE Tipo_Cliente='N'.
```

---

# Sección 2: Perfil

Mostrar:

```text
Nombre
Email
Puntos (CLIENTE.Puntos)
```

---

# Sección 3: Mesas Disponibles

Condición:

```text
Si entró por /cliente/mesa/:id con comanda activa
→ se incorpora a la comanda existente (no crea nueva).
Si no hay comanda activa → se crea y mesa pasa a OCUPADA.
```

Fuente:

```text
MESA + VW_MAPA_MESAS
```

---

# Flujo Principal

```text
Ingresar con Gmail
 ↓
Asociar/reutilizar CLIENTE por EMAIL
 ↓
AUDITORIA Accion='LOGIN'
 ↓
Si vino por QR mesa → clienteMesa / comanda compartida
Si vino por web → cliente-inicio (hub)
```

---

# Flujo Alterno

```text
Sin celular o sin deseo QR → atención por mozo (sin login)
CLIENTES VARIOS → venta rápida presencial sin identificación
```

---

# Reglas de Negocio

## BR-RES-021

```text
El autoconsumo QR exige identificación obligatoria con login Gmail.
Si el cliente no desea usar QR o no tiene celular,
un mesero toma el pedido tradicional sin exigir login.
```

---

## BR-ACC-044

```text
En autoconsumo QR el cliente inicia sesión con Gmail (OAuth externo)
de forma obligatoria; el login/cierre se audita en AUDITORIA.
En flujo presencial el mesero toma el pedido sin login del cliente.
```

---

## BR-EST-003

```text
Todo USUARIO es personal; el cliente con Gmail es solo CLIENTE, no usuario.
```

---

## BR-INF-050

```text
Cliente frecuente: se identifica por correo Gmail
y acumula Puntos/historial reutilizando su CLIENTE.
```

---

## BR-EST-001

```text
Un CLIENTE es N (natural, p. ej. Gmail) o J (empresa RUC), nunca ambos (XOR).
El login Gmail siempre crea/usa Tipo_Cliente='N'.
```

---

## BR-ACC-047 (referencia QR)

```text
Al escanear el QR se valida si la mesa posee una comanda activa
(ver cliente-comanda.md: si hay activa se incorpora, si no se crea).
```

---

## BR-RES-024 (referencia QR)

```text
El cliente que escanea el QR de una mesa con comanda activa
se incorpora automáticamente a dicha comanda
(ver cliente-comanda.md, BR-ACC-049).
```

---

# Seguridad

## Guards

```text
PublicGuard para ver /cliente/login
AuthGuard cliente (sesión Gmail + CLIENTE id) para /cliente/...
```

---

## Permisos

```text
CLIENTE_QR
CLIENTE_RESERVA
CLIENTE_PEDIDOS
```

> Propuestos: validar alta en PERMISO/MODULO o mapear a existentes.

---

# APIs

## OAuth Callback

```http
POST /api/cliente/oauth/google
Body: { idToken }
Response: { clienteId, nombre, email, puntos }
```

---

## Sesión Cliente

```http
GET /api/cliente/sesion
```

---

## Cerrar Sesión

```http
POST /api/cliente/logout
```

Audita cierre en AUDITORIA.

---

# Base de Datos

## Tablas

```text
PERSONA (EMAIL UNIQUE, Nombres, Apellidos)
CLIENTE (ID_Persona XOR ID_Empresa, Tipo_Cliente='N', Codigo_Cliente, Puntos)
AUDITORIA (Accion='LOGIN' / 'LOGOUT')
MESA (para derivar comanda activa)
```

> No toca USUARIO / USUARIO_ROL.

---

# Auditoría

Registrar:

```text
LOGIN cliente (CLIENTE id, EMAIL, fecha, IP)
LOGOUT cliente
Creación CLIENTE por primer login Gmail
```

---

# Estados de Pantalla

## Loading

```text
Botón Gmail con spinner durante OAuth.
```

---

## Sin Datos

```text
No aplica.
```

---

## Error

```text
No fue posible validar con Google. Reintente.
```

---

# Responsive

## Desktop

```text
Tarjeta centrada 420px.
```

---

## Tablet

```text
Tarjeta centrada full-width.
```

---

## Mobile

```text
Prioritario: botón Gmail grande, full-screen.
Flujo QR 100% mobile-first.
```

---

# Casos Especiales

## QR con Comanda Activa

```text
No crea nueva comanda (BR-RES-023).
Se incorpora a la existente (BR-ACC-049).
Todos ven mismo acumulado (BR-ACC-050).
```

---

## QR sin Comanda Activa

```text
Crea nueva comanda vía usuario interno AUTOSERVICIO.
Mesa pasa a OCUPADA (BR-ACC-048).
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un cliente con Gmail válido
When pulsa Ingresar con Gmail
Then se asocia su CLIENTE y se audita LOGIN
```

---

## Escenario 2

```gherkin
Given un QR de mesa con comanda activa
When el cliente escanea tras login
Then se incorpora a la comanda existente sin crear otra
```

---

## Escenario 3

```gherkin
Given un cliente sin celular
When pide atención presencial
Then el mozo toma el pedido sin exigir Gmail
```

---

## Escenario 4

```gherkin
Given un primer login Gmail
When el EMAIL no existe en PERSONA
Then se crea PERSONA + CLIENTE N y se audita
```
