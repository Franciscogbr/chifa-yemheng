# Spec delta: auth — cambio de clave desde perfil

## Endpoint (`/api/v1/auth/clave`, `authGuard`)
- `PATCH /` body `{actual: string(1..100), nueva: string(4..100)}`.
- 200 `{ok:true}`; 401 `{error: ACTUAL_INCORRECTA|BLOQUEADO|INACTIVO}`; 400 `VALIDATION_ERROR`.
- Efectos: `clave=sha256(nueva)`, `intentos=0`, auditoría `CAMBIO_CLAVE`; en fallo `intentos+1`/bloqueo y `CLAVE_FALLIDA`.

## Criterios
1. Actual incorrecta → 401, clave intacta, intentos+1.
2. `nueva` corta o igual a actual → 400/validación front.
3. Éxito → login con nueva ok, con vieja falla; sesión actual sigue.
