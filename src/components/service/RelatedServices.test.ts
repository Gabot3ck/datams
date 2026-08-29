import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import RelatedServices from './RelatedServices.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(RelatedServices, { props });

describe('RelatedServices', () => {
  it('lista los enlaces relacionados', async () => {
    const html = await render({
      heading: 'Servicios relacionados',
      items: [{ label: 'ITIN', href: '/itin-ein/solicitar-itin' }],
    });
    expect(html).toContain('Servicios relacionados');
    expect(html).toContain('href="/itin-ein/solicitar-itin"');
    expect(html).toContain('ITIN');
  });
  it('es navegable (nav o lista)', async () => {
    const html = await render({ heading: 'X', items: [{ label: 'a', href: '/a' }] });
    expect(html).toMatch(/<nav|role="list"|<ul/);
  });
});
