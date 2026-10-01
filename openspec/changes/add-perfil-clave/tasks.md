# Tasks: add-perfil-clave

- [x] T1 SQL: `alter-data/add-auth-clave/01_fn_cambiar_clave.sql` + `README.md`
- [x] T2 Backend: `schemas/auth.ts` (+`claveSchema`), `repositories/auth-repository.ts` (+`rpcCambiarClave`), `services/auth-service.ts` (+`cambiarClaveService`), `controllers/auth-controller.ts` (+`patchClave`), `routes/auth.ts` (+`PATCH /clave`)
- [x] T3 Frontend: `admin-shell.tsx` (grupos display solo habilitados, dropdown `Ver perfil/Cerrar sesión`, sin logout inferior, buscador filtra menú, drawer móvil, tuerca + modal vista claro/oscuro) + `PerfilModal` (lectura + clave actual/nueva/repetir) + `theme-context` + hero swap + `auth-service.cambiarClaveRequest`
- [x] T4 Verificación: typecheck backend OK, build backend OK, tsc/vite build front OK (194 módulos). Pendiente manual + `psql` fn + notificaciones fase 2
