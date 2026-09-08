import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import FaqSection from './FaqSection.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(FaqSection, { props });

const items = [
  { q: '¿Necesito cita?', a: 'Puedes agendar por WhatsApp o llegar en horario.' },
  { q: '¿Puedo declarar con ITIN?', a: 'Sí, trabajamos con ITIN regularmente.' },
];

describe('FaqSection', () => {
  it('renderiza un <details> por pregunta con su respuesta', async () => {
    const html = await render({ items });
    expect((html.match(/<details/g) ?? []).length).toBe(2);
    expect(html).toContain('¿Necesito cita?');
    expect(html).toContain('trabajamos con ITIN regularmente');
  });
  it('usa <dl>/<dt>/<dd> para semántica', async () => {
    const html = await render({ items });
    expect(html).toMatch(/<dl/);
    expect(html).toMatch(/<dt/);
    expect(html).toMatch(/<dd/);
  });
  it('heading por defecto', async () => {
    const html = await render({ items });
    expect(html).toContain('Preguntas frecuentes');
  });
  it('NO emite JSON-LD (lo hace el layout)', async () => {
    const html = await render({ items });
    expect(html).not.toContain('application/ld+json');
  });
});
