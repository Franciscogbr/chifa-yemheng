# Login Personal

## Información General

### Nombre

Inicio de Sesión del Personal

### Ruta

```text
/auth/login
```

### Shell

```text
PublicShell
```

### Feature

```text
features/auth/login
```

### Roles Permitidos

```text
Sin rol (público). Tras login exitoso redirige según rol:
ADMIN, GERENTE, SUPERVISOR → /admin
CAJERO → /caja
MOZO → /mozo
COCINERO → /cocina
REPARTIDOR → /repartidor
```

### Permisos

```text
Sin permiso (público, PublicGuard).
Tras login se cargan con USP_PERMISOS_USUARIO.
```

---

# Objetivo

Autenticar al personal interno del restaurante (cajero, mozo, cocina, repartidor, admin).

Permite:

- Iniciar sesión con usuario + contraseña.
- Bloquear tras 3 intentos fallidos.
- Rechazar usuarios inactivos.
- Cargar menú según roles y permisos (RBAC).
- Redirigir a la ruta inicial por rol.
- Registrar último acceso.

No permite:

- Registro autónomo de usuarios.
- Login de clientes (ver `login-cliente.md`).
- Recuperación sin autorización (la hace ADMIN en `usuarios.md`).

---

# Usuarios Objetivo

- ADMIN
- GERENTE
- SUPERVISOR
- CAJERO
- MOZO
- COCINERO
- REPARTIDOR

---

# Layout

## Tipo

```text
Formulario Centrado
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Logo + Nombre Chifa                         │
├─────────────────────────────────────────────┤
│ Formulario Login                             │
│  Usuario                                    │
│  Contraseña                                 │
│  [Ingresar]                                 │
├─────────────────────────────────────────────┤
│ Mensajes de error                           │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Formulario

## Usuario (Logeo)

Tipo:

```text
Texto
```

Obligatorio:

```text
Sí
```

Fuente:

```text
USUARIO.Logeo (UNIQUE)
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

Validación:

```text
Se compara hash sha256 hex en BD (USP_LOGIN).
Nunca se muestra ni se retorna al frontend.
```

---

## Botón Ingresar

```text
POST /api/auth/login
```

Comportamiento:

```text
1. Valida campos requeridos.
2. Invoca USP_LOGIN(p_logeo, p_clave).
3. Si OK → emite JWT + carga permisos (USP_PERMISOS_USUARIO) + redirige por rol.
4. Si falla → muestra mensaje genérico + contador restante.
```

---

# Mensajes y Estados

## Credenciales inválidas

```text
Usuario o contraseña incorrectos. Intentos restantes: N.
```

## Usuario bloqueado

```text
Usuario bloqueado tras 3 intentos. Contacte al administrador.
```

Condición:

```text
USUARIO.Bloqueado = 'S'
```

Desbloqueo:

```text
Solo en usuarios.md por ADMIN/GERENTE (Bloqueado='N', Intentos=0).
```

## Usuario inactivo

```text
Usuario inactivo. Contacte al administrador.
```

Condición:

```text
USUARIO.Estado = 'I'
```

---

# Flujo Principal

```text
Login
 ↓ (OK)
JWT + Roles + Permisos
 ↓
Ruta inicial por rol (ver general/07-ruta-inicial-por-rol.md)
```

---

# Flujo Alterno

```text
Intento 1-2 fallido → Intentos+1, mensaje con restantes
Intento 3 fallido → Bloqueado='S', mensaje bloqueado
JWT inválido/expirado → Logout automático → /auth/login
Sin JWT → PublicGuard redirige a /auth/login
```

---

# Reglas de Negocio

## BR-ACC-035

```text
El personal inicia sesión con login + clave (hash sha256);
se bloquea tras 3 intentos fallidos.
```

Implementación:

```text
USP_LOGIN: valida hash, incrementa Intentos,
bloquea con Bloqueado='S', actualiza F_UltimoAcceso.
```

---

## BR-ACC-036

```text
El menú/permiso que ve cada usuario depende de sus roles
y permisos concedidos (RBAC).
```

Implementación:

```text
USP_PERMISOS_USUARIO: join USUARIO_ROL + ROL_PERMISO
+ PERMISO + MODULO vigentes. Unión de roles activos.
```

---

## BR-EST-003

```text
Todo USUARIO del sistema es personal (empleado);
el cliente con Gmail es solo CLIENTE, no usuario.
```

Implementación:

```text
USUARIO.ID_Empleado NOT NULL → EMPLEADO → PERSONA.
Esta pantalla nunca crea CLIENTE.
```

---

# Seguridad

## Guards

```text
PublicGuard (sin auth para ver el form)
AuthGuard (JWT válido post-login)
RoleGuard + PermissionGuard en destino
```

Orden:

```text
AuthGuard > RoleGuard > PermissionGuard
```

---

## Permisos

```text
Ninguno requerido para ver /auth/login.
```

---

# APIs

## Login

```http
POST /api/auth/login
Body: { logeo, clave }
Response OK: { token JWT, usuario, roles[], permisos[], rutaInicial }
Response 401: { error: CREDENCIALES_INVALIDAS | BLOQUEADO | INACTIVO }
```

---

## Mis Permisos

```http
GET /api/auth/permisos
Header: Authorization Bearer JWT
```

---

# Base de Datos

## Tablas

```text
USUARIO (Logeo UNIQUE, Clave sha256, Intentos, Bloqueado S/N, Estado A/I, F_UltimoAcceso)
USUARIO_ROL
ROL
ROL_PERMISO
PERMISO
MODULO
EMPLEADO
TIPO_USUARIO
```

## Procedimientos

```text
USP_LOGIN(p_logeo, p_clave)
USP_PERMISOS_USUARIO(p_id_usuario)
```

---

# Auditoría

Registrar:

```text
Login exitoso (usuario, fecha, IP, terminal)
Login fallido (logeo intentado, IP)
Bloqueo automático tras 3 intentos
```

Tabla:

```text
AUDITORIA (Accion='LOGIN' / 'LOGIN_FALLIDO' / 'BLOQUEO')
```

---

# Estados de Pantalla

## Loading

```text
Botón con spinner, form deshabilitado.
```

---

## Sin Datos

```text
No aplica.
```

---

## Error

```text
No fue posible conectar con el servidor. Reintente.
```

---

## Sin Conexión

```text
Verifique su conexión.
```

---

# Responsive

## Desktop

```text
Tarjeta centrada 400px.
```

---

## Tablet

```text
Tarjeta centrada full-width con margen.
```

---

## Mobile

```text
Formulario full-screen, teclado adaptado.
```

---

# Casos Especiales

## Sesión Expirada

```text
JWT expirado → logout + mensaje + retorno a /auth/login.
```

---

## Multi-rol

```text
Si tiene N roles, ruta inicial = mayor privilegio
ADMIN > GERENTE > SUPERVISOR > CAJERO > MOZO > COCINERO > REPARTIDOR.
Permisos = unión de roles activos.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un cajero activo con credenciales válidas
When ingresa usuario y clave correctos
Then recibe JWT y es redirigido a /caja
```

---

## Escenario 2

```gherkin
Given un usuario con 2 intentos fallidos
When falla por tercera vez
Then su Bloqueado pasa a 'S' y ve mensaje de bloqueo
```

---

## Escenario 3

```gherkin
Given un usuario bloqueado
When intenta ingresar con clave correcta
Then el sistema rechaza con mensaje de bloqueado
```

---

## Escenario 4

```gherkin
Given un usuario sin JWT
When accede a /admin o /caja
Then es redirigido a /auth/login
```

---

## Escenario 5

```gherkin
Given un login exitoso
When se consulta USP_PERMISOS_USUARIO
Then el menú mostrado corresponde solo a sus permisos concedidos
```

---

# Copy Hero Administrativo (referencia, `login-page.tsx`)

```text
Pill: 益恒 · En servicio
H1: Que no se apague / el fuego
P: Del primer pedido al último cobro: sigue el ritmo del salón aquí y ahora, sin perder un plato.
Badge 1: Salón en llamas / Ocupación y tiempos
Badge 2: Despacho exacto / Cada plato a su mesa
Final: "Aquí nadie trabaja solo: cada rol sostiene el servicio."
Tarjeta: ACCESO INTERNO (sin claims SSL)
Footer: Uso interno · Toda acción queda auditada
```

> Tono llamativo-orientado a personal (variante B + final A).
> Prohibido: claims de cifrado/SSL, poesía gastronómica al comensal.
