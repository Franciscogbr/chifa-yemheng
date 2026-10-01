# Design: add-login-seguridad

## Decisiones
1. **Repositorio via `supabase.rpc`** (`fn_login`, `fn_permisos_usuario`).
   Nunca `pg` directo: el puerto 5432/6543 expira desde esta red.
   (Cloudflare IPs, ETIMEOUT verificado). Solo HTTPS + service_role.
2. **Wrappers espejo v3** (`openspec/database/add-function-connect-supabase/fn-auth.sql`):
   sin `CALL` (falla 42601 en PG 17.6 dentro de funciones guardadas),
   réplica exacta de `yemheng.sql:636-689` y `696-713`. USP intactos.
3. **JWT** con `jsonwebtoken` + `JWT_SECRET` del `.env`, expira 8h,
   payload `{sub, logeo, tipo, roles[], permisos[]}`. Guardado en
   localStorage + header `Authorization: Bearer` (decisión aprobada).
4. **Mapeo 401**: mensaje con 'bloqueado' → `BLOQUEADO`;
   'inexistente, inactivo o bloqueado' → `INACTIVO` si el logeo existe
   pero inactivo/bloqueado (se lee `usuario` para afinar), si no
   `CREDENCIALES_INVALIDAS`; 'Clave incorrecta' → `CREDENCIALES_INVALIDAS`.
5. **Ruta versionada** `POST /api/v1/auth/login` (stack §2 manda `/api/v1`;
   `login.md` la cita sin versión y se unifica aquí).
6. **Guards backend como fábricas** `requireRoles(...)/requirePermisos(...)`
   → 401 sin token, 403 sin rol/permiso. Guards frontend equivalentes
   (`Public/Auth/Role/Permission`) con redirección (`07-ruta-inicial-por-rol.md`):
   ADMIN/GERENTE/SUPERVISOR→`/admin`, CAJERO→`/caja`, MOZO→`/mozo`,
   COCINERO→`/cocina`, REPARTIDOR→`/repartidor`.
7. **Frontend** React Hook Form + Zod con los mismos límites que el
   backend; diseño Yemheng (paleta `#A61E22…`), campo Logeo (no email),
   sin registro ni SSO (prohibido en `login.md`).

## Riesgos
- Deriva espejo↔USP: la cabecera de `fn-auth.sql` fija la fuente y fecha;
  si `usp_login` cambia, actualizar el espejo.
- `fn_login` no distingue inactivo de inexistente en el mensaje: se afina
  leyendo `usuario` solo para el código de error (sin exponerlo).
