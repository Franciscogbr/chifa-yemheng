# Design: add-perfil-clave

## Contrato
| Capa | Decisión |
|---|---|
| SQL | `fn_cambiar_clave(p_id, p_actual, p_nueva)` JSON `ok/mensaje`; verifica `sha256(actual)`, respeta `estado/bloqueado`, `intentos+1` y bloqueo al 3er fallo, actualiza a `sha256(nueva)`, audita `CLAVE_FALLIDA/CAMBIO_CLAVE`. |
| Backend | `PATCH /auth/clave` con `authGuard`. Zod `claveSchema {actual min1, nueva min4 max100}`. Front valida `repetir` (no viaja). `401 ACTUAL_INCORRECTA/BLOQUEADO/INACTIVO`, `400 VALIDATION_ERROR`. Servicio no toca roles/tipo/cargo. Repo vía `supabase.rpc('fn_cambiar_clave')`. |
| Front | `UserMenu` dropdown (Escape/click fuera): `Ver perfil` abre `PerfilModal`; `Cerrar sesión` reutiliza `salir()`. Modal: lectura + 3 inputs password + errores por código + éxito cierra con aviso (sesión sigue). |
| Sidebar | Se quita bloque inferior logout; grupos solo habilitados (change layout). |

## Decisiones
1. Mín 4 (acordado) para `nueva`; `nueva!==actual`.
2. Sesión sigue tras cambio (no logout forzado).
3. `repetir` solo front (no llega al API).
