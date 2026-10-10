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
    // Credencial verificada = AFSP; "Agentes Enrolados" solo con tarjeta EA (DECISIONES-NEGOCIO.md §1.7)
    // "completaron": describe un hecho, no una relación con el IRS (§1.4)
    expect(html).toContain('Preparadores que completaron el Annual Filing Season Program del IRS');
    expect(await render('en')).toContain('Preparers who completed the IRS Annual Filing Season Program');
    expect(html).not.toContain('Agentes Enrolados');
    // Circular 230 §10.30: los EA no pueden describirse como "certificados"
    expect(html).not.toContain('certificados por el IRS');
    expect(await render('en')).not.toContain('IRS-certified');
  });

  it('renderiza el heading accent en inglés', async () => {
    expect(await render('en')).toContain('done right.');
  });
});
