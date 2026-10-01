# Design: add-cliente-login-prueba

## Contrato
| Capa | Decisión |
|---|---|
| Front página | `features/cliente/login/cliente-login-page.tsx`. Lee `?mesa=` con `useSearchParams`. Sin param → estado vacío ("Abre esta página desde el QR de tu mesa"). `<form onSubmit={preventDefault}>`, cero llamadas API, cero sesión. |
| Responsive | Un solo componente mobile-first (patrón `login-page.tsx` staff): base = tarjeta `max-w-md` centrada; `lg:` = split `lg:grid-cols-12` con narrativa hero real (`hidden lg:flex`). Tailwind v4 (arbitrarios + tokens `@theme`), fuentes ya en `index.html`. |
| Fondo | Local `/img/fachada-yemheng.png` + scrims lacre, `onError` oculta (mismo patrón staff). Sin hotlinks `googleusercontent`. |
| Ruta | `/cliente` con `PublicShell`, **sin `PublicGuard`** (evita rebote a `/admin` con sesión staff abierta durante la prueba en PC). |
| QR admin | `qrValor()` en `mesas-page.tsx`: extrae código tras `/m/` de `Codigo_QR` y devuelve `${VITE_PUBLIC_URL}/cliente/login?mesa=<código>`; sin código → URL pelada. Arregla detalle + hoja de QRs (ambos usan `qrValor`). Nueva `qrImprimible` para el preview del modal + línea "Se imprimirá como: \<url\>" al editar. |
| Deploy | `frontend/vercel.json`: `buildCommand npm run build`, `outputDirectory dist`, rewrite SPA `/(.*) → /index.html` (evita 404 al abrir `/cliente/login?mesa=` directo o desde QR). |

## Correcciones de contenido (mockups Stitch → verdad)
| Mockup | Reemplazo |
|---|---|
| `setCredentials()` + clave `ChifaYemheng2025!` hardcodeada | Eliminado (prohibido por seguridad) |
| `handleLoginSubmit()` → `#error-alert` inexistente | Eliminado; solo `preventDefault` |
| Badge `SSL 256-BIT` / "Cifrado SSL 256-bit Activo" | Falso en `http` LAN → badge `MODO PRUEBA` + pie "Vista de prueba — sin autenticación activa" |
| "Club Dinastía / Reservas Preferenciales / catas" | Inventado → narrativa real: QR de mesa + Gmail en próxima fase (BR-ACC-044) |
| "Crear cuenta gratis" / "Regístrate aquí" | Contradice BR-EST-003 → enlace real `/auth/login` para personal |
| "¿Olvidaste tu contraseña?" muerto | Eliminado; inputs `readOnly` + `disabled` |
| Botones con apariencia activa | `disabled` + `cursor-not-allowed` + `disabled:hover:*` neutro |
| 2 archivos desktop/móvil + Tailwind CDN | Un componente Tailwind v4 del proyecto |

## Decisiones
1. Todo deshabilitado: la prueba valida escaneo→URL→render, no autenticación.
2. Sin `PublicGuard` a propósito (ver contrato).
3. `codigo_qr` en BD intacto: el envoltorio a URL vive solo en `qrValor()` (presentación).
4. Reimpresión obligatoria tras el cambio: PNGs viejos codifican `yemheng.pe/...`.

## Escenarios A/B/C + BRs
| Escenario | Entrada | Destino final | BRs |
|---|---|---|---|
| A 📱 QR salón | `/cliente/login?mesa=<código>` | Gmail → `/cliente/mesa/:id` (comanda) | BR-RES-021, BR-ACC-044/047/048/049, BR-RES-023/024, BR-EST-011/012, def. Autoconsumo QR |
| B 📱 Web sin mesa | `/cliente/login` | Gmail → `/cliente/inicio` (delivery/reservas) | BR-EST-004 (delivery no requiere mesa), BR-RES-052 (reserva online sin mesa), Tramo 8 |
| C 🖥️ PC sin mesa | `/cliente/login` | Igual que B (hub) | Mismas que B; PC jamás lleva `?mesa=` |
| Común | Cliente Gmail = solo CLIENTE | — | BR-EST-003 |

## Aviso contextual (CLI-LOGIN-P8)
Sin `?mesa=`: PC muestra "Entrada web: delivery, reservas y pedidos";
móvil muestra "¿Estás en el local? Apunta tu cámara al QR…".
Detección: `matchMedia('(pointer: coarse)')` + fallback UA (`esMovil`).
Copy final de los 3 estados (mesa / sin-mesa PC / sin-mesa móvil) en la tarjeta.
