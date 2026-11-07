# Design System — Chifa Yemheng

Fuente de tokens: `frontend/src/index.css` (`@theme` y `:root`).
Nunca usar valores inventados; solo los listados aquí.

## Colores

| Token | Valor | Uso | Source |
|-------|-------|-----|--------|
| `--color-primary` | `#a61e22` | Botones principales, estado activo, texto de sección | frontend/src/index.css |
| `--color-primary-dark` | `#7f1518` | Hover de botones primarios, acentos oscuros | frontend/src/index.css |
| `--color-primary-light` | `#b3282a` | Variantes claras de primario | frontend/src/index.css |
| `--color-gold` | `#d4a017` | Acentos dorados, bordes de estado activo | frontend/src/index.css |
| `--color-gold-light` | `#f6be39` | Fondos claros de advertencia | frontend/src/index.css |
| `--color-gold-dark` | `#795900` | Texto dorado oscuro | frontend/src/index.css |
| `--color-gold-soft` | `#ffdfa0` | Sombras suaves doradas | frontend/src/index.css |
| `--color-tertiary` | `#7c1316` | Terciario | frontend/src/index.css |
| `--color-tertiary-container` | `#9d2c2b` | Contenedor terciario | frontend/src/index.css |
| `--color-surface` | `#fbf9f8` | Fondo general | frontend/src/index.css |
| `--color-surface-lowest` | `#ffffff` | Tarjetas, modales, superficie más clara | frontend/src/index.css |
| `--color-surface-low` | `#f6f3f2` | Fondos secundarios | frontend/src/index.css |
| `--color-surface-container` | `#f0eded` | Contenedores de formulario | frontend/src/index.css |
| `--color-surface-high` | `#eae8e7` | Superficies elevadas | frontend/src/index.css |
| `--color-surface-highest` | `#e4e2e1` | Superficies más elevadas | frontend/src/index.css |
| `--color-surface-dim` | `#dcd9d9` | Bordes suaves | frontend/src/index.css |
| `--color-border` | `#e2bebb` | Bordes estándar | frontend/src/index.css |
| `--color-outline` | `#8e706d` | Outline de inputs y elementos activos | frontend/src/index.css |
| `--color-ink` | `#1b1c1c` | Texto principal | frontend/src/index.css |
| `--color-text-secondary` | `#5a413e` | Texto secundario, muted | frontend/src/index.css |
| `--color-success` | `#22c55e` | Estados de éxito | frontend/src/index.css |
| `--color-warning` | `#f6be39` | Estados de advertencia | frontend/src/index.css |
| `--color-error` | `#ba1a1a` | Estados de error, peligro | frontend/src/index.css |
| `--color-info` | `#2563eb` | Estados informativos | frontend/src/index.css |

## Tipografía

| Token | Valor | Uso | Source |
|-------|-------|-----|--------|
| `--font-sans` | `"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif` | Cuerpo general | frontend/src/index.css |
| `--font-display` | `"Playfair Display", ui-serif, Georgia, serif` | Títulos, display grande | frontend/src/index.css |
| `--font-epilogue` | `"Epilogue", ui-sans-serif, system-ui, sans-serif` | Texto alternativo sans | frontend/src/index.css |
| `--font-newsreader` | `"Newsreader", ui-serif, Georgia, serif` | Lectura larga, serif | frontend/src/index.css |

## Espaciado y bordes

| Token | Valor | Uso | Source |
|-------|-------|-----|--------|
| `--r` | `16px` | Radio de borde estándar (tarjetas, modales) | frontend/src/index.css |
| `--shadow` | `0 4px 16px rgba(166, 30, 34, 0.12)` | Sombra estándar de tarjetas | frontend/src/index.css |

## Reglas de componente

- **Botón primario**: fondo `--color-primary`, texto blanco, hover `--color-primary-dark`, radio 8px, padding 11px 20px, fuente 13px peso 600.
- **Tarjeta (`.y-panel`)**: fondo `--color-surface-lowest`, borde 1px `--color-outline-variant` (`#e2bebb`), radio 16px.
- **Eyebrow (sección)**: texto 11px, peso 700, mayúsculas, letra espaciada 0.12em, color `--color-primary`.
- **Título de sección**: fuente `--font-display`, peso 700, clamp entre 21px y 26px.
- **Hero de flujo (`.y-flow-hero`)**: degradado radial con `--color-gold-soft` al 22% + degradado lineal de `--color-primary-dark` a `--color-primary`, color texto `#fffaf0`, radio 22px, sombra 0 18px 44px rgba(83,15,19,0.2).
- **Estado activo**: fondo `--color-primary` con sombra `--color-primary-dark` al 25%.
- **Estado inactivo**: fondo gris claro `--color-surface-low`, texto `--color-text-secondary`.
