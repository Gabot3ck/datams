# DATA'S & MULTISERVICES — Tax Web

Web de taxes, notaría y servicios corporativos para comunidad hispana en EE.UU con oficina física en Las Vegas.

## Stack

- **Framework**: Astro 6
- **UI interactiva**: React 19 — solo `MegaMenu.tsx` usa `client:load`
- **Estilos**: Tailwind CSS 4 vía `@tailwindcss/vite` + bloque `@theme` en `global.css`
- **Animaciones**: GSAP 3 (hero slider)
- **Tipado**: TypeScript 6 + `@astrojs/check`
- **Fuente**: Roboto woff2 self-hosted en `/public/fonts/roboto/`
- **Node**: >=22.12.0

## i18n — bilingüe sin subdominio

Español default en `/`, inglés bajo `/en/`. Mismo dominio. Sin Astro i18n middleware.

```ts
// Detección en cualquier componente
const lang = Astro.url.pathname.startsWith("/en") ? "en" : "es";
```

- `x-default` → español (audiencia principal)
- hreflang generado en `src/utils/hreflang.ts` — cambiar `SITE_URL` al dominio real
- `BaseLayout.astro` inyecta hreflang, `og:locale`, `html lang` automáticamente

### Patrón de traducciones (inline, no archivos JSON)

```astro
---
interface Props { lang: 'es' | 'en'; }
const { lang } = Astro.props;
const t = { es: { heading: "Español" }, en: { heading: "English" } }[lang];
---
<h1>{t.heading}</h1>
```

### Rutas por crear

| ES | EN |
|----|----|
| `/contacto` | `/en/contact` |
| `/nosotros` | `/en/about` |
| `/blog` | `/en/blog` |
| `/taxes/*` | `/en/taxes/*` |
| `/notaria/*` | `/en/notary/*` |
| `/inmigracion/*` | `/en/immigration/*` |
| `/itin-ein/*` | `/en/itin-ein/*` |
| `/irs/*` | `/en/irs/*` |
| `/negocio/*` | `/en/business/*` |
| `/dmv/*` | `/en/dmv/*` |
| `/corte/*` | `/en/court/*` |
| `/otros/*` | `/en/other/*` |

## Estructura de archivos

```
src/
├── assets/images/banners/    # Slides hero: slide_tax_1/2/3_d.png (misma img en m/t/d por ahora)
├── components/
│   ├── Hero.astro            # Slider 3 slides, GSAP, responsive images via astro:assets
│   ├── HomePage.astro        # Todas las secciones del home
│   ├── Navbar.astro          # Header sticky: idioma + megamenú + mobile
│   ├── MegaMenu.tsx          # React — portal a document.body, tabs por clic
│   ├── MegaMenuPanel.tsx     # Panel del megamenú: grid 2 cols de items + imagen + footer link
│   ├── Breadcrumb.astro      # Breadcrumb reutilizable con JSON-LD BreadcrumbList
│   ├── Footer.astro          # Footer con 8 links de categorías + contacto (HTML estático)
│   └── BaseLayout.astro      # Layout raíz con SEO completo — incluye Navbar + Footer
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro           # Home ES
│   └── en/index.astro        # Home EN
├── styles/global.css         # @theme tokens, fuentes, .container-custom, .title, .subtitle
└── utils/hreflang.ts         # getHreflangUrls(pathname) + SITE_URL
public/
├── assets/icons/             # flag_mexico.webp, flag_usa.webp
├── fonts/roboto/             # roboto-regular.woff2, roboto-bold.woff2
└── scripts/
    └── hero-slider.js        # Lógica real del slider (prev/next/dots/autoplay/keyboard/swipe)
```

## Componentes — notas críticas

### Hero.astro
- Props: `lang`, `autoplay`, `interval`, `classSection`, `id`
- Dos `<script>` blocks: `is:inline src="/scripts/hero-slider.js"` (lógica del slider) + GSAP (animaciones panel)
- **IMPORTANTE**: `hero-slider.js` cargado con `<script is:inline src="/scripts/hero-slider.js">` — sin esto los botones no funcionan
- `public/scripts/hero-slider.js` maneja: prev/next/dots/autoplay/keyboard/swipe/WeakMap state
- GSAP anima title → subtitle → cta en secuencia via `MutationObserver` en `opacity-100`
- Imágenes: actualmente misma PNG para m/t/d. Reemplazar con versiones reales responsive

### HomePage.astro — secciones en orden

```
1. <Hero lang={lang} />                    ← slider de imágenes
2. Community & Stats                        ← 2 cols: copy + grid 2×2 stats  ← NUEVO
3. Services                                 ← 3 tarjetas (Taxes, Notaría, Business)
4. Stats bar                                ← fondo accent, 4 números horizontales
5. Why Us                                   ← checklist 2 cols
6. CTA Banner                              ← fondo accent-dark, conversión final
```

La sección **Community & Stats** (nueva, después del hero):
- Izquierda: label con punto rojo, H2 bicolor (`t.community.heading.pre + accent + post`), descripción, CTA, trust indicators con checkmarks
- Derecha: `<dl>` grid 2×2 con bordes via `class:list` condicional por índice (`i===1||3` → `border-l`, `i===2||3` → `border-t`)
- Hover en cada celda: número cambia a `brand-light`
- Bilingüe: traducciones en `t.community` dentro de `HomePage.astro`

### Navbar.astro — menú de servicios reales

5 items con mega menú + 3 links simples:

| Label | Tabs del mega menú |
|-------|--------------------|
| Taxes | Taxes Personales · Taxes de Negocio · IRS & Resolución Fiscal |
| ITIN / EIN | ITIN & EIN (3 items) |
| Notary Public | Poderes · Declaraciones · Propiedad · Apostillas |
| Inmigración | Trámites Migratorios · Documentos y Apoyo |
| Más Servicios | Business · DMV · Formularios Corte · Otros |
| Nosotros / Blog / Contacto | — links simples |

URLs siguen patrón SEO semántico: `/taxes/declaracion-personal`, `/notaria/power-of-attorney`, etc. Páginas aún no existen — links listos cuando se creen.

**Interface `NavItem`** — campos relevantes:
```ts
interface NavItem {
  label: string;
  href: string;           // '#' solo en "Más Servicios" (sin pilar único)
  megaMenu?: MegaSubcategory[];
  miniLinks?: MegaMiniLink[]; // solo en "Más Servicios": [Negocio, DMV, Corte, Otros]
}
```

**Interlinking en mobile**: dentro de cada `<details>` de categoría, después del listado de sub-tabs:
- Si `item.href !== '#'` → link "→ Ver todos los servicios de X" con `border-t`
- Si `item.miniLinks` → los 4 mini-links separados por `·` con `border-t`

### MegaMenu.tsx (React)
- Portal a `document.body` — evita `overflow:hidden` del header
- `panelTop` calculado desde `header.getBoundingClientRect().bottom`
- **Apertura por clic** (no hover) — no cambiar este comportamiento
- Cierre con delay 150ms (`CLOSE_MS`) — permite mover cursor al panel
- Animaciones: `animate-mega-open` / `animate-mega-close` en `global.css`
- Props nuevas: `lang`, `pillarUrl` (`item.href` si no es `#`), `categoryLabel` (`item.label`), `miniLinks`
- Exports: `MegaSubItem`, `MegaSubcategory`, `MegaMiniLink`

### MegaMenuPanel.tsx
- Tabs: `onMouseEnter` cambia tab activo
- Columna izquierda: `flex flex-col min-h-[400px]` — grid de items arriba + footer con `mt-auto`
- Imagen a la derecha: hover sobre item → muestra `item.image`, fallback → `subcategory.image`, si nada → div gris
- **Footer del panel** (siempre pegado al fondo, independiente del número de items):
  - Categorías con pilar (`pillarUrl`): text-link `"Ver todos los servicios de X →"` / `"See all services in X →"`
  - "Más Servicios": 4 mini-links separados por `·` (Negocio · DMV · Formularios Corte · Otros)
  - Estilo: `text-sm font-semibold text-brand-light hover:underline` — discreto, NO botón relleno

### Breadcrumb.astro
- Props: `lang: 'es' | 'en'`, `currentLabel: string` (el H1 exacto de la página)
- Infiere categoría desde `Astro.url.pathname` (quita prefijo `/en`, toma primer segmento)
- Caso especial: `/irs/*` se anida bajo Taxes → `Inicio > Taxes > IRS & Resolución Fiscal > {currentLabel}`
- Emite JSON-LD `BreadcrumbList` usando `SITE_URL` de `hreflang.ts`
- Uso: justo debajo del header en cada página de servicio, pasando el H1 como `currentLabel`

### Footer.astro
- HTML estático puro — sin JS, sin hidratación
- Lang inferida desde `Astro.url.pathname` (mismo patrón que Navbar)
- 4 columnas: marca/tagline · **Servicios** (8 links de categoría) · Empresa · Contacto
- Los 8 links de categoría son el interlinking SEO principal — siempre visibles sin JS
- Registrado en `BaseLayout.astro` — aparece en todas las páginas automáticamente

## Sistema de diseño

```css
--color-brand-light:   #CA3626  /* rojo — CTAs, hovers, acentos heading */
--color-brand-dark:    #810C00  /* rojo oscuro — fondos, hover secundario */
--color-accent:        #4d4e4a  /* gris carbón — stats bar bg */
--color-accent-dark:   #e3ab02  /* dorado — badge hero, CTA banner bg */
--color-neutral-dark:  #1a261a  /* casi negro — textos principales, stat numbers */
--color-neutral-grey:  #575756  /* gris medio — textos secundarios */
--color-background-light: #f9f9f9
--color-background-muted: #e0e0e0

/* Breakpoints custom */
lg: 990px  /* ← NO es 1024px estándar de Tailwind */
```

Utilidades globales:
- `.container-custom` — max-w-7xl + padding; >1520px → 80dvw
- `.title` — heading responsivo 1.6rem → 4rem
- `.subtitle` — texto secundario con max-width centrado

## Variables pendientes para producción

| Archivo | Variable | Acción |
|---------|----------|--------|
| `src/utils/hreflang.ts` | `SITE_URL = 'https://tudominio.com'` | Dominio real |
| `src/layouts/BaseLayout.astro` | `siteName = "NOMBRE_SITIO"` | Nombre negocio |
| `src/layouts/BaseLayout.astro` | `ogImage` | URL imagen OG real |
| `src/layouts/BaseLayout.astro` | `google-site-verification` | GSC code |
| `src/pages/index.astro` | `image="/assets/og-image.png"` | Crear OG 1200×675 |

## Pendientes

- [ ] Crear páginas de servicios (ver tabla de rutas)
- [ ] Usar `Breadcrumb.astro` en cada página de servicio (pasar H1 exacto como `currentLabel`)
- [ ] `@astrojs/sitemap` o `public/sitemap.xml`
- [ ] `public/robots.txt`
- [ ] Imagen OG real (`public/assets/og-image.webp`, 1200×675)
- [ ] Imágenes hero responsive reales (mobile/tablet/desktop separadas)
- [ ] Imágenes reales en subcategorías del mega menú (actualmente sin imagen → fondo gris)
- [x] URLs reales en tarjetas de Services del Home (`/taxes`, `/notaria`, `/negocio`)

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # producción
npm run preview  # preview build
```
