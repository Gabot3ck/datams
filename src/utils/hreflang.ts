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
