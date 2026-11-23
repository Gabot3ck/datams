# Página Nosotros (`/nosotros` ↔ `/en/about`) — diseño

Fecha: 2026-11-22 · Estado: aprobado e implementado (2026-11-22)

## Intención

Una página centrada en **las personas que trabajan en la oficina**: que quien
llega vea quién lo va a atender antes de entregar sus papeles. No es una
página de historia ni de misión/visión. Referencias del usuario: capturas
"Etico" (ritmo de secciones, fila de valores con íconos) y
theprofessionalmultiservices.com/equipo (grilla de retratos con nombre y cargo).

## Objetivos / no-objetivos / anti-objetivos

- **Objetivos:** hero con la foto grupal del equipo completo; retratos
  individuales con nombre y cargo; valores; tiempo de servicio de la empresa.
- **No-objetivos:** misión/visión/objetivos (sí están en la referencia Etico,
  el usuario no los pidió); historia del negocio; biografías.
- **Anti-objetivos:** usar personas generadas con IA (slides 3 y 4 del hero);
  mostrar la placa "Professional Multiservices · David Takamura"; decir
  "certificado/certified", "Realtor", "notario"; estirar la foto grupal
  más allá de su tamaño real (se ve borrosa).

## Restricciones

- Colores, tipografía y fluid design actuales (tokens de `global.css`,
  `text-fluid-*`, `.title`, `.btn`, `font-display`). Nada de los verdes de Etico.
- Fotos en `../datams/team/` (fuera del repo). Grupal: 1024×728 (horizontal)
  y 932×1024 (vertical) — WhatsApp, baja resolución.
- Reglas legales de `CLAUDE.md`: AFSP (no "certificado"), Notary Public,
  Real Estate sin brokerage.
- Mobile first, lg = 990px, WCAG AA, un solo H1, alt en todas las imágenes.

## Enfoques considerados

- **A. Hero dividido (elegido):** texto + H1 a un lado, foto grupal
  contenida (≤1024px, `rounded-2xl`) al otro; en mobile foto arriba.
  La foto nunca se escala por encima de su tamaño real y repite el patrón
  imagen/texto de WhyUs, FAQ y CTA del Home.
- **B. Hero a ancho completo con texto encima** (como el Home/Etico):
  descartado por ahora — la foto de 1024px se ve borrosa desde ~1280px y el
  degradado tapa caras. Reconsiderar si el cliente manda el original.

## Decidido con el usuario

1. Hero A con la foto grupal.
2. Grilla de retratos individuales con nombre e imagen.
3. Valores con íconos (fila, como la referencia).
4. Tiempo de servicio de la empresa.
5. Nombres pendientes: **"Asesor 1…5"** / "Advisor 1…5" hasta que el cliente
   los confirme.

## Mis decisiones (corregibles)

- **Orden:** Hero → franja de datos (10+ años · 5,000+ familias · Las Vegas,
  mismos números que `CommunitySection`) → grilla del equipo → valores →
  `CtaSection` del Home reutilizado.
- **Grilla:** 5 tarjetas, retrato 3:4 con el mismo fondo blanco. 2 cols mobile,
  3 tablet, 5 desde 1280px. Cargo según la placa: "Tax Preparer" en ES y EN (pendiente decidir si en ES va "Preparador(a) de taxes").
- **6ª persona** (sentada a la derecha en la grupal) sin retrato individual:
  queda solo en la grupal; sin tarjeta hasta que llegue su retrato.
- **Retratos elegidos:** Anabella → el de placa legible (1.20.30 PM (1));
  la asesora de pelo claro → el de alta resolución (1.19.26 PM, 3140×5120)
  con la placa tapada por un parche del color de la chaqueta (script con
  `sharp`, sin ffmpeg). Las fotos se procesan a WebP en `src/assets/images/team/`
  con nombres SEO (`datamultiservices-equipo-asesor-N.webp`) y se sirven con
  `astro:assets`.
- **Valores (4):** Transparencia (precio claro desde el inicio), Atención en
  tu idioma, Responsabilidad (comprobante de que todo quedó bien hecho),
  Confianza/cercanía. Copy ES/EN redactado a partir de `WhyUsSection`;
  íconos de línea SVG inline en `brand`.
- **Componentes:** `src/components/about/` — `AboutHero`, `AboutStats`,
  `TeamGrid` (+ `TeamCard`), `ValuesSection`, y un orquestador `AboutPage`
  con `lang` (patrón de `HomePage`). Páginas `src/pages/nosotros.astro` y
  `src/pages/en/about.astro`. Datos del equipo en un array dentro de
  `TeamGrid` (o `src/config/team.ts` si el builder lo prefiere).
- **Rutas:** añadir `{ es: '/nosotros', en: '/en/about', enBuilt: true }`
  en `routes.ts`.
- **SEO:** title/description únicos ES/EN con "Las Vegas"; JSON-LD `AboutPage`
  sobre la organización. **Sin** `Person` en JSON-LD mientras los nombres
  sean placeholder.
- **Pendientes para el cliente** (nueva entrada en `DECISIONES-NEGOCIO.md` §7):
  nombre y cargo de cada asesor; retrato de la 6ª persona; foto grupal
  original sin WhatsApp; valores propios si los tienen.

## Queda al builder

- Copy exacto del hero y de los valores (respetando las reglas legales).
- Breadcrumb: usarlo si rinde bien con `/nosotros` (hoy infiere categoría del
  primer segmento); si no, omitirlo.
- Animación de entrada con `data-reveal` como el Home (opcional).
- Tests: smoke test de la página con Vitest + Container API, como
  `_contacto.test.ts`; `npm run check:links` en verde.
