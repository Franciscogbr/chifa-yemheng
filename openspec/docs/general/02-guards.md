# Reglas de Guards

PublicGuard
- Permite acceso sin autenticación.

AuthGuard
- Requiere JWT válido.

RoleGuard
- Requiere rol autorizado.

PermissionGuard
- Requiere permiso específico.

Orden de validación:

1. AuthGuard
2. RoleGuard
3. PermissionGuard