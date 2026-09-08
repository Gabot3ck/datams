import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react';
import { describe, expect, it } from 'vitest';
import Page from './contacto.astro';
import { BUSINESS } from '@config/site';

// /contacto → BaseLayout → Navbar → MegaMenu (React client:load).
// El Container necesita el renderer de React registrado o lanza NoMatchingRenderer.
const renderers = await loadRenderers([getContainerRenderer()]);

const render = async () =>
  (await AstroContainer.create({ renderers })).renderToString(Page, {
    request: new Request('http://example.com/contacto'),
  });

describe('/contacto', () => {
  it('tiene un <h1> "Contacto"', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[^>]*>\s*Contacto\s*<\/h1>/);
  });
  it('muestra teléfono, WhatsApp y dirección', async () => {
    const html = await render();
    expect(html).toContain(BUSINESS.phoneDisplay);
    expect(html).toContain(BUSINESS.whatsapp);
    expect(html).toContain(BUSINESS.address.street);
  });
  it('emite JSON-LD LocalBusiness', async () => {
    const html = await render();
    expect(html).toContain('"@type":"LocalBusiness"');
  });
});
