import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CtaBanner from './CtaBanner.astro';
import { BUSINESS } from '@config/site';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(CtaBanner, { props });

describe('CtaBanner', () => {
  it('renderiza heading <h2> y CTA a /contacto por defecto', async () => {
    const html = await render({ heading: '¿Listo para declarar?' });
    expect(html).toMatch(/<h2[^>]*>[^<]*¿Listo para declarar\?/);
    expect(html).toContain('href="/contacto"');
  });
  it('incluye el teléfono del negocio en un <address>', async () => {
    const html = await render({ heading: 'X' });
    expect(html).toMatch(/<address/);
    expect(html).toContain(BUSINESS.phoneDisplay);
    expect(html).toContain(`tel:${BUSINESS.phone.replace('+', '')}`);
  });
  it('renderiza body y eyebrow si se pasan', async () => {
    const html = await render({ heading: 'X', body: 'Consulta sin costo.', eyebrow: 'Sin compromiso' });
    expect(html).toContain('Consulta sin costo.');
    expect(html).toContain('Sin compromiso');
  });
});
