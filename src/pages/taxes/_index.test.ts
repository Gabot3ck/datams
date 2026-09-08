import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react';
import { describe, expect, it } from 'vitest';
import Page from './index.astro';

// /taxes/ → ServiceLayout → BaseLayout → Navbar → MegaMenu (React client:load).
// El Container necesita el renderer de React registrado o lanza NoMatchingRenderer.
const renderers = await loadRenderers([getContainerRenderer()]);

const render = async () =>
  (await AstroContainer.create({ renderers })).renderToString(Page, {
    request: new Request('http://example.com/taxes/'),
  });

describe('/taxes/', () => {
  it('tiene un solo <h1> con el H1 de estrategia', async () => {
    const html = await render();
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).toContain('Taxes en Español en Las Vegas');
    expect(html).toContain('Sin Sorpresas en el Precio');
  });
  it('enlaza a las 6 hijas con slugs finales', async () => {
    const html = await render();
    for (const href of [
      '/taxes/declaracion-personal', '/taxes/declaracion-negocio', '/taxes/todos-los-estados',
      '/taxes/enmiendas', '/taxes/seguimiento-reembolso', '/taxes/formularios-1099',
    ]) expect(html).toContain(`href="${href}"`);
  });
  it('no contiene los links obsoletos', async () => {
    const html = await render();
    expect(html).not.toContain('/taxes/seguimiento"');
    expect(html).not.toContain('/taxes/transcripciones-irs');
    expect(html).not.toContain('href="/irs"'); // debe ser /irs/
  });
  it('emite JSON-LD Service + FAQPage + ItemList', async () => {
    const html = await render();
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"ItemList"');
  });
});
