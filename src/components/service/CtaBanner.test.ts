import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CtaBanner from './CtaBanner.astro';
import { BUSINESS } from '@config/site';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(CtaBanner, { props });

describe('CtaBanner', () => {
  it('renderiza heading <h2> y CTA a Google Maps por defecto, en pestaña nueva', async () => {
    const html = await render({ heading: '¿Listo para declarar?' });
    expect(html).toMatch(/<h2[^>]*>[^<]*¿Listo para declarar\?/);
    expect(html).toContain('href="https://www.google.com/maps/dir/?api=1');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('Cómo llegar');
    expect(html).toContain('Por orden de llegada');
  });
  it('un ctaHref interno no abre pestaña nueva', async () => {
    const html = await render({ heading: 'X', ctaHref: '/contacto' });
    expect(html).toContain('href="/contacto"');
    expect(html).not.toContain('target="_blank"');
  });
  it('incluye el teléfono del negocio en un <address>', async () => {
    const html = await render({ heading: 'X' });
    expect(html).toMatch(/<address/);
    expect(html).toContain(BUSINESS.phoneDisplay);
    BUSINESS.hoursDisplay.es.forEach((line) => expect(html).toContain(line));
    expect(html).toContain(`tel:${BUSINESS.phone.replace('+', '')}`);
  });
  it('renderiza body y eyebrow si se pasan', async () => {
    const html = await render({ heading: 'X', body: 'Consulta sin costo.', eyebrow: 'Sin compromiso' });
    expect(html).toContain('Consulta sin costo.');
    expect(html).toContain('Sin compromiso');
  });
});
