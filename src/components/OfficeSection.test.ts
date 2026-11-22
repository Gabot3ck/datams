import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import OfficeSection from './OfficeSection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(OfficeSection, { props: { lang } });

describe('OfficeSection', () => {
  it('renderiza el <h2> con id y el heading tricolor por idioma', async () => {
    const es = await render('es');
    expect(es).toMatch(/<h2[^>]*id="office-heading"/);
    expect(es).toContain('nuestra oficina');
    expect(await render('en')).toContain('Our Office');
  });

  it('renderiza 3 imágenes de galería, todas con alt no vacío', async () => {
    const imgs = (await render('es')).match(/<img[^>]*>/g) ?? [];
    expect(imgs).toHaveLength(3);
    expect(imgs.every((img) => /\balt="[^"]+"/.test(img))).toBe(true);
  });

  it('el video tiene poster, aria-label y no precarga (b523520)', async () => {
    const video = (await render('es')).match(/<video[^>]*>/)?.[0] ?? '';
    expect(video).toContain('poster="/assets/video/datamultiservices-oficina-las-vegas-poster.webp"');
    expect(video).toMatch(/aria-label="[^"]+"/);
    expect(video).toContain('preload="none"');
    expect(video).toContain('muted');
  });

  it('bajo 990px muestra el video arriba y una fila de 3 miniaturas', async () => {
    const html = await render('es');
    expect(html).toMatch(/class="[^"]*\bgrid grid-cols-3\b[^"]*lg:grid-cols-4/);
    expect(html).toMatch(/<div class="contents"[\s>]/);
    const figure = html.match(/<figure[^>]*data-office-video[^>]*>/)?.[0] ?? '';
    expect(figure).toMatch(/\bcol-span-3\b/);
    expect(figure).toMatch(/\border-first\b/);
    expect(figure).toContain('lg:order-none');
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    // cuadradas en mobile, 4:3 en tablet
    expect(imgs.every((img) => img.includes('aspect-square sm:aspect-[4/3]'))).toBe(true);
    // las miniaturas piden 1/3 del ancho, no la pantalla completa
    expect(imgs.every((img) => img.includes('sizes="(min-width: 990px) 25vw, 33vw"'))).toBe(true);
  });

  it('desde 990px: video 16:9 en 3/4 + columna de 3 fotos, sin alto fijo', async () => {
    const html = await render('es');
    expect(html).toMatch(/class="[^"]*lg:grid-cols-4 lg:grid-rows-3[^"]*"/);
    expect(html).not.toContain('lg:h-[460px]');
    const figure = html.match(/<figure[^>]*data-office-video[^>]*>/)?.[0] ?? '';
    expect(figure).toContain('lg:row-span-3');
    // el video conserva 16:9 en todos los tamaños (antes se recortaba a ~1:1)
    const video = html.match(/<video[^>]*>/)?.[0] ?? '';
    expect(video).toContain('aspect-video');
    expect(video).not.toContain('lg:aspect-auto');
    // las 3 fotos van en la columna 4, absolutas para no estirar las filas
    expect(html.match(/<picture[^>]*lg:col-start-4[^>]*>/g)).toHaveLength(3);
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    expect(imgs.every((img) => img.includes('lg:absolute lg:inset-0'))).toBe(true);
  });

  it('el CTA abre Google Maps en pestaña nueva y segura', async () => {
    const html = await render('es');
    // R2: renderToString HTML-escapes attribute values (& -> &#38;) and injects
    // data-astro-source-* attrs, so an assertion on the literal `&` URL cannot match.
    // Check the semantic intent instead: CTA points at the Las Vegas maps directions
    // URL, opens in a new tab, and carries a safe rel.
    expect(html).toContain('href="https://www.google.com/maps/dir/?api=1');
    expect(html).toContain('destination=235%20N%20Eastern%20Ave%20Suite%20130%2C%20Las%20Vegas%2C%20NV%2089101');
    expect(html).toContain('target="_blank"');
    expect(html).toMatch(/rel="noopener noreferrer"/);
  });

  it('cambia el texto del CTA por idioma', async () => {
    expect(await render('es')).toContain('Cómo llegar');
    expect(await render('en')).toContain('Get Directions');
  });
});
