import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ProcessSteps from './ProcessSteps.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(ProcessSteps, { props });

describe('ProcessSteps', () => {
  const steps = [
    { title: 'Agenda tu cita', body: 'Por WhatsApp o teléfono.' },
    { title: 'Trae tus documentos', body: 'Lista abajo.' },
  ];
  it('usa una lista ordenada', async () => {
    const html = await render({ heading: 'Cómo funciona', steps });
    expect(html).toMatch(/<ol/);
  });
  it('renderiza título y cuerpo de cada paso', async () => {
    const html = await render({ heading: 'Cómo funciona', steps });
    expect(html).toContain('Agenda tu cita');
    expect(html).toContain('Por WhatsApp o teléfono.');
    expect(html).toContain('Trae tus documentos');
  });
  it('renderiza el heading como <h2>', async () => {
    const html = await render({ heading: 'Cómo funciona el proceso', steps });
    expect(html).toMatch(/<h2[^>]*>[^<]*Cómo funciona el proceso/);
  });
});
