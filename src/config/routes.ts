import { SITE_URL } from './site';

export interface RoutePair {
  es: string;
  en: string;
  enBuilt: boolean;
}

export const ROUTES: RoutePair[] = [
  { es: '/',                            en: '/en',                            enBuilt: true  },
  { es: '/contacto',                    en: '/en/contact',                    enBuilt: false },
  // ── Taxes ──────────────────────────────────────────────────────────
  { es: '/taxes/',                      en: '/en/taxes/',                     enBuilt: false },
  { es: '/taxes/declaracion-personal',  en: '/en/taxes/personal-tax-return',  enBuilt: false },
  { es: '/taxes/declaracion-negocio',   en: '/en/taxes/business-tax-return',  enBuilt: false },
  { es: '/taxes/todos-los-estados',     en: '/en/taxes/all-states',           enBuilt: false },
  { es: '/taxes/enmiendas',             en: '/en/taxes/amended-returns',      enBuilt: false },
  { es: '/taxes/seguimiento-reembolso', en: '/en/taxes/refund-tracking',      enBuilt: false },
  { es: '/taxes/formularios-1099',      en: '/en/taxes/1099-forms',           enBuilt: false },
  // ── IRS ────────────────────────────────────────────────────────────
  { es: '/irs/',                        en: '/en/irs/',                       enBuilt: false },
  { es: '/irs/solucion-deudas',         en: '/en/irs/tax-debt-resolution',    enBuilt: false },
  { es: '/irs/auditorias',              en: '/en/irs/audits',                 enBuilt: false },
  { es: '/irs/resolucion-cartas',       en: '/en/irs/irs-letters',            enBuilt: false },
  { es: '/irs/acuerdos-pago',           en: '/en/irs/payment-plans',          enBuilt: false },
  { es: '/irs/transcripciones',         en: '/en/irs/irs-transcripts',        enBuilt: false },
  // ── ITIN / EIN ─────────────────────────────────────────────────────
  { es: '/itin-ein/',                   en: '/en/itin-ein/',                  enBuilt: false },
  { es: '/itin-ein/solicitar-itin',    en: '/en/itin-ein/itin-application',  enBuilt: false },
  { es: '/itin-ein/renovar-itin',      en: '/en/itin-ein/itin-renewal',      enBuilt: false },
  { es: '/itin-ein/solicitar-ein',     en: '/en/itin-ein/ein-application',   enBuilt: false },
];

/** Quita barras finales para comparar rutas, conservando '/' para la home. */
function stripTrailing(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

/**
 * Resuelve las URLs alternas (hreflang) para un pathname dado.
 *
 * - Acepta tanto el pathname ES como el EN (`/en`, `/en/...`).
 * - `es` / `xDefault`: siempre la URL absoluta ES (registrada o fallback normalizado).
 * - `en`: URL absoluta EN solo si la ruta está registrada y `enBuilt === true`; si no, `null`.
 * - No usa `.replace` sobre la subcadena "en" — detecta el prefijo `/en` de forma exacta
 *   para no destrozar rutas como `/taxes/enmiendas`.
 */
export function getAlternates(pathname: string): {
  es: string;
  en: string | null;
  xDefault: string;
} {
  const isEn = pathname === '/en' || pathname.startsWith('/en/');
  const esPathname = isEn ? (pathname === '/en' ? '/' : pathname.slice(3)) : pathname;
  const key = stripTrailing(esPathname);

  const entry = ROUTES.find((r) => stripTrailing(r.es) === key);
  const es = SITE_URL + (entry ? entry.es : key);
  const en = entry && entry.enBuilt ? SITE_URL + entry.en : null;

  return { es, en, xDefault: es };
}
