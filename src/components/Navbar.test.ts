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

describe('Navbar — acceso directo al pilar /irs/ (decisión 2026-10-10)', () => {
  it('la subcategoría IRS define allLink ES y EN', () => {
    expect(src).toContain('allLink: { label: "Ver toda la ayuda con el IRS", href: "/irs/" }');
    expect(src).toContain('allLink: { label: "See all IRS help", href: "/en/irs/" }');
  });
  it('el menú mobile renderiza sub.allLink dentro del acordeón', () => {
    expect(src).toContain('sub.allLink &&');
  });
});

describe('Navbar — Notary Public: "Documentos Legales" + pestaña "Títulos de Traila" (decisión 2026-10-11)', () => {
  it('fusiona las dos pestañas de documentos en ES y EN', () => {
    expect(src).toContain('label: "Documentos Legales"');
    expect(src).toContain('label: "Legal Documents"');
    for (const viejo of ['Declaraciones y Documentos', 'Propiedad y Documentos Legales', 'Statements & Documents', 'Property & Legal Documents']) {
      expect(src).not.toContain(viejo);
    }
  });
  it('"Títulos de Traila" / "Mobile Home Titles" es una pestaña propia (no un grupo)', () => {
    expect(src).toMatch(/label: "Títulos de Traila",\s*items: \[/);
    expect(src).toMatch(/label: "Mobile Home Titles",\s*items: \[/);
    expect(src).not.toContain('groups:');
    expect(src).not.toContain('sub.groups');
  });
  it('los dos ítems de la pestaña de trailas, ES y EN', () => {
    expect(src).toContain('{ label: "Trámite de título de Mobile Home", href: "/notary-public/titulos-casas-moviles"');
    expect(src).toContain('href: "/notary-public/mobile-home-living-trust"');
    expect(src).toContain('href: "/en/notary-public/mobile-home-titles"');
    expect(src).toContain('href: "/en/notary-public/mobile-home-living-trust"');
    expect(src).not.toContain('Títulos de casas móviles');
  });
  it('living trust: solo trust ya existente, nunca "Living trust" a secas', () => {
    expect(src).not.toMatch(/label: "Living trust"/i);
    expect(src).toContain('trust ya existente');
  });
});

describe('Navbar — duplicado de título: DMV solo vehículos (decisión 2026-10-12)', () => {
  it('el ítem de DMV dice "de vehículo" en ES y EN', () => {
    expect(src).toContain('{ label: "Duplicado de título de vehículo", href: "/dmv/duplicado-titulo" }');
    expect(src).toContain('{ label: "Vehicle title duplicate", href: "/en/dmv/title-duplicate" }');
  });
  it('en español no usa "notarizar" (fórmula única: "ante notary public")', () => {
    // Solo formas en español; "Notarized"/"notarization" en inglés son correctas.
    expect(src).not.toMatch(/\bnotariz(ar|amos|an|a|o|ado|ada)\b/i);
  });
});

describe('Navbar — Apostillas: carta poder, permiso de viaje para menores y otros documentos (decisión 2026-10-12)', () => {
  it('ítems nuevos en ES y EN', () => {
    expect(src).toContain('{ label: "Apostilla de carta poder", href: "/notary-public/apostilla-carta-poder", description: "Válida en países del Convenio de La Haya" }');
    expect(src).toContain('{ label: "Apostilla de permiso de viaje para menores", href: "/notary-public/apostilla-permiso-viaje-menores", description: "Válida en países del Convenio de La Haya" }');
    expect(src).toContain('href: "/en/notary-public/apostille-letter-of-attorney"');
    expect(src).toContain('href: "/en/notary-public/apostille-minor-travel-permit"');
  });
  it('"cartas y documentos" pasa a "otros documentos" y conserva su URL', () => {
    expect(src).toContain('{ label: "Apostilla de otros documentos", href: "/notary-public/apostillas-documentos"');
    expect(src).toContain('{ label: "Apostille — other documents", href: "/en/notary-public/apostille-documents"');
    expect(src).not.toContain('Apostillas de cartas y documentos');
    expect(src).not.toContain('letters & documents');
  });
  it('nunca promete validez "en cualquier parte del mundo"', () => {
    expect(src).not.toMatch(/cualquier parte del mundo|anywhere in the world/i);
  });
});

describe('Navbar — Inmigración: Tarjeta de Social Security y Affidavit of Support (decisión 2026-10-12)', () => {
  it('Tarjeta de Social Security en ES y EN, sin "Citas" en el nombre', () => {
    expect(src).toContain('{ label: "Tarjeta de Social Security", href: "/inmigracion/tarjeta-social-security", description: "Primera vez o duplicado" }');
    expect(src).toContain('href: "/en/immigration/social-security-card"');
    expect(src).not.toMatch(/Citas para el Social Security/i);
  });
  it('Affidavit of Support (I-864) en Inmigración, ES y EN', () => {
    expect(src).toContain('{ label: "Affidavit of Support (I-864)", href: "/inmigracion/affidavit-of-support"');
    expect(src).toContain('href: "/en/immigration/affidavit-of-support"');
    expect(src).not.toContain('/notary-public/affidavit-of-support');
  });
  it('ambos van en "Documentos y Apoyo Migratorio", antes de "Otros formularios migratorios"', () => {
    const tab = src.slice(src.indexOf('label: "Documentos y Apoyo Migratorio"'), src.indexOf('Otros formularios migratorios'));
    expect(tab).toContain('Tarjeta de Social Security');
    expect(tab).toContain('Affidavit of Support (I-864)');
  });
});
