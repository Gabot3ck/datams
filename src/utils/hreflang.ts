// src/utils/hreflang.ts
export const SITE_URL = 'https://tudominio.com';

export function getHreflangUrls(pathname: string) {
  const cleanPath = pathname.replace('/en', '').replace(/\/$/, '') || '/';
  
  return {
    es: `${SITE_URL}${cleanPath}`,
    en: `${SITE_URL}/en${cleanPath}`,
    xDefault: `${SITE_URL}${cleanPath}` // Español como default
  };
}