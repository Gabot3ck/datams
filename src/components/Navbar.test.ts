import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = readFileSync(new URL('./Navbar.astro', import.meta.url), 'utf8');

describe('Navbar — hrefs alineados al CONTENT-STRATEGY', () => {
  const obsoletos = [
    '/taxes/seguimiento"', '/taxes/transcripciones-irs', '/taxes/asesoria-negocio"',
    '/irs/cartas-irs', '/irs/deudas-irs', '/irs/pagos-irs',
    '/itin-ein/solicitud-itin', '/itin-ein/renovacion-itin', '/itin-ein/solicitud-ein',
  ];
  for (const o of obsoletos) {
    it(`ya no contiene ${o}`, () => {
      expect(src).not.toContain(o);
    });
  }
  const finales = [
    '/taxes/seguimiento-reembolso', '/taxes/formularios-1099',
    '/irs/solucion-deudas', '/irs/resolucion-cartas', '/irs/acuerdos-pago', '/irs/transcripciones',
    '/itin-ein/solicitar-itin', '/itin-ein/renovar-itin', '/itin-ein/solicitar-ein',
  ];
  for (const f of finales) {
    it(`contiene ${f}`, () => {
      expect(src).toContain(f);
    });
  }
  it('pillarUrls con barra final', () => {
    expect(src).toMatch(/label:\s*"Taxes",\s*\n\s*href:\s*"\/taxes\/"/);
  });
});

describe('Navbar — slugs EN alineados a routes.ts', () => {
  it('ya no contiene /en/taxes/amendments', () => {
    expect(src).not.toContain('/en/taxes/amendments');
  });
  it('ya no contiene /en/irs/irs-payments', () => {
    expect(src).not.toContain('/en/irs/irs-payments');
  });
  it('ya no contiene /en/taxes/irs-transcripts (movido a la pestaña IRS)', () => {
    expect(src).not.toContain('/en/taxes/irs-transcripts');
  });
  it('contiene /en/taxes/amended-returns', () => {
    expect(src).toContain('/en/taxes/amended-returns');
  });
  it('contiene /en/irs/irs-transcripts', () => {
    expect(src).toContain('/en/irs/irs-transcripts');
  });
  it('mueve la asesoría de negocio bajo /en/business/', () => {
    expect(src).toContain('/en/business/business-tax-advice');
    expect(src).not.toContain('/en/taxes/business-tax-advice');
  });
});
