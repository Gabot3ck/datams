# Prompt para Claude Code — Mejoras de navegación e interlinking

## Contexto del proyecto

Lee primero `CLAUDE.md` en la raíz del proyecto: ahí está el stack (Astro 6 + React 19 solo en `MegaMenu.tsx` + Tailwind 4), el sistema de diseño (variables CSS como `--color-brand-light`), el patrón de i18n (objeto `t = {es:{}, en:{}}[lang]`, sin archivos JSON) y la tabla de rutas ES/EN.

**Antes de modificar nada, lee el contenido actual de:**
- `src/components/Navbar.astro`
- `src/components/MegaMenu.tsx`
- `src/components/MegaMenuPanel.tsx`
- `src/components/HomePage.astro` (sección "Services")
- Busca si ya existe `src/components/Footer.astro`; si no existe, créalo.

No asumas la forma exacta de las props/interfaces de estos componentes — adapta la implementación a lo que encuentres en el código real. **No toques el gesto de apertura del mega-menú** (se abre con clic en el `<li>`, no con hover) — eso ya quedó decidido y no se modifica.

## Objetivo

Las 5 categorías del mega-menú (Taxes, ITIN/EIN, Notaría Pública, Inmigración, Más Servicios) no tienen hoy forma de enlazar a su página de categoría/pilar (`/taxes`, `/itin-ein`, `/notaria`, `/inmigracion`) porque el label del nav solo abre/cierra el panel. Resolver esto en 4 frentes, sin romper el patrón de apertura por clic.

---

## Tarea 1 — Link de acceso al pilar dentro de cada panel

En `MegaMenuPanel.tsx`, agrega un encabezado fijo arriba de los tabs existentes (antes del contenedor de tabs).

### Para Taxes, ITIN/EIN, Notaría Pública, Inmigración (una categoría = un link)

```tsx
<div class="flex items-center justify-between border-b border-background-muted pb-3 mb-4">
  <a
    href={pillarUrl}
    class="text-lg font-bold text-brand-light hover:underline"
  >
    Ver todos los servicios de {categoryLabel} →
  </a>
</div>
```

`pillarUrl` y `categoryLabel` deben venir del objeto de configuración de cada categoría (el que ya alimenta los tabs/items en `MegaMenu.tsx` o `Navbar.astro`). Agrega esos dos campos a esa estructura si no existen.

Mapeo exacto:

| Categoría del nav | categoryLabel | pillarUrl |
|---|---|---|
| Taxes | Taxes | `/taxes` |
| ITIN / EIN | ITIN / EIN | `/itin-ein` |
| Notary Public | Notaría Pública | `/notaria` |
| Inmigración | Inmigración | `/inmigracion` |

### Para "Más Servicios" (sin pilar único — 4 mini-links fijos, NO dinámicos por tab)

```tsx
<div class="flex items-center gap-4 border-b border-background-muted pb-3 mb-4 text-sm font-semibold">
  <a href="/negocio" class="text-brand-light hover:underline">Negocio</a>
  <span class="text-neutral-grey">·</span>
  <a href="/dmv" class="text-brand-light hover:underline">DMV</a>
  <span class="text-neutral-grey">·</span>
  <a href="/corte" class="text-brand-light hover:underline">Formularios Corte</a>
  <span class="text-neutral-grey">·</span>
  <a href="/otros" class="text-brand-light hover:underline">Otros Servicios</a>
</div>
```

Estos 4 links se muestran **siempre**, sin importar qué tab (Business/DMV/Formularios Corte/Otros) esté activo — no dependen del estado `activeTab`. Esta decisión ya fue confirmada con el cliente, no proponer la versión dinámica.

### Versión en inglés
El mismo componente debe resolver las URLs con prefijo `/en/` cuando `lang === 'en'`, y los textos ("Ver todos los servicios de" → "See all services in") deben venir del mismo patrón bilingüe `t = {es:{}, en:{}}` ya usado en el resto del sitio.

---

## Tarea 2 — Componente `Breadcrumb.astro`

Crea `src/components/Breadcrumb.astro`, genérico y reutilizable en cualquier página de servicio.

**Props:**
```ts
interface Props {
  lang: 'es' | 'en';
  currentLabel: string; // el H1 exacto de la página, ej: "Declaración de Impuestos Personales"
}
```

**Lógica:**
1. Toma `Astro.url.pathname`, quita el prefijo `/en` si existe, separa por `/` → primer segmento (`taxes`, `irs`, `itin-ein`, `notaria`, `inmigracion`, `negocio`, `dmv`, `corte`, `otros`).
2. Resuelve ese segmento contra un mapa interno del componente:

```ts
const categoryMap = {
  es: {
    taxes:        { label: "Taxes",                  url: "/taxes" },
    irs:          { label: "IRS & Resolución Fiscal", url: "/irs", parent: "taxes" }, // caso especial: anidado bajo Taxes aunque su URL no lo esté
    "itin-ein":   { label: "ITIN / EIN",              url: "/itin-ein" },
    notaria:      { label: "Notaría Pública",         url: "/notaria" },
    inmigracion:  { label: "Inmigración",             url: "/inmigracion" },
    negocio:      { label: "Negocio",                 url: "/negocio" },
    dmv:          { label: "DMV",                     url: "/dmv" },
    corte:        { label: "Formularios Corte",       url: "/corte" },
    otros:        { label: "Otros Servicios",         url: "/otros" },
  },
  en: { /* mismas keys, labels traducidos, urls con /en/ */ }
};
```

3. **Caso especial:** si la categoría resuelta tiene `parent` (como `irs` → `taxes`), el breadcrumb debe insertar ese ancestro aunque no esté en el path de la URL real:
   `Inicio > Taxes > IRS & Resolución Fiscal > {currentLabel}`
4. Para el resto: `Inicio > {label de la categoría} > {currentLabel}`.
5. Todos los crumbs son `<a>` excepto el último (`currentLabel`), que es texto plano con `aria-current="page"`.
6. Emite además **JSON-LD `BreadcrumbList`** — es lo que Google usa para breadcrumbs en el SERP; el HTML visible es solo para el usuario.

**Estructura sugerida:**
```astro
---
interface Props { lang: 'es' | 'en'; currentLabel: string; }
const { lang, currentLabel } = Astro.props;
// resolver categoría + parent según lógica de arriba
// construir jsonLd con itemListElement
---
<nav aria-label="Breadcrumb" class="text-sm text-neutral-grey mb-4">
  <ol class="flex gap-2 flex-wrap">
    <li><a href={lang === 'en' ? '/en' : '/'}>{lang === 'en' ? 'Home' : 'Inicio'}</a></li>
    <!-- ...ancestro(s) según categoryMap... -->
    <li aria-current="page" class="text-neutral-dark font-medium">{currentLabel}</li>
  </ol>
</nav>
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

**Úsalo en cada página de servicio**, justo debajo del header, pasando el H1 exacto como `currentLabel`. Implementa primero en las páginas de Taxes, ITIN/EIN, Notaría e Inmigración (ya tienen Title/Meta/H1 definidos); el resto se agrega cuando se creen sus páginas.

---

## Tarea 3 — Footer con links planos a las 8 categorías

Si no existe `Footer.astro`, créalo; si existe, agrégale una columna "Servicios" en HTML estático (sin JS, sin depender de hidratación — debe funcionar aunque falle todo el JS de la página):

```astro
<nav aria-label="Servicios">
  <a href="/taxes">Taxes</a>
  <a href="/itin-ein">ITIN / EIN</a>
  <a href="/notaria">Notaría Pública</a>
  <a href="/inmigracion">Inmigración</a>
  <a href="/negocio">Negocio</a>
  <a href="/dmv">DMV</a>
  <a href="/corte">Formularios Corte</a>
  <a href="/otros">Otros Servicios</a>
</nav>
```
Con su versión `/en/...` cuando `lang === 'en'`, usando el patrón bilingüe del proyecto.

---

## Tarea 4 — Verificar tarjetas de "Services" en el Home

En `HomePage.astro`, sección Services (Taxes / Notaría / Business), confirma que cada tarjeta tenga `href="/taxes"`, `href="/notaria"`, `href="/negocio"` reales — **no** `href="#"` placeholder (CLAUDE.md marca esto como pendiente). Si están en placeholder, corrígelas.

---

## Criterios de aceptación

- [ ] Clic en cada categoría del nav sigue abriendo el panel igual que antes (no se tocó el gesto de apertura).
- [ ] Paneles de Taxes, ITIN/EIN, Notaría e Inmigración muestran su link "Ver todos los servicios de X" arriba de los tabs, visible sin necesidad de hover en ningún tab.
- [ ] Panel de "Más Servicios" muestra los 4 mini-links (Negocio · DMV · Corte · Otros) siempre visibles, sin cambiar según el tab activo.
- [ ] `Breadcrumb.astro` existe, recibe `lang` y `currentLabel`, resuelve la categoría desde la URL, maneja el caso especial de `/irs` anidado bajo Taxes, y emite JSON-LD `BreadcrumbList` válido.
- [ ] Footer tiene los 8 links planos a las categorías, en ES y EN.
- [ ] Tarjetas de Services en el Home usan URLs reales, no `#`.
- [ ] `npm run build` pasa sin errores ni warnings nuevos.
- [ ] Probar visualmente con `npm run dev` en desktop (≥990px, breakpoint custom `lg`) y en mobile, tanto en `/` como en `/en`.
