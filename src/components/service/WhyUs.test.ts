import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import WhyUs from './WhyUs.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(WhyUs, { props });

describe('WhyUs', () => {
  const items = [
    { heading: 'Precio claro antes de empezar', body: 'No "vamos viendo".' },
    { heading: 'Revisamos contigo', body: 'En español, línea por línea.' },
  ];
  it('renderiza cada razón con <h3> y cuerpo', async () => {
    const html = await render({ heading: 'Por qué elegirnos', items });
    expect(html).toContain('Precio claro antes de empezar');
    expect(html).toContain('En español, línea por línea.');
    expect(html).toMatch(/<h3/);
  });
  it('renderiza intro si se pasa', async () => {
    const html = await render({ heading: 'X', intro: 'Trabajamos distinto.', items });
    expect(html).toContain('Trabajamos distinto.');
  });
});
