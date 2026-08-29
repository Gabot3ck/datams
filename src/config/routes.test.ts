import { describe, expect, it } from 'vitest';
import { getAlternates, ROUTES } from './routes';

describe('getAlternates', () => {
  it('para una ruta ES con contraparte EN sin construir: en = null', () => {
    const alt = getAlternates('/taxes/declaracion-personal');
    expect(alt.es).toBe('https://tudominio.com/taxes/declaracion-personal');
    expect(alt.en).toBeNull();
    expect(alt.xDefault).toBe(alt.es);
  });

  it('NO destroza rutas que contienen la subcadena "en" (bug histórico de hreflang)', () => {
    const alt = getAlternates('/taxes/enmiendas');
    expect(alt.es).toBe('https://tudominio.com/taxes/enmiendas');
  });

  it('desde la versión EN de la home resuelve la home ES', () => {
    const alt = getAlternates('/en');
    expect(alt.es).toBe('https://tudominio.com/');
  });

  it('home ES: en construido', () => {
    const alt = getAlternates('/');
    expect(alt.en).toBe('https://tudominio.com/en');
  });

  it('ruta no registrada: fallback es = url, en = null', () => {
    const alt = getAlternates('/pagina-inexistente');
    expect(alt.es).toBe('https://tudominio.com/pagina-inexistente');
    expect(alt.en).toBeNull();
  });
});

describe('ROUTES', () => {
  it('incluye los 3 pilares y sus 14 hijas + home + contacto (18)', () => {
    expect(ROUTES.length).toBeGreaterThanOrEqual(18);
  });
  it('solo la home tiene enBuilt=true en esta ronda', () => {
    expect(ROUTES.filter((r) => r.enBuilt).map((r) => r.es)).toEqual(['/']);
  });
});
