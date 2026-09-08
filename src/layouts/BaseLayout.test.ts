import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer } from '@astrojs/react';
import { describe, expect, it } from 'vitest';
import BaseLayout from './BaseLayout.astro';

const renderers = await loadRenderers([getContainerRenderer()]);

async function render(props: Record<string, unknown>, path = '/taxes/') {
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(BaseLayout, {
    props: { title: 'T', description: 'D', ...props },
    slots: { default: '<p>contenido</p>' },
    request: new Request(`http://example.com${path}`),
  });
}

describe('BaseLayout', () => {
  it('usa SITE_NAME en og:site_name', async () => {
    const html = await render({});
    // El "&" del nombre se serializa como entidad HTML (&#38; / &amp;) dentro del atributo.
    expect(html).toMatch(
      /property="og:site_name" content="Data's (?:&#38;|&amp;|&) Multiservices"/,
    );
    expect(html).not.toContain('NOMBRE_SITIO');
  });

  it('emite canonical normalizado para un pilar', async () => {
    const html = await render({ canonical: 'https://tudominio.com/taxes/' });
    expect(html).toContain('<link rel="canonical" href="https://tudominio.com/taxes/"');
  });

  it('emite hreflang es y x-default siempre', async () => {
    const html = await render({});
    expect(html).toMatch(/hreflang="es"/);
    expect(html).toMatch(/hreflang="x-default"/);
  });
});
