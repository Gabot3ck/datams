import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import InfoBlock from './InfoBlock.astro';

const render = async (props: Record<string, unknown>, slot = '<p>cuerpo</p>') =>
  (await AstroContainer.create()).renderToString(InfoBlock, { props, slots: { default: slot } });

describe('InfoBlock', () => {
  it('renderiza heading <h2> y el slot', async () => {
    const html = await render({ heading: 'Cuánto tarda' }, '<p>Entre 7 y 11 semanas.</p>');
    expect(html).toMatch(/<h2[^>]*>[^<]*Cuánto tarda/);
    expect(html).toContain('Entre 7 y 11 semanas.');
  });
  it('renderiza el eyebrow si se pasa', async () => {
    const html = await render({ heading: 'X', eyebrow: 'Tiempos' });
    expect(html).toContain('Tiempos');
  });
  it('el section se nombra por aria-label (repetible sin colisión de id)', async () => {
    const html = await render({ heading: 'Cuánto tarda' });
    expect(html).toContain('aria-label="Cuánto tarda"');
    expect(html).not.toContain('id="info-heading"');
  });
});
