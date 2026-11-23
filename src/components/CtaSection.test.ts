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
    expect(await render('es')).toContain('Llámanos o ven a nuestra oficina');
    expect(await render('en')).toContain('Call us or stop by our Las Vegas office');
  });

  it('el botón llama al teléfono del negocio con aria-label por idioma', async () => {
    const es = await render('es');
    expect(es).toContain('href="tel:+17026400088"');
    expect(es).toContain('(702) 640-0088');
    expect(es).toContain('aria-label="Llámanos al (702) 640-0088"');
    expect(await render('en')).toContain('aria-label="Call us at (702) 640-0088"');
  });

  it('desde 640px la imagen va al lado del texto (40% tablet, 50% desktop)', async () => {
    const html = await render('es');
    expect(html).toMatch(/class="grid [^"]*sm:grid-cols-\[2fr_3fr\] lg:grid-cols-2"/);
    // 4:3 solo en mobile; desde 640px toma el alto del texto
    expect(html).toMatch(/class="relative aspect-\[4\/3\] sm:aspect-auto"/);
    expect(html).toContain('sizes="(min-width: 990px) 50vw, (min-width: 640px) 40vw, 100vw"');
  });

  it('la imagen usa el alt de imageAlt', async () => {
    // R2: renderToString HTML-escapes attribute values (& -> entity), so assert
    // the stable substrings of the alt without the ampersand.
    expect(await render('es')).toContain('en su escritorio, en la oficina de Las Vegas');
    expect(await render('en')).toContain('advisor at his desk in the Las Vegas office');
    // El alt no debe volver a mencionar un cliente que no está en la foto (2b43d29)
    expect(await render('es')).not.toContain('atendiendo a un cliente');
  });
});
