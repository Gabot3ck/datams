import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react';
import { describe, expect, it } from 'vitest';
import ServiceLayout from './ServiceLayout.astro';

// ServiceLayout → BaseLayout → Navbar → MegaMenu (React client:load).
// El Container necesita el renderer de React registrado o lanza NoMatchingRenderer.
const renderers = await loadRenderers([getContainerRenderer()]);

const base = {
  title: 'Enmiendas de Impuestos | Las Vegas',
  description: 'Corregimos tu declaración con el formulario 1040-X.',
  breadcrumbLabel: 'Enmiendas de Impuestos (Formulario 1040-X) en Las Vegas',
  service: { name: 'Enmiendas de impuestos', serviceType: 'Tax preparation' },
};

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(ServiceLayout, {
    props: { ...base, ...props },
    slots: { default: '<p>cuerpo de la página</p>' },
    request: new Request('http://example.com/taxes/enmiendas'),
  });
};

describe('ServiceLayout', () => {
  it('emite JSON-LD Service', async () => {
    const html = await render({});
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('Enmiendas de impuestos');
  });
  it('emite FAQPage cuando hay faqs', async () => {
    const html = await render({ faqs: [{ q: '¿Cuánto tarda?', a: 'Unas 16 semanas.' }] });
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('¿Cuánto tarda?');
  });
  it('NO emite FAQPage sin faqs', async () => {
    const html = await render({});
    expect(html).not.toContain('FAQPage');
  });
  it('emite ItemList cuando se pasa (pilares)', async () => {
    const html = await render({ itemList: [{ name: 'Solución de deudas', url: 'https://tudominio.com/irs/solucion-deudas' }] });
    expect(html).toContain('"@type":"ItemList"');
  });
  it('NO emite ItemList sin itemList', async () => {
    const html = await render({});
    expect(html).not.toContain('ItemList');
  });
  it('renderiza el breadcrumb con el label', async () => {
    const html = await render({});
    expect(html).toContain('Enmiendas de Impuestos (Formulario 1040-X) en Las Vegas');
  });
  it('renderiza el slot', async () => {
    const html = await render({});
    expect(html).toContain('cuerpo de la página');
  });
});
