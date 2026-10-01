# Mi Clave

## Información General

### Nombre

Cambio de Contraseña Propia

### Ruta

```text
/mi-clave
```

### Shell

```text
StaffShell (personal)
AdminShell (admin)
```

> Accesible desde header/avatar en ambos shells.

### Feature

```text
features/auth/mi-clave
```

### Roles Permitidos

```text
Todos autenticados:
ADMIN, GERENTE, SUPERVISOR, CAJERO, MOZO, COCINERO, REPARTIDOR
```

### Permisos

```text
Sin permiso específico (AuthGuard + JWT propio).
```

---

# Objetivo

Permitir a todo usuario autenticado cambiar su propia contraseña.

Permite:

- Validar contraseña actual.
- Ingresar nueva + confirmación.
- Aplicar políticas de seguridad.
- Actualizar hash en USUARIO.
- Registrar auditoría.
- Cerrar otras sesiones (opcional).

No permite:

- Cambiar clave de otro usuario (eso es `usuarios.md` reset por ADMIN).
- Desbloquearse a sí mismo.
- Ver hash almacenado.

---

# Usuarios Objetivo

- Todo personal autenticado

---

# Layout

## Tipo

```text
Formulario Simple
```

## Estructura General

```text
┌─────────────────────────────────────────────┐
│ Header (Mi Clave)                           │
├─────────────────────────────────────────────┤
│ Contraseña actual                           │
│ Nueva contraseña                            │
│ Confirmar nueva                             │
│ Políticas visibles                          │
│ [Guardar]                                   │
└─────────────────────────────────────────────┘
```

---

# Sección 1: Formulario

## Contraseña Actual

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
Hash actual coincide con USUARIO.Clave.
Si falla → error genérico, no revela cuál campo falló en exceso.
```

---

## Nueva Contraseña

Tipo:

```text
Password con medidor fuerza
```

Obligatorio:

```text
Sí
```

Políticas (sugeridas, validar con negocio):

```text
Mínimo 8 caracteres
Al menos 1 mayúscula + 1 número
Distinta a la actual
```

---

## Confirmación

Tipo:

```text
Password
```

Validación:

```text
Debe coincidir con nueva.
```

---

# Políticas Visibles

```text
- Mínimo 8 caracteres
- La nueva debe ser distinta a la actual
- No se muestra la clave en texto plano
```

---

# Flujo Principal

```text
Ingresa actual + nueva + confirmación
 ↓ valida actual + políticas + coincidencia
 ↓ UPDATE USUARIO.Clave = sha256(nueva), fecmod=NOW()
 ↓ AUDITORIA CAMBIO_CLAVE
 ↓ mensaje éxito + opcional logout otros dispositivos
```

---

# Flujo Alterno

```text
Actual incorrecta → error 401, no actualiza, audita intento
Nueva débil → error validación, no llama API
Confirmación distinta → error validación frontend
```

---

# Reglas de Negocio

## BR-ACC-035 (extensión)

```text
Clave almacenada como hash; su cambio exige validar la actual.
```

---

# Seguridad

## Guards

```text
AuthGuard (JWT válido obligatorio)
```

> Sin RoleGuard/PermissionGuard: todo autenticado puede cambiar la suya.

---

## Anti-patrones

```text
Nunca retornar Clave ni hash al frontend.
Nunca permitir cambio sin actual (evita takeover por sesión abierta).
Rate-limit 5 intentos / 10 min.
```

---

# APIs

## Cambiar Clave

```http
PATCH /api/auth/mi-clave
Header: Authorization Bearer JWT
Body: { claveActual, claveNueva, confirmacion }
Response OK: { mensaje: Clave actualizada }
Response 401: { error: CLAVE_ACTUAL_INVALIDA }
Response 422: { error: POLITICA_INCUMPLIDA | CONFIRMACION_DISTINTA }
```

---

# Base de Datos

## Tablas

```text
USUARIO (Clave VARCHAR(200) sha256 hex, usumod, fecmod, pcmod)
```

Update:

```text
UPDATE USUARIO SET Clave=:hash, usumod=:yo, fecmod=NOW()
WHERE ID_Usuario=:miId AND Clave=:hashActual AND Estado='A'
```

Si `rowcount=0` → actual inválida o inactivo.

---

# Auditoría

Registrar:

```text
CAMBIO_CLAVE exitoso (usuario, fecha, IP)
Intento fallido (usuario, fecha, IP)
```

Tabla:

```text
AUDITORIA
```

> Nunca guardar claves en auditoría, solo el hecho.

---

# Estados de Pantalla

## Loading

```text
Botón Guardar con spinner.
```

---

## Error

```text
No fue posible actualizar. Reintente.
```

---

# Responsive

## Desktop

```text
Tarjeta 480px centrada.
```

---

## Mobile

```text
Full-width, inputs grandes.
```

---

# Criterios de Aceptación

## Escenario 1

```gherkin
Given un cajero autenticado
When ingresa actual correcta + nueva válida coincidente
Then su Clave se actualiza y se audita
```

---

## Escenario 2

```gherkin
Given actual incorrecta
When intenta cambiar
Then recibe 401 y la clave no cambia
```

---

## Escenario 3

```gherkin
Given nueva débil o confirmación distinta
When envía el form
Then ve error de política sin llamar al backend
```
