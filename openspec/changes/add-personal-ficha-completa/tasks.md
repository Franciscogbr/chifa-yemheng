# Tasks: add-personal-ficha-completa

- [x] T1 Backend maestros: `repositories/maestros-repository.ts` + `services/maestros-service.ts` + `controllers/maestros-controller.ts` + `routes/maestros.ts` + registro en `app.ts`
- [x] T2 Backend personal: `schemas/personal.ts` (6 campos) + `models/personal.ts` + `repositories/personal-repository.ts` (SELECT/mapRow/insert/update)
- [x] T3 Frontend personal: `personal-service.ts` (+4 fetch) + `personal-types.ts` (tipos extendidos, sin CARGOS/CONTRATOS/TURNOS) + `personal-page.tsx` (VACIO, abrirEditar, 6 inputs, columna Distrito, carga paralela + spinner/error)
- [x] T4 Frontend clientes: distrito al endpoint maestros (muere placeholder Lima v1) + backend devuelve `distritoId`
- [x] T6 Picker: `components/distrito-picker.tsx` (buscador interno + teclado + a11y) integrado en personal y clientes (reemplaza selects y el filtro previo de clientes)
- [x] T5 Verificación código: typecheck backend exit 0, build frontend exit 0 (✓ 1.51s), grep `CARGOS|CONTRATOS|TURNOS|DISTRITOS` en `src` = 0. Pendiente manual: endpoints con filas reales + roundtrip crear/editar en BD
- [x] T7 Fix 400 en updates/creates: `distritoId` nulable + `correo` opcional (cliente); `fondoPension/essalud` nulables (personal); services omiten `''` inválidos y `nHijos: null`. Causa: frontend mandaba `razonSocial:''`/`correo:''`/`distritoId:null` que Zod rechazaba.
