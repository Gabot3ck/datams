# Tax & Notaría

Sitio web bilingüe (español/inglés) para servicios de impuestos, notaría y servicios corporativos dirigido a la comunidad hispana en Estados Unidos.

**Stack**: Astro 6 · Tailwind CSS v4 · React 18 · TypeScript (modo estricto)

---

## Requisitos

- Node.js >= 22.12.0

## Instalación

```bash
npm install
cp .env.example .env   # configurar variables de entorno
```

## Variables de entorno

| Variable          | Descripción                                          |
| :---------------- | :--------------------------------------------------- |
| `PUBLIC_API_BASE` | URL del API backend (envío del formulario de contacto) |

## Comandos

| Comando            | Acción                                        |
| :----------------- | :-------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo en `localhost:4321`    |
| `npm run build`    | Compila el sitio estático en `./dist/`        |
| `npm run preview`  | Previsualiza el build de producción           |
| `npx astro check`  | Verificación de tipos TypeScript              |

---

## Estructura del proyecto

```
src/
├── layouts/
│   └── BaseLayout.astro        # Único layout; SEO completo (OG, Twitter Cards, hreflang, JSON-LD)
├── components/
│   ├── Navbar.astro            # Navbar bilingüe con mega menú y selector de idioma
│   ├── MegaMenu.tsx            # Componente React: mega menú con tabs, grilla e imagen preview
│   ├── MegaMenuPanel.tsx       # Panel del mega menú (extraído de MegaMenu.tsx)
│   └── HomePage.astro          # Mockup de homepage; acepta prop lang="es"|"en"
├── pages/
│   ├── index.astro             # Ruta /    → español (es-US)
│   └── en/
│       └── index.astro         # Ruta /en  → inglés  (en-US)
├── styles/
│   └── global.css              # Tailwind v4 + tokens del tema + clases utilitarias globales
└── utils/
    └── hreflang.ts             # Genera URLs hreflang para es, en y x-default

public/
├── assets/
│   ├── icons/                  # Banderas WebP (flag_mexico.webp, flag_usa.webp)
│   └── images/                 # Imágenes del sitio
└── fonts/
    └── roboto/                 # Roboto 400 y 700 en woff2
```

---

## Arquitectura bilingüe

El sitio maneja dos idiomas dentro del mismo dominio sin usar la integración i18n de Astro. El enrutamiento es manual:

| Ruta     | Idioma       | `lang` HTML |
| :------- | :----------- | :---------- |
| `/`      | Español (ES) | `es-US`     |
| `/en`    | Inglés  (EN) | `en-US`     |

**Reglas:**
- El idioma se infiere automáticamente desde `Astro.url.pathname` en `BaseLayout.astro`.
- Las páginas hardcodean `lang` como documentación explícita, pero no es obligatorio pasarlo al layout.
- El `alternateLang` es la URL del idioma alternativo (hardcodeado por página):
  - `index.astro` (ES) → `alternateLang = '/en'`
  - `en/index.astro` (EN) → `alternateLang = '/'`
- El selector de idioma del Navbar calcula `altLangUrl` dinámicamente desde `Astro.url.pathname`, sin configuración adicional por página.

**Flujo de navegación:**
```
/  (ES)  →  click "EN"  →  /en  (EN)  →  click "ES"  →  /
```

**Para agregar nuevas páginas bilingües**, crear el par:
- `src/pages/[ruta].astro` (ES)
- `src/pages/en/[ruta].astro` (EN)

Los componentes de contenido bilingüe deben aceptar `lang: 'es' | 'en'` como prop (ver `HomePage.astro`).

---

## Sistema de estilos

Tailwind CSS v4 cargado mediante `@import "tailwindcss"` en `global.css`.

**Tokens del tema** (disponibles como clases Tailwind):

| Token               | Valor     | Uso                        |
| :------------------ | :-------- | :------------------------- |
| `brand-extralight`  | `#1d8ce7` | Azul claro                 |
| `brand-light`       | `#036dc4` | Azul medio (principal)     |
| `brand-dark`        | `#044274` | Azul oscuro                |
| `accent`            | `#faba02` | Amarillo/dorado (CTA)      |
| `neutral-dark`      | `#1a261a` | Texto oscuro               |
| `neutral-grey`      | `#575756` | Texto secundario           |
| `background-light`  | `#f9f9f9` | Fondo claro                |
| `background-muted`  | `#e0e0e0` | Fondo atenuado / bordes    |

**Breakpoints**: `xs` 425px · `sm` 640px · `md` 768px · `lg` 990px · `xl` 1280px · `2xl` 1536px · `3xl` 1920px

**Clases utilitarias globales** (definidas en `global.css` con `@apply`):

| Clase              | Descripción                                    |
| :----------------- | :--------------------------------------------- |
| `container-custom` | Contenedor centrado con ancho máximo           |
| `title`            | Tamaño de título responsivo                    |
| `subtitle`         | Tamaño de subtítulo responsivo con max-width   |
| `form-*`           | Primitivas del formulario de contacto          |
| `footer-*`         | Utilidades para el footer                      |
| `no-scrollbar`     | Oculta scrollbar manteniendo el scroll         |

**Fuentes**: Roboto 400 y 700 desde `/public/fonts/roboto/` con `font-display: swap`.

---

## Navbar y Mega Menú

El navbar (`Navbar.astro`) es bilingüe y tiene dos zonas:

- **Barra superior**: selector de idioma (banderas WebP) + botón CTA.
- **Barra de navegación**: logo + ítems + hamburguesa mobile.

Cada ítem de navegación es `NavItem { label, href, megaMenu? }`:
- Con `megaMenu` → renderiza `<MegaMenu client:load>` en desktop y acordeón `<details>` en mobile.
- Sin `megaMenu` → enlace plano `<a>`.

**MegaMenu** (`MegaMenu.tsx` + `MegaMenuPanel.tsx`):
- Usa `createPortal` a `document.body` con `position: fixed` anclado al bottom del `<header>`.
- El top del panel se calcula en el `onClick` (no en `useEffect`) para evitar parpadeo — React 18 batchea ambos `setState` en un solo render.
- El estado `isMounted` previene acceso a `document.body` durante SSR.
- Mobile: acordeón de dos niveles con `<details>` nativo (categoría → subcategoría → ítems), sin React.

**Selector de idioma**: ES muestra `flag_mexico.webp` (bandera de México, no España). Decisión deliberada: el público objetivo es hispano en EE.UU.

---

## Pendiente antes de producción

Reemplazar los placeholders en los siguientes archivos:

- `src/layouts/BaseLayout.astro` — `siteName` y `ogImage` (dominio real)
- `src/utils/hreflang.ts` — `SITE_URL` (dominio real)
