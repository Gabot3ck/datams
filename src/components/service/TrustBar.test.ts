import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import TrustBar from './TrustBar.astro';
import { TRUST_BAR_DEFAULT_ES } from '@config/site';

const render = async (props: Record<string, unknown> = {}) =>
  (await AstroContainer.create()).renderToString(TrustBar, { props });

describe('TrustBar', () => {
  it('usa los 4 ítems por defecto', async () => {
    const html = await render();
    for (const item of TRUST_BAR_DEFAULT_ES) expect(html).toContain(item);
  });
  it('acepta ítems propios', async () => {
    const html = await render({ items: ['Uno', 'Dos'] });
    expect(html).toContain('Uno');
    expect(html).toContain('Dos');
  });
  it('es una lista', async () => {
    const html = await render();
    expect(html).toMatch(/role="list"|<ul/);
  });
});
