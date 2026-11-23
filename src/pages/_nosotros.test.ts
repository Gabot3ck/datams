import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react';
import { describe, expect, it } from 'vitest';
import Nosotros from './nosotros.astro';
import About from './en/about.astro';

// BaseLayout → Navbar → MegaMenu (React client:load): requiere el renderer de React.
const renderers = await loadRenderers([getContainerRenderer()]);
const render = async (Page: any, path: string) =>
  (await AstroContainer.create({ renderers })).renderToString(Page, {
    request: new Request(`http://example.com${path}`),
  });
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('/nosotros', () => {
  it('un solo <h1> y el CTA del Home al final', async () => {
    const html = await render(Nosotros, '/nosotros');
    expect(count(html, /<h1[\s>]/g)).toBe(1);
    expect(html).toContain('¿Listo para resolver tu situación fiscal?');
  });

  it('JSON-LD AboutPage sobre el LocalBusiness, sin Person (nombres provisorios)', async () => {
    const html = await render(Nosotros, '/nosotros');
    expect(html).toContain('"@type":"AboutPage"');
    expect(html).toContain('"@type":"LocalBusiness"');
    expect(html).not.toContain('"@type":"Person"');
  });

  it('hreflang EN apunta a /en/about', async () => {
    const html = await render(Nosotros, '/nosotros');
    expect(html).toMatch(/<link[^>]*hreflang="en"[^>]*href="[^"]*\/en\/about\/?"/);
  });

  it('title y description propios', async () => {
    const html = await render(Nosotros, '/nosotros');
    const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').replace(/&#38;|&amp;/g, '&').replace(/&#39;/g, "'");
    expect(title).toBe("Nuestro equipo de taxes en Las Vegas | Data's & Multiservices");
    expect(html).toContain('Conoce al equipo hispano de Data');
  });
});

describe('/en/about', () => {
  it('en inglés, un solo <h1> y los asesores', async () => {
    const html = await render(About, '/en/about');
    expect(html).toMatch(/<html[^>]*lang="en(-US)?"/);
    expect(count(html, /<h1[\s>]/g)).toBe(1);
    expect(html).toContain('Advisor 1');
  });

  it('hreflang ES apunta a /nosotros', async () => {
    const html = await render(About, '/en/about');
    expect(html).toMatch(/<link[^>]*hreflang="es"[^>]*href="[^"]*\/nosotros"/);
  });
});

// El switch de idioma del Navbar debe llevar a la gemela registrada en routes.ts,
// no a "/en" + ruta ES (que daría /en/nosotros/, inexistente).
const langSwitchHref = (html: string) =>
  html.match(/id="lang-menu"[\s\S]*?<a[^>]*href="([^"]*)"/)?.[1];

describe('switch de idioma del Navbar', () => {
  it('desde /nosotros lleva a /en/about', async () => {
    expect(langSwitchHref(await render(Nosotros, '/nosotros'))).toMatch(/^\/en\/about\/?$/);
  });
  it('desde /en/about lleva a /nosotros', async () => {
    expect(langSwitchHref(await render(About, '/en/about'))).toBe('/nosotros');
  });
});

describe('estructura de AboutPage', () => {
  it('incluye el observer que revela [data-reveal] (si no, el CTA queda invisible)', async () => {
    const html = await render(Nosotros, '/nosotros');
    expect(html).toContain('data-reveal');
    expect(html).toMatch(/IntersectionObserver[\s\S]*is-visible|<script[^>]*src="[^"]*AboutPage[^"]*"/);
  });
  it('el breadcrumb va dentro de .container-custom', async () => {
    const html = await render(Nosotros, '/nosotros');
    // Breadcrumb emite su JSON-LD antes del <nav>: se admite contenido entre medio, sin salir del div.
    expect(html).toMatch(/<div class="container-custom[^"]*"[^>]*>(?:(?!<\/div>)[\s\S])*<nav/);
  });
});
