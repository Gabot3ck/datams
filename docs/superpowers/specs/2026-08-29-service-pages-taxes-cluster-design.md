# Diseño — Sistema de páginas de servicio + clúster Taxes/IRS/ITIN (ES)

**Fecha:** 2026-08-29
**Estado:** aprobado para plan de implementación
**Alcance de esta ronda:** clúster **Taxes / IRS / ITIN-EIN en español** (17 páginas) + `/contacto` mínima + infraestructura reutilizable + SEO técnico. Inglés queda como arquitectura lista, **sin páginas EN construidas**.

---

## 1. Objetivo

Construir un sistema de componentes + layout que permita crear páginas de servicio SEO en Astro, una por archivo `.astro`, y con él completar el clúster Taxes/IRS/ITIN en español. Cada página debe tener contenido único y específico (reglas §6 del `CONTENT-STRATEGY.md`) para evitar "scaled content abuse". La arquitectura debe estar lista para replicar en inglés (audiencia angloparlante nativa, contenido no traducido) sin refactor.

## 2. Decisiones tomadas (con el usuario)

| Tema | Decisión |
|---|---|
| Estructura de contenido | Un `.astro` por página + componentes de sección compartidos. **No** plantillado por props ni Content Collections. |
| Alcance | Solo clúster Taxes/IRS/ITIN en ES (17 páginas). EN: arquitectura lista, sin páginas. |
| Paleta / tipografía | `src/styles/global.css` **es la fuente de verdad** (brand `#8b1d28` vino, brand-light `#DB757F` rosa, `accent`, `midnight`, `accent-dark` dorado; `font-display` = Playfair Display; cuerpo Roboto). Se actualiza `CLAUDE.md` para reflejarlo. Sin rediseño visual — solo componentización de lo que ya existe en `/taxes/index.astro`. |
| Redacción del cuerpo | La hago yo para las 17, siguiendo §6: documentos exactos, tiempos reales, errores comunes, ≥3 FAQ propias por servicio. Datos del negocio que no conozco → `[PLACEHOLDER: ...]` explícito, nunca inventado. |
| URLs de pilar | **Con** barra final: `/taxes/`, `/irs/`, `/itin-ein/`. Páginas hijas **sin** barra final: `/taxes/enmiendas`. |
| `/contacto` | Página simple: `<h1>Contacto</h1>` + datos de oficina (dirección, tel, WhatsApp, horario desde config). Sin formulario — el usuario tiene un componente de otro proyecto que integrará después. |
| Testing | Vitest (no Jest). Esta ronda: instalar + configurar Vitest + 1 smoke test + `astro check` + `astro build` + script de links rotos. **Los tests unitarios de helpers quedan fuera de esta ronda** (anotado en memoria como pendiente). |
| i18n | Cada idioma su propio archivo físico. Registro `routes.ts` como puente ES↔EN. |

## 3. Enfoque: composición por slots + layout delgado

Cada página `.astro` importa componentes de sección y los ordena libremente dentro de `<ServiceLayout>`. El layout solo hace: shell (`BaseLayout`) + `Breadcrumb` + emisión de JSON-LD (`Service` + `FAQPage`) + `<slot/>`. Los componentes de sección son "tontos": reciben contenido por props/slot, sin lógica de negocio.

Alternativa descartada: layout con props estructuradas (`hero`, `sections[]`, `faqs`) que renderiza toda la página → es plantillado, dificulta que una página tenga secciones propias, empuja hacia contenido homogéneo.

---

## 4. Estructura de archivos

```
src/
├── config/
│   ├── site.ts          # NUEVO — SITE_URL, SITE_NAME, OG_IMAGE, GSC, BUSINESS{}, helpers JSON-LD, canonicalURL()
│   └── routes.ts        # NUEVO — registro ES↔EN [{ es, en, enBuilt }]  + getAlternates(pathname)
├── layouts/
│   ├── BaseLayout.astro     # EDITAR — importa site.ts; hreflang solo si enBuilt; canonical normalizado
│   └── ServiceLayout.astro  # NUEVO — BaseLayout + Breadcrumb + JSON-LD Service/FAQPage + <slot/>
├── components/
│   ├── Breadcrumb.astro     # EDITAR — categoryMap a slugs con barra: /taxes/, /irs/, /itin-ein/
│   ├── Navbar.astro         # EDITAR — alinear hrefs del MegaMenu Taxes/ITIN/IRS a slugs finales
│   └── service/             # NUEVO
│       ├── ServiceHero.astro
│       ├── TrustBar.astro
│       ├── ServiceList.astro
│       ├── ProcessSteps.astro
│       ├── DocsChecklist.astro
│       ├── InfoBlock.astro
│       ├── WhyUs.astro
│       ├── FaqSection.astro
│       ├── CtaBanner.astro
│       └── RelatedServices.astro
├── pages/
│   ├── contacto.astro       # NUEVO
│   ├── taxes/
│   │   ├── index.astro                 # EDITAR — migrar al sistema
│   │   ├── declaracion-personal.astro  # NUEVO — contenido en CONTENT-STRATEGY §7
│   │   ├── declaracion-negocio.astro   # NUEVO
│   │   ├── todos-los-estados.astro     # NUEVO
│   │   ├── enmiendas.astro             # NUEVO
│   │   ├── seguimiento-reembolso.astro # NUEVO
│   │   └── formularios-1099.astro      # NUEVO
│   ├── irs/
│   │   ├── index.astro                 # NUEVO (pilar)
│   │   ├── solucion-deudas.astro       # NUEVO
│   │   ├── auditorias.astro            # NUEVO
│   │   ├── resolucion-cartas.astro     # NUEVO
│   │   ├── acuerdos-pago.astro         # NUEVO
│   │   └── transcripciones.astro       # NUEVO
│   └── itin-ein/
│       ├── index.astro                 # NUEVO (pilar)
│       ├── solicitar-itin.astro        # NUEVO
│       ├── renovar-itin.astro          # NUEVO
│       └── solicitar-ein.astro         # NUEVO
├── utils/
│   └── hreflang.ts         # EDITAR — corregir bug .replace('/en'); re-exportar SITE_URL desde config/site.ts
└── styles/global.css       # sin cambios (fuente de verdad)
public/
└── robots.txt              # NUEVO
scripts/
└── check-links.mjs         # NUEVO — verifica hrefs internos contra dist/
astro.config.mjs            # EDITAR — site: SITE_URL + integración sitemap
vitest.config.ts            # NUEVO
```

tsconfig: añadir alias `@config/*` → `./src/config/*` y `@utils/*` → `./src/utils/*`.

---

## 5. `src/config/site.ts`

Única fuente de verdad para producción. `SITE_URL` = única variable a cambiar al desplegar.

```ts
export const SITE_URL = 'https://tudominio.com';          // ← PROD: dominio real
export const SITE_NAME = "Data's & Multiservices";
export const OG_IMAGE = `${SITE_URL}/assets/og-image.webp`; // ← PROD: crear imagen 1200×675
export const GSC_VERIFICATION = '';                        // ← PROD: código Google Search Console

export const BUSINESS = {
  phone: '+17026400088',
  phoneDisplay: '(702) 640-0088',
  whatsapp: 'https://wa.me/17026400088',
  address: { street: '235 N Eastern Ave. Suite 130', city: 'Las Vegas',
             region: 'NV', postalCode: '89101', country: 'US' },
  openingHours: ['Mo-Sa 09:00-21:00', 'Su 10:00-17:00'],
  hoursDisplay: 'Lun–Sáb 9AM–9PM · Dom 10AM–5PM',
  email: '[PLACEHOLDER: email de contacto del negocio]',
} as const;

export const TRUST_BAR_DEFAULT_ES = [
  'Atención 100% en español',
  'Precio fijo, conocido antes de empezar',
  'Oficina física en Las Vegas — no somos solo una página web',
  '[PLACEHOLDER: preparadores con PTIN autorizado por el IRS — confirmar credencial]',
];

// Helpers
export function canonicalURL(pathname: string): string { /* normaliza barra final: pilares/home con barra, hijas sin */ }
export function buildServiceJsonLd(opts: {
  name: string; description: string; serviceType: string; url: string; lang: 'es' | 'en';
}): object { /* Service + provider LocalBusiness desde BUSINESS */ }
export function buildLocalBusinessJsonLd(lang: 'es' | 'en'): object { /* reutilizable para home/contacto */ }
```

`canonicalURL` regla: `/`, `/taxes/`, `/irs/`, `/itin-ein/` y futuros pilares → con barra; todo lo demás → sin barra. `BaseLayout` usa `canonicalURL(Astro.url.pathname)` en vez de `Astro.url.href` crudo.

---

## 6. `src/config/routes.ts`

```ts
export interface RoutePair { es: string; en: string; enBuilt: boolean; }
export const ROUTES: RoutePair[] = [
  { es: '/',                          en: '/en',                          enBuilt: true  },
  { es: '/taxes/',                    en: '/en/taxes/',                   enBuilt: false },
  { es: '/taxes/declaracion-personal',en: '/en/taxes/personal-tax-return',enBuilt: false },
  // … las 17 + /contacto
];
export function getAlternates(pathname: string): { es?: string; en?: string; xDefault: string } { /* … */ }
```

Alimenta 3 cosas:
1. **hreflang** en `BaseLayout`: emite `<link hreflang="en">` solo si `enBuilt`. Siempre emite `es` + `x-default` (→ ES).
2. **sitemap**: filtro `serialize`/`filter` de `@astrojs/sitemap` para no incluir rutas EN no construidas; añade `links` de alternancia donde `enBuilt`.
3. **Switch de idioma del Navbar**: si la ruta actual no tiene contraparte construida → link cae a `/en` (home). Hoy `Navbar.astro` calcula `altLangUrl` a mano (línea 8-11) — se reemplaza por `getAlternates()`.

En esta ronda todas las entradas del clúster tienen `enBuilt: false`.

---

## 7. `ServiceLayout.astro` — contrato

```ts
interface Props {
  title: string;                 // <title> + og
  description: string;           // meta description
  lang?: 'es' | 'en';            // default 'es'
  breadcrumbLabel: string;       // = H1 exacto de la página
  service: { name: string; serviceType: string };   // JSON-LD Service
  faqs?: { q: string; a: string }[];                 // JSON-LD FAQPage (mismo array que se pasa a <FaqSection>)
  itemList?: { name: string; url: string }[];        // solo pilares → JSON-LD ItemList
}
```

Render:
```astro
<BaseLayout {title} {description} {lang} jsonLd={serviceJsonLd}>
  <script type="application/ld+json" slot="head" set:html={faqJsonLd} />   {/* si faqs */}
  <script type="application/ld+json" slot="head" set:html={itemListJsonLd} /> {/* si itemList */}
  <div class="container-custom pt-6">
    <Breadcrumb {lang} currentLabel={breadcrumbLabel} />
  </div>
  <slot />
</BaseLayout>
```

`BreadcrumbList` lo sigue emitiendo `Breadcrumb.astro` (ya lo hace). El layout **no** fuerza `CtaBanner` — cada página lo pone en su slot (será el patrón por defecto).

---

## 8. Componentes de sección (`src/components/service/`)

Todos: `lang?: 'es' | 'en'` (default `'es'`) **solo** para textos fijos de UI (labels de botón, "Ver más", aria-labels). Todo el contenido real entra por props/slot. Estilos extraídos literalmente de `src/pages/taxes/index.astro` actual.

| Componente | Props | Notas |
|---|---|---|
| `ServiceHero` | `eyebrow: string`, `heading: string`, `headingAccent?: string`, `ctaHref?: string` (def `/contacto`), `ctaLabel?: string` + `<slot>` (párrafos de intro) | H1 con `<em class="not-italic text-brand-light">{headingAccent}</em>` |
| `TrustBar` | `items?: string[]` (def `TRUST_BAR_DEFAULT_ES`) | `bg-accent`, checks dorados. `role="list"` |
| `ServiceList` | `eyebrow?: string`, `heading: string`, `intro?: string`, `items: {label,href,description}[]` | grid tarjetas-enlace; para pilares |
| `ProcessSteps` | `heading: string`, `steps: {title,body}[]` | lista `<ol>` numerada |
| `DocsChecklist` | `heading: string`, `items: string[]`, `note?: string` | lista con checks; `note` en itálica |
| `InfoBlock` | `eyebrow?: string`, `heading: string` + `<slot>` | bloque prosa/listas genérico: "qué incluye", "cuánto tarda", "errores comunes" |
| `WhyUs` | `heading: string`, `intro?: string`, `items: {heading,body}[]` | razones numeradas |
| `FaqSection` | `items: {q,a}[]`, `heading?: string` (def "Preguntas frecuentes") | `<details>` accesible; `<dl>/<dt>/<dd>` |
| `CtaBanner` | `heading: string`, `body?: string`, `ctaHref?: string` (def `/contacto`), `ctaLabel?: string` | `bg-midnight`, `<address>` desde `BUSINESS` |
| `RelatedServices` | `heading: string`, `items: {label,href}[]` | interlinking horizontal a hermanas/pilar |

Accesibilidad transversal (checklist §11): un solo `<h1>` (en `ServiceHero`), `<h2>` por sección con `aria-labelledby`, foco visible (`focus-visible:outline-2`), `<details>` operables por teclado, contraste AA verificado sobre la paleta viva, `prefers-reduced-motion` respetado (ya en `global.css`).

---

## 9. Las 17 páginas — slug · H1 · ángulo de contenido único

Metadata (Title/Meta/H1): se usa la de `CONTENT-STRATEGY.md §4` donde existe; para las pendientes la redacto con las reglas §4 (Title <60, meta 100–155, ES coloquial, "Las Vegas" señal local).

### Pilar Taxes — `/taxes/` (EDITAR, migrar)
H1: *Taxes en Español en Las Vegas, Sin Sorpresas en el Precio*. Contenido ya redactado (§7). Migrar a componentes. Corregir links internos: `/taxes/seguimiento` → `/taxes/seguimiento-reembolso`; `/irs` → `/irs/`; `/taxes/transcripciones-irs` (no existe) → quitar o apuntar a `/irs/transcripciones`. `ServiceList` con las 6 hijas + `itemList` JSON-LD.

| # | Slug | H1 | Ángulo único |
|---|---|---|---|
| 1 | `/taxes/declaracion-personal` | Declaración de Impuestos Personales en Las Vegas | Ya redactada (§7). W-2 vs 1099 vs ITIN, deducciones/créditos, doc checklist, proceso 4 pasos. |
| 2 | `/taxes/declaracion-negocio` | Declaración de Impuestos de Negocio y LLC en Las Vegas | Sole Prop vs LLC vs S-Corp, Schedule C, gastos deducibles de negocio, deadlines (marzo vs abril), self-employment tax. |
| 3 | `/taxes/todos-los-estados` | Declaraciones de Impuestos en Todos los Estados | Part-year vs nonresident return, reciprocidad entre estados, trabajar remoto/mudanza, doble tributación y crédito. |
| 4 | `/taxes/enmiendas` | Enmiendas de Impuestos (Formulario 1040-X) en Las Vegas | Cuándo enmendar vs no, plazo 3 años para reclamar reembolso, tiempos de procesamiento IRS (~16 sem), errores comunes que la disparan. |
| 5 | `/taxes/seguimiento-reembolso` | Seguimiento de tu Reembolso de Taxes que No Ha Llegado | Herramienta "Where's My Refund", 21 días e-file / 6 sem papel, causas de retención (revisión, PATH Act, offset), qué documentar. |
| 6 | `/taxes/formularios-1099` | Formularios 1099-NEC para Contratistas en Las Vegas | 1099-NEC vs 1099-MISC vs 1099-K, quién debe emitir, pagos estimados trimestrales, deducciones de contratista, multas por no emitir. |

### Pilar IRS — `/irs/` (NUEVO)
H1: *IRS y Resolución Fiscal en Español en Las Vegas* (redactar metadata). `ServiceList` con 5 hijas + `itemList`. Breadcrumb ya anida `/irs/*` bajo Taxes.

| # | Slug | H1 | Ángulo único |
|---|---|---|---|
| 7 | `/irs/solucion-deudas` | Solución de Deudas con el IRS, en Español y Sin Compromiso | Offer in Compromise vs Currently Not Collectible vs plan de pago, requisitos reales del OIC, advertencia sobre promesas falsas ("pennies on the dollar"). |
| 8 | `/irs/auditorias` | Representación en Auditorías del IRS | Tipos: correspondencia / oficina / campo; qué revisa el IRS, plazo de respuesta, qué NO decir, papeles a reunir. |
| 9 | `/irs/resolucion-cartas` | ¿Te Llegó una Carta del IRS? Te la Resolvemos en Español | Códigos comunes (CP2000, CP14, LT11, CP49), qué significa cada uno, plazo de respuesta por tipo, riesgo de ignorarla. |
| 10 | `/irs/acuerdos-pago` | Acuerdos de Pago con el IRS (Installment Agreement) | Corto plazo vs largo plazo, umbrales ($10k / $50k / $100k), débito directo, cuotas mínimas, qué pasa si te atrasas. |
| 11 | `/irs/transcripciones` | Transcripciones del IRS en Las Vegas | 5 tipos (Account, Return, Record of Account, Wage & Income, Verification of Non-filing), para qué sirve cada una (préstamo, inmigración, FAFSA), cómo se piden. |

### Pilar ITIN/EIN — `/itin-ein/` (NUEVO)
H1: *ITIN y EIN en Español en Las Vegas* (redactar metadata). `ServiceList` con 3 hijas + `itemList`.

| # | Slug | H1 | Ángulo único |
|---|---|---|---|
| 12 | `/itin-ein/solicitar-itin` | Solicitar tu ITIN Number en Las Vegas | Formulario W-7, documentos que prueban identidad y extranjería, rol del CAA (no mandas pasaporte original), se hace junto con la declaración, tiempos (~7–11 sem). |
| 13 | `/itin-ein/renovar-itin` | Renovar tu ITIN Number en Las Vegas | Ya tiene metadata (§4). ITIN que expira por no uso 3 años consecutivos / rangos de dígitos medios, cuándo renovar antes de declarar, qué documentos. |
| 14 | `/itin-ein/solicitar-ein` | Solicitar un EIN para tu Negocio en Las Vegas | Formulario SS-4, con o sin SSN/ITIN, para qué se necesita (cuenta bancaria de negocio, empleados, LLC), inmediato online vs por fax/correo para extranjeros. |

### `/contacto` (NUEVO)
`<h1>Contacto</h1>` + bloque de datos (dirección con enlace a mapa, `tel:`, WhatsApp, horario) desde `BUSINESS`. `LocalBusiness` JSON-LD. Nota en código: *placeholder para el componente de formulario que traerá el usuario*.

**Política de placeholders** — se marca `[PLACEHOLDER: ...]` y NO se inventa: precios/tarifas, número PTIN/EFIN real, política exacta de citas (walk-in vs cita), email de contacto, tiempos que dependan de política interna del negocio. Todos los placeholders se listan al final de la implementación.

---

## 10. SEO técnico

1. **`astro.config.mjs`**: `import sitemap from '@astrojs/sitemap'`; `site: SITE_URL`; `integrations: [react(), sitemap({ filter: … , serialize: … })]`. Instalar `@astrojs/sitemap`.
2. **`public/robots.txt`**:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://tudominio.com/sitemap-index.xml
   ```
   (dominio = placeholder, documentado en §5 de `CLAUDE.md`).
3. **`hreflang.ts`**: `const clean = pathname.startsWith('/en') ? pathname.slice(3) || '/' : pathname;` (elimina el bug de `.replace('/en','')` que afecta cualquier `/en` en la ruta). Re-exporta `SITE_URL` desde `config/site.ts`.
4. **`BaseLayout.astro`**: `siteName`, `ogImage`, `google-site-verification` desde `config/site.ts`; hreflang vía `getAlternates()`; canonical vía `canonicalURL()`.
5. **JSON-LD** centralizado en `ServiceLayout` (Service + FAQPage + ItemList) y `Breadcrumb` (BreadcrumbList, ya existe). Nada de JSON-LD escrito a mano en las páginas.
6. **Navbar `MegaMenu`** — alinear hrefs del bloque Taxes/ITIN/IRS (ES **y** EN) a los slugs finales:

   | Nav actual (ES) | Slug final |
   |---|---|
   | `/taxes/seguimiento` | `/taxes/seguimiento-reembolso` |
   | `/taxes/transcripciones-irs` (tab Taxes Personales) | `/irs/transcripciones` (mover a tab IRS) |
   | `/taxes/asesoria-negocio` | `/negocio/asesoria-impuestos-negocio` (fuera de clúster; solo corregir slug) |
   | `/irs/cartas-irs` | `/irs/resolucion-cartas` |
   | `/irs/deudas-irs` | `/irs/solucion-deudas` |
   | `/irs/pagos-irs` | **quitar** (cubierto por `acuerdos-pago`) |
   | `/itin-ein/solicitud-itin` | `/itin-ein/solicitar-itin` |
   | `/itin-ein/renovacion-itin` | `/itin-ein/renovar-itin` |
   | `/itin-ein/solicitud-ein` | `/itin-ein/solicitar-ein` |
   | `/taxes`, `/irs`, `/itin-ein` (pillarUrl) | `/taxes/`, `/irs/`, `/itin-ein/` |

   EN: solo ajustar los pillarUrl a barra final (`/en/taxes/` etc.) y mantener slugs EN coherentes con `routes.ts`; las páginas EN no se construyen esta ronda.
7. **Home** (`HomePage.astro` / `ServicesSection.astro`): pillarUrls `/taxes/`, `/irs/`, `/itin-ein/` con barra final. Sin otros cambios de home.

---

## 11. Testing y verificación

- **`npx astro check`** → 0 errores de tipo.
- **`npx astro build`** → build limpio.
- **`node scripts/check-links.mjs`** (post-build, sin deps): recorre `dist/**/*.html`, extrae `href` internos (empiezan con `/`, no `mailto:`/`tel:`/`#`/`http`), verifica que cada uno resuelva a un `.html` en `dist/`. Exit 1 con lista si hay rotos. Se agrega script `npm run check:links` (`astro build && node scripts/check-links.mjs`).
- **Vitest**: instalar `vitest`, crear `vitest.config.ts`, script `npm run test`. Esta ronda incluye **1 smoke test** (`src/config/site.test.ts` → `canonicalURL('/taxes/') === '/taxes/'` y `canonicalURL('/taxes/enmiendas') === '/taxes/enmiendas'`). Los tests completos de helpers (`buildServiceJsonLd`, `getAlternates`, `hreflang`) quedan como pendiente anotado en memoria y en `CLAUDE.md` §Pendientes.
- **Checklist manual A11Y/SEO** (una vez, sobre 2-3 páginas representativas: 1 pilar + 1 hija con proceso + 1 hija corta): jerarquía de headings, `aria-label` en nav/section, navegación por teclado del acordeón FAQ, foco visible, contraste AA, meta title/description presentes y únicos, canonical correcto, JSON-LD válido (Rich Results Test).
- **Coverage 80% (regla global `code-quality.md`)**: se documenta como **no aplicable a páginas de contenido estático `.astro`**; el objetivo de coverage aplica solo a helpers de `src/config` y `src/utils`, a cubrir en la ronda de tests pendiente.

---

## 12. Cambios a `CLAUDE.md`

- Sección "Sistema de diseño": reemplazar la paleta documentada por la de `global.css` actual (brand/brand-light/brand-dark/brand-extralight, accent/accent-light/accent-extralight/accent-dark, neutral-*, background-*, midnight, cream). Añadir `font-display` = Playfair Display (link en `BaseLayout`), cuerpo Roboto.
- Sección "Estructura de archivos": añadir `src/config/`, `src/components/service/`, `ServiceLayout.astro`, `scripts/check-links.mjs`, `public/robots.txt`.
- Sección "Componentes — notas críticas": añadir subsección `ServiceLayout.astro` + `components/service/*` con sus contratos.
- Sección "Variables pendientes para producción": consolidar en `src/config/site.ts` (una tabla: `SITE_URL`, `OG_IMAGE`, `GSC_VERIFICATION`, `BUSINESS.email`, placeholders de contenido).
- Sección "Pendientes": marcar hechas las páginas del clúster Taxes/IRS/ITIN ES; añadir "tests unitarios de helpers con Vitest", "páginas EN del clúster", "imagen OG real", "componente de formulario en `/contacto`".
- Nota i18n: documentar `src/config/routes.ts` como registro ES↔EN y su rol en hreflang/sitemap/switch de idioma.

---

## 13. Fuera de alcance (explícito)

- Páginas EN (solo arquitectura lista).
- Clústeres Notaría, Inmigración, Negocio, DMV, Corte, Otros.
- Keyword research formal de esos clústeres.
- Rediseño visual / cambios de paleta.
- Formulario funcional de contacto (backend, validación) — llega con el componente del usuario.
- Imagen OG real, dominio real, código GSC (quedan como placeholder centralizado).
- Refactor de `HomePage.astro` / `ServicesSection.astro` más allá de corregir pillarUrls.
- Tests unitarios completos de helpers (anotado como pendiente).
- Blog, `/nosotros`.
