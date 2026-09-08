import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ServiceHero from './ServiceHero.astro';

const render = async (props: Record<string, unknown>, slot = '<p>Intro</p>') =>
  (await AstroContainer.create()).renderToString(ServiceHero, { props, slots: { default: slot } });

describe('ServiceHero', () => {
  it('renderiza un <h1> con el heading y el acento', async () => {
    const html = await render({ eyebrow: 'Taxes', heading: 'Taxes en Las Vegas', headingAccent: 'Sin Sorpresas' });
    expect(html).toMatch(/<h1[^>]*>/);
    expect(html).toContain('Taxes en Las Vegas');
    expect(html).toContain('Sin Sorpresas');
    expect(html).toContain('not-italic');
  });
  it('renderiza el slot de intro', async () => {
    const html = await render({ eyebrow: 'X', heading: 'Y' }, '<p>Párrafo de intro</p>');
    expect(html).toContain('Párrafo de intro');
  });
  it('CTA por defecto apunta a /contacto', async () => {
    const html = await render({ eyebrow: 'X', heading: 'Y' });
    expect(html).toContain('href="/contacto"');
  });
  it('respeta ctaHref y ctaLabel', async () => {
    const html = await render({ eyebrow: 'X', heading: 'Y', ctaHref: 'https://wa.me/1', ctaLabel: 'WhatsApp' });
    expect(html).toContain('https://wa.me/1');
    expect(html).toContain('WhatsApp');
  });
});
