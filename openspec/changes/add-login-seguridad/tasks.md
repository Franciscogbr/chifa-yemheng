# Tasks: add-login-seguridad

- [ ] T1 Backend: models + schemas Zod (`models/auth.ts`, `schemas/auth.ts`)
- [ ] T2 Backend: `repositories/auth-repository.ts` (rpc `fn_login`, `fn_permisos_usuario`)
- [ ] T3 Backend: `services/auth-service.ts` (mapeo 401, JWT 8h, `rutaInicial`)
- [ ] T4 Backend: `controllers/auth-controller.ts` + `routes/auth.ts` + montar en `app.ts`
- [ ] T5 Backend: `middlewares/auth-guard.ts`, `role-guard.ts`, `permission-guard.ts`
- [ ] T6 Backend: `typecheck` + `build` limpios
- [ ] T7 Frontend: `features/auth/login/` (service, context, form, page)
- [ ] T8 Frontend: guards + rutas (`/auth/login` pública, `/admin` protegida)
- [ ] T9 Frontend: `tsc` + `vite build` limpios
- [ ] T10 Verificación: `fran/fran` → JWT → `/admin`; clave mala → 401;
  ×3 fallos → `BLOQUEADO`; 5 escenarios Gherkin en verde; desbloquear `fran`
- [ ] T11 Archive del change
