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

  it('renderiza 4 imágenes (3 galería + poster de video)', async () => {
    const html = await render('es');
    expect((html.match(/<img/g) ?? []).length).toBe(4);
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
