import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CtaSection from './CtaSection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(CtaSection, { props: { lang } });

describe('CtaSection', () => {
  it('renderiza el <h2> con id y el heading por idioma', async () => {
    const es = await render('es');
    expect(es).toMatch(/<h2[^>]*id="cta-heading"/);
    expect(es).toContain('¿Listo para resolver tu situación fiscal?');
    expect(await render('en')).toContain('Ready to resolve your tax situation?');
  });

  it('el subheading cambia por idioma', async () => {
    expect(await render('es')).toContain('Agenda una consulta sin costo');
    expect(await render('en')).toContain('Schedule a free consultation');
  });

  it('el botón llama al teléfono del negocio con aria-label por idioma', async () => {
    const es = await render('es');
    expect(es).toContain('href="tel:+17026400088"');
    expect(es).toContain('(702) 640-0088');
    expect(es).toContain('aria-label="Llámanos al (702) 640-0088"');
    expect(await render('en')).toContain('aria-label="Call us at (702) 640-0088"');
  });

  it('la imagen usa el alt de imageAlt', async () => {
    // R2: renderToString HTML-escapes attribute values (& -> entity), so assert
    // the stable substrings of the alt without the ampersand.
    expect(await render('es')).toContain('atendiendo a un cliente');
    expect(await render('en')).toContain('advisor helping a client');
  });
});
