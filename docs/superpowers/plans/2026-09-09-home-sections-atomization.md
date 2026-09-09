# Atomización de secciones del Home — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extraer las 4 secciones inline restantes de `src/components/HomePage.astro` a componentes propios con tests, dejando `HomePage.astro` como orquestador delgado, sin ningún cambio visual ni de copy.

**Architecture:** Cada sección pasa a ser un `.astro` en `src/components/` con `interface Props { lang: 'es' | 'en' }` como única prop y su propio objeto `t = { es: {...}, en: {...} }[lang]` inline, replicando el patrón de `ServicesSection.astro` y `TestimonialsSection.astro`. El markup se mueve **verbatim** desde `HomePage.astro`, cambiando solo el prefijo de las claves de traducción (`t.community.X` → `t.X`). `HomePage.astro` importa los nuevos componentes y conserva únicamente el array `faq` (que alimenta el componente genérico `FaqSection`) y su `<script>` de `IntersectionObserver`.

**Tech Stack:** Astro 6, TypeScript 6, Vitest 4 + Container API de Astro (`experimental_AstroContainer`). `vitest.config.ts` ya incluye `src/**/*.test.ts`.

**Spec:** `docs/superpowers/specs/2026-09-09-home-sections-atomization-design.md`

## Global Constraints

- **Node:** >= 22.12.0.
- **Sin cambio visual ni de copy.** El HTML renderizado de `/` y `/en` debe quedar idéntico salvo whitespace / orden de atributos. El markup se copia verbatim.
- **Paleta / tipografía:** nunca hardcodear hex; usar tokens de `src/styles/global.css`. (No aplica cambios acá — el markup se mueve tal cual.)
- **Breakpoint `lg` = 990px** (no 1024px). Ya está en el markup existente.
- **i18n:** ES en `/`, EN en `/en/`. Detección: `Astro.url.pathname.startsWith("/en") ? "en" : "es"`. Cada componente recibe `lang` por prop desde `HomePage.astro`; no lo infiere.
- **Cumplimiento legal (Nevada):** en español, "Notary Public" / "notary public" — nunca "notario", "notaría", "notarial", "licenciado". El copy actual ya cumple; no reescribir.
- **Marca:** `Data's & Multiservices`.
- **Touch targets** >= 44×44px; foco visible. Ya respetado en el markup existente.
- **Commits:** uno por task como mínimo, mensajes en español, imperativos. Terminar cada mensaje de commit con:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01YRAdGhiwtQQQacz56g6bYp
  ```
- **Rama:** trabajar en `dev` (rama actual). No hacer push salvo que el usuario lo pida.
- **Código muerto a eliminar en el camino** (ver Task 4 y Task 5): la clave top-level `t.stats` de `HomePage.astro` (la "Stats bar" ya no existe en el markup) y las claves `t.cta.phone` / `t.cta.address` / `t.cta.hours` (el markup del CTA no las usa desde el commit `1cd0287`).

---

## File Structure

**Crear:**
- `src/components/CommunitySection.astro` — sección "Community & Stats" (label + H2 bicolor + descripción + CTA + trust indicators + `<dl>` 2×2 de stats).
- `src/components/CommunitySection.test.ts`
- `src/components/WhyUsSection.astro` — sección "Why Us" (imagen vertical + eyebrow + H2 bicolor + descripción + checklist de 4 items).
- `src/components/WhyUsSection.test.ts`
- `src/components/OfficeSection.astro` — sección "Oficina" (cabecera + grid de 3 imágenes + figura de video placeholder + CTA "Cómo llegar" a Google Maps).
- `src/components/OfficeSection.test.ts`
- `src/components/CtaSection.astro` — CTA final del home (grid `bg-brand`: imagen + eyebrow + H2 + subheading + botón con subrayado animado).
- `src/components/CtaSection.test.ts`

**Modificar:**
- `src/components/HomePage.astro` — quitar `t.community` / `t.whyUs` / `t.office` / `t.cta` y el markup inline de esas 4 secciones; quitar `t.stats` (muerto); importar y usar los 4 componentes nuevos; renombrar `t` → objeto solo con `faq`; conservar el `<script>` de reveal.
- `CLAUDE.md` — sección "HomePage.astro — secciones en orden" + árbol de `src/components/`.

**Cada componente nuevo:** frontmatter con `interface Props { lang: 'es' | 'en' }`, `const { lang } = Astro.props;`, objeto `t` inline tipado implícito `{ es: {...}, en: {...} }[lang]`, y el `<section>` movido verbatim de `HomePage.astro`. Sin `<script>`, sin imports de `@config` ni de `astro:assets`.

---

## Task 1: `CommunitySection.astro`

**Files:**
- Create: `src/components/CommunitySection.astro`
- Create: `src/components/CommunitySection.test.ts`
- Modify: `src/components/HomePage.astro` (imports; reemplazar bloque "COMMUNITY & STATS" líneas ~198-277 por `<CommunitySection lang={lang} />`; borrar `t.community` de ambos idiomas)

**Interfaces:**
- Consumes: nada.
- Produces:
  ```astro
  <!-- CommunitySection.astro -->
  interface Props { lang: 'es' | 'en'; }
  ```
  Render: un `<section aria-labelledby="community-heading">` con `<h2 id="community-heading">`, un `<dl>` con 4 celdas de stats, un `<a>` de CTA a `/contacto` (es) / `/en/contact` (en), y un `<ul role="list">` de 3 trust indicators.

- [ ] **Step 1: Escribir el test que falla — `src/components/CommunitySection.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CommunitySection from './CommunitySection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(CommunitySection, { props: { lang } });

describe('CommunitySection', () => {
  it('renderiza el <h2> con id y el acento bicolor (es)', async () => {
    const html = await render('es');
    expect(html).toMatch(/<h2[^>]*id="community-heading"/);
    expect(html).toContain('comunidad hispana');
    expect(html).toMatch(/<em class="not-italic[^"]*">\s*comunidad hispana\s*<\/em>/);
  });

  it('renderiza exactamente 4 celdas de stats en un <dl>', async () => {
    const html = await render('es');
    expect(html).toContain('<dl');
    expect((html.match(/<dt/g) ?? []).length).toBe(4);
    expect(html).toContain('Años de experiencia');
  });

  it('CTA apunta a /contacto en es y /en/contact en en', async () => {
    expect(await render('es')).toContain('href="/contacto"');
    expect(await render('en')).toContain('href="/en/contact"');
  });

  it('renderiza los 3 trust indicators y cambia el copy por idioma', async () => {
    const es = await render('es');
    const en = await render('en');
    expect(es).toContain('Servicio bilingüe');
    expect(en).toContain('Fully bilingual service');
    expect(es).toContain('Nuestra comunidad');
    expect(en).toContain('Our community');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- src/components/CommunitySection.test.ts`
Expected: FAIL — `Cannot find module './CommunitySection.astro'`.

- [ ] **Step 3: Crear `src/components/CommunitySection.astro` — frontmatter**

```astro
---
interface Props {
  lang: 'es' | 'en';
}
const { lang } = Astro.props;

const t = {
  es: {
    label: "Nuestra comunidad",
    heading: { pre: "El aliado de confianza de la", accent: "comunidad hispana", post: "en Las Vegas y EE.UU." },
    description: "Ayudamos a familias, negocios e inmigrantes con sus trámites de taxes, notary public e inmigración. Profesionalismo, experiencia y atención 100% en español.",
    cta: "Agendar cita gratis",
    ctaHref: "/contacto",
    trust: ["IRS Authorized CAA", "Notary Public Certificada", "Servicio bilingüe"],
    stats: [
      { value: "10+", label: "Años de experiencia" },
      { value: "5,000+", label: "Familias atendidas" },
      { value: "50+", label: "Servicios disponibles" },
      { value: "100%", label: "Atención en español e inglés" },
    ],
  },
  en: {
    label: "Our community",
    heading: { pre: "The trusted partner of the", accent: "Hispanic community", post: "in the Las Vegas and U.S." },
    description: "We help families, businesses, and immigrants with their tax, notary, and immigration needs. Professional service, fully bilingual in Spanish and English.",
    cta: "Book free appointment",
    ctaHref: "/en/contact",
    trust: ["IRS Authorized CAA", "Certified Notary Public", "Fully bilingual service"],
    stats: [
      { value: "10+", label: "Years of experience" },
      { value: "5,000+", label: "Families served" },
      { value: "50+", label: "Services available" },
      { value: "100%", label: "Spanish & English service" },
    ],
  },
}[lang];
---
```

- [ ] **Step 4: Añadir el markup a `CommunitySection.astro`**

Copiar **verbatim** el bloque que hoy está en `src/components/HomePage.astro` entre el comentario `<!-- ─── COMMUNITY & STATS ... -->` y el `</section>` que lo cierra (aprox. líneas 198-277 — el `<section class="bg-background-light py-4" aria-labelledby="community-heading">` … `</section>`). En ese bloque, reemplazar **todas** las apariciones de `t.community.` por `t.` (p. ej. `t.community.label` → `t.label`, `t.community.heading.accent` → `t.heading.accent`, `t.community.stats` → `t.stats`, `t.community.trust` → `t.trust`, `t.community.ctaHref` → `t.ctaHref`, `t.community.cta` → `t.cta`, `t.community.description` → `t.description`). No cambiar nada más: ni clases, ni `data-reveal`, ni `data-reveal-delay`, ni el SVG.

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm test -- src/components/CommunitySection.test.ts`
Expected: PASS (4 casos).

- [ ] **Step 6: Cablear en `HomePage.astro`**

En `src/components/HomePage.astro`:
1. En el frontmatter, añadir el import (junto a los otros, en orden alfabético relativo):
   ```astro
   import CommunitySection from './CommunitySection.astro';
   ```
2. Borrar la clave `community: { ... }` completa del objeto `t.es` y del `t.en`.
3. En el `<main>`, reemplazar todo el bloque desde el comentario `<!-- ─── COMMUNITY & STATS ... -->` hasta su `</section>` de cierre por:
   ```astro
   <!-- ─── COMMUNITY & STATS ─────────────────────────────────────────── -->
   <CommunitySection lang={lang} />
   ```

- [ ] **Step 7: Verificar build + check + suite completa**

Run: `npx astro check`
Expected: 0 errores.
Run: `npx astro build`
Expected: 7 páginas, sin warnings nuevos.
Run: `npm test`
Expected: PASS (todas las suites, incluida la nueva).

- [ ] **Step 8: Verificar que el HTML de `/` no cambió (salvo whitespace)**

Run: `npx astro build && node -e "const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');console.log('community-heading:',h.includes('community-heading'));console.log('comunidad hispana:',h.includes('comunidad hispana'));console.log('4 stats:',(h.match(/Años de experiencia|Familias atendidas|Servicios disponibles|Atención en español e inglés/g)||[]).length)"`
Expected: `community-heading: true`, `comunidad hispana: true`, `4 stats: 4`.

- [ ] **Step 9: Commit**

```bash
git add src/components/CommunitySection.astro src/components/CommunitySection.test.ts src/components/HomePage.astro
git commit -m "refactor: extrae CommunitySection.astro del Home"
```

---

## Task 2: `WhyUsSection.astro`

**Files:**
- Create: `src/components/WhyUsSection.astro`
- Create: `src/components/WhyUsSection.test.ts`
- Modify: `src/components/HomePage.astro` (import; reemplazar bloque "WHY US" líneas ~283-336 por `<WhyUsSection lang={lang} />`; borrar `t.whyUs` de ambos idiomas)

**Interfaces:**
- Consumes: nada.
- Produces:
  ```astro
  <!-- WhyUsSection.astro -->
  interface Props { lang: 'es' | 'en'; }
  ```
  Render: `<section aria-labelledby="whyus-heading">` con `<h2 id="whyus-heading">`, `<img>` con `alt` según idioma, y `<ul role="list">` con 4 `<li>`.

- [ ] **Step 1: Escribir el test que falla — `src/components/WhyUsSection.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import WhyUsSection from './WhyUsSection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(WhyUsSection, { props: { lang } });

describe('WhyUsSection', () => {
  it('renderiza el <h2> con id y el eyebrow por idioma', async () => {
    const es = await render('es');
    expect(es).toMatch(/<h2[^>]*id="whyus-heading"/);
    expect(es).toContain('¿Por qué elegirnos?');
    expect(await render('en')).toContain('Why choose us?');
  });

  it('la imagen usa el alt correcto por idioma', async () => {
    expect(await render('es')).toContain('alt="David Takamura, Notary Public certificado"');
    expect(await render('en')).toContain('alt="David Takamura, certified notary public"');
  });

  it('renderiza una lista de 4 items', async () => {
    const html = await render('es');
    expect(html).toMatch(/<ul[^>]*role="list"/);
    expect((html.match(/<li/g) ?? []).length).toBe(4);
    expect(html).toContain('El reembolso más alto que la ley permite, 100% legal');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- src/components/WhyUsSection.test.ts`
Expected: FAIL — `Cannot find module './WhyUsSection.astro'`.

- [ ] **Step 3: Crear `src/components/WhyUsSection.astro` — frontmatter**

```astro
---
interface Props {
  lang: 'es' | 'en';
}
const { lang } = Astro.props;

const t = {
  es: {
    eyebrow: "¿Por qué elegirnos?",
    heading: { pre: "No solo asesoramos,", accent: "resolvemos." },
    description:
      "Sabemos que detrás de cada trámite hay una familia que no quiere una carta del IRS ni vivir con incertidumbre. Resolvemos tus taxes, notary public e inmigración en un solo lugar de confianza, en español, con precio claro desde el inicio y un comprobante en tus manos de que todo quedó bien hecho.",
    items: [
      "Tus taxes completos y sin errores que después traigan cartas del IRS",
      "El reembolso más alto que la ley permite, 100% legal",
      "Taxes, ITIN, notary public e inmigración en una sola oficina",
      "Precio exacto antes de empezar y comprobante de que quedó bien hecho",
    ],
    imageAlt: "David Takamura, Notary Public certificado",
  },
  en: {
    eyebrow: "Why choose us?",
    heading: { pre: "Not just paperwork,", accent: "done right." },
    description:
      "Notary and apostilles, tax preparation and business filings, all handled correctly the first time, with a clear price before we start and a stamped record that it's done. Our team works primarily in Spanish, but we gladly assist English-speaking clients with these services.",
    items: [
      "Notarizations, apostilles and document legalization, done right",
      "Tax preparation with no errors that bring an IRS letter later",
      "Business filings in one place: LLC, EIN and corporate documents",
      "An exact price before we start, and proof in hand that it's done",
    ],
    imageAlt: "David Takamura, certified notary public",
  },
}[lang];
---
```

- [ ] **Step 4: Añadir el markup a `WhyUsSection.astro`**

Copiar **verbatim** el bloque de `HomePage.astro` entre `<!-- ─── WHY US ... -->` y su `</section>` de cierre (aprox. líneas 283-336 — `<section class="py-32 bg-background-light" aria-labelledby="whyus-heading">` … `</section>`). Reemplazar todas las apariciones de `t.whyUs.` por `t.` (`t.whyUs.imageAlt` → `t.imageAlt`, `t.whyUs.eyebrow` → `t.eyebrow`, `t.whyUs.heading.pre` → `t.heading.pre`, `t.whyUs.heading.accent` → `t.heading.accent`, `t.whyUs.description` → `t.description`, `t.whyUs.items` → `t.items`). Nada más cambia.

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm test -- src/components/WhyUsSection.test.ts`
Expected: PASS (3 casos).

- [ ] **Step 6: Cablear en `HomePage.astro`**

1. Import: `import WhyUsSection from './WhyUsSection.astro';`
2. Borrar la clave `whyUs: { ... }` de `t.es` y `t.en`.
3. Reemplazar el bloque `<!-- ─── WHY US ... -->` … `</section>` por:
   ```astro
   <!-- ─── WHY US ────────────────────────────────────────────────────── -->
   <WhyUsSection lang={lang} />
   ```

- [ ] **Step 7: Verificar build + check + suite**

Run: `npx astro check` → 0 errores.
Run: `npx astro build` → 7 páginas, sin warnings nuevos.
Run: `npm test` → PASS.

- [ ] **Step 8: Verificar el HTML de `/en`**

Run: `npx astro build && node -e "const fs=require('fs');const h=fs.readFileSync('dist/en/index.html','utf8');console.log('whyus-heading:',h.includes('whyus-heading'));console.log('alt en:',h.includes('David Takamura, certified notary public'));console.log('4 li items:',(h.match(/Notarizations, apostilles|Tax preparation with no errors|Business filings in one place|An exact price before we start/g)||[]).length)"`
Expected: `whyus-heading: true`, `alt en: true`, `4 li items: 4`.

- [ ] **Step 9: Commit**

```bash
git add src/components/WhyUsSection.astro src/components/WhyUsSection.test.ts src/components/HomePage.astro
git commit -m "refactor: extrae WhyUsSection.astro del Home"
```

---

## Task 3: `OfficeSection.astro`

**Files:**
- Create: `src/components/OfficeSection.astro`
- Create: `src/components/OfficeSection.test.ts`
- Modify: `src/components/HomePage.astro` (import; reemplazar bloque "OFICINA" líneas ~342-443 por `<OfficeSection lang={lang} />`; borrar `t.office` de ambos idiomas)

**Interfaces:**
- Consumes: nada.
- Produces:
  ```astro
  <!-- OfficeSection.astro -->
  interface Props { lang: 'es' | 'en'; }
  ```
  Render: `<section aria-labelledby="office-heading">` con `<h2 id="office-heading">`, 4 `<img>` (2 apiladas + 1 vertical + poster de video dentro de un `<figure>`), y un `<a target="_blank" rel="noopener noreferrer">` a Google Maps.

- [ ] **Step 1: Escribir el test que falla — `src/components/OfficeSection.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import OfficeSection from './OfficeSection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(OfficeSection, { props: { lang } });

describe('OfficeSection', () => {
  it('renderiza el <h2> con id y el heading tricolor por idioma', async () => {
    const es = await render('es');
    expect(es).toMatch(/<h2[^>]*id="office-heading"/);
    expect(es).toContain('nuestra oficina');
    expect(await render('en')).toContain('Our Office');
  });

  it('renderiza 4 imágenes (3 galería + poster de video)', async () => {
    const html = await render('es');
    expect((html.match(/<img/g) ?? []).length).toBe(4);
  });

  it('el CTA abre Google Maps en pestaña nueva y segura', async () => {
    const html = await render('es');
    expect(html).toContain('href="https://www.google.com/maps/dir/?api=1&destination=235%20N%20Eastern%20Ave%20Suite%20130%2C%20Las%20Vegas%2C%20NV%2089101"');
    expect(html).toContain('target="_blank"');
    expect(html).toMatch(/rel="noopener noreferrer"/);
  });

  it('cambia el texto del CTA por idioma', async () => {
    expect(await render('es')).toContain('Cómo llegar');
    expect(await render('en')).toContain('Get Directions');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- src/components/OfficeSection.test.ts`
Expected: FAIL — `Cannot find module './OfficeSection.astro'`.

- [ ] **Step 3: Crear `src/components/OfficeSection.astro` — frontmatter**

```astro
---
interface Props {
  lang: 'es' | 'en';
}
const { lang } = Astro.props;

const t = {
  es: {
    kicker: "Taxes, notary public e inmigración, en un mismo lugar",
    heading: { pre: "Conoce", accent: "nuestra oficina", post: "en Las Vegas" },
    description:
      "Ven a nuestra oficina en Las Vegas y resuelve en una sola visita lo que normalmente te tomaría ir a tres lugares distintos.",
    cta: "Cómo llegar",
    ctaHref: "https://www.google.com/maps/dir/?api=1&destination=235%20N%20Eastern%20Ave%20Suite%20130%2C%20Las%20Vegas%2C%20NV%2089101",
    images: [
      { src: "/assets/images/test/thumb_servicios_90c45b98c0.jpg", alt: "Atención a un cliente en la oficina" },
      { src: "/assets/images/test/thumb_empresas_4b46959dd7.avif", alt: "Asesoría a un negocio local" },
      { src: "/assets/images/test/thumb_servicios_90c45b98c0.jpg", alt: "Recepción de la oficina en Las Vegas" },
    ],
    videoPoster: "/assets/images/test/thumb_empresas_4b46959dd7.avif",
    videoAlt: "Video: recorrido por nuestra oficina",
    videoTime: "03:05 / 05:10",
  },
  en: {
    kicker: "Taxes, notary, and immigration help, all in one place",
    heading: { pre: "Visit", accent: "Our Office", post: "in Las Vegas" },
    description:
      "Visit our Las Vegas office and handle in one trip what would normally mean three different stops.",
    cta: "Get Directions",
    ctaHref: "https://www.google.com/maps/dir/?api=1&destination=235%20N%20Eastern%20Ave%20Suite%20130%2C%20Las%20Vegas%2C%20NV%2089101",
    images: [
      { src: "/assets/images/test/thumb_servicios_90c45b98c0.jpg", alt: "Helping a client at the office" },
      { src: "/assets/images/test/thumb_empresas_4b46959dd7.avif", alt: "Advising a local business" },
      { src: "/assets/images/test/thumb_servicios_90c45b98c0.jpg", alt: "Front desk of the Las Vegas office" },
    ],
    videoPoster: "/assets/images/test/thumb_empresas_4b46959dd7.avif",
    videoAlt: "Video: a tour of our office",
    videoTime: "03:05 / 05:10",
  },
}[lang];
---
```

- [ ] **Step 4: Añadir el markup a `OfficeSection.astro`**

Copiar **verbatim** el bloque de `HomePage.astro` entre `<!-- ─── OFICINA ... -->` y su `</section>` de cierre (aprox. líneas 342-443 — `<section class="py-24 bg-background-light" aria-labelledby="office-heading">` … `</section>`), **incluyendo** el comentario JSX interno `{/* Video real: ... */}`. Reemplazar todas las apariciones de `t.office.` por `t.` (`t.office.kicker` → `t.kicker`, `t.office.heading.pre` → `t.heading.pre`, `t.office.heading.accent` → `t.heading.accent`, `t.office.heading.post` → `t.heading.post`, `t.office.description` → `t.description`, `t.office.images` → `t.images`, `t.office.videoPoster` → `t.videoPoster`, `t.office.videoAlt` → `t.videoAlt`, `t.office.videoTime` → `t.videoTime`, `t.office.ctaHref` → `t.ctaHref`, `t.office.cta` → `t.cta`). Nada más cambia.

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm test -- src/components/OfficeSection.test.ts`
Expected: PASS (4 casos).

- [ ] **Step 6: Cablear en `HomePage.astro`**

1. Import: `import OfficeSection from './OfficeSection.astro';`
2. Borrar la clave `office: { ... }` de `t.es` y `t.en`.
3. Reemplazar el bloque `<!-- ─── OFICINA ... -->` … `</section>` por:
   ```astro
   <!-- ─── OFICINA — GALERÍA IMÁGENES + VIDEO ────────────────────────── -->
   <OfficeSection lang={lang} />
   ```

- [ ] **Step 7: Verificar build + check + suite**

Run: `npx astro check` → 0 errores.
Run: `npx astro build` → 7 páginas, sin warnings nuevos.
Run: `npm test` → PASS.

- [ ] **Step 8: Verificar el HTML de `/`**

Run: `npx astro build && node -e "const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');console.log('office-heading:',h.includes('office-heading'));console.log('maps cta:',h.includes('maps/dir/?api=1&#38;destination=235')||h.includes('maps/dir/?api=1&destination=235'));console.log('Cómo llegar:',h.includes('Cómo llegar'))"`
Expected: `office-heading: true`, `maps cta: true`, `Cómo llegar: true`.

- [ ] **Step 9: Commit**

```bash
git add src/components/OfficeSection.astro src/components/OfficeSection.test.ts src/components/HomePage.astro
git commit -m "refactor: extrae OfficeSection.astro del Home"
```

---

## Task 4: `CtaSection.astro`

**Files:**
- Create: `src/components/CtaSection.astro`
- Create: `src/components/CtaSection.test.ts`
- Modify: `src/components/HomePage.astro` (import; reemplazar bloque "CTA" líneas ~457-513 por `<CtaSection lang={lang} />`; borrar `t.cta` **y** `t.stats` de ambos idiomas)

**Interfaces:**
- Consumes: nada.
- Produces:
  ```astro
  <!-- CtaSection.astro -->
  interface Props { lang: 'es' | 'en'; }
  ```
  Render: `<section aria-labelledby="cta-heading">` con `<h2 id="cta-heading">`, `<img>` con `alt`, y `<a>` a `/contacto` (es) / `/en/contact` (en).

**Nota:** el markup actual del CTA usa solo `eyebrow`, `heading`, `subheading`, `href`, `button`, `imageAlt`. Las claves `phone`, `address`, `hours` que hoy están en `t.cta` **no se usan** — no las incluyas en el `t` del componente.

- [ ] **Step 1: Escribir el test que falla — `src/components/CtaSection.test.ts`**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CtaSection from './CtaSection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(CtaSection, { props: { lang } });

describe('CtaSection', () => {
  it('renderiza el <h2> con id y el heading por idioma', async () => {
    const es = await render('es');
    expect(es).toMatch(/<h2[^>]*id="cta-heading"/);
    expect(es).toContain('¿Listo para resolver tu situación fiscal?');
    expect(await render('en')).toContain('Ready to resolve your tax situation?');
  });

  it('el subheading cambia por idioma', async () => {
    expect(await render('es')).toContain('Agenda una consulta sin costo');
    expect(await render('en')).toContain('Schedule a free consultation');
  });

  it('el botón apunta a /contacto en es y /en/contact en en', async () => {
    expect(await render('es')).toContain('href="/contacto"');
    expect(await render('en')).toContain('href="/en/contact"');
  });

  it('la imagen usa el alt de imageAlt', async () => {
    expect(await render('es')).toContain("alt=\"Asesor de Data's &#38; Multiservices atendiendo a un cliente\"");
  });
});
```

> Si el assert del `alt` con la entidad `&#38;` no coincide con el escape real que emite Astro, ajústalo a lo que devuelva `renderToString` (comprobar con un `console.log(html)` puntual). El resto de asserts es estable.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- src/components/CtaSection.test.ts`
Expected: FAIL — `Cannot find module './CtaSection.astro'`.

- [ ] **Step 3: Crear `src/components/CtaSection.astro` — frontmatter**

```astro
---
interface Props {
  lang: 'es' | 'en';
}
const { lang } = Astro.props;

const t = {
  es: {
    eyebrow: "Da el primer paso",
    heading: "¿Listo para resolver tu situación fiscal?",
    subheading: "Agenda una consulta sin costo y descubre cómo podemos ayudarte con tus trámites fiscales, de notary public y corporativos.",
    button: "Agendar cita gratis",
    href: "/contacto",
    imageAlt: "Asesor de Data's & Multiservices atendiendo a un cliente",
  },
  en: {
    eyebrow: "Take the first step",
    heading: "Ready to resolve your tax situation?",
    subheading: "Schedule a free consultation and discover how we can help with your tax, notary, and business needs.",
    button: "Book free appointment",
    href: "/en/contact",
    imageAlt: "A Data's & Multiservices advisor helping a client",
  },
}[lang];
---
```

- [ ] **Step 4: Añadir el markup a `CtaSection.astro`**

Copiar **verbatim** el bloque de `HomePage.astro` entre `<!-- ─── CTA ... -->` y su `</section>` de cierre (aprox. líneas 457-513 — `<section class="bg-background-light py-16 lg:py-24" aria-labelledby="cta-heading">` … `</section>`). Reemplazar todas las apariciones de `t.cta.` por `t.` (`t.cta.imageAlt` → `t.imageAlt`, `t.cta.eyebrow` → `t.eyebrow`, `t.cta.heading` → `t.heading`, `t.cta.subheading` → `t.subheading`, `t.cta.href` → `t.href`, `t.cta.button` → `t.button`). Nada más cambia.

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm test -- src/components/CtaSection.test.ts`
Expected: PASS (4 casos).

- [ ] **Step 6: Cablear en `HomePage.astro`**

1. Import: `import CtaSection from './CtaSection.astro';`
2. Borrar la clave `cta: { ... }` de `t.es` y `t.en`.
3. Borrar también la clave `stats: [ ... ]` top-level de `t.es` y `t.en` (código muerto — la "Stats bar" ya no está en el markup).
4. Reemplazar el bloque `<!-- ─── CTA ... -->` … `</section>` (el último del `<main>`) por:
   ```astro
   <!-- ─── CTA ──────────────────────────────────────────────────────── -->
   <CtaSection lang={lang} />
   ```

- [ ] **Step 7: Verificar build + check + suite**

Run: `npx astro check` → 0 errores.
Run: `npx astro build` → 7 páginas, sin warnings nuevos.
Run: `npm test` → PASS.

- [ ] **Step 8: Verificar los dos HTML**

Run: `npx astro build && node -e "for (const p of ['dist/index.html','dist/en/index.html']){const fs=require('fs');const h=fs.readFileSync(p,'utf8');console.log(p,'cta-heading:',h.includes('cta-heading'))}"`
Expected: ambas líneas `cta-heading: true`.

- [ ] **Step 9: Commit**

```bash
git add src/components/CtaSection.astro src/components/CtaSection.test.ts src/components/HomePage.astro
git commit -m "refactor: extrae CtaSection.astro del Home y borra t.stats muerto"
```

---

## Task 5: Limpieza final de `HomePage.astro` + docs

**Files:**
- Modify: `src/components/HomePage.astro`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `CommunitySection`, `WhyUsSection`, `OfficeSection`, `CtaSection` (Tasks 1-4).
- Produces: nada (task terminal).

- [ ] **Step 1: Revisar el frontmatter de `HomePage.astro`**

Tras las Tasks 1-4, el objeto `t` de `HomePage.astro` debe contener **solo** la clave `faq` en `es` y en `en`. Renombrar la constante para que quede explícito. El frontmatter final debe ser exactamente:

```astro
---
import Hero from './Hero.astro';
import CommunitySection from './CommunitySection.astro';
import ServicesSection from './ServicesSection.astro';
import WhyUsSection from './WhyUsSection.astro';
import TestimonialsSection from './TestimonialsSection.astro';
import OfficeSection from './OfficeSection.astro';
import FaqSection from './FaqSection.astro';
import CtaSection from './CtaSection.astro';

interface Props {
  lang: 'es' | 'en';
}
const { lang } = Astro.props;

// FaqSection es un componente genérico (compartido con páginas de servicio):
// su contenido vive acá y se le pasa por props.
const faq = {
  es: [
    /* los 6 objetos { q, a } de t.es.faq, sin cambios */
  ],
  en: [
    /* los 6 objetos { q, a } de t.en.faq, sin cambios */
  ],
}[lang];

const faqImage = {
  src: "/assets/images/david_takamura_notary_public.jpg",
  alt: lang === 'es'
    ? "David Takamura, Notary Public certificado"
    : "David Takamura, certified notary public",
};
---
```

(Los arrays `faq.es` / `faq.en` se copian tal cual de lo que hoy es `t.es.faq` / `t.en.faq`.)

- [ ] **Step 2: Revisar el `<main>` de `HomePage.astro`**

El `<main>` final debe ser exactamente:

```astro
<main>
  <!-- HERO SLIDER -->
  <Hero lang={lang} />

  <!-- ─── COMMUNITY & STATS ─────────────────────────────────────────── -->
  <CommunitySection lang={lang} />

  <!-- ─── SERVICES ──────────────────────────────────────────────────── -->
  <ServicesSection lang={lang} />

  <!-- ─── WHY US ────────────────────────────────────────────────────── -->
  <WhyUsSection lang={lang} />

  <!-- ─── TESTIMONIOS ───────────────────────────────────────────────── -->
  <TestimonialsSection lang={lang} />

  <!-- ─── OFICINA — GALERÍA IMÁGENES + VIDEO ────────────────────────── -->
  <OfficeSection lang={lang} />

  <!-- ─── FAQ ──────────────────────────────────────────────────────── -->
  <FaqSection
    lang={lang}
    faqs={faq}
    image={faqImage}
  />

  <!-- ─── CTA ──────────────────────────────────────────────────────── -->
  <CtaSection lang={lang} />
</main>
```

El `<script>` del `IntersectionObserver` de `[data-reveal]` que está debajo del `</main>` **no se toca** — queda tal cual.

- [ ] **Step 3: Verificar que no quedaron referencias colgando**

Run: `node -e "const s=require('fs').readFileSync('src/components/HomePage.astro','utf8');for (const k of ['t.community','t.whyUs','t.office','t.cta','t.stats','t.es.stats','t.en.stats']) if (s.includes(k)) { console.error('QUEDA:',k); process.exit(1) } console.log('limpio')"`
Expected: `limpio`.

- [ ] **Step 4: Verificar build + check + suite completa**

Run: `npx astro check`
Expected: 0 errores.
Run: `npx astro build`
Expected: 7 páginas, sin warnings nuevos respecto al baseline.
Run: `npm test`
Expected: PASS — 20 suites previas + 4 nuevas, ~124 tests.

- [ ] **Step 5: Diff de humo del HTML renderizado**

Run: `npx astro build && node -e "const fs=require('fs');for (const p of ['dist/index.html','dist/en/index.html']){const h=fs.readFileSync(p,'utf8');const ids=['community-heading','services-heading','whyus-heading','office-heading','cta-heading'];console.log(p, ids.map(i=>i+':'+h.includes(i)).join(' '))}"`
Expected: para ambos archivos, los 5 ids en `true`.

Además, inspección visual rápida: `npm run dev`, abrir `/` y `/en`, confirmar que las 8 secciones se ven igual que antes (hero, community+stats, services, why us, testimonios, oficina, faq, cta) y que la animación `data-reveal` sigue disparando al hacer scroll.

- [ ] **Step 6: Actualizar `CLAUDE.md`**

En la sección **"### HomePage.astro — secciones en orden"**, reemplazar el bloque de código de la lista de secciones por:

```
1. <Hero lang={lang} />              ← slider de imágenes
2. <CommunitySection lang={lang} />  ← 2 cols: copy + grid 2×2 stats
3. <ServicesSection lang={lang} />   ← 3 tarjetas (Taxes, Notary Public, Business)
4. <WhyUsSection lang={lang} />      ← imagen + checklist de 4 puntos
5. <TestimonialsSection lang={lang} /> ← reseñas de Google
6. <OfficeSection lang={lang} />     ← galería 3 imágenes + video + CTA "cómo llegar"
7. <FaqSection lang={lang} faqs={faq} image={faqImage} /> ← acordeón
8. <CtaSection lang={lang} />        ← fondo bg-brand, conversión final
```

Y añadir debajo:

```
`HomePage.astro` quedó como orquestador: solo importa las 8 secciones, define
el array `faq` (contenido del acordeón, que alimenta el componente genérico
`FaqSection`) y `faqImage`, y conserva el `<script>` del IntersectionObserver
de `[data-reveal]`. Cada sección es un componente en `src/components/` con
`interface Props { lang }` y su propio objeto `t` inline ES/EN.
```

Actualizar también la descripción larga de la sub-sección "La sección **Community & Stats**" para que diga que ahora vive en `CommunitySection.astro` (no en `HomePage.astro`).

En el árbol de **"## Estructura de archivos"**, dentro de `src/components/`, añadir las líneas (en orden, junto a los otros componentes de nivel raíz):

```
│   ├── CommunitySection.astro # Home: comunidad + grid 2×2 de stats
│   ├── WhyUsSection.astro      # Home: imagen + checklist "por qué elegirnos"
│   ├── OfficeSection.astro     # Home: galería de oficina + video + CTA maps
│   ├── CtaSection.astro        # Home: CTA final (bg-brand) — NO es service/CtaBanner
```

- [ ] **Step 7: Commit**

```bash
git add src/components/HomePage.astro CLAUDE.md
git commit -m "refactor: HomePage.astro queda como orquestador + CLAUDE.md al día"
```

---

## Self-Review

**1. Spec coverage:**
- 4 componentes nuevos (`CommunitySection`, `WhyUsSection`, `OfficeSection`, `CtaSection`) → Tasks 1-4. ✓
- Cada uno con `interface Props { lang }` + `t` inline + markup verbatim → Steps 3-4 de cada task. ✓
- `CtaSection` ≠ `service/CtaBanner` → nota en Task 4 y en `CLAUDE.md` (Task 5 Step 6). ✓
- Tests Container API, un archivo por componente, render ES + EN → Step 1 de Tasks 1-4. ✓
- `HomePage.astro` orquestador, conserva `faq` + `<script>` → Task 5 Steps 1-2. ✓
- Script `data-reveal` sin cambios → Task 5 Step 2 (explícito) + Global Constraints. ✓
- Fuera de alcance (primitivos, copy, tests retro, Hero/FaqSection) → respetado; ningún step los toca. ✓
- Verificación (`npm test`, `astro check`, `astro build`, diff HTML) → Steps de verificación en cada task + Task 5 Step 5. ✓
- Doc `CLAUDE.md` → Task 5 Step 6. ✓
- Código muerto (`t.stats`, `t.cta.phone/address/hours`) → Global Constraints + Task 4. ✓

**2. Placeholder scan:** Los `/* ... */` en Task 5 Step 1 remiten a contenido concreto y ya existente en el repo (`t.es.faq` / `t.en.faq`), con instrucción de copiarlo verbatim — no es un placeholder abierto. El markup "copiar verbatim de líneas X-Y" apunta a código commiteado y verificable. Sin `TODO` / `TBD` / "add error handling".

**3. Type consistency:** Todos los componentes exponen la misma interfaz `Props { lang: 'es' | 'en' }`. `HomePage.astro` los invoca todos como `<XxxSection lang={lang} />`. `FaqSection` mantiene su firma actual (`lang`, `faqs`, `image`) — no se toca. Nombres de componentes idénticos entre "Files", "Interfaces", imports y uso en `<main>`.

---

## Execution Handoff

Al terminar de escribir el plan, elegir modo de ejecución (ver más abajo en la conversación).
