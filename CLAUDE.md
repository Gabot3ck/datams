# DATA'S & MULTISERVICES — Tax Web

Sitio web de servicios de taxes, notaría y corporativos para la comunidad hispana en EE.UU.

## Stack tecnológico

- **Framework**: Astro 6 (SSG/SSR)
- **UI interactiva**: React 19 (solo para MegaMenu via `client:load`)
- **Estilos**: Tailwind CSS 4 (configurado via `@tailwindcss/vite` y bloque `@theme`)
- **Animaciones**: GSAP 3 (hero slider)
- **Tipado**: TypeScript 6 + `@astrojs/check`
- **Fuente**: Roboto (woff2, self-hosted en `/public/fonts/roboto/`)
- **Node**: >=22.12.0

## Arquitectura de i18n (bilingüe sin subdominio)

El sitio sirve **español como idioma por defecto** e **inglés bajo el prefijo `/en/`**, todo dentro del mismo dominio. Esta es la estrategia SEO más robusta para mantener autoridad de dominio única.

### Reglas de rutas

| Idioma   | URL           | Archivo de página                 |
|----------|---------------|-----------------------------------|
| Español  | `/`           | `src/pages/index.astro`           |
| Inglés   | `/en/`        | `src/pages/en/index.astro`        |
| Español  | `/contacto`   | `src/pages/contacto.astro`        |
| Inglés   | `/en/contact` | `src/pages/en/contact.astro`      |
| Español  | `/nosotros`   | `src/pages/nosotros.astro`        |
| Inglés   | `/en/about`   | `src/pages/en/about.astro`        |
| Español  | `/blog`       | `src/pages/blog/index.astro`      |
| Inglés   | `/en/blog`    | `src/pages/en/blog/index.astro`   |

### Detección de idioma

El idioma se infiere automáticamente del pathname de la URL:

```ts
// En cualquier componente Astro
const lang = Astro.url.pathname.startsWith("/en") ? "en" : "es";
```

No se usa ningún middleware de Astro i18n — la detección es por convención de rutas.

### hreflang y SEO multiidioma

Toda la lógica de hreflang vive en `src/utils/hreflang.ts`:

```ts
export const SITE_URL = 'https://tudominio.com'; // ← cambiar al dominio real

export function getHreflangUrls(pathname: string) {
  const cleanPath = pathname.replace('/en', '').replace(/\/$/, '') || '/';
  return {
    es: `${SITE_URL}${cleanPath}`,
    en: `${SITE_URL}/en${cleanPath}`,
    xDefault: `${SITE_URL}${cleanPath}` // Español como x-default
  };
}
```

`BaseLayout.astro` inyecta automáticamente:
- `<link rel="alternate" hreflang="es" />` → versión en español
- `<link rel="alternate" hreflang="en" />` → versión en inglés
- `<link rel="alternate" hreflang="x-default" />` → español (audiencia principal)
- `<html lang="es-US">` o `<html lang="en-US">` según el path
- `og:locale` y `og:locale:alternate` correctos por idioma

### Patrón de traducciones en componentes

Las traducciones se manejan como objetos literales por componente, no con un sistema de archivos `.json` externo. El componente recibe `lang: 'es' | 'en'` como prop:

```astro
---
interface Props { lang: 'es' | 'en'; }
const { lang } = Astro.props;

const t = {
  es: { heading: "Título en español" },
  en: { heading: "English heading" },
}[lang];
---
<h1>{t.heading}</h1>
```

## Estructura de archivos

```
src/
├── assets/
│   └── images/banners/          # Imágenes del hero slider (mobile, tablet, desktop)
├── components/
│   ├── BaseLayout.astro          # Layout raíz con todos los meta tags SEO
│   ├── Hero.astro                # Slider responsivo con GSAP + imágenes optimizadas
│   ├── HomePage.astro            # Secciones: Hero, Services, Stats, WhyUs, CTA
│   ├── MegaMenu.tsx             # Mega menú (React, client:load, usa portal)
│   ├── MegaMenuPanel.tsx        # Panel de contenido del mega menú
│   └── Navbar.astro             # Header sticky: idioma switcher + nav desktop + mobile
├── layouts/
│   └── BaseLayout.astro         # Layout con SEO completo (OG, Twitter, JSON-LD)
├── pages/
│   ├── index.astro              # Home en español
│   └── en/
│       └── index.astro          # Home en inglés
├── styles/
│   └── global.css               # @theme Tailwind, fuentes, utilidades globales
└── utils/
    └── hreflang.ts              # Generador de URLs hreflang
public/
├── assets/
│   ├── icons/                   # flag_mexico.webp, flag_usa.webp
│   └── images/test/             # Imágenes de prueba del menú
├── fonts/roboto/                # Roboto woff2 (self-hosted)
├── scripts/
│   └── hero-slider.js           # Script vanilla del slider (actualmente reemplazado por Hero.astro)
├── favicon.ico / favicon.svg
```

## Componentes clave

### BaseLayout.astro
Recibe: `title`, `description`, `robots?`, `canonical?`, `image?`, `jsonLd?`

- Detecta `lang` automáticamente del pathname
- Genera todos los meta tags: description, OG (og:title, og:description, og:image, og:locale), Twitter cards
- Inyecta JSON-LD via `<script type="application/ld+json">`
- Incluye `<Navbar />` antes del `<slot />`

### Navbar.astro
- Header sticky con `z-50`
- Barra superior: selector de idioma (con banderas) + CTA "Agendar cita"
- Al abrir el selector de idioma: overlay oscuro cubre el nav (z-10) y backdrop fijo (z-40)
- Nav desktop: items con `MegaMenu` (React) o links simples
- Menú mobile: `<details>/<summary>` nativo para categorías y subcategorías
- El switcher de idioma construye la URL alternativa dinámicamente:
  ```astro
  // ES → EN: añade /en al path actual
  // EN → ES: quita /en del path actual
  const altLangUrl = lang === "es"
    ? `/en${currentPath === "/" ? "" : currentPath}`
    : currentPath.replace(/^\/en/, "") || "/";
  ```

### MegaMenu.tsx (React)
- Renderiza el panel via `createPortal` en `document.body` para evitar problemas de `overflow:hidden`
- Calcula `panelTop` desde el `getBoundingClientRect()` del `<header>` para posicionarlo debajo
- Cierre con delay de 150ms (`CLOSE_MS`) para permitir mover el cursor al panel sin que se cierre
- Animaciones CSS: `animate-mega-open` / `animate-mega-close` (definidas en global.css)

### Hero.astro
- Slider de 3 slides con imágenes responsivas (mobile/tablet/desktop) en WebP
- Usa `astro:assets` `getImage()` con múltiples widths para srcset automático
- Animaciones con GSAP: título, subtítulo y CTA aparecen en secuencia al cambiar slide
- `MutationObserver` detecta cambios de clase `opacity-100` en los paneles para disparar la animación
- Soporte completo: autoplay, intervalo configurable, swipe (touch), controles prev/next, dots

### HomePage.astro
Secciones en orden:
1. **Hero** — heading principal + CTAs + trust indicators + tarjeta visual
2. **Services** — 3 tarjetas: Impuestos, Notaría, Servicios Corporativos
3. **Stats** — 4 números: 10+ años, 5000+ clientes, 100% español, 3 oficinas
4. **Why Us** — checklist de 6 puntos en grid 2 columnas
5. **CTA Banner** — banner con fondo accent para conversión final

## Sistema de diseño (Tailwind @theme)

```css
/* Colores principales */
--color-brand-extralight: #DF5E51
--color-brand-light: #CA3626   /* rojo principal — CTAs, hovers */
--color-brand: #a41e11
--color-brand-dark: #810C00    /* rojo oscuro — fondos hero, hover secundario */
--color-accent: #4d4e4a        /* gris carbón — stats background */
--color-accent-dark: #e3ab02   /* amarillo dorado — badge hero, CTA banner */
--color-neutral-dark: #1a261a  /* casi negro verdoso — textos principales */
--color-neutral-grey: #575756  /* gris medio — textos secundarios */
--color-background-light: #f9f9f9
--color-background-muted: #e0e0e0

/* Breakpoints */
xs: 425px | sm: 640px | md: 768px | lg: 990px | xl: 1280px | 2xl: 1536px | 3xl: 1920px
```

### Utilidades globales
- `.container-custom` — max-w-7xl, centrado, padding responsivo; en >1520px cambia a 80dvw
- `.title` — tamaño de heading responsivo (1.6rem → 3rem → 4rem)
- `.subtitle` — texto secundario con max-width centrado

## Variables pendientes de configurar

Antes de ir a producción, actualizar:

| Archivo | Variable | Valor actual | Acción requerida |
|---------|----------|-------------|-----------------|
| `src/utils/hreflang.ts` | `SITE_URL` | `'https://tudominio.com'` | Cambiar al dominio real |
| `src/layouts/BaseLayout.astro` | `siteName` | `"NOMBRE_SITIO"` | Nombre real del negocio |
| `src/layouts/BaseLayout.astro` | `ogImage` | `"https://NOMBRE_SITIO/default-og.webp"` | URL de la imagen OG real |
| `src/layouts/BaseLayout.astro` | `google-site-verification` | `""` | Código de Google Search Console |
| `src/pages/index.astro` | `image` | `"/assets/og-image.png"` | Crear imagen OG real (1200x675) |
| `Navbar.astro` | Logo text | "DATA'S & MULTISERVICES" | Verificar nombre final |

## Páginas por crear

- [ ] `src/pages/contacto.astro` + `src/pages/en/contact.astro`
- [ ] `src/pages/nosotros.astro` + `src/pages/en/about.astro`
- [ ] `src/pages/blog/index.astro` + `src/pages/en/blog/index.astro`
- [ ] Páginas de servicios individuales (taxes, notaría, corporativos)
- [ ] `public/sitemap.xml` o configurar `@astrojs/sitemap`
- [ ] `public/robots.txt`
- [ ] Imagen OG por defecto (`/public/assets/og-image.webp`, 1200×675)

## Convenciones del proyecto

- **Idioma como prop**: todos los componentes reciben `lang: 'es' | 'en'`
- **Traducciones inline**: objeto `t = { es: {...}, en: {...} }[lang]` dentro del componente
- **Rutas EN**: siempre con prefijo `/en/` — no usar parámetros Astro i18n
- **Imágenes**: WebP optimizadas via `astro:assets`, siempre con `alt`, lazy loading en below-the-fold
- **Accesibilidad**: ARIA labels en español o inglés según `lang`, roles semánticos en listas de nav
- **React solo donde hay interactividad**: MegaMenu usa `client:load`; el resto es Astro puro
- **JSON-LD**: cada página define su propio Schema.org en la prop `jsonLd` de `BaseLayout`

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run preview  # preview del build
```
