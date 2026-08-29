import type { APIRoute } from 'astro';
import { SITE_URL } from '@config/site';

// Endpoint estático real (no test): Astro trata este .ts como ruta a propósito.
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
