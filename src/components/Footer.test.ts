import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Footer from './Footer.astro';

const render = async (path: string) =>
  (await AstroContainer.create()).renderToString(Footer, {
    request: new Request(`https://tudominio.com${path}`),
  });

describe('Footer', () => {
  it('enlaza las 8 categorías de servicio en ES (interlinking principal)', async () => {
    const html = await render('/');
    for (const href of ['/taxes', '/itin-ein', '/notary-public', '/inmigracion', '/negocio', '/dmv', '/corte', '/otros']) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it('enlaza las 8 categorías de servicio en EN', async () => {
    const html = await render('/en');
    for (const href of ['/en/taxes', '/en/itin-ein', '/en/notary-public', '/en/immigration', '/en/business', '/en/dmv', '/en/court', '/en/other']) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it('muestra el aviso "No somos abogados" (NRS 240A.150) en ambos idiomas', async () => {
    expect(await render('/')).toContain('No somos abogados en el estado de Nevada');
    expect(await render('/en')).toContain('We are not attorneys licensed to practice law in the State of Nevada');
  });

  it('muestra el horario por temporada desde BUSINESS.seasons', async () => {
    const es = await render('/');
    expect(es).toContain('Temporada de taxes');
    expect(es).toContain('9:00 AM – 10:00 PM');
    expect(es).toContain('Cerrado el 1 de enero');
    expect(await render('/en')).toContain('Rest of the year');
  });

  it('no incluye WhatsApp (decisión 2026-10-19)', async () => {
    const html = await render('/');
    expect(html).not.toContain('wa.me');
    expect(html).not.toContain('WhatsApp');
  });

  it('el perfil de la ciudad es decorativo (oculto a lectores de pantalla)', async () => {
    expect(await render('/')).toMatch(/<div[^>]*data-skyline[^>]*aria-hidden="true"/);
  });

  it('redes con nombre accesible, copyright y autor en líneas separadas', async () => {
    const html = await render('/');
    expect(html).toContain('aria-label="Instagram"');
    expect(html).toContain('aria-label="Facebook"');
    expect(html).toContain('Todos los derechos reservados');
    expect(html).toContain('Desarrollado por Gabriel Castillo');
    expect(await render('/en')).toContain('Built by Gabriel Castillo');
  });
});
