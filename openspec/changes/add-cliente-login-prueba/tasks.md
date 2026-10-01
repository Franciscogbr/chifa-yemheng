# Tasks: add-cliente-login-prueba

- [x] T1 Docs: `proposal.md` + `design.md` + `tasks.md` + `specs/cliente/spec.md` (sin SQL)
- [x] T2 Frontend página: `features/cliente/login/cliente-login-page.tsx` (Stitch corregido, responsive, todo disabled, badge MODO PRUEBA)
- [x] T2b Textos por escenario: sin-mesa PC = entrada web (delivery/reservas); hero + "¿En el local? Escanea el QR…"
- [x] T2c Detección móvil (`esMovil` pointer coarse + UA) + aviso "¿Estás en el local?" solo en móvil (CLI-LOGIN-P8)
- [x] T3 Ruta: `routes/index.tsx` rama `/cliente/login` con `PublicShell`, sin guards
- [x] T4 Admin QR: `mesas-page.tsx` `qrValor()` → URL prueba + `qrImprimible` + "Se imprimirá como" al editar
- [x] T5 Verificación: `tsc && vite build` OK (dist 658 kB), backend typecheck OK, hovers 108/109 (1 placeholder disabled intencional). Pendiente manual: visual PC + celular LAN
- [x] T6 Deploy prep: `frontend/vercel.json` (build `dist` + rewrite SPA) + scripts Render confirmados (`npm run build` / `npm start`). Pendiente manual: git push, Render back, Vercel front, reimprimir QRs

> REVERTIDO y RE-APLICADO (2026-10-01): se revirtió para descartar causa del
> NETWORK_ERROR; la consola mostró `POST ...192.168.1.5... ERR_CONNECTION_TIMED_OUT`
> con el código ya revertido → causa confirmada: IP LAN cambió (.5→.4),
> `frontend/.env` desactualizado. Login volvió tras corregir IP. Todo lo de
> este change re-aplicado idéntico + build/typecheck/hovers en verde.
