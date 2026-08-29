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
