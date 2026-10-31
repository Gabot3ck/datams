// ─── Producción: cambiar SITE_URL al desplegar ──────────────────────────
export const SITE_URL = 'https://tudominio.com';
export const SITE_NAME = "Data's & Multiservices";
export const OG_IMAGE = `${SITE_URL}/assets/og-image.webp`; // ← PROD: crear imagen 1200×675
export const GSC_VERIFICATION = ''; // ← PROD: código de Google Search Console

export const BUSINESS = {
  phone: '+17026400088',
  phoneDisplay: '(702) 640-0088',
  whatsapp: 'https://wa.me/17026400088',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=235%20N%20Eastern%20Ave%20Suite%20130%2C%20Las%20Vegas%2C%20NV%2089101',
  address: {
    street: '235 N Eastern Ave. Suite 130',
    city: 'Las Vegas',
    region: 'NV',
    postalCode: '89101',
    country: 'US',
  },
  // Horario por temporada (fechas MM-DD). Domingos cerrados todo el año.
  // Alimenta el JSON-LD (buildOpeningHoursSpecification); hoursDisplay es la versión corta para UI.
  seasons: [
    {
      label: { es: 'Temporada de taxes', en: 'Tax season' },
      from: '01-02',
      through: '04-15',
      hours: [{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '22:00' }],
    },
    {
      label: { es: 'Resto del año', en: 'Rest of the year' },
      from: '04-16',
      through: '12-31',
      hours: [
        { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '19:00' },
        { days: ['Saturday'], opens: '10:00', closes: '14:00' },
      ],
    },
  ],
  closedDates: ['01-01'],
  hoursDisplay: {
    es: [
      'Temporada de taxes (2 ene–15 abr): Lun–Sáb 9AM–10PM',
      'Resto del año: Lun–Vie 10AM–7PM · Sáb 10AM–2PM',
      'Cerrado el 1 de enero',
    ],
    en: [
      'Tax season (Jan 2–Apr 15): Mon–Sat 9AM–10PM',
      'Rest of the year: Mon–Fri 10AM–7PM · Sat 10AM–2PM',
      'Closed January 1',
    ],
  },
  email: '[PLACEHOLDER: email de contacto del negocio]',
} as const;

export const TRUST_BAR_DEFAULT_ES = [
  'Atención 100% en español',
  'Precio fijo, conocido antes de empezar',
  'Oficina física en Las Vegas — no somos solo una página web',
  // Nunca "certificados": el IRS prohíbe ese término para el AFSP (ver DECISIONES-NEGOCIO.md)
  'Preparadores que completaron el Annual Filing Season Program del IRS',
];

const PILLAR_PATHS = new Set([
  '/taxes', '/irs', '/itin-ein', '/notary-public', '/inmigracion',
  '/negocio', '/dmv', '/corte', '/otros',
]);

/** Quita barras finales, conservando '/' para la home.
 *  Normalizador compartido — lo usan `canonicalURL` y `routes.ts`. */
export function stripTrailingSlash(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

/** URL canónica absoluta con barra final normalizada:
 *  home y pilares de categoría → con barra; todo lo demás → sin barra. */
export function canonicalURL(pathname: string): string {
  let path = stripTrailingSlash(pathname);
  const isEn = path === '/en' || path.startsWith('/en/');
  const noEn = isEn ? path.slice(3) || '/' : path;
  const isPillar = noEn === '/' || PILLAR_PATHS.has(noEn);
  if (isPillar && path !== '/') path = `${path}/`;
  return SITE_URL + path;
}

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

/** OpeningHoursSpecification de schema.org para los años dados (por defecto:
 *  el año del build y el siguiente, para que el sitio no quede sin horario
 *  vigente si no se reconstruye al cambiar de año). Las fechas cerradas van
 *  como opens = closes = 00:00, que es como Google marca un día cerrado. */
export interface OpeningHoursSpec {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek?: string[];
  opens: string;
  closes: string;
  validFrom: string;
  validThrough: string;
}

export function buildOpeningHoursSpecification(
  years: number[] = [new Date().getFullYear(), new Date().getFullYear() + 1],
): OpeningHoursSpec[] {
  return years.flatMap((year): OpeningHoursSpec[] => [
    ...BUSINESS.closedDates.map((date) => ({
      '@type': 'OpeningHoursSpecification' as const,
      opens: '00:00',
      closes: '00:00',
      validFrom: `${year}-${date}`,
      validThrough: `${year}-${date}`,
    })),
    ...BUSINESS.seasons.flatMap((season) =>
      season.hours.map((h) => ({
        '@type': 'OpeningHoursSpecification' as const,
        dayOfWeek: [...h.days],
        opens: h.opens,
        closes: h.closes,
        validFrom: `${year}-${season.from}`,
        validThrough: `${year}-${season.through}`,
      })),
    ),
  ]);
}

const MONTHS = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES = {
  es: { short: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], long: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] },
  en: { short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], long: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
};

/** 'MM-DD' → "2 de enero" / "January 2" */
function formatDay(mmdd: string, lang: 'es' | 'en'): string {
  const [m, d] = mmdd.split('-').map(Number);
  return lang === 'es' ? `${d} de ${MONTHS.es[m - 1]}` : `${MONTHS.en[m - 1]} ${d}`;
}

/** '19:00' → "7:00 PM" */
function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Días consecutivos → "Lun – Sáb"; un solo día → nombre completo ("Sábado"). */
function formatDays(days: readonly string[], lang: 'es' | 'en'): string {
  const idx = days.map((d) => WEEKDAYS.indexOf(d));
  const names = DAY_NAMES[lang];
  return idx.length === 1 ? names.long[idx[0]] : `${names.short[idx[0]]} – ${names.short[idx[idx.length - 1]]}`;
}

/** Horario por temporada listo para mostrar en tabla (footer). Sale de
 *  BUSINESS.seasons, la misma fuente que el JSON-LD. */
export function buildHoursTable(lang: 'es' | 'en') {
  return {
    seasons: BUSINESS.seasons.map((season) => ({
      label: season.label[lang],
      dates: `${formatDay(season.from, lang)} – ${formatDay(season.through, lang)}`,
      rows: season.hours.map((h) => ({
        days: formatDays(h.days, lang),
        time: `${formatTime(h.opens)} – ${formatTime(h.closes)}`,
      })),
    })),
    closed: BUSINESS.closedDates.map((d) =>
      lang === 'es' ? `Cerrado el ${formatDay(d, 'es')}` : `Closed ${formatDay(d, 'en')}`,
    ),
  };
}

export function buildLocalBusinessJsonLd(lang: 'es' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    telephone: BUSINESS.phone,
    address: addressNode(),
    openingHoursSpecification: buildOpeningHoursSpecification(),
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
      openingHoursSpecification: buildOpeningHoursSpecification(),
    },
  };
}
