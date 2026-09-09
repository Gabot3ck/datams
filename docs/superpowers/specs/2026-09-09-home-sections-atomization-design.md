# Atomización de secciones del Home — Design

**Fecha:** 2026-09-09
**Estado:** Aprobado (pendiente de plan de implementación)

## Objetivo

`src/components/HomePage.astro` (530 líneas) mezcla un objeto `t` de traducciones
de todas las secciones con cuatro bloques de markup inline. El objetivo es
convertirlo en un orquestador delgado (~60 líneas) extrayendo esas cuatro
secciones a componentes propios, cada uno dueño de su markup **y** sus
traducciones, siguiendo el patrón ya establecido por `ServicesSection.astro` y
`TestimonialsSection.astro`.

No hay ningún cambio visual, de copy ni de comportamiento. El HTML renderizado de
`/` y `/en` debe quedar idéntico salvo whitespace.

## Estado actual

`HomePage.astro` → `<main>` con 8 bloques:

1. `<Hero lang={lang} />` — ya es componente
2. **Community & Stats** — inline (L199-277), usa `t.community`
3. `<ServicesSection lang={lang} />` — ya es componente
4. **Why Us** — inline (L284-336), usa `t.whyUs`
5. `<TestimonialsSection lang={lang} />` — ya es componente
6. **Oficina — galería imágenes + video** — inline (L343-443), usa `t.office`
7. `<FaqSection lang={lang} faqs={t.faq} image={...} />` — ya es componente, prop-driven
8. **CTA final** — inline (L458-513), usa `t.cta`

Al final del archivo hay un `<script>` con un `IntersectionObserver` que revela los
elementos `[data-reveal]` al entrar en viewport.

Patrón de los componentes de sección existentes:
- `interface Props { lang: 'es' | 'en' }` como única prop
- objeto `t` inline con forma `{ es: {...}, en: {...} }[lang]`
- un `<section>` con `aria-labelledby` y `data-reveal` en subelementos
- sin lógica JS propia

Los componentes de sección actuales (`ServicesSection`, `TestimonialsSection`) **no
tienen tests**. Los de `src/components/service/` **sí** (Container API de Astro).

## Diseño

### Componentes nuevos (`src/components/`)

| Componente | Reemplaza (líneas actuales) | Claves `t` que absorbe | `aria-labelledby` |
|---|---|---|---|
| `CommunitySection.astro` | Community & Stats (L199-277) | `t.community` | `community-heading` |
| `WhyUsSection.astro` | Why Us (L284-336) | `t.whyUs` | `whyus-heading` |
| `OfficeSection.astro` | Oficina galería + video (L343-443) | `t.office` | `office-heading` |
| `CtaSection.astro` | CTA final (L458-513) | `t.cta` | `cta-heading` |

Cada componente nuevo:
- `interface Props { lang: 'es' | 'en' }` — única prop
- objeto `t` inline con las sub-claves ES/EN que hoy viven en `HomePage.astro`
  (se mueven tal cual, sin reescribir el contenido)
- **markup idéntico** al bloque actual: mismo HTML, mismas clases Tailwind, mismos
  atributos `data-reveal` / `data-reveal-delay`, mismos `id` en los headings
- sin `<script>` ni lógica de cliente

> `CtaSection.astro` es el CTA del **home** (grid imagen + texto sobre fondo
> `bg-brand`). No debe confundirse con `src/components/service/CtaBanner.astro`,
> que es el CTA de las páginas de servicio y tiene otro markup.

### `HomePage.astro` resultante

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

interface Props { lang: 'es' | 'en'; }
const { lang } = Astro.props;

// FaqSection es un componente genérico (compartido con páginas de servicio),
// así que su contenido se queda acá como datos que se le pasan por props.
const faq = { es: [ /* 6 items */ ], en: [ /* 6 items */ ] }[lang];
const faqImage = {
  src: "/assets/images/david_takamura_notary_public.jpg",
  alt: lang === 'es'
    ? "David Takamura, Notary Public certificado"
    : "David Takamura, certified notary public",
};
---

<main>
  <Hero lang={lang} />
  <CommunitySection lang={lang} />
  <ServicesSection lang={lang} />
  <WhyUsSection lang={lang} />
  <TestimonialsSection lang={lang} />
  <OfficeSection lang={lang} />
  <FaqSection lang={lang} faqs={faq} image={faqImage} />
  <CtaSection lang={lang} />
</main>

<script>
  // IntersectionObserver de [data-reveal] — sin cambios
</script>
```

El único bloque largo que queda en `HomePage.astro` es el array `faq` ES/EN
(6 items por idioma). El archivo final ronda las 90-110 líneas, contra 530.

### Script `data-reveal`

Se queda tal cual en `HomePage.astro`. Consulta
`document.querySelectorAll('[data-reveal]')` a nivel de documento, así que sigue
alcanzando los elementos `data-reveal` que ahora viven dentro de los componentes
hijos. No se toca.

### Tests

Un archivo `*.test.ts` por componente nuevo, en `src/components/`, siguiendo el
patrón de `src/components/service/*.test.ts` (Container API de Astro + Vitest).
`vitest.config.ts` ya incluye `src/**/*.test.ts`, no hace falta configurar nada.

Cada suite: un render ES y un render EN, ~4-6 asserts. Sin snapshots.

- **`CommunitySection.test.ts`**
  - render ES: `<h2 id="community-heading">` presente; el accent (`t.community.heading.accent`) dentro de un `<em class="not-italic ...">`
  - `<dl>` con exactamente 4 celdas de stats
  - CTA con `href="/contacto"` (ES) / `href="/en/contact"` (EN)
  - los 3 trust indicators presentes
  - textos ES ≠ textos EN (algún string representativo)

- **`WhyUsSection.test.ts`**
  - `<h2 id="whyus-heading">` presente
  - `<img>` con `alt` = `imageAlt` correcto según idioma
  - `<ul role="list">` con 4 `<li>`
  - un string ES contra su equivalente EN

- **`OfficeSection.test.ts`**
  - `<h2 id="office-heading">` presente
  - 4 `<img>` (2 apiladas + 1 vertical + poster de video)
  - CTA con texto "Cómo llegar" (ES) / "Get Directions" (EN), `target="_blank"` y `rel` con `noopener`
  - `href` del CTA contiene `google.com/maps`

- **`CtaSection.test.ts`**
  - `<h2 id="cta-heading">` presente
  - heading y subheading correctos según idioma
  - botón con `href="/contacto"` (ES) / `href="/en/contact"` (EN)
  - `<img>` con `alt` = `t.cta.imageAlt`

### Orden de trabajo sugerido

Una sección por vez, cada una con su commit: escribir test (falla) → extraer
componente moviendo markup + traducciones → reemplazar el bloque en `HomePage.astro`
por `<XxxSection lang={lang} />` → test pasa → `astro check` + `astro build` OK.
Repetir para las 4. Commit final: actualizar `CLAUDE.md`.

## Fuera de alcance

- **Primitivos compartidos.** Los patrones repetidos entre secciones (label/eyebrow
  con punto o raya, botón pill `rounded-full`, ícono checkmark SVG) quedan
  duplicados como están hoy. Se pueden atomizar en un paso posterior si molestan.
- **Cambios de copy o visuales** de cualquier tipo.
- **Tests retroactivos** para `ServicesSection` / `TestimonialsSection`.
- **Tocar `Hero.astro` o `FaqSection.astro`.**
- Mover el contenido del FAQ fuera de `HomePage.astro` (queda como datos que
  alimentan el componente genérico `FaqSection`).

## Verificación

- `npm test` → todo verde, con 4 suites nuevas
- `npx astro check` → 0 errores
- `npx astro build` → 7 páginas construidas, sin warnings nuevos
- Comparar el HTML renderizado de `/` y `/en` antes/después: idéntico salvo
  whitespace / orden de atributos

## Documentación a actualizar

`CLAUDE.md`:
- Sección "HomePage.astro — secciones en orden": reflejar que ahora son todos
  componentes (`<CommunitySection>`, `<WhyUsSection>`, `<OfficeSection>`,
  `<CtaSection>`) y que solo el array `faq` queda inline
- Árbol de `src/components/`: añadir los 4 componentes nuevos
