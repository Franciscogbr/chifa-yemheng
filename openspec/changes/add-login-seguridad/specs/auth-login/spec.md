# Spec delta: auth-login

## Endpoints

### POST /api/v1/auth/login
- Body (Zod): `{ logeo: string[3..30], clave: string[1..100] }`.
  Fallo de validación → 400 `{ error: 'VALIDATION_ERROR', details }`.
- 200: `{ token, usuario: { id, logeo, tipo, empleado, cargo },
  roles: string[], permisos: string[], rutaInicial: string }`.
- 401: `{ error: 'CREDENCIALES_INVALIDAS' | 'BLOQUEADO' | 'INACTIVO' }`.
- 500: `{ error: 'INTERNAL_ERROR' }`. 503 si la BD no responde.

### GET /api/v1/auth/permisos
- Requiere `Authorization: Bearer <JWT>` → 401 sin token o inválido.
- 200: `{ permisos: [{ modulo, orden, clave, permiso }] }`.

## Criterios de aceptación (Gherkin, de `login.md`)
1. Cajero válido → JWT y redirección a `/caja`.
2. 2 fallos previos + 3er fallo → `Bloqueado='S'` y mensaje de bloqueo.
3. Usuario bloqueado + clave correcta → rechazo `BLOQUEADO`.
4. Sin JWT a `/admin` o `/caja` → redirección a `/auth/login`.
5. Login OK → menú = unión de permisos (`USP_PERMISOS_USUARIO`).
