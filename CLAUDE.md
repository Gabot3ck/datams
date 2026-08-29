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
- hreflang generado en `src/config/routes.ts` (`getAlternates`), `SITE_URL` centralizado en `src/config/site.ts`
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

### Registro de rutas (src/config/routes.ts)
ROUTES mapea cada ruta ES a su gemela EN + flag `enBuilt`. getAlternates(pathname) alimenta:
- hreflang en BaseLayout (solo emite `<link hreflang="en">` si enBuilt)
- filtro del sitemap
- switch de idioma del Navbar (cae a `/en` home si no hay gemela construida)

Al crear una página EN: crear el archivo + poner `enBuilt: true` en su entrada.

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
│   ├── BaseLayout.astro      # Layout raíz con SEO completo — incluye Navbar + Footer
│   └── service/              # ServiceHero, TrustBar, ServiceList, RelatedServices, ProcessSteps,
│                              # DocsChecklist, InfoBlock, WhyUs, FaqSection, CtaBanner
├── config/
│   ├── site.ts               # SITE_URL (única var de prod), SITE_NAME, OG_IMAGE, GSC, BUSINESS, helpers JSON-LD, canonicalURL
│   └── routes.ts             # registro ES↔EN + getAlternates() para hreflang/sitemap/switch de idioma
├── layouts/
│   ├── BaseLayout.astro
│   └── ServiceLayout.astro   # BaseLayout + Breadcrumb + JSON-LD Service/FAQPage/ItemList + slot
├── pages/
│   ├── index.astro           # Home ES
│   └── en/index.astro        # Home EN
├── styles/global.css         # @theme tokens, fuentes, .container-custom, .title, .subtitle
public/
├── assets/icons/             # flag_mexico.webp, flag_usa.webp
├── fonts/roboto/             # roboto-regular.woff2, roboto-bold.woff2
├── robots.txt
└── scripts/
    └── hero-slider.js        # Lógica real del slider (prev/next/dots/autoplay/keyboard/swipe)
scripts/
└── check-links.mjs           # verificador de enlaces internos post-build (+ check-links.test.ts)
vitest.config.ts              # tests con Vitest + Container API de Astro
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
- Emite JSON-LD `BreadcrumbList` usando `SITE_URL` de `src/config/site.ts`
- Uso: justo debajo del header en cada página de servicio, pasando el H1 como `currentLabel`

### Footer.astro
- HTML estático puro — sin JS, sin hidratación
- Lang inferida desde `Astro.url.pathname` (mismo patrón que Navbar)
- 4 columnas: marca/tagline · **Servicios** (8 links de categoría) · Empresa · Contacto
- Los 8 links de categoría son el interlinking SEO principal — siempre visibles sin JS
- Registrado en `BaseLayout.astro` — aparece en todas las páginas automáticamente

### Páginas de servicio (src/components/service/ + ServiceLayout.astro)
- Patrón: un `.astro` por página que compone componentes de sección dentro de `<ServiceLayout>`.
- ServiceLayout props: `title`, `description`, `lang`, `breadcrumbLabel` (= H1 exacto), `service {name, serviceType}`, `faqs?`, `itemList?`.
- El array `faqs` se pasa a la vez a `<ServiceLayout>` (para JSON-LD FAQPage) y a `<FaqSection>` (para render).
- Los componentes son "tontos": todo el contenido entra por props/slot; `lang` solo cambia strings fijos de UI.
- Estilos: derivados de la primera versión de `/taxes/index.astro`. No hardcodear hex — usar tokens.
- URLs: pilares con barra final (`/taxes/`), hijas sin (`/taxes/enmiendas`). `canonicalURL()` lo normaliza.

## Sistema de diseño

```css
--color-brand-extralight: #FBCFD4
--color-brand-light:      #DB757F  /* rosa — hovers, acentos de heading, borde animado */
--color-brand:            #8b1d28  /* vino — CTAs principales, texto de marca */
--color-brand-dark:       #63050E  /* vino oscuro — hover de CTA */
--color-accent:           #5b5a5c  /* gris carbón — fondo trust bar */
--color-accent-light:     #9A999B
--color-accent-extralight:#c5c5c5
--color-accent-dark:      #e3ab02  /* dorado — checks de trust bar */
--color-neutral-dark:     #1a261a  /* textos principales */
--color-neutral-grey:     #5b5a5c  /* textos secundarios */
--color-midnight:         #1A1A1D  /* fondo de CtaBanner */
--color-cream:            #FAF7F2  /* fondo de WhyUs */
--color-background-light: #f9f9f9
--color-background-muted: #e0e0e0

/* Breakpoints custom */
lg: 990px  /* ← NO es 1024px estándar de Tailwind */
```

**Tipografía:** `font-display` (clase `.font-display`) = Playfair Display serif, cargada por Google Fonts en `BaseLayout.astro`. Cuerpo = Roboto self-hosted (`body` en `global.css`).

Utilidades globales:
- `.container-custom` — max-w-7xl + padding; >1520px → 80dvw
- `.title` — heading responsivo 1.6rem → 4rem
- `.subtitle` — texto secundario con max-width centrado

## Variables pendientes para producción

Todo centralizado en `src/config/site.ts`:

| Constante          | Acción para producción                        |
|--------------------|-----------------------------------------------|
| `SITE_URL`         | Dominio real (propaga a canonical, og, sitemap, robots, hreflang) |
| `OG_IMAGE`         | Crear `/public/assets/og-image.webp` 1200×675    |
| `GSC_VERIFICATION` | Código de Google Search Console                |
| `BUSINESS.email`   | Email de contacto real                         |
| Placeholders de contenido | Buscar `[PLACEHOLDER:` en `src/` — precios, PTIN/EFIN, política de citas |

También: `public/robots.txt` tiene el dominio hardcodeado — cambiarlo junto con `SITE_URL`.

## Pendientes

- [x] Sistema de páginas de servicio + clúster Taxes/IRS/ITIN ES (pilar `/taxes/` + `/taxes/declaracion-personal` hechos; resto en Plan 2)
- [x] `@astrojs/sitemap` y `public/robots.txt`
- [ ] Resto de páginas del clúster Taxes/IRS/ITIN ES (Plan 2: `docs/superpowers/plans/`)
- [ ] Tests unitarios de helpers con Vitest (`site.ts` / `routes.ts`) para coverage — hoy solo smoke tests
- [ ] Páginas EN del clúster (arquitectura lista: poner `enBuilt: true` en `routes.ts` al crearlas)
- [ ] Integrar componente de formulario real en `/contacto`
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
