import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CommunitySection from './CommunitySection.astro';

const render = async (lang: 'es' | 'en') =>
  (await AstroContainer.create()).renderToString(CommunitySection, { props: { lang } });

describe('CommunitySection', () => {
  it('renderiza el <h2> con id y el acento bicolor (es)', async () => {
    const html = await render('es');
    expect(html).toMatch(/<h2[^>]*id="community-heading"/);
    expect(html).toContain('comunidad hispana');
    expect(html).toMatch(/<em class="not-italic[^"]*"[^>]*>\s*comunidad hispana\s*<\/em>/);
  });

  it('renderiza exactamente 4 celdas de stats en un <dl>', async () => {
    const html = await render('es');
    expect(html).toContain('<dl');
    expect((html.match(/<dt/g) ?? []).length).toBe(4);
    expect(html).toContain('Años de experiencia');
  });

  it('CTA apunta a /contacto en es y /en/contact en en', async () => {
    expect(await render('es')).toContain('href="/contacto"');
    expect(await render('en')).toContain('href="/en/contact"');
  });

  it('renderiza los 3 trust indicators y cambia el copy por idioma', async () => {
    const es = await render('es');
    const en = await render('en');
    expect(es).toContain('Servicio bilingüe');
    expect(en).toContain('Fully bilingual service');
    expect(es).toContain('Nuestra comunidad');
    expect(en).toContain('Our community');
  });
});
