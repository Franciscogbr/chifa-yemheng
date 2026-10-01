# Proposal: add-cliente-login-prueba

## Por qué
El flujo QR→cliente no se puede probar de extremo a extremo: el QR impreso
codifica `yemheng.pe/m/...` sin esquema y no existe ninguna ruta `/cliente/*`.
Se necesita una página de prueba visual que valide escaneo → URL → render
con `?mesa=`, sin construir OAuth ni sesión (alcance grande, fase posterior).

## Qué
- Página visual `/cliente/login?mesa=<código>`: diseño Stitch adaptado,
  responsive mobile-first, todo deshabilitado con badge `MODO PRUEBA`.
- QR del admin genera URL escaneable `${VITE_PUBLIC_URL}/cliente/login?mesa=<código>`.
- Preparación deploy nube (Vercel + Render) como T6: `vercel.json` + matriz de envs.

## No objetivos
- OAuth Google real, `POST /api/cliente/oauth/google`, sesión cliente.
- Comandas, toma de mesa, puntos, reservas.
- Backend, BD (`codigo_qr` y scripts `add-qr-token` intactos).
- Guards del staff, resto de módulos.
- Credenciales de prueba hardcodeadas (prohibidas; el login staff ya las eliminó).
