# Sistema de páginas de servicio + infraestructura SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el layout + los 10 componentes de sección + la config de sitio + el SEO técnico que permiten crear páginas de servicio en Astro, y migrar el pilar `/taxes/` y su hija `/taxes/declaracion-personal` como prueba end-to-end.

**Architecture:** Composición por slots: cada página `.astro` importa componentes "tontos" de `src/components/service/` y los ordena dentro de `<ServiceLayout>`, que hace shell (`BaseLayout`) + `Breadcrumb` + JSON-LD (`Service`/`FAQPage`/`ItemList`) + `<slot/>`. Toda la config de producción vive en `src/config/site.ts` (una sola variable a cambiar: `SITE_URL`). Un registro `src/config/routes.ts` es el puente ES↔EN para hreflang, sitemap y el switch de idioma.

**Tech Stack:** Astro 6, React 19 (solo MegaMenu), Tailwind CSS 4 (`@theme` en `global.css`), TypeScript 6, Vitest + Container API de Astro para tests, `@astrojs/sitemap`.

**Spec:** `docs/superpowers/specs/2026-08-29-service-pages-taxes-cluster-design.md`

## Global Constraints

- **Node:** >= 22.12.0.
- **Paleta / tipografía:** `src/styles/global.css` es la fuente de verdad. Colores por token (`brand` `#8b1d28`, `brand-light` `#DB757F`, `brand-dark` `#63050E`, `accent` `#5b5a5c`, `accent-dark` `#e3ab02`, `neutral-dark` `#1a261a`, `neutral-grey` `#5b5a5c`, `midnight` `#1A1A1D`, `cream` `#FAF7F2`, `background-light` `#f9f9f9`, `background-muted` `#e0e0e0`). Nunca hardcodear hex en componentes. `font-display` = Playfair Display (clase `.font-display`); cuerpo Roboto (por `body`).
- **Breakpoint `lg` = 990px** (no 1024px). Definido en `@theme`.
- **i18n:** ES en `/`, EN en `/en/`. Detección: `Astro.url.pathname.startsWith("/en") ? "en" : "es"`. `x-default` → ES.
- **URLs:** pilares de categoría CON barra final (`/taxes/`, `/irs/`, `/itin-ein/`); páginas hijas SIN barra final (`/taxes/enmiendas`).
- **Marca:** `Data's & Multiservices` (constante `SITE_NAME`). Nunca "Tax & Notaría" / "NOMBRE_SITIO" en código nuevo.
- **Voz de contenido ES:** español coloquial, no formal/técnico (perfil del avatar en `CONTENT-STRATEGY.md §1`). Nada de "in Spanish" como diferenciador.
- **Datos del negocio desconocidos:** marcar `[PLACEHOLDER: ...]` explícito, nunca inventar (precios, PTIN/EFIN, política de citas, email).
- **Touch targets** >= 44×44px; foco visible (`focus-visible:outline-2 focus-visible:outline-brand-light`); `prefers-reduced-motion` ya respetado en `global.css`.
- **Commits:** frecuentes, uno por task como mínimo. Mensajes en español, imperativos. Terminar mensajes de commit con:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_015KqgSEwjAzdYcGqxxgugwU
  ```
- **Rama:** trabajar en `dev` (rama actual). No hacer push salvo que el usuario lo pida.

---

## File Structure

**Crear:**
- `src/config/site.ts` — constantes de producción + `BUSINESS` + `TRUST_BAR_DEFAULT_ES` + helpers `canonicalURL`, `buildServiceJsonLd`, `buildLocalBusinessJsonLd`.
- `src/config/site.test.ts` — tests de helpers.
- `src/config/routes.ts` — `ROUTES` + `getAlternates`.
- `src/config/routes.test.ts` — tests.
- `src/layouts/ServiceLayout.astro` — layout de páginas de servicio.
- `src/layouts/ServiceLayout.test.ts` — test Container API.
- `src/components/service/ServiceHero.astro` + `.test.ts`
- `src/components/service/TrustBar.astro` + `.test.ts`
- `src/components/service/ServiceList.astro` + `.test.ts`
- `src/components/service/RelatedServices.astro` + `.test.ts`
- `src/components/service/ProcessSteps.astro` + `.test.ts`
- `src/components/service/DocsChecklist.astro` + `.test.ts`
- `src/components/service/InfoBlock.astro` + `.test.ts`
- `src/components/service/WhyUs.astro` + `.test.ts`
- `src/components/service/FaqSection.astro` + `.test.ts`
- `src/components/service/CtaBanner.astro` + `.test.ts`
- `src/pages/irs/index.astro` *(placeholder mínimo en Task 14; contenido real en Plan 2)*
- `src/pages/itin-ein/index.astro` *(idem)*
- `src/pages/contacto.astro`
- `src/pages/taxes/declaracion-personal.astro`
- `public/robots.txt`
- `scripts/check-links.mjs`
- `vitest.config.ts`

**Modificar:**
- `package.json` — deps (`vitest`, `@astrojs/sitemap`) + scripts.
- `tsconfig.json` — alias `@config/*`, `@utils/*`.
- `astro.config.mjs` — `site` + integración `sitemap()`.
- `src/utils/hreflang.ts` — re-exportar `SITE_URL` desde `config/site.ts`, corregir `getHreflangUrls`.
- `src/layouts/BaseLayout.astro` — config centralizada + hreflang vía `getAlternates` + canonical vía `canonicalURL`.
- `src/components/Breadcrumb.astro` — `categoryMap` con barra final en pilares; import de `SITE_URL`.
- `src/components/Navbar.astro` — alinear hrefs del MegaMenu Taxes/IRS/ITIN + pillarUrls con barra.
- `src/components/ServicesSection.astro` — pillarUrls ES con barra final.
- `src/pages/taxes/index.astro` — reescribir con el sistema nuevo.
- `CLAUDE.md` — paleta real, estructura nueva, config consolidada, pendientes.

---

## Task 1: Tooling, alias y `site.ts` (constantes + `canonicalURL`)

**Files:**
- Modify: `package.json`, `tsconfig.json`
- Create: `vitest.config.ts`, `src/config/site.ts`, `src/config/site.test.ts`
- Modify: `src/utils/hreflang.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `src/config/site.ts` exporta:
    ```ts
    export const SITE_URL: string;          // 'https://tudominio.com'
    export const SITE_NAME: string;         // "Data's & Multiservices"
    export const OG_IMAGE: string;          // `${SITE_URL}/assets/og-image.webp`
    export const GSC_VERIFICATION: string;  // ''
    export const BUSINESS: {
      phone: string; phoneDisplay: string; whatsapp: string;
      address: { street: string; city: string; region: string; postalCode: string; country: string };
      openingHours: string[]; hoursDisplay: string; email: string;
    };
    export const TRUST_BAR_DEFAULT_ES: string[];
    export function canonicalURL(pathname: string): string; // absoluta, normaliza barra final
    ```

- [ ] **Step 1: Instalar dependencias de dev**

Run:
```bash
npm install -D vitest @astrojs/sitemap
```
(Si `@astrojs/sitemap` no resuelve para Astro 6, instalar `@astrojs/sitemap@latest` y anotar la versión; contingencia en Task 5.)

- [ ] **Step 2: Añadir alias en `tsconfig.json`**

En `compilerOptions.paths`, añadir junto a los existentes:
```json
"@config/*": ["./src/config/*"],
"@utils/*": ["./src/utils/*"]
```

- [ ] **Step 3: Añadir scripts en `package.json`**

En `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"check:links": "astro build && node scripts/check-links.mjs"
```

- [ ] **Step 4: Crear `vitest.config.ts`**

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Escribir el test que falla — `src/config/site.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { canonicalURL, SITE_URL, SITE_NAME, BUSINESS, TRUST_BAR_DEFAULT_ES } from './site';

describe('canonicalURL', () => {
  it('deja la home como raíz con barra', () => {
    expect(canonicalURL('/')).toBe(`${SITE_URL}/`);
  });
  it('agrega barra final a un pilar sin barra', () => {
    expect(canonicalURL('/taxes')).toBe(`${SITE_URL}/taxes/`);
  });
  it('conserva la barra final de un pilar', () => {
    expect(canonicalURL('/taxes/')).toBe(`${SITE_URL}/taxes/`);
  });
  it('quita la barra final de una página hija', () => {
    expect(canonicalURL('/taxes/enmiendas/')).toBe(`${SITE_URL}/taxes/enmiendas`);
  });
  it('no toca una página hija sin barra', () => {
    expect(canonicalURL('/taxes/enmiendas')).toBe(`${SITE_URL}/taxes/enmiendas`);
  });
  it('normaliza pilar en inglés', () => {
    expect(canonicalURL('/en/irs')).toBe(`${SITE_URL}/en/irs/`);
  });
  it('trata /contacto como hija (sin barra)', () => {
    expect(canonicalURL('/contacto')).toBe(`${SITE_URL}/contacto`);
  });
});

describe('constantes', () => {
  it('marca correctamente', () => {
    expect(SITE_NAME).toBe("Data's & Multiservices");
  });
  it('teléfono en formato E.164', () => {
    expect(BUSINESS.phone).toBe('+17026400088');
  });
  it('trust bar tiene 4 ítems', () => {
    expect(TRUST_BAR_DEFAULT_ES).toHaveLength(4);
  });
});
```

- [ ] **Step 6: Correr el test y verificar que falla**

Run: `npm test -- src/config/site.test.ts`
Expected: FAIL — `Cannot find module './site'`.

- [ ] **Step 7: Implementar `src/config/site.ts`**

```ts
// ─── Producción: cambiar SITE_URL al desplegar ──────────────────────────
export const SITE_URL = 'https://tudominio.com';
export const SITE_NAME = "Data's & Multiservices";
export const OG_IMAGE = `${SITE_URL}/assets/og-image.webp`; // ← PROD: crear imagen 1200×675
export const GSC_VERIFICATION = ''; // ← PROD: código de Google Search Console

export const BUSINESS = {
  phone: '+17026400088',
  phoneDisplay: '(702) 640-0088',
  whatsapp: 'https://wa.me/17026400088',
  address: {
    street: '235 N Eastern Ave. Suite 130',
    city: 'Las Vegas',
    region: 'NV',
    postalCode: '89101',
    country: 'US',
  },
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

const PILLAR_PATHS = new Set([
  '/taxes', '/irs', '/itin-ein', '/notaria', '/inmigracion',
  '/negocio', '/dmv', '/corte', '/otros',
]);

/** URL canónica absoluta con barra final normalizada:
 *  home y pilares de categoría → con barra; todo lo demás → sin barra. */
export function canonicalURL(pathname: string): string {
  let path = pathname.replace(/\/+$/, '') || '/';
  const noEn = path.startsWith('/en') ? path.slice(3) || '/' : path;
  const isPillar = noEn === '/' || PILLAR_PATHS.has(noEn);
  if (isPillar && path !== '/') path = `${path}/`;
  return SITE_URL + path;
}
```

- [ ] **Step 8: Actualizar `src/utils/hreflang.ts`**

Reemplazar el contenido completo por:
```ts
// src/utils/hreflang.ts
export { SITE_URL } from '../config/site';

/** Devuelve las URLs es/en/x-default para una ruta dada.
 *  Nota: para hreflang de <head> usar getAlternates() de config/routes.ts;
 *  esta función queda como utilidad genérica. */
export function getHreflangUrls(pathname: string) {
  const clean = pathname.startsWith('/en')
    ? pathname.slice(3).replace(/\/$/, '') || '/'
    : pathname.replace(/\/$/, '') || '/';
  const base = 'https://tudominio.com';
  return {
    es: `${base}${clean}`,
    en: `${base}/en${clean === '/' ? '' : clean}`,
    xDefault: `${base}${clean}`,
  };
}
```
(No importar `SITE_URL` en la plantilla literal para evitar ciclo raro con re-export; usar el literal — el valor real se centraliza vía `canonicalURL`/`routes.ts`, y esta función pasa a ser secundaria.)

- [ ] **Step 9: Correr los tests y verificar que pasan**

Run: `npm test`
Expected: PASS (7 casos de `canonicalURL` + 3 de constantes). `npx astro check` debe seguir en 0 errores.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts src/config/site.ts src/config/site.test.ts src/utils/hreflang.ts
git commit -m "chore: config de sitio centralizada + Vitest + canonicalURL"
```

---

## Task 2: Helpers JSON-LD en `site.ts`

**Files:**
- Modify: `src/config/site.ts`, `src/config/site.test.ts`

**Interfaces:**
- Consumes: `BUSINESS`, `SITE_NAME` de Task 1.
- Produces:
  ```ts
  export function buildServiceJsonLd(opts: {
    name: string; description: string; serviceType: string; url: string; lang: 'es' | 'en';
  }): Record<string, unknown>;
  export function buildLocalBusinessJsonLd(lang: 'es' | 'en'): Record<string, unknown>;
  ```

- [ ] **Step 1: Escribir tests que fallan (añadir a `src/config/site.test.ts`)**

```ts
import { buildServiceJsonLd, buildLocalBusinessJsonLd } from './site';

describe('buildServiceJsonLd', () => {
  const jsonld = buildServiceJsonLd({
    name: 'Declaración de Impuestos Personales',
    description: 'Declaramos tus impuestos personales en español.',
    serviceType: 'Tax preparation',
    url: 'https://tudominio.com/taxes/declaracion-personal',
    lang: 'es',
  });
  it('es un Service con contexto schema.org', () => {
    expect(jsonld['@context']).toBe('https://schema.org');
    expect(jsonld['@type']).toBe('Service');
  });
  it('incluye provider LocalBusiness con teléfono', () => {
    const provider = jsonld.provider as Record<string, unknown>;
    expect(provider['@type']).toBe('LocalBusiness');
    expect(provider.telephone).toBe('+17026400088');
  });
  it('propaga url e inLanguage', () => {
    expect(jsonld.url).toBe('https://tudominio.com/taxes/declaracion-personal');
    expect(jsonld.inLanguage).toBe('es');
  });
  it('areaServed es Las Vegas', () => {
    const area = jsonld.areaServed as Record<string, unknown>;
    expect(area.name).toBe('Las Vegas');
  });
});

describe('buildLocalBusinessJsonLd', () => {
  it('arma NAP completo', () => {
    const b = buildLocalBusinessJsonLd('es');
    expect(b['@type']).toBe('LocalBusiness');
    expect(b.name).toBe("Data's & Multiservices");
    const addr = b.address as Record<string, unknown>;
    expect(addr.postalCode).toBe('89101');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/config/site.test.ts`
Expected: FAIL — `buildServiceJsonLd is not a function`.

- [ ] **Step 3: Implementar en `src/config/site.ts`**

```ts
function addressNode() {
  return {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.address.street,
    addressLocality: BUSINESS.address.city,
    addressRegion: BUSINESS.address.region,
    postalCode: BUSINESS.address.postalCode,
    addressCountry: BUSINESS.address.country,
  };
}

export function buildLocalBusinessJsonLd(lang: 'es' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    telephone: BUSINESS.phone,
    address: addressNode(),
    openingHours: BUSINESS.openingHours,
    areaServed: { '@type': 'City', name: 'Las Vegas' },
    inLanguage: lang,
  };
}

export function buildServiceJsonLd(opts: {
  name: string; description: string; serviceType: string; url: string; lang: 'es' | 'en';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    url: opts.url,
    inLanguage: opts.lang,
    areaServed: { '@type': 'City', name: 'Las Vegas' },
    provider: {
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      telephone: BUSINESS.phone,
      address: addressNode(),
      openingHours: BUSINESS.openingHours,
    },
  };
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config/site.ts src/config/site.test.ts
git commit -m "feat: helpers JSON-LD Service y LocalBusiness"
```

---

## Task 3: Registro de rutas `routes.ts` + `getAlternates`

**Files:**
- Create: `src/config/routes.ts`, `src/config/routes.test.ts`

**Interfaces:**
- Consumes: `SITE_URL` de Task 1.
- Produces:
  ```ts
  export interface RoutePair { es: string; en: string; enBuilt: boolean }
  export const ROUTES: RoutePair[];
  export function getAlternates(pathname: string): { es: string; en: string | null; xDefault: string };
  ```
  (URLs absolutas. `en` es `null` si `enBuilt === false` o si la ruta no está registrada. `xDefault` siempre = `es`.)

- [ ] **Step 1: Escribir el test que falla — `src/config/routes.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { getAlternates, ROUTES } from './routes';

describe('getAlternates', () => {
  it('para una ruta ES con contraparte EN sin construir: en = null', () => {
    const alt = getAlternates('/taxes/declaracion-personal');
    expect(alt.es).toBe('https://tudominio.com/taxes/declaracion-personal');
    expect(alt.en).toBeNull();
    expect(alt.xDefault).toBe(alt.es);
  });

  it('NO destroza rutas que contienen la subcadena "en" (bug histórico de hreflang)', () => {
    const alt = getAlternates('/taxes/enmiendas');
    expect(alt.es).toBe('https://tudominio.com/taxes/enmiendas');
  });

  it('desde la versión EN de la home resuelve la home ES', () => {
    const alt = getAlternates('/en');
    expect(alt.es).toBe('https://tudominio.com/');
  });

  it('home ES: en construido', () => {
    const alt = getAlternates('/');
    expect(alt.en).toBe('https://tudominio.com/en');
  });

  it('ruta no registrada: fallback es = url, en = null', () => {
    const alt = getAlternates('/pagina-inexistente');
    expect(alt.es).toBe('https://tudominio.com/pagina-inexistente');
    expect(alt.en).toBeNull();
  });
});

describe('ROUTES', () => {
  it('incluye los 3 pilares y sus 14 hijas + home + contacto (18)', () => {
    expect(ROUTES.length).toBeGreaterThanOrEqual(18);
  });
  it('solo la home tiene enBuilt=true en esta ronda', () => {
    expect(ROUTES.filter((r) => r.enBuilt).map((r) => r.es)).toEqual(['/']);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/config/routes.test.ts`
Expected: FAIL — `Cannot find module './routes'`.

- [ ] **Step 3: Implementar `src/config/routes.ts`**

```ts
import { SITE_URL } from './site';

export interface RoutePair {
  es: string;
  en: string;
  enBuilt: boolean;
}

export const ROUTES: RoutePair[] = [
  { es: '/',                             en: '/en',                              enBuilt: true  },
  { es: '/contacto',                     en: '/en/contact',                      enBuilt: false },
  // ── Taxes ──────────────────────────────────────────────────────────
  { es: '/taxes/',                       en: '/en/taxes/',                       enBuilt: false },
  { es: '/taxes/declaracion-personal',   en: '/en/taxes/personal-tax-return',    enBuilt: false },
  { es: '/taxes/declaracion-negocio',    en: '/en/taxes/business-tax-return',    enBuilt: false },
  { es: '/taxes/todos-los-estados',      en: '/en/taxes/all-states',             enBuilt: false },
  { es: '/taxes/enmiendas',              en: '/en/taxes/amended-returns',        enBuilt: false },
  { es: '/taxes/seguimiento-reembolso',  en: '/en/taxes/refund-tracking',        enBuilt: false },
  { es: '/taxes/formularios-1099',       en: '/en/taxes/1099-forms',             enBuilt: false },
  // ── IRS ────────────────────────────────────────────────────────────
  { es: '/irs/',                         en: '/en/irs/',                         enBuilt: false },
  { es: '/irs/solucion-deudas',          en: '/en/irs/tax-debt-resolution',      enBuilt: false },
  { es: '/irs/auditorias',               en: '/en/irs/audits',                   enBuilt: false },
  { es: '/irs/resolucion-cartas',        en: '/en/irs/irs-letters',              enBuilt: false },
  { es: '/irs/acuerdos-pago',            en: '/en/irs/payment-plans',            enBuilt: false },
  { es: '/irs/transcripciones',          en: '/en/irs/irs-transcripts',          enBuilt: false },
  // ── ITIN / EIN ─────────────────────────────────────────────────────
  { es: '/itin-ein/',                    en: '/en/itin-ein/',                    enBuilt: false },
  { es: '/itin-ein/solicitar-itin',     en: '/en/itin-ein/itin-application',    enBuilt: false },
  { es: '/itin-ein/renovar-itin',       en: '/en/itin-ein/itin-renewal',        enBuilt: false },
  { es: '/itin-ein/solicitar-ein',      en: '/en/itin-ein/ein-application',     enBuilt: false },
];

function norm(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

export function getAlternates(pathname: string): {
  es: string;
  en: string | null;
  xDefault: string;
} {
  const isEn = pathname === '/en' || pathname.startsWith('/en/');
  const key = isEn
    ? norm(pathname === '/en' ? '/' : pathname.slice(3))
    : norm(pathname);

  const entry = ROUTES.find((r) => norm(r.es) === key);
  const esPath = entry ? entry.es : key;
  const es = `${SITE_URL}${esPath === '/' ? '/' : esPath.replace(/\/$/, '') + (esPath.endsWith('/') ? '/' : '')}`;
  // simplificado: usa la ruta tal cual del registro (ya trae la barra correcta)
  const esUrl = `${SITE_URL}${entry ? entry.es : key}`;
  const enUrl = entry && entry.enBuilt ? `${SITE_URL}${entry.en}` : null;
  return { es: esUrl.replace(/([^/])$/, '$1'), en: enUrl, xDefault: esUrl };
}
```

Nota de implementación: la construcción de `es`/`xDefault` debe devolver exactamente lo que esperan los tests (`https://tudominio.com/` para la home, `https://tudominio.com/taxes/enmiendas` para hijas, `https://tudominio.com/taxes/` para pilares registrados con barra). Simplificar el cuerpo hasta que los 7 asserts pasen; la versión de arriba es orientativa, no literal.

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test -- src/config/routes.test.ts`
Expected: PASS (7 asserts).

- [ ] **Step 5: Commit**

```bash
git add src/config/routes.ts src/config/routes.test.ts
git commit -m "feat: registro de rutas ES-EN + getAlternates para hreflang"
```

---

## Task 4: Rewire de `BaseLayout.astro`

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/BaseLayout.test.ts`

**Interfaces:**
- Consumes: `SITE_NAME`, `OG_IMAGE`, `GSC_VERIFICATION`, `canonicalURL` de `@config/site`; `getAlternates` de `@config/routes`.
- Produces: mismo contrato de props que hoy (`title`, `description`, `robots?`, `lang?`, `canonical?`, `jsonLd?`, `image?`) + slot `head`. Sin cambios para los consumidores.

- [ ] **Step 1: Escribir el test que falla — `src/layouts/BaseLayout.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from './BaseLayout.astro';

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(BaseLayout, {
    props: { title: 'T', description: 'D', ...props },
    slots: { default: '<p>contenido</p>' },
  });
}

describe('BaseLayout', () => {
  it('usa SITE_NAME en og:site_name', async () => {
    const html = await render({});
    expect(html).toContain("Data's & Multiservices");
    expect(html).not.toContain('NOMBRE_SITIO');
  });

  it('emite canonical normalizado para un pilar', async () => {
    const html = await render({ canonical: 'https://tudominio.com/taxes/' });
    expect(html).toContain('<link rel="canonical" href="https://tudominio.com/taxes/"');
  });

  it('emite hreflang es y x-default siempre', async () => {
    const html = await render({});
    expect(html).toMatch(/hreflang="es"/);
    expect(html).toMatch(/hreflang="x-default"/);
  });
});
```
(Nota: `Astro.url` dentro del Container por defecto es `http://example.com/`; para los asserts de hreflang que dependen de la ruta, pasar `request` en `renderToString` con `new Request('http://example.com/taxes/')` si hace falta afinar.)

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/layouts/BaseLayout.test.ts`
Expected: FAIL — el HTML todavía contiene `NOMBRE_SITIO`.

- [ ] **Step 3: Editar el frontmatter de `src/layouts/BaseLayout.astro`**

Reemplazar líneas 1-35 (imports + cálculo de vars) por:
```astro
---
import { getAlternates } from "@config/routes";
import { SITE_NAME, OG_IMAGE, GSC_VERIFICATION, canonicalURL } from "@config/site";
import Navbar from "../components/Navbar.astro";
import Footer from "../components/Footer.astro";

import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  robots?: string;
  lang?: "es" | "en";
  canonical?: string;
  jsonLd?: Record<string, any> | null;
  image?: string;
}

const { title, description, robots, canonical, image, jsonLd } = Astro.props;

const lang = Astro.url.pathname.startsWith("/en") ? "en" : "es";
const alt = getAlternates(Astro.url.pathname);

const ogLocale = lang === "es" ? "es_US" : "en_US";
const ogLocaleAlternate = lang === "es" ? "en_US" : "es_US";
const htmlLang = { en: "en-US", es: "es-US" } as const;

const url = canonical ?? canonicalURL(Astro.url.pathname);
const siteName = SITE_NAME;
const ogImage = image ?? OG_IMAGE;
---
```

- [ ] **Step 4: Editar el `<head>` de `BaseLayout.astro`**

- Línea `<meta name="google-site-verification" content="" />` → `content={GSC_VERIFICATION}` y envolver en `{GSC_VERIFICATION && (...)}`.
- Reemplazar el bloque de 3 `<link rel="alternate" hreflang=...>` por:
  ```astro
  <link rel="alternate" hreflang="es" href={alt.es} />
  {alt.en && <link rel="alternate" hreflang="en" href={alt.en} />}
  <link rel="alternate" hreflang="x-default" href={alt.xDefault} />
  ```

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npm test -- src/layouts/BaseLayout.test.ts`
Expected: PASS.
Run también: `npx astro check` → 0 errores; `npx astro build` → build OK.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/layouts/BaseLayout.test.ts
git commit -m "refactor: BaseLayout usa config centralizada + hreflang por registro"
```

---

## Task 5: Sitemap + `robots.txt`

**Files:**
- Modify: `astro.config.mjs`
- Create: `public/robots.txt`

**Interfaces:**
- Consumes: `SITE_URL` de `@config/site`, `ROUTES` de `@config/routes`.
- Produces: `dist/sitemap-index.xml` + `dist/sitemap-0.xml` en build; `public/robots.txt` servido en `/robots.txt`.

- [ ] **Step 1: Editar `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/config/site.ts';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        // excluir rutas /en/* que aún no existen como archivo (Astro solo emite las que existen,
        // pero por si acaso: no listar EN mientras enBuilt=false en el registro)
        !page.includes('/en/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
```
Contingencia: si el import de `.ts` en `astro.config.mjs` falla, renombrar a `astro.config.ts` (Astro 6 lo soporta) o inline el string `'https://tudominio.com'` con un comentario `// = SITE_URL de src/config/site.ts`.

- [ ] **Step 2: Crear `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://tudominio.com/sitemap-index.xml
```
(Comentario para el equipo: el dominio es placeholder — cambiar junto con `SITE_URL`. Documentado en `CLAUDE.md`.)

- [ ] **Step 3: Build y verificar**

Run: `npx astro build`
Expected: `dist/sitemap-index.xml` existe. `dist/robots.txt` existe con la línea `Sitemap:`.
Run: `node -e "const fs=require('fs');process.exit(fs.existsSync('dist/sitemap-index.xml')?0:1)"`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs public/robots.txt
git commit -m "feat: sitemap.xml + robots.txt"
```

---

## Task 6: Script `check-links.mjs`

**Files:**
- Create: `scripts/check-links.mjs`

**Interfaces:**
- Consumes: `dist/**/*.html` (tras `astro build`).
- Produces: comando `npm run check:links`. Exit 1 si hay un enlace interno roto **cuyo destino** está bajo `/`, `/en`, `/contacto`, `/taxes`, `/irs`, `/itin-ein` (el alcance construido); enlaces a otras secciones (`/notaria`, `/inmigracion`, …) solo generan warning.

- [ ] **Step 1: Escribir un test que falla — `scripts/check-links.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { classifyLink } from './check-links.mjs';

describe('classifyLink', () => {
  it('ignora anclas, mailto, tel y externos', () => {
    expect(classifyLink('#top')).toBe('ignore');
    expect(classifyLink('mailto:a@b.com')).toBe('ignore');
    expect(classifyLink('tel:+1702')).toBe('ignore');
    expect(classifyLink('https://irs.gov')).toBe('ignore');
  });
  it('marca como "gate" los destinos dentro del alcance construido', () => {
    expect(classifyLink('/taxes/enmiendas')).toBe('gate');
    expect(classifyLink('/irs/')).toBe('gate');
    expect(classifyLink('/contacto')).toBe('gate');
    expect(classifyLink('/')).toBe('gate');
  });
  it('marca como "warn" secciones aún no construidas', () => {
    expect(classifyLink('/notaria/affidavit')).toBe('warn');
    expect(classifyLink('/nosotros')).toBe('warn');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- scripts/check-links.test.ts`
Expected: FAIL — no se puede importar `classifyLink`.

- [ ] **Step 3: Implementar `scripts/check-links.mjs`**

```js
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const GATE_PREFIXES = ['/taxes', '/irs', '/itin-ein', '/contacto', '/en'];

export function classifyLink(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
      href.startsWith('tel:') || /^https?:\/\//.test(href) || href.startsWith('//')) {
    return 'ignore';
  }
  if (!href.startsWith('/')) return 'ignore';
  const path = href.split('#')[0].split('?')[0];
  if (path === '/' || GATE_PREFIXES.some((p) => path === p || path.startsWith(p + '/') || path === p + '/')) {
    return 'gate';
  }
  return 'warn';
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (extname(entry.name) === '.html') out.push(full);
  }
  return out;
}

function resolves(path) {
  const clean = path.replace(/\/$/, '');
  return existsSync(join(DIST, clean, 'index.html')) ||
         existsSync(join(DIST, clean + '.html')) ||
         (path === '/' && existsSync(join(DIST, 'index.html')));
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('No existe dist/. Corré `astro build` primero.');
    process.exit(1);
  }
  const files = await walk(DIST);
  const broken = { gate: [], warn: [] };
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
      const kind = classifyLink(href);
      if (kind === 'ignore') continue;
      const path = href.split('#')[0].split('?')[0];
      if (!resolves(path)) broken[kind].push({ file: file.replace(DIST, ''), href });
    }
  }
  if (broken.warn.length) {
    console.warn(`\n⚠️  ${broken.warn.length} enlaces a secciones aún no construidas (OK por ahora):`);
    for (const b of [...new Set(broken.warn.map((b) => b.href))].sort()) console.warn(`   ${b}`);
  }
  if (broken.gate.length) {
    console.error(`\n❌ ${broken.gate.length} enlaces rotos DENTRO del alcance construido:`);
    for (const b of broken.gate) console.error(`   ${b.file}  →  ${b.href}`);
    process.exit(1);
  }
  console.log('\n✅ Sin enlaces rotos en el alcance construido.');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
```

- [ ] **Step 4: Correr los tests y el script**

Run: `npm test -- scripts/check-links.test.ts` → PASS.
Run: `npm run check:links` → build + check; Expected: `✅ Sin enlaces rotos en el alcance construido.` (warnings sobre `/notaria`, `/nosotros`, etc. son esperados).

- [ ] **Step 5: Commit**

```bash
git add scripts/check-links.mjs scripts/check-links.test.ts
git commit -m "feat: verificador de enlaces internos post-build"
```

---

## Task 7: `ServiceHero` + `TrustBar`

**Files:**
- Create: `src/components/service/ServiceHero.astro`, `src/components/service/ServiceHero.test.ts`
- Create: `src/components/service/TrustBar.astro`, `src/components/service/TrustBar.test.ts`

**Interfaces:**
- Consumes: `TRUST_BAR_DEFAULT_ES` de `@config/site`.
- Produces:
  ```astro
  <!-- ServiceHero.astro -->
  interface Props {
    eyebrow: string;
    heading: string;
    headingAccent?: string;   // fragmento en <em class="not-italic text-brand-light">
    ctaHref?: string;         // default '/contacto'
    ctaLabel?: string;        // default 'Agendar mi cita' (es) / 'Book my appointment' (en)
    lang?: 'es' | 'en';       // default 'es'
  }
  // slot por defecto: párrafos <p> de introducción

  <!-- TrustBar.astro -->
  interface Props {
    items?: string[];         // default TRUST_BAR_DEFAULT_ES
    ariaLabel?: string;       // default 'Por qué confiar en nosotros'
  }
  ```

- [ ] **Step 1: Tests que fallan**

`src/components/service/ServiceHero.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ServiceHero from './ServiceHero.astro';

const render = async (props: Record<string, unknown>, slot = '<p>Intro</p>') =>
  (await AstroContainer.create()).renderToString(ServiceHero, { props, slots: { default: slot } });

describe('ServiceHero', () => {
  it('renderiza un <h1> con el heading y el acento', async () => {
    const html = await render({ eyebrow: 'Taxes', heading: 'Taxes en Las Vegas', headingAccent: 'Sin Sorpresas' });
    expect(html).toMatch(/<h1[^>]*>/);
    expect(html).toContain('Taxes en Las Vegas');
    expect(html).toContain('Sin Sorpresas');
    expect(html).toContain('not-italic');
  });
  it('renderiza el slot de intro', async () => {
    const html = await render({ eyebrow: 'X', heading: 'Y' }, '<p>Párrafo de intro</p>');
    expect(html).toContain('Párrafo de intro');
  });
  it('CTA por defecto apunta a /contacto', async () => {
    const html = await render({ eyebrow: 'X', heading: 'Y' });
    expect(html).toContain('href="/contacto"');
  });
  it('respeta ctaHref y ctaLabel', async () => {
    const html = await render({ eyebrow: 'X', heading: 'Y', ctaHref: 'https://wa.me/1', ctaLabel: 'WhatsApp' });
    expect(html).toContain('https://wa.me/1');
    expect(html).toContain('WhatsApp');
  });
});
```

`src/components/service/TrustBar.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import TrustBar from './TrustBar.astro';
import { TRUST_BAR_DEFAULT_ES } from '@config/site';

const render = async (props: Record<string, unknown> = {}) =>
  (await AstroContainer.create()).renderToString(TrustBar, { props });

describe('TrustBar', () => {
  it('usa los 4 ítems por defecto', async () => {
    const html = await render();
    for (const item of TRUST_BAR_DEFAULT_ES) expect(html).toContain(item);
  });
  it('acepta ítems propios', async () => {
    const html = await render({ items: ['Uno', 'Dos'] });
    expect(html).toContain('Uno');
    expect(html).toContain('Dos');
  });
  it('es una lista', async () => {
    const html = await render();
    expect(html).toMatch(/role="list"|<ul/);
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npm test -- src/components/service/`
Expected: FAIL — módulos no encontrados.

- [ ] **Step 3: Implementar `ServiceHero.astro`**

Base el markup en `src/pages/taxes/index.astro` líneas 131-182 (sección HERO), con estos cambios:
- `interface Props` como en Interfaces arriba; `const { eyebrow, heading, headingAccent, ctaHref = '/contacto', ctaLabel, lang = 'es' } = Astro.props;`
- `const ctaText = ctaLabel ?? (lang === 'es' ? 'Agendar mi cita' : 'Book my appointment');`
- El `<span>` del eyebrow usa `{eyebrow}`.
- El `<h1>` renderiza `{heading}` y, si `headingAccent`, `{' '}<em class="not-italic text-brand-light">{headingAccent}</em>`.
- Los párrafos de intro salen de `<slot />` (quitar los `<p>` hardcodeados).
- El `<a>` del CTA usa `href={ctaHref}` y `{ctaText}`; conservar el SVG de flecha y las clases de botón (`rounded-full bg-brand-light px-8 py-4 ... focus-visible:outline-2 focus-visible:outline-brand-light`).
- Mantener `<section class="bg-white pt-10 pb-16 lg:pt-14 lg:pb-24" aria-labelledby="service-h1">` y `id="service-h1"` en el `<h1>`.

- [ ] **Step 4: Implementar `TrustBar.astro`**

Base el markup en `src/pages/taxes/index.astro` líneas 184-218 (sección TRUST BAR):
- `import { TRUST_BAR_DEFAULT_ES } from '@config/site';`
- `interface Props { items?: string[]; ariaLabel?: string; }`
- `const { items = TRUST_BAR_DEFAULT_ES, ariaLabel = 'Por qué confiar en nosotros' } = Astro.props;`
- `<section class="bg-accent py-6" aria-label={ariaLabel}>` → `.map(items)` en vez del array literal. Conservar el `<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" role="list">` y el SVG de check `text-accent-dark`.

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npm test -- src/components/service/` → PASS. `npx astro check` → 0 errores.

- [ ] **Step 6: Commit**

```bash
git add src/components/service/ServiceHero.astro src/components/service/ServiceHero.test.ts src/components/service/TrustBar.astro src/components/service/TrustBar.test.ts
git commit -m "feat: componentes ServiceHero y TrustBar"
```

---

## Task 8: `ServiceList` + `RelatedServices`

**Files:**
- Create: `src/components/service/ServiceList.astro` + `.test.ts`
- Create: `src/components/service/RelatedServices.astro` + `.test.ts`

**Interfaces:**
- Produces:
  ```astro
  <!-- ServiceList.astro (grid de tarjetas-enlace, para pilares) -->
  interface Props {
    eyebrow?: string;
    heading: string;
    intro?: string;
    items: { label: string; href: string; description: string }[];
    lang?: 'es' | 'en';   // default 'es' — texto "Ver más"/"Learn more"
  }

  <!-- RelatedServices.astro (interlinking horizontal a hermanas / pilar) -->
  interface Props {
    heading: string;
    items: { label: string; href: string }[];
  }
  ```

- [ ] **Step 1: Tests que fallan**

`ServiceList.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ServiceList from './ServiceList.astro';

const items = [
  { label: 'Declaración personal', href: '/taxes/declaracion-personal', description: 'Para individuos y familias.' },
  { label: 'Enmiendas', href: '/taxes/enmiendas', description: 'Corregimos errores.' },
];
const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(ServiceList, { props });

describe('ServiceList', () => {
  it('renderiza una tarjeta por ítem con su href', async () => {
    const html = await render({ heading: 'Servicios', items });
    expect(html).toContain('href="/taxes/declaracion-personal"');
    expect(html).toContain('href="/taxes/enmiendas"');
    expect(html).toContain('Declaración personal');
    expect(html).toContain('Corregimos errores.');
  });
  it('renderiza el heading como <h2>', async () => {
    const html = await render({ heading: 'Nuestros servicios', items });
    expect(html).toMatch(/<h2[^>]*>[^<]*Nuestros servicios/);
  });
  it('usa <h3> para el label de cada tarjeta', async () => {
    const html = await render({ heading: 'X', items });
    expect(html).toMatch(/<h3/);
  });
});
```

`RelatedServices.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import RelatedServices from './RelatedServices.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(RelatedServices, { props });

describe('RelatedServices', () => {
  it('lista los enlaces relacionados', async () => {
    const html = await render({
      heading: 'Servicios relacionados',
      items: [{ label: 'ITIN', href: '/itin-ein/solicitar-itin' }],
    });
    expect(html).toContain('Servicios relacionados');
    expect(html).toContain('href="/itin-ein/solicitar-itin"');
    expect(html).toContain('ITIN');
  });
  it('es navegable (nav o lista)', async () => {
    const html = await render({ heading: 'X', items: [{ label: 'a', href: '/a' }] });
    expect(html).toMatch(/<nav|role="list"|<ul/);
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npm test -- src/components/service/ServiceList.test.ts src/components/service/RelatedServices.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar `ServiceList.astro`**

Base el markup en `src/pages/taxes/index.astro` líneas 220-286 (sección SERVICES):
- `interface Props` como arriba; `const { eyebrow, heading, intro, items, lang = 'es' } = Astro.props;`
- `const moreText = lang === 'es' ? 'Ver más' : 'Learn more';`
- Header de sección: `{eyebrow && <span class="text-xs font-bold tracking-widest text-brand-light uppercase">{eyebrow}</span>}`, `<h2 id="services-heading" class="font-display ...">{heading}</h2>`, `{intro && <p class="text-neutral-grey mt-4 max-w-xl mx-auto leading-relaxed">{intro}</p>}`.
- `<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">` con `items.map(svc => ...)`: `<a href={svc.href}>` tarjeta, `<h3>{svc.label}</h3>`, `<p>{svc.description}</p>`, `<span>{moreText} <svg.../></span>`. Conservar clases y el borde animado `scale-y-0 group-hover:scale-y-100`.
- `<section class="py-20 lg:py-28 bg-background-light" aria-labelledby="services-heading">`.

- [ ] **Step 4: Implementar `RelatedServices.astro`**

Nuevo, discreto (patrón del footer del panel del MegaMenu):
```astro
---
interface Props {
  heading: string;
  items: { label: string; href: string }[];
}
const { heading, items } = Astro.props;
---
<section class="py-14 bg-white border-t border-background-muted" aria-labelledby="related-heading">
  <div class="container-custom">
    <h2 id="related-heading" class="text-xs font-bold tracking-widest text-brand-light uppercase mb-4">
      {heading}
    </h2>
    <ul class="flex flex-wrap gap-x-6 gap-y-2" role="list">
      {items.map((it) => (
        <li>
          <a href={it.href} class="text-sm font-semibold text-neutral-dark hover:text-brand-light hover:underline transition-colors">
            {it.label} <span aria-hidden="true">→</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npm test -- src/components/service/ServiceList.test.ts src/components/service/RelatedServices.test.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/service/ServiceList.astro src/components/service/ServiceList.test.ts src/components/service/RelatedServices.astro src/components/service/RelatedServices.test.ts
git commit -m "feat: componentes ServiceList y RelatedServices"
```

---

## Task 9: `ProcessSteps` + `DocsChecklist`

**Files:**
- Create: `src/components/service/ProcessSteps.astro` + `.test.ts`
- Create: `src/components/service/DocsChecklist.astro` + `.test.ts`

**Interfaces:**
- Produces:
  ```astro
  <!-- ProcessSteps.astro -->
  interface Props { heading: string; steps: { title: string; body: string }[]; }
  <!-- DocsChecklist.astro -->
  interface Props { heading: string; items: string[]; note?: string; }
  ```

- [ ] **Step 1: Tests que fallan**

`ProcessSteps.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ProcessSteps from './ProcessSteps.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(ProcessSteps, { props });

describe('ProcessSteps', () => {
  const steps = [
    { title: 'Agenda tu cita', body: 'Por WhatsApp o teléfono.' },
    { title: 'Trae tus documentos', body: 'Lista abajo.' },
  ];
  it('usa una lista ordenada', async () => {
    const html = await render({ heading: 'Cómo funciona', steps });
    expect(html).toMatch(/<ol/);
  });
  it('renderiza título y cuerpo de cada paso', async () => {
    const html = await render({ heading: 'Cómo funciona', steps });
    expect(html).toContain('Agenda tu cita');
    expect(html).toContain('Por WhatsApp o teléfono.');
    expect(html).toContain('Trae tus documentos');
  });
  it('renderiza el heading como <h2>', async () => {
    const html = await render({ heading: 'Cómo funciona el proceso', steps });
    expect(html).toMatch(/<h2[^>]*>[^<]*Cómo funciona el proceso/);
  });
});
```

`DocsChecklist.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import DocsChecklist from './DocsChecklist.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(DocsChecklist, { props });

describe('DocsChecklist', () => {
  it('lista cada documento', async () => {
    const html = await render({ heading: 'Documentos', items: ['Identificación oficial', 'W-2 de cada trabajo'] });
    expect(html).toContain('Identificación oficial');
    expect(html).toContain('W-2 de cada trabajo');
    expect(html).toMatch(/role="list"|<ul/);
  });
  it('muestra la nota si se pasa', async () => {
    const html = await render({ heading: 'X', items: ['a'], note: 'Si te falta algo, dínoslo antes.' });
    expect(html).toContain('Si te falta algo, dínoslo antes.');
  });
  it('omite la nota si no se pasa', async () => {
    const html = await render({ heading: 'X', items: ['a'] });
    expect(html).not.toContain('undefined');
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npm test -- src/components/service/ProcessSteps.test.ts src/components/service/DocsChecklist.test.ts` → FAIL.

- [ ] **Step 3: Implementar `ProcessSteps.astro`**

Base el markup en `src/pages/taxes/index.astro` líneas 288-329 (sección "POR QUÉ ELEGIRNOS", que usa el patrón de número en círculo), adaptado a `<ol>`:
```astro
---
interface Props { heading: string; steps: { title: string; body: string }[]; }
const { heading, steps } = Astro.props;
---
<section class="py-20 lg:py-28 bg-white" aria-labelledby="process-heading">
  <div class="container-custom">
    <div class="max-w-3xl mx-auto">
      <h2 id="process-heading" class="font-display text-3xl md:text-4xl font-bold text-neutral-dark mb-10 leading-tight">
        {heading}
      </h2>
      <ol class="flex flex-col gap-5">
        {steps.map((step, i) => (
          <li class="flex gap-5 items-start bg-background-light rounded-2xl p-6">
            <span class="shrink-0 size-10 rounded-xl bg-brand-light flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3 class="font-semibold text-neutral-dark mb-1">{step.title}</h3>
              <p class="text-sm text-neutral-grey leading-relaxed">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Implementar `DocsChecklist.astro`**

```astro
---
interface Props { heading: string; items: string[]; note?: string; }
const { heading, items, note } = Astro.props;
---
<section class="py-20 lg:py-28 bg-background-light" aria-labelledby="docs-heading">
  <div class="container-custom">
    <div class="max-w-2xl mx-auto">
      <h2 id="docs-heading" class="font-display text-3xl md:text-4xl font-bold text-neutral-dark mb-8 leading-tight">
        {heading}
      </h2>
      <ul class="flex flex-col gap-3" role="list">
        {items.map((item) => (
          <li class="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-brand-light shrink-0 mt-0.5" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm text-neutral-dark leading-snug">{item}</span>
          </li>
        ))}
      </ul>
      {note && <p class="text-sm text-neutral-grey italic mt-5">{note}</p>}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npm test -- src/components/service/ProcessSteps.test.ts src/components/service/DocsChecklist.test.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/service/ProcessSteps.astro src/components/service/ProcessSteps.test.ts src/components/service/DocsChecklist.astro src/components/service/DocsChecklist.test.ts
git commit -m "feat: componentes ProcessSteps y DocsChecklist"
```

---

## Task 10: `InfoBlock` + `WhyUs`

**Files:**
- Create: `src/components/service/InfoBlock.astro` + `.test.ts`
- Create: `src/components/service/WhyUs.astro` + `.test.ts`

**Interfaces:**
- Produces:
  ```astro
  <!-- InfoBlock.astro — bloque prosa/listas genérico -->
  interface Props { eyebrow?: string; heading: string; bg?: 'white' | 'light'; }
  // slot por defecto: prosa libre (<p>, <ul>, etc.)

  <!-- WhyUs.astro -->
  interface Props { heading: string; intro?: string; items: { heading: string; body: string }[]; }
  ```

- [ ] **Step 1: Tests que fallan**

`InfoBlock.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import InfoBlock from './InfoBlock.astro';

const render = async (props: Record<string, unknown>, slot = '<p>cuerpo</p>') =>
  (await AstroContainer.create()).renderToString(InfoBlock, { props, slots: { default: slot } });

describe('InfoBlock', () => {
  it('renderiza heading <h2> y el slot', async () => {
    const html = await render({ heading: 'Cuánto tarda' }, '<p>Entre 7 y 11 semanas.</p>');
    expect(html).toMatch(/<h2[^>]*>[^<]*Cuánto tarda/);
    expect(html).toContain('Entre 7 y 11 semanas.');
  });
  it('renderiza el eyebrow si se pasa', async () => {
    const html = await render({ heading: 'X', eyebrow: 'Tiempos' });
    expect(html).toContain('Tiempos');
  });
});
```

`WhyUs.test.ts`:
```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import WhyUs from './WhyUs.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(WhyUs, { props });

describe('WhyUs', () => {
  const items = [
    { heading: 'Precio claro antes de empezar', body: 'No "vamos viendo".' },
    { heading: 'Revisamos contigo', body: 'En español, línea por línea.' },
  ];
  it('renderiza cada razón con <h3> y cuerpo', async () => {
    const html = await render({ heading: 'Por qué elegirnos', items });
    expect(html).toContain('Precio claro antes de empezar');
    expect(html).toContain('En español, línea por línea.');
    expect(html).toMatch(/<h3/);
  });
  it('renderiza intro si se pasa', async () => {
    const html = await render({ heading: 'X', intro: 'Trabajamos distinto.', items });
    expect(html).toContain('Trabajamos distinto.');
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npm test -- src/components/service/InfoBlock.test.ts src/components/service/WhyUs.test.ts` → FAIL.

- [ ] **Step 3: Implementar `InfoBlock.astro`**

```astro
---
interface Props { eyebrow?: string; heading: string; bg?: 'white' | 'light'; }
const { eyebrow, heading, bg = 'white' } = Astro.props;
const bgClass = bg === 'light' ? 'bg-background-light' : 'bg-white';
---
<section class:list={['py-16 lg:py-20', bgClass]} aria-labelledby="info-heading">
  <div class="container-custom">
    <div class="max-w-2xl mx-auto">
      {eyebrow && <span class="text-xs font-bold tracking-widest text-brand-light uppercase">{eyebrow}</span>}
      <h2 id="info-heading" class="font-display text-3xl md:text-4xl font-bold text-neutral-dark mt-3 mb-6 leading-tight">
        {heading}
      </h2>
      <div class="prose-service text-neutral-grey leading-relaxed flex flex-col gap-4">
        <slot />
      </div>
    </div>
  </div>
</section>
```
(No hace falta plugin de prose; `prose-service` es solo un hook de clase por si luego se estiliza. Los `<p>`/`<ul>` del slot heredan `text-neutral-grey`.)

- [ ] **Step 4: Implementar `WhyUs.astro`**

Base en `src/pages/taxes/index.astro` líneas 288-329:
```astro
---
interface Props { heading: string; intro?: string; items: { heading: string; body: string }[]; }
const { heading, intro, items } = Astro.props;
---
<section class="py-20 lg:py-28 bg-cream" aria-labelledby="whyus-heading">
  <div class="container-custom">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-12">
        <h2 id="whyus-heading" class="font-display text-3xl md:text-4xl font-bold text-neutral-dark leading-tight">
          {heading}
        </h2>
        {intro && <p class="text-neutral-grey mt-4 leading-relaxed">{intro}</p>}
      </div>
      <ul class="flex flex-col gap-5" role="list">
        {items.map((item, i) => (
          <li class="flex gap-5 items-start bg-white rounded-2xl p-6 shadow-sm">
            <span class="shrink-0 size-10 rounded-xl bg-brand-light flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3 class="font-semibold text-neutral-dark mb-1">{item.heading}</h3>
              <p class="text-sm text-neutral-grey leading-relaxed">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npm test -- src/components/service/InfoBlock.test.ts src/components/service/WhyUs.test.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/service/InfoBlock.astro src/components/service/InfoBlock.test.ts src/components/service/WhyUs.astro src/components/service/WhyUs.test.ts
git commit -m "feat: componentes InfoBlock y WhyUs"
```

---

## Task 11: `FaqSection`

**Files:**
- Create: `src/components/service/FaqSection.astro` + `.test.ts`

**Interfaces:**
- Produces:
  ```astro
  interface Props {
    items: { q: string; a: string }[];
    heading?: string;   // default 'Preguntas frecuentes'
  }
  ```
  Solo renderiza el acordeón. El JSON-LD `FAQPage` lo emite `ServiceLayout` (Task 13) a partir del **mismo array** que la página pasa a ambos.

- [ ] **Step 1: Test que falla — `src/components/service/FaqSection.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import FaqSection from './FaqSection.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(FaqSection, { props });

const items = [
  { q: '¿Necesito cita?', a: 'Puedes agendar por WhatsApp o llegar en horario.' },
  { q: '¿Puedo declarar con ITIN?', a: 'Sí, trabajamos con ITIN regularmente.' },
];

describe('FaqSection', () => {
  it('renderiza un <details> por pregunta con su respuesta', async () => {
    const html = await render({ items });
    expect((html.match(/<details/g) ?? []).length).toBe(2);
    expect(html).toContain('¿Necesito cita?');
    expect(html).toContain('trabajamos con ITIN regularmente');
  });
  it('usa <dl>/<dt>/<dd> para semántica', async () => {
    const html = await render({ items });
    expect(html).toMatch(/<dl/);
    expect(html).toMatch(/<dt/);
    expect(html).toMatch(/<dd/);
  });
  it('heading por defecto', async () => {
    const html = await render({ items });
    expect(html).toContain('Preguntas frecuentes');
  });
  it('NO emite JSON-LD (lo hace el layout)', async () => {
    const html = await render({ items });
    expect(html).not.toContain('application/ld+json');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/components/service/FaqSection.test.ts` → FAIL.

- [ ] **Step 3: Implementar `FaqSection.astro`**

Base el markup en `src/pages/taxes/index.astro` líneas 331-378 (sección FAQ), quitando el `faqJsonLd`:
```astro
---
interface Props { items: { q: string; a: string }[]; heading?: string; }
const { items, heading = 'Preguntas frecuentes' } = Astro.props;
---
<section class="py-20 lg:py-28 bg-background-light" aria-labelledby="faq-heading">
  <div class="container-custom">
    <div class="max-w-2xl mx-auto">
      <h2 id="faq-heading" class="font-display text-3xl md:text-4xl font-bold text-neutral-dark text-center mb-12 leading-tight">
        {heading}
      </h2>
      <dl class="flex flex-col gap-3">
        {items.map((faq) => (
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <details class="group">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold text-neutral-dark hover:text-brand-light transition-colors">
                <dt>{faq.q}</dt>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 shrink-0 text-brand-light transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
              </summary>
              <dd class="px-6 pb-5 text-sm text-neutral-grey leading-relaxed border-t border-background-muted pt-4">
                {faq.a}
              </dd>
            </details>
          </div>
        ))}
      </dl>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test -- src/components/service/FaqSection.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/service/FaqSection.astro src/components/service/FaqSection.test.ts
git commit -m "feat: componente FaqSection (acordeón, sin JSON-LD)"
```

---

## Task 12: `CtaBanner`

**Files:**
- Create: `src/components/service/CtaBanner.astro` + `.test.ts`

**Interfaces:**
- Consumes: `BUSINESS` de `@config/site`.
- Produces:
  ```astro
  interface Props {
    heading: string;
    body?: string;
    eyebrow?: string;       // default 'Sin compromiso, sin costo' (es)
    ctaHref?: string;       // default '/contacto'
    ctaLabel?: string;      // default 'Agendar mi cita gratis' (es)
    lang?: 'es' | 'en';
  }
  ```

- [ ] **Step 1: Test que falla — `src/components/service/CtaBanner.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CtaBanner from './CtaBanner.astro';
import { BUSINESS } from '@config/site';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(CtaBanner, { props });

describe('CtaBanner', () => {
  it('renderiza heading <h2> y CTA a /contacto por defecto', async () => {
    const html = await render({ heading: '¿Listo para declarar?' });
    expect(html).toMatch(/<h2[^>]*>[^<]*¿Listo para declarar\?/);
    expect(html).toContain('href="/contacto"');
  });
  it('incluye el teléfono del negocio en un <address>', async () => {
    const html = await render({ heading: 'X' });
    expect(html).toMatch(/<address/);
    expect(html).toContain(BUSINESS.phoneDisplay);
    expect(html).toContain(`tel:${BUSINESS.phone.replace('+', '')}`);
  });
  it('renderiza body y eyebrow si se pasan', async () => {
    const html = await render({ heading: 'X', body: 'Consulta sin costo.', eyebrow: 'Sin compromiso' });
    expect(html).toContain('Consulta sin costo.');
    expect(html).toContain('Sin compromiso');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/components/service/CtaBanner.test.ts` → FAIL.

- [ ] **Step 3: Implementar `CtaBanner.astro`**

Base el markup en `src/pages/taxes/index.astro` líneas 380-438 (sección CTA FINAL), reemplazando los datos hardcodeados por `BUSINESS`:
- `import { BUSINESS } from '@config/site';`
- Props como arriba. `const eyebrowText = eyebrow ?? (lang === 'es' ? 'Sin compromiso, sin costo' : 'No commitment, no cost');` `const ctaText = ctaLabel ?? (lang === 'es' ? 'Agendar mi cita gratis' : 'Book my free appointment');`
- `<section class="bg-midnight py-20 lg:py-28 text-center" aria-labelledby="cta-banner-heading">`; `<h2 id="cta-banner-heading">{heading}</h2>`; `{body && <p class="text-white/60 ...">{body}</p>}`.
- `<a href={ctaHref}>` (default `/contacto`) con `{ctaText}` + SVG flecha.
- `<address class="not-italic mt-12 border-t border-white/10 pt-8">` con `<ul role="list">`:
  - `<a href={`tel:${BUSINESS.phone.replace('+','')}`}>{BUSINESS.phoneDisplay}</a>`
  - `{BUSINESS.address.street}, {BUSINESS.address.city}, {BUSINESS.address.region} {BUSINESS.address.postalCode}`
  - `{BUSINESS.hoursDisplay}`

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test -- src/components/service/CtaBanner.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/service/CtaBanner.astro src/components/service/CtaBanner.test.ts
git commit -m "feat: componente CtaBanner con datos de BUSINESS"
```

---

## Task 13: `ServiceLayout.astro`

**Files:**
- Create: `src/layouts/ServiceLayout.astro`, `src/layouts/ServiceLayout.test.ts`

**Interfaces:**
- Consumes: `BaseLayout` (`../layouts/BaseLayout.astro`), `Breadcrumb` (`../components/Breadcrumb.astro`), `buildServiceJsonLd`, `canonicalURL` de `@config/site`.
- Produces:
  ```astro
  interface Props {
    title: string;
    description: string;
    lang?: 'es' | 'en';                       // default 'es'
    breadcrumbLabel: string;                  // = H1 exacto de la página
    service: { name: string; serviceType: string };
    faqs?: { q: string; a: string }[];
    itemList?: { name: string; url: string }[];
  }
  ```
  Render: `BaseLayout` → `<Breadcrumb>` dentro de `.container-custom pt-6` → `<slot />`. Emite en `slot="head"`: `Service` JSON-LD siempre; `FAQPage` si `faqs`; `ItemList` si `itemList`.

- [ ] **Step 1: Test que falla — `src/layouts/ServiceLayout.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ServiceLayout from './ServiceLayout.astro';

const base = {
  title: 'Enmiendas de Impuestos | Las Vegas',
  description: 'Corregimos tu declaración con el formulario 1040-X.',
  breadcrumbLabel: 'Enmiendas de Impuestos (Formulario 1040-X) en Las Vegas',
  service: { name: 'Enmiendas de impuestos', serviceType: 'Tax preparation' },
};
const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(ServiceLayout, {
    props: { ...base, ...props },
    slots: { default: '<p>cuerpo de la página</p>' },
  });

describe('ServiceLayout', () => {
  it('emite JSON-LD Service', async () => {
    const html = await render({});
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('Enmiendas de impuestos');
  });
  it('emite FAQPage cuando hay faqs', async () => {
    const html = await render({ faqs: [{ q: '¿Cuánto tarda?', a: 'Unas 16 semanas.' }] });
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('¿Cuánto tarda?');
  });
  it('NO emite FAQPage sin faqs', async () => {
    const html = await render({});
    expect(html).not.toContain('FAQPage');
  });
  it('emite ItemList cuando se pasa (pilares)', async () => {
    const html = await render({ itemList: [{ name: 'Solución de deudas', url: 'https://tudominio.com/irs/solucion-deudas' }] });
    expect(html).toContain('"@type":"ItemList"');
  });
  it('renderiza el breadcrumb con el label', async () => {
    const html = await render({});
    expect(html).toContain('Enmiendas de Impuestos (Formulario 1040-X) en Las Vegas');
  });
  it('renderiza el slot', async () => {
    const html = await render({});
    expect(html).toContain('cuerpo de la página');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/layouts/ServiceLayout.test.ts` → FAIL.

- [ ] **Step 3: Implementar `src/layouts/ServiceLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Breadcrumb from '../components/Breadcrumb.astro';
import { buildServiceJsonLd, canonicalURL } from '@config/site';

interface Props {
  title: string;
  description: string;
  lang?: 'es' | 'en';
  breadcrumbLabel: string;
  service: { name: string; serviceType: string };
  faqs?: { q: string; a: string }[];
  itemList?: { name: string; url: string }[];
}

const { title, description, lang = 'es', breadcrumbLabel, service, faqs, itemList } = Astro.props;

const url = canonicalURL(Astro.url.pathname);

const serviceJsonLd = buildServiceJsonLd({
  name: service.name,
  description,
  serviceType: service.serviceType,
  url,
  lang,
});

const faqJsonLd = faqs && faqs.length
  ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }
  : null;

const itemListJsonLd = itemList && itemList.length
  ? {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: itemList.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: it.url,
      })),
    }
  : null;
---

<BaseLayout {title} {description} {lang} jsonLd={serviceJsonLd}>
  {faqJsonLd && (
    <script type="application/ld+json" slot="head" set:html={JSON.stringify(faqJsonLd)} />
  )}
  {itemListJsonLd && (
    <script type="application/ld+json" slot="head" set:html={JSON.stringify(itemListJsonLd)} />
  )}

  <div class="container-custom pt-6">
    <Breadcrumb {lang} currentLabel={breadcrumbLabel} />
  </div>

  <slot />
</BaseLayout>
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npm test -- src/layouts/ServiceLayout.test.ts` → PASS. `npx astro check` → 0 errores.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/ServiceLayout.astro src/layouts/ServiceLayout.test.ts
git commit -m "feat: ServiceLayout con JSON-LD Service/FAQPage/ItemList"
```

---

## Task 14: `Breadcrumb.astro` — barra final en pilares + placeholders de pilares IRS/ITIN

**Files:**
- Modify: `src/components/Breadcrumb.astro`
- Create: `src/components/Breadcrumb.test.ts`
- Create: `src/pages/irs/index.astro`, `src/pages/itin-ein/index.astro` (placeholders mínimos para que `/irs/*` e `/itin-ein/*` resuelvan en `check:links`; contenido real en Plan 2)

**Interfaces:**
- Consumes: `SITE_URL` de `@config/site` (cambiar el import).
- Produces: `Breadcrumb` con `categoryMap` cuyas URLs de pilar terminan en `/` (`/taxes/`, `/irs/`, `/itin-ein/`, etc. y sus `/en/...`). El anidamiento `/irs/*` bajo Taxes se conserva.

- [ ] **Step 1: Test que falla — `src/components/Breadcrumb.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Breadcrumb from './Breadcrumb.astro';

async function renderAt(pathname: string, props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Breadcrumb, {
    props,
    request: new Request(`https://tudominio.com${pathname}`),
  });
}

describe('Breadcrumb', () => {
  it('pilar Taxes con barra final', async () => {
    const html = await renderAt('/taxes/enmiendas', { lang: 'es', currentLabel: 'Enmiendas' });
    expect(html).toContain('href="/taxes/"');
  });
  it('anida /irs/* bajo Taxes', async () => {
    const html = await renderAt('/irs/solucion-deudas', { lang: 'es', currentLabel: 'Solución de deudas' });
    expect(html).toContain('href="/taxes/"');
    expect(html).toContain('href="/irs/"');
    expect(html).toContain('Solución de deudas');
  });
  it('JSON-LD BreadcrumbList con URLs absolutas', async () => {
    const html = await renderAt('/itin-ein/renovar-itin', { lang: 'es', currentLabel: 'Renovar ITIN' });
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('https://tudominio.com/itin-ein/');
  });
});
```
(Si el Container no propaga bien `Astro.url` desde `request`, ajustar el test para pasar `routePattern`/`params` según la doc de la versión de Astro instalada; el objetivo del assert no cambia.)

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/components/Breadcrumb.test.ts`
Expected: FAIL — hoy `categoryMap` tiene `/taxes` sin barra.

- [ ] **Step 3: Editar `src/components/Breadcrumb.astro`**

- Línea 2: `import { SITE_URL } from '../utils/hreflang';` → `import { SITE_URL } from '@config/site';`
- En `categoryMap.es`: cambiar `url: '/taxes'` → `'/taxes/'`, `'/irs'` → `'/irs/'`, `'/itin-ein'` → `'/itin-ein/'`, `'/notaria'` → `'/notaria/'`, `'/inmigracion'` → `'/inmigracion/'`, `'/negocio'` → `'/negocio/'`, `'/dmv'` → `'/dmv/'`, `'/corte'` → `'/corte/'`, `'/otros'` → `'/otros/'`.
- En `categoryMap.en`: igual con prefijo `/en/`: `'/en/taxes/'`, `'/en/irs/'`, `'/en/itin-ein/'`, `'/en/notary/'`, `'/en/immigration/'`, `'/en/business/'`, `'/en/dmv/'`, `'/en/court/'`, `'/en/other/'`.
- En el JSON-LD (línea ~72): `item: SITE_URL + (crumb.url === '/' ? '/' : crumb.url)` — como las URLs de pilar ya traen barra, queda bien; verificar que el `currentLabel` use `canonicalURL(pathname)` no está pedido — dejar `pathname` tal cual (es la URL de la página actual).

- [ ] **Step 4: Crear placeholders de pilar**

`src/pages/irs/index.astro`:
```astro
---
import ServiceLayout from '../../layouts/ServiceLayout.astro';
// TODO(Plan 2): contenido real del pilar IRS
---
<ServiceLayout
  title="IRS y Resolución Fiscal en Español en Las Vegas | Data's & Multiservices"
  description="Te ayudamos en español con deudas, cartas, auditorías, acuerdos de pago y transcripciones del IRS. Representación real en Las Vegas."
  breadcrumbLabel="IRS y Resolución Fiscal en Español en Las Vegas"
  service={{ name: 'Resolución fiscal ante el IRS', serviceType: 'Tax resolution' }}
>
  <section class="container-custom py-20">
    <h1 class="font-display text-4xl font-bold text-neutral-dark">IRS y Resolución Fiscal en Español en Las Vegas</h1>
    <p class="text-neutral-grey mt-4">[PLACEHOLDER: contenido del pilar IRS — Plan 2]</p>
  </section>
</ServiceLayout>
```

`src/pages/itin-ein/index.astro`: idéntico patrón con
- title `"ITIN y EIN en Español en Las Vegas | Data's & Multiservices"`
- description `"Solicitamos y renovamos tu ITIN Number y tu EIN de negocio en español, aunque no tengas número de Social Security. Oficina en Las Vegas."`
- breadcrumbLabel / h1 `"ITIN y EIN en Español en Las Vegas"`
- service `{ name: 'Trámite de ITIN y EIN', serviceType: 'Tax identification services' }`

- [ ] **Step 5: Correr los tests y verificar**

Run: `npm test -- src/components/Breadcrumb.test.ts` → PASS.
Run: `npx astro build` → OK (3 páginas nuevas: `/irs/`, `/itin-ein/` + las de tasks previas).

- [ ] **Step 6: Commit**

```bash
git add src/components/Breadcrumb.astro src/components/Breadcrumb.test.ts src/pages/irs/index.astro src/pages/itin-ein/index.astro
git commit -m "refactor: breadcrumb con barra final en pilares + placeholders IRS/ITIN"
```

---

## Task 15: Alinear hrefs de `Navbar` + pillarUrls del Home

**Files:**
- Modify: `src/components/Navbar.astro`
- Modify: `src/components/ServicesSection.astro`
- Create: `src/components/Navbar.test.ts`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `Navbar` cuyos hrefs del bloque Taxes/IRS/ITIN coinciden con los slugs finales del `CONTENT-STRATEGY.md §3`; pillarUrls (`item.href`) de las 6 categorías con barra final. `ServicesSection` con pillarUrls ES con barra.

- [ ] **Step 1: Test que falla — `src/components/Navbar.test.ts`**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = readFileSync(new URL('./Navbar.astro', import.meta.url), 'utf8');

describe('Navbar — hrefs alineados al CONTENT-STRATEGY', () => {
  const obsoletos = [
    '/taxes/seguimiento"', '/taxes/transcripciones-irs', '/taxes/asesoria-negocio"',
    '/irs/cartas-irs', '/irs/deudas-irs', '/irs/pagos-irs',
    '/itin-ein/solicitud-itin', '/itin-ein/renovacion-itin', '/itin-ein/solicitud-ein',
  ];
  for (const o of obsoletos) {
    it(`ya no contiene ${o}`, () => {
      expect(src).not.toContain(o);
    });
  }
  const finales = [
    '/taxes/seguimiento-reembolso', '/taxes/formularios-1099',
    '/irs/solucion-deudas', '/irs/resolucion-cartas', '/irs/acuerdos-pago', '/irs/transcripciones',
    '/itin-ein/solicitar-itin', '/itin-ein/renovar-itin', '/itin-ein/solicitar-ein',
  ];
  for (const f of finales) {
    it(`contiene ${f}`, () => {
      expect(src).toContain(f);
    });
  }
  it('pillarUrls con barra final', () => {
    expect(src).toMatch(/label:\s*"Taxes",\s*\n\s*href:\s*"\/taxes\/"/);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/components/Navbar.test.ts` → FAIL.

- [ ] **Step 3: Editar `src/components/Navbar.astro` (bloque `data.es`)**

Aplicar exactamente estos cambios de `href` (tab del mega menú entre paréntesis):
- `item.href` de `"Taxes"`: `/taxes` → `/taxes/`
- `item.href` de `"ITIN / EIN"`: `/itin-ein` → `/itin-ein/`
- `item.href` de `"Notary Public"`: `/notaria` → `/notaria/`
- `item.href` de `"Inmigración"`: `/inmigracion` → `/inmigracion/`
- (Taxes Personales) `Seguimiento de impuestos` href `/taxes/seguimiento` → `/taxes/seguimiento-reembolso`
- (Taxes Personales) quitar el item `Transcripciones IRS` (`/taxes/transcripciones-irs`) de este tab
- (Taxes de Negocio) `Asesoría de impuestos de negocio` href `/taxes/asesoria-negocio` → `/negocio/asesoria-impuestos-negocio`
- (IRS & Resolución Fiscal) `Resolución de cartas del IRS` href `/irs/cartas-irs` → `/irs/resolucion-cartas`
- (IRS & Resolución Fiscal) `Solución de deudas con el IRS` href `/irs/deudas-irs` → `/irs/solucion-deudas`
- (IRS & Resolución Fiscal) quitar el item `Pagos al IRS` (`/irs/pagos-irs`)
- (IRS & Resolución Fiscal) añadir item `{ label: "Transcripciones del IRS", href: "/irs/transcripciones", description: "Copias oficiales de tu cuenta y declaraciones ante el IRS" }`
- (ITIN & EIN) `Solicitud de ITIN Number` href `/itin-ein/solicitud-itin` → `/itin-ein/solicitar-itin`
- (ITIN & EIN) `Renovación de ITIN Number` href `/itin-ein/renovacion-itin` → `/itin-ein/renovar-itin`
- (ITIN & EIN) `Solicitud de EIN para negocio` href `/itin-ein/solicitud-ein` → `/itin-ein/solicitar-ein`

En el bloque `data.en`, solo ajustar los `item.href` de pilar a barra final: `/en/taxes/`, `/en/itin-ein/`, `/en/notary/`, `/en/immigration/`. (Los slugs EN de sub-items ya coinciden con `routes.ts`; no se tocan más porque las páginas EN no se construyen esta ronda.)

- [ ] **Step 4: Editar `src/components/ServicesSection.astro`**

En `t.es.items`, cambiar `href: "/taxes"` → `"/taxes/"`, `"/irs"` → `"/irs/"`, `"/itin-ein"` → `"/itin-ein/"`, `"/notaria"` → `"/notaria/"`, `"/inmigracion"` → `"/inmigracion/"`, `"/dmv"` → `"/dmv/"`. En `t.en.items` no tocar (las páginas EN no existen aún).

- [ ] **Step 5: Correr los tests y verificar**

Run: `npm test -- src/components/Navbar.test.ts` → PASS.
Run: `npm run check:links` → build + check. Los `/irs/`, `/itin-ein/`, `/taxes/` resuelven; el resto (`/notaria/`, `/inmigracion/`, `/dmv/`, `/negocio/...`) sale como warning, no como error.

- [ ] **Step 6: Commit**

```bash
git add src/components/Navbar.astro src/components/Navbar.test.ts src/components/ServicesSection.astro
git commit -m "refactor: hrefs del menú y home alineados a slugs finales del CONTENT-STRATEGY"
```

---

## Task 16: Migrar `/taxes/index.astro` al sistema

**Files:**
- Modify: `src/pages/taxes/index.astro` (reescritura completa)
- Create: `src/pages/taxes/index.test.ts`

**Interfaces:**
- Consumes: `ServiceLayout`, `ServiceHero`, `TrustBar`, `ServiceList`, `WhyUs`, `FaqSection`, `CtaBanner`, `RelatedServices`.
- Produces: la página `/taxes/` con el **mismo contenido de texto** que hoy (ya redactado, no reescribir prosa), renderizado por los componentes nuevos, con links internos corregidos y `ItemList` JSON-LD de las 6 hijas.

- [ ] **Step 1: Test que falla — `src/pages/taxes/index.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Page from './index.astro';

const render = async () => (await AstroContainer.create()).renderToString(Page);

describe('/taxes/', () => {
  it('tiene un solo <h1> con el H1 de estrategia', async () => {
    const html = await render();
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).toContain('Taxes en Español en Las Vegas');
    expect(html).toContain('Sin Sorpresas en el Precio');
  });
  it('enlaza a las 6 hijas con slugs finales', async () => {
    const html = await render();
    for (const href of [
      '/taxes/declaracion-personal', '/taxes/declaracion-negocio', '/taxes/todos-los-estados',
      '/taxes/enmiendas', '/taxes/seguimiento-reembolso', '/taxes/formularios-1099',
    ]) expect(html).toContain(`href="${href}"`);
  });
  it('no contiene los links obsoletos', async () => {
    const html = await render();
    expect(html).not.toContain('/taxes/seguimiento"');
    expect(html).not.toContain('/taxes/transcripciones-irs');
    expect(html).not.toContain('href="/irs"'); // debe ser /irs/
  });
  it('emite JSON-LD Service + FAQPage + ItemList', async () => {
    const html = await render();
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"ItemList"');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/pages/taxes/index.test.ts` → FAIL (la página aún es la vieja con breadcrumb inline y links viejos).

- [ ] **Step 3: Reescribir `src/pages/taxes/index.astro`**

Estructura (reusar TEXTOS exactos del archivo actual — están en `CONTENT-STRATEGY.md §7` y en el propio archivo; NO reescribir prosa):
```astro
---
import ServiceLayout from '../../layouts/ServiceLayout.astro';
import ServiceHero from '../../components/service/ServiceHero.astro';
import TrustBar from '../../components/service/TrustBar.astro';
import ServiceList from '../../components/service/ServiceList.astro';
import WhyUs from '../../components/service/WhyUs.astro';
import FaqSection from '../../components/service/FaqSection.astro';
import CtaBanner from '../../components/service/CtaBanner.astro';
import { SITE_URL } from '@config/site';

const title = "Taxes en Español en Las Vegas | Data's & Multiservices";
const description =
  "Hacemos tus taxes en español, con precio claro desde el inicio. Oficina física en Las Vegas, citas por WhatsApp, tardes y sábados. Agenda hoy.";

const services = [
  { label: 'Declaración de impuestos personales', href: '/taxes/declaracion-personal',
    description: 'Para individuos y familias, incluyendo declaración federal y estatal. Si trabajas con W-2, eres contratista 1099, o tienes ITIN en lugar de número de Social Security, aquí es donde empezamos.' },
  { label: 'Declaración de impuestos de negocio y LLC', href: '/taxes/declaracion-negocio',
    description: 'Si tienes tu propio negocio, eres Sole Proprietor o manejas una LLC, declaramos tus impuestos de negocio por separado, con la asesoría que evita que pagues de más.' },
  { label: 'Declaraciones en todos los estados', href: '/taxes/todos-los-estados',
    description: '¿Trabajaste en más de un estado este año? Lo manejamos sin que tengas que ir a dos lugares distintos.' },
  { label: 'Enmiendas de impuestos', href: '/taxes/enmiendas',
    description: 'Si una declaración anterior (con nosotros o con otra persona) tuvo un error, la corregimos.' },
  { label: 'Seguimiento de tu reembolso', href: '/taxes/seguimiento-reembolso',
    description: 'Si ya declaraste y tu reembolso no ha llegado, te ayudamos a rastrearlo directamente con el IRS.' },
  { label: 'Formularios 1099-NEC', href: '/taxes/formularios-1099',
    description: 'Si trabajas por contrato o contratas a otros, preparamos y presentamos los formularios 1099 que el IRS exige.' },
];

const whyUs = [
  { heading: 'Precio claro antes de empezar', body: 'Te decimos el precio antes de empezar, no "vamos viendo según avance".' },
  { heading: 'Revisamos contigo, en español', body: 'Revisamos tu declaración contigo, explicándote en español qué dice cada número, antes de enviarla.' },
  { heading: 'Seguimos contigo después', body: 'Si el IRS te escribe, si tu reembolso se retrasa, si necesitas una copia el próximo año — seguimos siendo tu punto de contacto.' },
];

const faqs = [
  { q: '¿Necesito cita o puedo llegar directo a la oficina?',
    a: '[PLACEHOLDER: completar según política real — ej. "Puedes agendar por WhatsApp o llegar en nuestro horario de atención, aunque agendar te garantiza que no esperes."]' },
  { q: '¿Puedo declarar taxes si tengo ITIN en vez de número de Social Security?',
    a: 'Sí. Trabajamos regularmente con personas que declaran usando ITIN Number, y si todavía no tienes uno, también te ayudamos a solicitarlo.' },
  { q: '¿Cuánto cuesta hacer mis taxes?',
    a: 'El precio depende de tu situación (si tienes un solo empleo, varios, si eres contratista, si trabajaste en más de un estado). Te damos el precio exacto en tu primera consulta, antes de que decidas continuar.' },
  { q: '¿Qué pasa si ya hice mis taxes con otra persona y tuvieron un error?',
    a: 'Revisamos tu declaración anterior y, si encontramos un error, preparamos la enmienda correspondiente.' },
];

const itemList = services.map((s) => ({ name: s.label, url: `${SITE_URL}${s.href}` }));
---

<ServiceLayout
  {title}
  {description}
  lang="es"
  breadcrumbLabel="Taxes en Español en Las Vegas, Sin Sorpresas en el Precio"
  service={{ name: 'Preparación de Taxes en Las Vegas', serviceType: 'Tax preparation' }}
  {faqs}
  {itemList}
>
  <ServiceHero
    eyebrow="Preparación de impuestos"
    heading="Taxes en Español en Las Vegas,"
    headingAccent="Sin Sorpresas en el Precio"
  >
    <p>Hacer tus taxes no debería sentirse como un riesgo. En Data's &amp; Multiservices te ayudamos a declarar tus impuestos en español, de principio a fin, con un precio claro desde la primera consulta — sin sorpresas, sin letras chiquitas y sin que tengas que adivinar en inglés qué te están cobrando.</p>
    <p>Tenemos oficina física en Las Vegas, atendemos por WhatsApp, y agendamos citas en la tarde y los sábados, porque sabemos que tu horario no siempre es de 9 a 5.</p>
  </ServiceHero>

  <TrustBar />

  <ServiceList
    eyebrow="Nuestros servicios de taxes"
    heading="Todo lo que necesitas, en un solo lugar"
    intro="No importa si es tu primera vez declarando taxes en Estados Unidos o si ya tienes años haciéndolo — tenemos el servicio que corresponde a tu situación."
    items={services}
  />

  <WhyUs
    heading="Por qué las familias de Las Vegas nos eligen"
    intro="Sabemos que muchas personas han tenido una mala experiencia antes — con alguien que se hizo pasar por experto, cobró de más, o desapareció cuando hubo un problema con el IRS. Por eso trabajamos distinto."
    items={whyUs}
  />

  <FaqSection items={faqs} />

  <CtaBanner
    heading="¿Listo para declarar tus taxes sin estrés?"
    body="Agenda una consulta sin costo y te decimos exactamente qué necesitas y cuánto va a costar, antes de que decidas continuar."
  />
</ServiceLayout>
```

- [ ] **Step 4: Correr los tests y verificar**

Run: `npm test -- src/pages/taxes/index.test.ts` → PASS.
Run: `npm run check:links` → `✅ Sin enlaces rotos en el alcance construido.` (los links a `/taxes/declaracion-negocio` etc. aún no existen → deben salir como **error gate**… ver Step 5).

- [ ] **Step 5: Ajuste de expectativa de `check:links`**

Las 5 hijas de taxes que no existen todavía (`declaracion-negocio`, `todos-los-estados`, `enmiendas`, `seguimiento-reembolso`, `formularios-1099`) son destino gate y harían fallar el script. Para esta ronda: añadir esos 5 paths + los de IRS/ITIN pendientes a un set `KNOWN_PENDING` en `scripts/check-links.mjs` que los degrada a warning, con comentario `// Plan 2 los construye`. Documentarlo en el commit. (Plan 2 vacía este set a medida que crea cada página.)

Editar `scripts/check-links.mjs`: añadir
```js
const KNOWN_PENDING = new Set([
  '/taxes/declaracion-negocio', '/taxes/todos-los-estados', '/taxes/enmiendas',
  '/taxes/seguimiento-reembolso', '/taxes/formularios-1099',
  '/irs/solucion-deudas', '/irs/auditorias', '/irs/resolucion-cartas',
  '/irs/acuerdos-pago', '/irs/transcripciones',
  '/itin-ein/solicitar-itin', '/itin-ein/renovar-itin', '/itin-ein/solicitar-ein',
]); // Plan 2 va vaciando este set
```
y en el loop: `if (kind === 'gate' && KNOWN_PENDING.has(path)) { broken.warn.push(...); continue; }`. Actualizar `scripts/check-links.test.ts` con un caso: `classifyLink` sigue devolviendo `'gate'` para esos paths (la degradación ocurre en `main`, no en `classifyLink`) — añadir test de que `KNOWN_PENDING` los contiene.

- [ ] **Step 6: Correr todo y verificar**

Run: `npm test` → todo PASS.
Run: `npm run check:links` → `✅` con warnings de páginas pendientes.
Run: `npx astro check` → 0 errores.

- [ ] **Step 7: Commit**

```bash
git add src/pages/taxes/index.astro src/pages/taxes/index.test.ts scripts/check-links.mjs scripts/check-links.test.ts
git commit -m "refactor: /taxes/ migrado al sistema de componentes + ItemList JSON-LD"
```

---

## Task 17: Página `/contacto`

**Files:**
- Create: `src/pages/contacto.astro`, `src/pages/contacto.test.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `BUSINESS`, `buildLocalBusinessJsonLd` de `@config/site`.
- Produces: `/contacto` — página mínima: `<h1>Contacto</h1>` + datos de oficina + JSON-LD LocalBusiness. Sin formulario (comentario para el componente futuro del usuario).

- [ ] **Step 1: Test que falla — `src/pages/contacto.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Page from './contacto.astro';
import { BUSINESS } from '@config/site';

const render = async () => (await AstroContainer.create()).renderToString(Page);

describe('/contacto', () => {
  it('tiene un <h1> "Contacto"', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[^>]*>\s*Contacto\s*<\/h1>/);
  });
  it('muestra teléfono, WhatsApp y dirección', async () => {
    const html = await render();
    expect(html).toContain(BUSINESS.phoneDisplay);
    expect(html).toContain(BUSINESS.whatsapp);
    expect(html).toContain(BUSINESS.address.street);
  });
  it('emite JSON-LD LocalBusiness', async () => {
    const html = await render();
    expect(html).toContain('"@type":"LocalBusiness"');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/pages/contacto.test.ts` → FAIL.

- [ ] **Step 3: Implementar `src/pages/contacto.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { BUSINESS, buildLocalBusinessJsonLd } from '@config/site';

const title = "Contacto | Data's & Multiservices";
const description =
  "Visítanos en nuestra oficina de Las Vegas o escríbenos por WhatsApp. Atención en español, tardes y sábados.";

const jsonLd = buildLocalBusinessJsonLd('es');
const mapsQuery = encodeURIComponent(
  `${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.region} ${BUSINESS.address.postalCode}`
);
---
<BaseLayout {title} {description} lang="es" {jsonLd}>
  <main class="container-custom py-20 lg:py-28">
    <h1 class="font-display text-4xl md:text-5xl font-bold text-neutral-dark leading-tight">Contacto</h1>
    <p class="text-neutral-grey mt-4 max-w-xl leading-relaxed">
      Estamos en Las Vegas y atendemos en español. Puedes escribirnos por WhatsApp, llamarnos o
      visitarnos en la oficina.
    </p>

    <dl class="mt-10 grid gap-6 sm:grid-cols-2 max-w-2xl">
      <div>
        <dt class="text-xs font-bold tracking-widest text-brand-light uppercase mb-1">Teléfono</dt>
        <dd><a href={`tel:${BUSINESS.phone.replace('+', '')}`} class="text-neutral-dark hover:text-brand-light">{BUSINESS.phoneDisplay}</a></dd>
      </div>
      <div>
        <dt class="text-xs font-bold tracking-widest text-brand-light uppercase mb-1">WhatsApp</dt>
        <dd><a href={BUSINESS.whatsapp} class="text-neutral-dark hover:text-brand-light">Escribir por WhatsApp</a></dd>
      </div>
      <div>
        <dt class="text-xs font-bold tracking-widest text-brand-light uppercase mb-1">Oficina</dt>
        <dd>
          <address class="not-italic text-neutral-dark">
            {BUSINESS.address.street}<br />
            {BUSINESS.address.city}, {BUSINESS.address.region} {BUSINESS.address.postalCode}
          </address>
          <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} class="text-sm text-brand-light hover:underline">Ver en el mapa →</a>
        </dd>
      </div>
      <div>
        <dt class="text-xs font-bold tracking-widest text-brand-light uppercase mb-1">Horario</dt>
        <dd class="text-neutral-dark">{BUSINESS.hoursDisplay}</dd>
      </div>
    </dl>

    {/* TODO(usuario): integrar aquí el componente de formulario de contacto de otro proyecto. */}
  </main>
</BaseLayout>
```

- [ ] **Step 4: Correr los tests y verificar**

Run: `npm test -- src/pages/contacto.test.ts` → PASS.
Run: `npm run check:links` → los links del Navbar/Footer a `/contacto` ahora resuelven.

- [ ] **Step 5: Commit**

```bash
git add src/pages/contacto.astro src/pages/contacto.test.ts
git commit -m "feat: página /contacto mínima con datos de oficina y LocalBusiness JSON-LD"
```

---

## Task 18: Página `/taxes/declaracion-personal`

**Files:**
- Create: `src/pages/taxes/declaracion-personal.astro`, `src/pages/taxes/declaracion-personal.test.ts`
- Modify: `scripts/check-links.mjs` (quitar `/taxes/declaracion-personal` de `KNOWN_PENDING`)

**Interfaces:**
- Consumes: `ServiceLayout` + `ServiceHero`, `TrustBar`, `InfoBlock`, `ProcessSteps`, `DocsChecklist`, `WhyUs`, `FaqSection`, `RelatedServices`, `CtaBanner`.
- Produces: la página hija con el contenido ya redactado en `CONTENT-STRATEGY.md §7` (usar ese texto literal; no reescribir).

- [ ] **Step 1: Test que falla — `src/pages/taxes/declaracion-personal.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Page from './declaracion-personal.astro';

const render = async () => (await AstroContainer.create()).renderToString(Page);

describe('/taxes/declaracion-personal', () => {
  it('un solo <h1> con el H1 de estrategia', async () => {
    const html = await render();
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).toContain('Declaración de Impuestos Personales en Las Vegas');
  });
  it('incluye checklist de documentos y pasos del proceso', async () => {
    const html = await render();
    expect(html).toContain('Formularios W-2 de cada trabajo');
    expect(html).toMatch(/<ol/); // ProcessSteps
  });
  it('interlinking a hermanas y pilar', async () => {
    const html = await render();
    expect(html).toContain('href="/taxes/todos-los-estados"');
    expect(html).toContain('href="/taxes/seguimiento-reembolso"');
    expect(html).toContain('href="/itin-ein/solicitar-itin"');
  });
  it('JSON-LD Service + FAQPage', async () => {
    const html = await render();
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"FAQPage"');
  });
  it('breadcrumb muestra Inicio > Taxes > H1', async () => {
    const html = await render();
    expect(html).toContain('href="/taxes/"');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- src/pages/taxes/declaracion-personal.test.ts` → FAIL.

- [ ] **Step 3: Implementar `src/pages/taxes/declaracion-personal.astro`**

Usar los textos de `CONTENT-STRATEGY.md §7` (`### /taxes/declaracion-personal`) **literalmente**. Estructura:
```astro
---
import ServiceLayout from '../../layouts/ServiceLayout.astro';
import ServiceHero from '../../components/service/ServiceHero.astro';
import TrustBar from '../../components/service/TrustBar.astro';
import InfoBlock from '../../components/service/InfoBlock.astro';
import ProcessSteps from '../../components/service/ProcessSteps.astro';
import DocsChecklist from '../../components/service/DocsChecklist.astro';
import WhyUs from '../../components/service/WhyUs.astro';
import FaqSection from '../../components/service/FaqSection.astro';
import RelatedServices from '../../components/service/RelatedServices.astro';
import CtaBanner from '../../components/service/CtaBanner.astro';

const title = "Declaración de Impuestos Personales | Las Vegas";
const description =
  "Declaramos tus impuestos personales en español, revisando cada deducción para tu reembolso máximo. Precio fijo, sin letras chiquitas. Agenda tu cita.";

const incluye = [
  'Declaración federal (IRS) y estatal, según donde hayas trabajado',
  'Declaración para individuos, parejas (married filing jointly/separately) y familias con dependientes',
  'Revisión de todas las deducciones y créditos que te correspondan según tu situación',
  'Declaración para quienes usan ITIN Number en lugar de Social Security',
  'Declaración para ingresos por contrato (1099) o trabajo independiente',
];
const pasos = [
  { title: 'Agenda tu cita', body: 'Por WhatsApp, teléfono o en nuestra oficina.' },
  { title: 'Trae tus documentos', body: 'Si no estás seguro de qué necesitas, te lo confirmamos antes de tu cita para que no hagas el viaje en falso.' },
  { title: 'Preparamos y revisamos contigo', body: 'Preparamos tu declaración y la revisamos contigo, explicándote en español qué significa cada línea, antes de enviarla al IRS.' },
  { title: 'Te damos tu comprobante', body: 'Recibes un comprobante de que quedó presentada, y si elegiste depósito directo, te explicamos cuándo esperar tu reembolso.' },
];
const docs = [
  'Identificación oficial (tuya y de tu cónyuge si declaran juntos)',
  'Social Security Number o ITIN Number (tuyo y de cada dependiente)',
  'Formularios W-2 de cada trabajo, o 1099 si trabajaste por contrato',
  'Declaración del año anterior (si la tienes)',
  'Comprobante de gastos relacionados con deducciones (renta si trabajas desde casa, gastos médicos importantes, donaciones, etc., según aplique)',
  'Información de cuenta bancaria si quieres tu reembolso por depósito directo',
];
const whyUs = [
  { heading: 'Precio fijo según tu situación', body: 'No por hora ni "depende de cómo salga".' },
  { heading: 'Revisión humana de cada declaración', body: 'Antes de enviarla — no es solo un software automático.' },
  { heading: 'Te explicamos el resultado', body: 'No solo te entregamos un papel con números.' },
];
const faqs = [
  { q: '¿Puedo declarar si trabajé en más de un estado este año?', a: 'Sí, preparamos declaraciones en todos los estados donde hayas trabajado, dentro de la misma cita.' },
  { q: '¿Qué pasa si soy contratista independiente (1099) y no empleado?', a: 'También te ayudamos — la declaración de ingresos 1099 tiene reglas distintas a un W-2, y te explicamos qué te corresponde declarar.' },
  { q: '¿Cuánto tiempo tarda mi reembolso después de declarar?', a: 'El tiempo lo determina el IRS, no nosotros, pero si pasa más tiempo del esperado, te ayudamos con el seguimiento de tu reembolso.' },
  { q: '¿Necesito sacar mi ITIN antes de poder declarar?', a: 'Si no tienes Social Security ni ITIN todavía, podemos ayudarte a solicitar tu ITIN como parte del mismo proceso.' },
];
---
<ServiceLayout
  {title}
  {description}
  lang="es"
  breadcrumbLabel="Declaración de Impuestos Personales en Las Vegas"
  service={{ name: 'Declaración de impuestos personales', serviceType: 'Personal tax preparation' }}
  {faqs}
>
  <ServiceHero
    eyebrow="Taxes personales"
    heading="Declaración de Impuestos Personales en Las Vegas"
    ctaLabel="Agendar mi declaración"
  >
    <p>Tu declaración de impuestos personales es la base de todo lo demás: tu reembolso, tu historial con el IRS, e incluso documentación que más adelante puedes necesitar para otros trámites (como inmigración o un préstamo). Por eso la hacemos con calma, revisando cada detalle contigo, no como un formulario que se llena rápido y se manda.</p>
    <p>Trabajamos con declaraciones federales y estatales, para individuos y familias — tengas W-2, seas contratista independiente (1099), o declares con ITIN Number.</p>
  </ServiceHero>

  <TrustBar />

  <InfoBlock heading="Qué incluye este servicio">
    <ul class="list-disc pl-5 flex flex-col gap-2">
      {incluye.map((i) => <li>{i}</li>)}
    </ul>
  </InfoBlock>

  <ProcessSteps heading="Cómo funciona el proceso" steps={pasos} />

  <DocsChecklist
    heading="Documentos que necesitas traer"
    items={docs}
    note="Si te falta algo de esta lista, dínoslo antes de tu cita — muchas veces hay alternativas."
  />

  <WhyUs heading="Por qué elegirnos para tu declaración personal" items={whyUs} />

  <FaqSection items={faqs} />

  <RelatedServices
    heading="Servicios relacionados"
    items={[
      { label: 'Declaraciones en todos los estados', href: '/taxes/todos-los-estados' },
      { label: 'Seguimiento de tu reembolso', href: '/taxes/seguimiento-reembolso' },
      { label: 'Solicitar tu ITIN', href: '/itin-ein/solicitar-itin' },
      { label: 'Ver todos los servicios de Taxes', href: '/taxes/' },
    ]}
  />

  <CtaBanner
    heading="Agenda tu declaración personal"
    body="Te decimos qué necesitas traer y cuánto va a costar antes de empezar."
  />
</ServiceLayout>
```

- [ ] **Step 4: Quitar de `KNOWN_PENDING`**

En `scripts/check-links.mjs`, borrar `'/taxes/declaracion-personal'` del set `KNOWN_PENDING` (Task 16 lo había añadido — si no está, no hacer nada).

- [ ] **Step 5: Correr todo y verificar**

Run: `npm test` → todo PASS.
Run: `npm run check:links` → `✅`.
Run: `npx astro check` → 0 errores.

- [ ] **Step 6: Commit**

```bash
git add src/pages/taxes/declaracion-personal.astro src/pages/taxes/declaracion-personal.test.ts scripts/check-links.mjs
git commit -m "feat: página /taxes/declaracion-personal con el sistema de componentes"
```

---

## Task 19: Actualizar `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: nada.
- Produces: doc del proyecto al día con la arquitectura nueva.

- [ ] **Step 1: Sección "Sistema de diseño" — reemplazar la paleta**

Sustituir el bloque de tokens de color por los valores reales de `src/styles/global.css` (`@theme`), agrupados:
```
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
```
Añadir: "**Tipografía:** `font-display` (clase `.font-display`) = Playfair Display serif, cargada por Google Fonts en `BaseLayout.astro`. Cuerpo = Roboto self-hosted (`body` en `global.css`)."
Corregir la nota de breakpoint: `lg: 990px` (ya está) — mantener.

- [ ] **Step 2: Sección "Estructura de archivos" — añadir**

```
src/
├── config/
│   ├── site.ts       # SITE_URL (única var de prod), SITE_NAME, OG_IMAGE, GSC, BUSINESS, helpers JSON-LD, canonicalURL
│   └── routes.ts     # registro ES↔EN + getAlternates() para hreflang/sitemap/switch de idioma
├── components/service/   # ServiceHero, TrustBar, ServiceList, RelatedServices, ProcessSteps,
│                          # DocsChecklist, InfoBlock, WhyUs, FaqSection, CtaBanner
├── layouts/ServiceLayout.astro   # BaseLayout + Breadcrumb + JSON-LD Service/FAQPage/ItemList + slot
scripts/check-links.mjs            # verificador de enlaces internos post-build
public/robots.txt
vitest.config.ts                   # tests con Vitest + Container API de Astro
```

- [ ] **Step 3: Sección "Componentes — notas críticas" — añadir subsección**

```
### Páginas de servicio (src/components/service/ + ServiceLayout.astro)
- Patrón: un .astro por página que compone componentes de sección dentro de <ServiceLayout>.
- ServiceLayout props: title, description, lang, breadcrumbLabel (= H1 exacto), service {name, serviceType}, faqs?, itemList?.
- El array `faqs` se pasa a la vez a <ServiceLayout> (para JSON-LD FAQPage) y a <FaqSection> (para render).
- Los componentes son "tontos": todo el contenido entra por props/slot; `lang` solo cambia strings fijos de UI.
- Estilos: derivados de la primera versión de /taxes/index.astro. No hardcodear hex — usar tokens.
- URLs: pilares con barra final (/taxes/), hijas sin (/taxes/enmiendas). canonicalURL() lo normaliza.
```

- [ ] **Step 4: Sección "Variables pendientes para producción" — reemplazar la tabla**

```
Todo centralizado en src/config/site.ts:
| Constante          | Acción para producción                        |
|--------------------|-----------------------------------------------|
| SITE_URL           | Dominio real (propaga a canonical, og, sitemap, robots, hreflang) |
| OG_IMAGE           | Crear /public/assets/og-image.webp 1200×675    |
| GSC_VERIFICATION   | Código de Google Search Console                |
| BUSINESS.email     | Email de contacto real                         |
| Placeholders de contenido | Buscar `[PLACEHOLDER:` en src/ — precios, PTIN/EFIN, política de citas |

También: public/robots.txt tiene el dominio hardcodeado — cambiarlo junto con SITE_URL.
```

- [ ] **Step 5: Sección "Pendientes" — actualizar**

- Marcar `[x]` "Sistema de páginas de servicio + clúster Taxes/IRS/ITIN ES (pilar /taxes/ + /taxes/declaracion-personal hechos; resto en Plan 2)".
- Marcar `[x]` "`@astrojs/sitemap`" y "`public/robots.txt`".
- Añadir `[ ]` "Resto de páginas del clúster Taxes/IRS/ITIN ES (Plan 2: `docs/superpowers/plans/`)".
- Añadir `[ ]` "Tests unitarios de helpers con Vitest (site.ts / routes.ts) para coverage — hoy solo smoke tests".
- Añadir `[ ]` "Páginas EN del clúster (arquitectura lista: poner `enBuilt: true` en routes.ts al crearlas)".
- Añadir `[ ]` "Integrar componente de formulario real en `/contacto`".

- [ ] **Step 6: Sección i18n — añadir nota**

Tras el patrón de detección de `lang`, añadir:
```
### Registro de rutas (src/config/routes.ts)
ROUTES mapea cada ruta ES a su gemela EN + flag `enBuilt`. getAlternates(pathname) alimenta:
- hreflang en BaseLayout (solo emite <link hreflang="en"> si enBuilt)
- filtro del sitemap
- switch de idioma del Navbar (cae a /en home si no hay gemela construida)
Al crear una página EN: crear el archivo + poner enBuilt: true en su entrada.
```

- [ ] **Step 7: Verificar y commit**

Run: `npx astro check` → 0 errores (sanity, aunque CLAUDE.md no compila).
```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md al día con sistema de páginas de servicio y config centralizada"
```

---

## Self-Review

**1. Spec coverage:**

| Spec § | Requisito | Task |
|---|---|---|
| §3, §7 | Enfoque slots + ServiceLayout delgado | 13 |
| §4 | Estructura de archivos (config/, service/, scripts/) | 1, 3, 6, 7-13 |
| §5 | `site.ts` con SITE_URL/BUSINESS/helpers/canonicalURL | 1, 2 |
| §6 | `routes.ts` + getAlternates (hreflang/sitemap/switch) | 3, 4, 5, 15 |
| §7 | ServiceLayout contrato (title/desc/lang/breadcrumbLabel/service/faqs/itemList) | 13 |
| §8 | 10 componentes de sección con sus contratos | 7, 8, 9, 10, 11, 12 |
| §9 | Pilar /taxes/ migrado + /taxes/declaracion-personal | 16, 18 (resto → Plan 2) |
| §9 | /contacto mínima | 17 |
| §10.1 | @astrojs/sitemap + site en config | 5 |
| §10.2 | robots.txt | 5 |
| §10.3 | fix bug hreflang.ts | 1 (reescritura) + 3 (getAlternates cubre el caso `/taxes/enmiendas`) |
| §10.4 | BaseLayout: config + hreflang + canonical | 4 |
| §10.5 | JSON-LD centralizado (Service/FAQPage/ItemList/BreadcrumbList) | 13, 14 |
| §10.6 | Navbar MegaMenu hrefs alineados | 15 |
| §10.7 | Home pillarUrls con barra | 15 |
| §11 | Vitest + smoke test + astro check + build + check-links | 1, 6, y en cada task |
| §11 | Checklist manual A11Y/SEO | ver nota abajo |
| §12 | CLAUDE.md actualizado | 19 |
| §2 | Barra final en pilares | 1 (canonicalURL), 3, 14, 15 |
| §2 | Paleta viva = verdad; no rediseño | componentes extraen markup existente; 19 documenta |

**Gap consciente:** el "checklist manual A11Y/SEO" de §11 no es una task automatizable — se ejecuta como paso de verificación al cerrar el plan (ver Ejecución). Los tests de componentes ya cubren: un solo `<h1>` (tasks 16, 18), uso de `<h2>`/`<h3>`, `role="list"`, `<details>` semántico, `<dl>/<dt>/<dd>`. Contraste y navegación por teclado quedan para revisión manual.

**Gap consciente:** las 15 páginas de contenido restantes (spec §9) son **Plan 2** explícitamente — este plan entrega el sistema + 2 páginas como prueba, que es software funcional y testeable por sí solo.

**2. Placeholder scan:** Los `[PLACEHOLDER: ...]` en `site.ts` (email, PTIN) y en el contenido de `/taxes/` (política de citas) son **intencionales y marcados** según Global Constraints — no son placeholders de plan. Los `// TODO(Plan 2)` en los `index.astro` de IRS/ITIN son andamiaje declarado. `getAlternates` Step 3 dice "versión orientativa, no literal" — es el único punto donde el implementador debe iterar contra los tests; los 7 asserts son exactos y definen el comportamiento, así que es aceptable.

**3. Type consistency:**
- `canonicalURL(pathname: string): string` — consistente en tasks 1, 13.
- `buildServiceJsonLd(opts: {name,description,serviceType,url,lang})` — task 2 define, task 13 consume con esas llaves exactas. ✓
- `getAlternates(pathname): {es, en: string|null, xDefault}` — task 3 define, task 4 consume (`alt.es`, `alt.en`, `alt.xDefault`). ✓
- `ServiceLayout` props `{title, description, lang?, breadcrumbLabel, service:{name,serviceType}, faqs?, itemList?}` — task 13 define, tasks 14/16/18 consumen con esos nombres. ✓
- `FaqSection` props `{items:{q,a}[], heading?}` — task 11 define, tasks 16/18 pasan `items={faqs}` donde `faqs` es `{q,a}[]`. ✓ Y `ServiceLayout` faqs también `{q,a}[]`. ✓
- `ServiceList` props `{eyebrow?, heading, intro?, items:{label,href,description}[], lang?}` — task 8 define, task 16 pasa `services` con `{label,href,description}`. ✓
- `WhyUs` props `{heading, intro?, items:{heading,body}[]}` — task 10 define, tasks 16/18 pasan `whyUs` con `{heading,body}`. ✓
- `ProcessSteps` `{heading, steps:{title,body}[]}` — task 9 define, task 18 pasa `pasos` con `{title,body}`. ✓
- `DocsChecklist` `{heading, items:string[], note?}` — task 9 define, task 18 usa `items={docs}` (string[]) + `note`. ✓
- `CtaBanner` `{heading, body?, eyebrow?, ctaHref?, ctaLabel?, lang?}` — task 12 define, tasks 16/18 pasan `heading`+`body`. ✓
- `RelatedServices` `{heading, items:{label,href}[]}` — task 8 define, task 18 consume. ✓
- `Breadcrumb` props `{lang, currentLabel}` — sin cambios (ya existe), task 13 pasa `currentLabel={breadcrumbLabel}`. ✓
- `classifyLink(href): 'ignore'|'gate'|'warn'` — task 6 define, task 16 Step 5 aclara que `KNOWN_PENDING` actúa en `main`, no en `classifyLink`. ✓

No se detectaron inconsistencias.

---

## Ejecución — verificación de cierre (checklist manual, tras la última task)

1. `npm test` → todos verdes.
2. `npm run check:links` → `✅ Sin enlaces rotos en el alcance construido`, warnings solo de secciones/páginas pendientes.
3. `npx astro check` → 0 errores, 0 warnings.
4. `npm run dev` y revisar en navegador `/taxes/`, `/taxes/declaracion-personal`, `/contacto`:
   - un solo `<h1>` por página (DevTools › Elements).
   - Tab recorre CTAs y abre/cierra los `<details>` de FAQ con Enter/Espacio.
   - foco visible (anillo `brand-light`) en enlaces y botones.
   - contraste: texto `neutral-grey` sobre `background-light`, blanco sobre `midnight`, blanco sobre `accent` → verificar ≥ 4.5:1 con el picker de DevTools.
   - breadcrumb `/taxes/declaracion-personal`: `Inicio / Taxes / Declaración de Impuestos Personales en Las Vegas`.
   - `/irs/solucion-deudas` no existe aún (Plan 2) pero `/irs/` sí y su breadcrumb muestra `Inicio / Taxes / IRS & Resolución Fiscal`.
5. Pegar el HTML de `/taxes/` en el [Rich Results Test](https://search.google.com/test/rich-results) → detecta `Service`, `FAQPage`, `BreadcrumbList`, `ItemList` sin errores.
6. `view-source:` de `/taxes/` → `<link rel="canonical" href=".../taxes/">`, `<link rel="alternate" hreflang="es">`, `hreflang="x-default">`, **sin** `hreflang="en"` (aún no construido).
