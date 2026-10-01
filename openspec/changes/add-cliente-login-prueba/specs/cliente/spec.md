# Spec delta: cliente login prueba

## CLI-LOGIN-P1 · Ruta pública de prueba
La app expone `GET /cliente/login` (shell público, sin guards) que renderiza
la página de prueba. Acepta query `?mesa=<código>`; sin param muestra estado
vacío. Abrirla directo nunca retorna 404 (rewrite SPA).

## CLI-LOGIN-P2 · Chip de mesa real
Si llega `?mesa=` con valor no vacío, la tarjeta muestra el código tal cual
(`Mesa <código>`). No se valida contra BD en esta fase.

## CLI-LOGIN-P3 · Todo deshabilitado y veraz
Botón Google, inputs, checkbox y submit están `disabled` (`readOnly` en inputs).
Badge visible `MODO PRUEBA`. Prohibido: credenciales hardcodeadas, badges SSL,
programas de lealtad inventados, links muertos, auto-registro de clientes.

## CLI-LOGIN-P4 · Nota de fase y salida a staff
La tarjeta informa "Disponible en próxima fase" y enlaza `/auth/login`
para el personal. Sin llamadas API ni sesión.

## CLI-LOGIN-P5 · QR admin apunta a la prueba
El QR renderizado/descargado desde admin codifica
`${VITE_PUBLIC_URL}/cliente/login?mesa=<código>` (código extraído de
`Codigo_QR`); sin código, URL pelada. `codigo_qr` en BD no se modifica.

## CLI-LOGIN-P6 · Sin mesa = entrada web válida
Abrir `/cliente/login` sin `?mesa=` no es error: es el login web normal
(delivery/reservas/hub) en PC y móvil. La tarjeta lo informa como tal.

## CLI-LOGIN-P7 · Derivación futura (solo especificación)
Fase real: con `?mesa=` → `/cliente/mesa/:id` (comanda); sin mesa →
`/cliente/inicio` (hub). No implementado en este change.

## CLI-LOGIN-P8 · Aviso contextual por dispositivo
Sin `?mesa=`: en PC se muestra la entrada web; en móvil (táctil o UA móvil)
se muestra "¿Estás en el local? Apunta tu cámara al QR de tu mesa…".
PC nunca invita a escanear.
