import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ServiceList from './ServiceList.astro';

const items = [
  { label: 'Declaración personal', href: '/taxes/declaracion-personal', description: 'Para individuos y familias.' },
  { label: 'Enmiendas', href: '/taxes/enmiendas', description: 'Corregimos errores.' },
];
const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(ServiceList, { props });

describe('ServiceList', () => {
  it('renderiza una tarjeta por ítem con su href', async () => {
    const html = await render({ heading: 'Servicios', items });
    expect(html).toContain('href="/taxes/declaracion-personal"');
    expect(html).toContain('href="/taxes/enmiendas"');
    expect(html).toContain('Declaración personal');
    expect(html).toContain('Corregimos errores.');
  });
  it('renderiza el heading como <h2>', async () => {
    const html = await render({ heading: 'Nuestros servicios', items });
    expect(html).toMatch(/<h2[^>]*>[^<]*Nuestros servicios/);
  });
  it('usa <h3> para el label de cada tarjeta', async () => {
    const html = await render({ heading: 'X', items });
    expect(html).toMatch(/<h3/);
  });
});
