import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import FaqSection from './FaqSection.astro';
import imgFaq from '../assets/images/faq/datamultiservices-preguntas-frecuentes-las-vegas.webp';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(FaqSection, { props });

const image = { src: imgFaq, alt: 'Asesora lista para responder' };
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
  it('la imagen se optimiza con <Picture> (WebP, varios anchos) y lleva alt', async () => {
    const html = await render({ lang: 'es', faqs, image });
    expect(html).toContain('<picture');
    expect(html).toMatch(/<source[^>]*type="image\/webp"/);
    expect(html).toMatch(/srcset="[^"]*400w[^"]*1080w/);
    expect(html).toContain('alt="Asesora lista para responder"');
    expect(html).toContain('loading="lazy"');
  });
  it('foto 200px en mobile y 34% al lado del acordeón desde 640px (patrón WhyUs)', async () => {
    const html = await render({ lang: 'es', faqs, image });
    expect(html).toMatch(/class="w-\[200px\] mx-auto sm:mx-0 sm:w-\[34%\] sm:shrink-0"/);
    expect(html).toMatch(/class="flex flex-col sm:flex-row items-center sm:items-start[^"]*"/);
    expect(html).toContain('sizes="(min-width: 640px) 34vw, 200px"');
    expect(html).toMatch(/<img[^>]*aspect-\[4\/5\][^>]*>/);
  });
});
