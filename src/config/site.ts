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
