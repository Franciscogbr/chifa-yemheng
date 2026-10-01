# Proposal: add-login-seguridad

## Por qué
Sin autenticación no existe el sistema: todo (RBAC, auditoría, rutas por rol,
Fases 2-3) exige JWT + permisos. Hoy `POST /api/v1/auth/login` no existe
(404) y el frontend muestra un placeholder.

## Qué
Login de **personal** según `openspec/docs/screens/login.md`:
- Backend `POST /api/v1/auth/login {logeo, clave}` → `fn_login` (espejo
  verificado de `usp_login`) → JWT 8h + roles + permisos
  (`fn_permisos_usuario`) + `rutaInicial` por rol.
- Backend `GET /api/v1/auth/permisos` (protegida) para el menú RBAC.
- Middlewares `AuthGuard → RoleGuard → PermissionGuard` reutilizables.
- Frontend `features/auth/login`: Logeo + clave con toggle, 3 mensajes de
  error, redirección por rol, guards de ruta. JWT en localStorage.
- Reglas: `BR-ACC-035` (sha256 + bloqueo 3 intentos), `BR-ACC-036`
  (menú por unión de roles/permisos), `BR-EST-003` (solo personal).

## No objetivos
- Login de clientes / OAuth Gmail (`login-cliente.md`, fase posterior).
- Recuperación de clave (la gestiona ADMIN en `usuarios.md`).
- Refresh tokens / sesiones múltiples / 2FA.
- Diseño Stitch 1:1 (se usa como referencia; marca y paleta Yemheng).
