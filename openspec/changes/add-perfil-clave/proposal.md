# Proposal: add-perfil-clave

## Por qué
El header muestra usuario sin acciones y el logout está abajo suelto.
Se pide display con `Ver perfil / Cerrar sesión` y que el perfil permita
cambiar contraseña (único editable seguro sin romper RBAC).

## Qué
- Avatar → dropdown `Ver perfil / Cerrar sesión` (se quita botón inferior).
- Modal perfil: lectura (empleado, logeo, cargo, tipo, id) + form clave
  `actual / nueva / repetir` (mín 4, `nueva===repetir`, `nueva!==actual`).
- Backend `PATCH /auth/clave` + `fn_cambiar_clave` (sha256, bloqueo 3).
- SQL en `openspec/database/alter-data/add-auth-clave/`.

## No objetivos
- Editar cargo/tipo/rol/logeo desde perfil (rompe RBAC, exige `EMP_EDITAR`).
- Email/teléfono (no existen en `AuthUsuario`).
- Tema/hero (van en su propio change de layout).
