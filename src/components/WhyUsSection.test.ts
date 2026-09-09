import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import WhyUsSection from './WhyUsSection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(WhyUsSection, { props: { lang } });

describe('WhyUsSection', () => {
  it('renderiza el <h2> con id y el eyebrow por idioma', async () => {
    const es = await render('es');
    expect(es).toMatch(/<h2[^>]*id="whyus-heading"/);
    expect(es).toContain('¿Por qué elegirnos?');
    expect(await render('en')).toContain('Why choose us?');
  });

  it('la imagen usa el alt correcto por idioma', async () => {
    expect(await render('es')).toContain('alt="David Takamura, Notary Public certificado"');
    expect(await render('en')).toContain('alt="David Takamura, certified notary public"');
  });

  it('renderiza una lista de 4 items', async () => {
    const html = await render('es');
    expect(html).toMatch(/<ul[^>]*role="list"/);
    expect((html.match(/<li/g) ?? []).length).toBe(4);
    expect(html).toContain('El reembolso más alto que la ley permite, 100% legal');
  });

  it('renderiza el heading accent en inglés', async () => {
    expect(await render('en')).toContain('done right.');
  });
});
