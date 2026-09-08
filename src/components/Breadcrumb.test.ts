import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Breadcrumb from './Breadcrumb.astro';

async function renderAt(pathname: string, props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Breadcrumb, {
    props,
    request: new Request(`https://tudominio.com${pathname}`),
  });
}

describe('Breadcrumb', () => {
  it('pilar Taxes con barra final', async () => {
    const html = await renderAt('/taxes/enmiendas', { lang: 'es', currentLabel: 'Enmiendas' });
    expect(html).toContain('href="/taxes/"');
  });
  it('anida /irs/* bajo Taxes', async () => {
    const html = await renderAt('/irs/solucion-deudas', { lang: 'es', currentLabel: 'Solución de deudas' });
    expect(html).toContain('href="/taxes/"');
    expect(html).toContain('href="/irs/"');
    expect(html).toContain('Solución de deudas');
  });
  it('JSON-LD BreadcrumbList con URLs absolutas', async () => {
    const html = await renderAt('/itin-ein/renovar-itin', { lang: 'es', currentLabel: 'Renovar ITIN' });
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('https://tudominio.com/itin-ein/');
  });
});
