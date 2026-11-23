import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import AboutHero from './AboutHero.astro';
import AboutStats from './AboutStats.astro';
import TeamGrid from './TeamGrid.astro';
import ValuesSection from './ValuesSection.astro';

type Lang = 'es' | 'en';
const render = async (C: any, lang: Lang) =>
  (await AstroContainer.create()).renderToString(C, { props: { lang } });
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('AboutHero', () => {
  it('es el único H1 de la página, por idioma', async () => {
    const es = await render(AboutHero, 'es');
    expect(count(es, /<h1[\s>]/g)).toBe(1);
    expect(es).toMatch(/<h1[^>]*id="about-heading"[^>]*>\s*Las personas que te atienden en Las Vegas\s*<\/h1>/);
    expect(await render(AboutHero, 'en')).toContain('The people who serve you in Las Vegas');
  });

  it('foto grupal: carga prioritaria y nunca más ancha que 1024px', async () => {
    const html = await render(AboutHero, 'es');
    expect(html).toContain('fetchpriority="high"');
    expect(html).toContain('loading="eager"');
    const widths = [...html.matchAll(/\s(\d+)w/g)].map((m) => Number(m[1]));
    expect(widths.length).toBeGreaterThan(0);
    expect(Math.max(...widths)).toBeLessThanOrEqual(1024);
  });

  it('alt descriptivo de la foto grupal por idioma', async () => {
    const alt = (html: string) =>
      (html.match(/<img[^>]*alt="([^"]*)"/)?.[1] ?? '').replace(/&#38;|&amp;/g, '&').replace(/&#39;/g, "'");
    expect(alt(await render(AboutHero, 'es'))).toBe("Equipo de Data's & Multiservices en su oficina de Las Vegas, frente al logo de la empresa");
    expect(alt(await render(AboutHero, 'en'))).toBe("The Data's & Multiservices team at their Las Vegas office, in front of the company logo");
  });
});

describe('AboutStats', () => {
  it('muestra años y familias con etiqueta por idioma', async () => {
    const es = await render(AboutStats, 'es');
    expect(es).toContain('10+');
    expect(es).toContain('5,000+');
    expect(es).toContain('Años de servicio');
    expect(await render(AboutStats, 'en')).toContain('Years of service');
  });

  it('no fuerza anchos que desborden a 320px', async () => {
    const html = await render(AboutStats, 'es');
    expect(html).toContain('min-w-0');
    expect(html).not.toMatch(/\bw-\[\d{3,}px\]|\bmin-w-\[/);
  });
});

describe('TeamGrid', () => {
  it('un h2 de sección y un h3 por asesor (5)', async () => {
    const es = await render(TeamGrid, 'es');
    expect(es).toMatch(/<h2[^>]*id="team-heading"/);
    expect(count(es, /<h3[\s>]/g)).toBe(5);
    for (let i = 1; i <= 5; i++) expect(es).toContain(`Asesor ${i}`);
    expect(await render(TeamGrid, 'en')).toContain('Advisor 5');
  });

  it('la lista se centra y envuelve (cuadra con 5 o 6 tarjetas)', async () => {
    const html = await render(TeamGrid, 'es');
    expect(html).toMatch(/<ul[^>]*class="[^"]*flex-wrap[^"]*justify-center|<ul[^>]*class="[^"]*justify-center[^"]*flex-wrap/);
  });

  it('retratos con alt no vacío y carga diferida', async () => {
    const html = await render(TeamGrid, 'es');
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    expect(imgs.length).toBe(5);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]+"/);
      expect(img).toContain('loading="lazy"');
    }
  });
});

describe('ValuesSection', () => {
  it('4 valores con h3, texto por idioma', async () => {
    const es = await render(ValuesSection, 'es');
    expect(es).toMatch(/<h2[^>]*id="values-heading"/);
    expect(count(es, /<h3[\s>]/g)).toBe(4);
    expect(es).toContain('Transparencia');
    expect(es).toContain('te entregamos');
    expect(await render(ValuesSection, 'en')).toContain('Transparency');
  });

  it('íconos decorativos ocultos al lector de pantalla', async () => {
    const svgs = (await render(ValuesSection, 'es')).match(/<svg[^>]*>/g) ?? [];
    expect(svgs.length).toBe(4);
    for (const s of svgs) expect(s).toContain('aria-hidden="true"');
  });
});

describe('cumplimiento legal (Nevada / IRS)', () => {
  it('ninguna sección usa términos prohibidos', async () => {
    for (const C of [AboutHero, AboutStats, TeamGrid, ValuesSection]) {
      for (const lang of ['es', 'en'] as const) {
        const text = (await render(C, lang)).replace(/<[^>]+>/g, ' ');
        expect(text).not.toMatch(/certific|realtor|notari[oa]|licenciad/i);
      }
    }
  });
});

describe('TeamGrid con 6 personas', () => {
  it('desde xl reparte en 3+3 en vez de 5+1', async () => {
    const { TEAM } = await import('../../config/team');
    const six = [...TEAM, { ...TEAM[0], id: 'asesor-6', name: { es: 'Asesor 6', en: 'Advisor 6' } }];
    const html = await (await AstroContainer.create()).renderToString(TeamGrid, { props: { lang: 'es', members: six } });
    expect((html.match(/<h3[\s>]/g) ?? []).length).toBe(6);
    expect(html).not.toContain('xl:basis-[calc((100%-4*');
    expect(html).toContain('xl:basis-[calc((100%-2*');
  });
});
