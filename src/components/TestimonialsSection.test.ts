import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import TestimonialsSection from './TestimonialsSection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(TestimonialsSection, { props: { lang } });

describe('TestimonialsSection', () => {
  it('renderiza el <h2> con id y el heading por idioma', async () => {
    expect(await render('es')).toMatch(/<h2[^>]*id="testimonials-heading"[^>]*>\s*Lo que dice nuestra comunidad/);
    expect(await render('en')).toContain('What our community says');
  });

  it('renderiza las 6 reseñas en orden dentro de un solo contenedor', async () => {
    const html = await render('es');
    expect(html.match(/<li[\s>]/g)).toHaveLength(6);
    const order = ['Alexis L.', 'Juan G.', 'Irene C.', 'Blanca M.', 'Juan J.', 'Elizeth M.'].map((n) =>
      html.indexOf(n),
    );
    expect(order.every((pos, i) => pos > -1 && (i === 0 || pos > order[i - 1]))).toBe(true);
  });

  it('en mobile el contenedor es un carrusel accesible por teclado', async () => {
    const html = await render('es');
    const region = html.match(/<div[^>]*role="region"[^>]*>/)?.[0] ?? '';
    expect(region).toContain('tabindex="0"');
    expect(region).toContain('aria-label="Reseñas de clientes (desliza para ver más)"');
    expect(region).toContain('max-md:overflow-x-auto');
    expect(region).toContain('max-md:snap-x');
    // Las dos columnas se "aplanan" en una sola fila en mobile
    expect(html.match(/<ul[^>]*max-md:contents[^>]*>/g)).toHaveLength(2);
    expect(await render('en')).toContain('aria-label="Client reviews (swipe to see more)"');
  });

  it('las cards se cortan a 5 líneas solo en mobile y conservan el texto completo', async () => {
    const html = await render('es');
    expect(html.match(/max-md:line-clamp-5/g)).toHaveLength(6);
    expect(html).toContain('¡Lo recomiendo encarecidamente!');
  });

  it('cada card tiene un avatar lateral (>=md) y uno en el pie (mobile)', async () => {
    const html = await render('es');
    const classes = html.match(/class="[^"]*rounded-full[^"]*"/g) ?? [];
    expect(classes.filter((c) => c.includes('size-10') && c.includes('max-md:hidden'))).toHaveLength(6);
    expect(classes.filter((c) => c.includes('size-8') && /(?<!max-)md:hidden/.test(c))).toHaveLength(6);
  });

  it('renderiza un dot por reseña (solo mobile), con el primero activo', async () => {
    const html = await render('es');
    const group = html.match(/<div[^>]*data-carousel-dots[^>]*>/)?.[0] ?? '';
    expect(group).toContain('md:hidden');
    expect(group).toContain('aria-label="Elegir reseña"');
    const dots = html.match(/<button[^>]*data-dot[^>]*>/g) ?? [];
    expect(dots).toHaveLength(6);
    expect(dots.every((d) => d.includes('aria-controls="testimonials-carousel"'))).toBe(true);
    // área táctil >= 44px (size-11 = 44px, size-12 = 48px)
    expect(dots.every((d) => /\bsize-1[1-9]\b/.test(d))).toBe(true);
    expect(dots.filter((d) => d.includes('aria-current="true"'))).toHaveLength(1);
    expect(dots[0]).toContain('aria-current="true"');
    expect(dots[0]).toContain('aria-label="Ver reseña 1 de 6"');
    expect(html).toMatch(/id="testimonials-carousel"/);
    expect(await render('en')).toContain('aria-label="Show review 6 of 6"');
  });

  it('las estrellas tienen etiqueta accesible por idioma', async () => {
    expect(await render('es')).toContain('aria-label="5 de 5 estrellas"');
    expect(await render('en')).toContain('aria-label="5 out of 5 stars"');
  });

  it('el enlace a Google abre en pestaña nueva con rel seguro', async () => {
    const html = await render('es');
    expect(html).toMatch(/target="_blank"\s+rel="noopener noreferrer"/);
    expect(html).toContain('Ver más comentarios en Google');
    expect(await render('en')).toContain('See more reviews on Google');
  });
});
