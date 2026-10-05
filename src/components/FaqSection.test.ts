import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import FaqSection from './FaqSection.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(FaqSection, { props });

const image = { src: '/img.jpg', alt: 'alt' };
const faqs = [
  { q: '¿Cuánto cuesta?', a: 'Depende del trámite.' },
  {
    q: '¿Atienden todo el año?',
    a: 'Sí, todo el año:',
    list: [
      { label: 'Temporada:', text: 'lunes a sábado.' },
      { label: 'Resto del año:', text: 'lunes a viernes.' },
    ],
  },
];

describe('FaqSection (Home)', () => {
  it('renderiza una pregunta por item', async () => {
    const html = await render({ lang: 'es', faqs, image });
    expect((html.match(/class="faq-item/g) ?? []).length).toBe(2);
    expect(html).toContain('Depende del trámite.');
  });
  it('renderiza la lista opcional con label en negrita', async () => {
    const html = await render({ lang: 'es', faqs, image });
    expect((html.match(/<ul/g) ?? []).length).toBe(1);
    expect((html.match(/<li/g) ?? []).length).toBe(2);
    expect(html).toMatch(/<strong[^>]*>Temporada:<\/strong>/);
  });
  it('incluye la lista en el texto del JSON-LD FAQPage', async () => {
    const html = await render({ lang: 'es', faqs, image });
    expect(html).toContain('"@type":"FAQPage"');
    // JSON.stringify serializa el salto de línea como el escape literal "\n"
    expect(html).toContain(String.raw`Sí, todo el año:\nTemporada: lunes a sábado.\nResto del año: lunes a viernes.`);
  });
  it('no emite JSON-LD con emitSchema=false', async () => {
    const html = await render({ lang: 'es', faqs, image, emitSchema: false });
    expect(html).not.toContain('FAQPage');
  });
});
