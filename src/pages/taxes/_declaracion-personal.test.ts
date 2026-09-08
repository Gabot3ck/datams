import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react';
import { describe, expect, it } from 'vitest';
import Page from './declaracion-personal.astro';

// /taxes/declaracion-personal → ServiceLayout → BaseLayout → Navbar → MegaMenu (React client:load).
// El Container necesita el renderer de React registrado o lanza NoMatchingRenderer.
const renderers = await loadRenderers([getContainerRenderer()]);

const render = async () =>
  (await AstroContainer.create({ renderers })).renderToString(Page, {
    request: new Request('http://example.com/taxes/declaracion-personal'),
  });

describe('/taxes/declaracion-personal', () => {
  it('un solo <h1> con el H1 de estrategia', async () => {
    const html = await render();
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).toContain('Declaración de Impuestos Personales en Las Vegas');
  });
  it('incluye checklist de documentos y pasos del proceso', async () => {
    const html = await render();
    expect(html).toContain('Formularios W-2 de cada trabajo');
    expect(html).toMatch(/<ol/); // ProcessSteps
  });
  it('interlinking a hermanas y pilar', async () => {
    const html = await render();
    expect(html).toContain('href="/taxes/todos-los-estados"');
    expect(html).toContain('href="/taxes/seguimiento-reembolso"');
    expect(html).toContain('href="/itin-ein/solicitar-itin"');
  });
  it('JSON-LD Service + FAQPage', async () => {
    const html = await render();
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"FAQPage"');
  });
  it('breadcrumb muestra Inicio > Taxes > H1', async () => {
    const html = await render();
    expect(html).toContain('href="/taxes/"');
  });
});
