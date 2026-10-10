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

describe('Navbar — pestaña IRS (decisiones 2026-10-10, ver DECISIONES-NEGOCIO.md)', () => {
  it('incluye Verificación de identidad del IRS en ES y EN', () => {
    expect(src).toContain('/irs/verificacion-identidad');
    expect(src).toContain('/en/irs/identity-verification');
  });
  it('seguimiento de reembolso aparece en Taxes Personales y en la pestaña IRS (ES y EN)', () => {
    expect(src.split('href: "/taxes/seguimiento-reembolso"').length - 1).toBe(2);
    expect(src.split('href: "/en/taxes/refund-tracking"').length - 1).toBe(2);
    expect(src).not.toContain('Seguimiento de impuestos');
  });
  // Equipo con PTIN + AFSP: sin representación en cobranza ni "cualquier auditoría"
  const prohibidos = [
    'Representación profesional', 'Negociamos tu deuda',
    'Professional representation', 'We negotiate your tax debt',
  ];
  for (const p of prohibidos) {
    it(`no promete "${p}"`, () => {
      expect(src).not.toContain(p);
    });
  }
});

describe('Navbar — nombre de la pestaña IRS (decisión 2026-10-10)', () => {
  it('usa "Ayuda con el IRS" / "IRS Help"', () => {
    expect(src).toContain('label: "Ayuda con el IRS"');
    expect(src).toContain('label: "IRS Help"');
    expect(src).not.toContain('Resolución Fiscal');
    expect(src).not.toContain('Resolución del IRS');
  });
});
