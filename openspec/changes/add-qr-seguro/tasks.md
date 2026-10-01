# Tasks: add-qr-seguro

- [x] T1 BD: `openspec/database/alter-data/add-qr-token/01_alter_mesa_qr_unique.sql` (UNIQUE + COMMENT)
- [x] T2 BD: `openspec/database/alter-data/add-qr-token/02_backfill_mesa_qr.sql` (WHERE NULL, idempotente) + `README.md` (orden, rollback, verificación)
- [x] T3 Backend: `schemas/mesa.ts` (+`regenerarQr`), `repositories/mesas-repository.ts` (`qrPara(numero,token)`, token en crear, mantener/regenerar en actualizar), auditoría `REGENERAR_QR`
- [x] T4 Frontend: `mesas-types.ts`/`mesas-service.ts` (+`regenerarQr`), `mesas-page.tsx` toggle Mantener/Regenerar + previews SVG + warning desincronía + usar `m.qr` real en detalle/hoja
- [x] T5 Verificación: `typecheck` backend OK, `build` backend OK, `tsc && vite build` frontend OK (193 módulos). Pendiente: `psql` constraint + manual `PUT regenerar:true/false` contra Supabase
- [ ] T6 Pendiente fase carta pública: resolver por `codigo_qr`, no por `numero`
