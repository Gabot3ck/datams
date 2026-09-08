import { describe, expect, it } from 'vitest';
import { classifyLink, KNOWN_PENDING } from './check-links.mjs';

describe('classifyLink', () => {
  it('ignora anclas, mailto, tel y externos', () => {
    expect(classifyLink('#top')).toBe('ignore');
    expect(classifyLink('mailto:a@b.com')).toBe('ignore');
    expect(classifyLink('tel:+1702')).toBe('ignore');
    expect(classifyLink('https://irs.gov')).toBe('ignore');
  });
  it('ignora assets de build (no son páginas)', () => {
    expect(classifyLink('/_astro/index.abc123.css')).toBe('ignore');
    expect(classifyLink('/favicon.svg')).toBe('ignore');
  });
  it('marca como "gate" los destinos dentro del alcance construido', () => {
    expect(classifyLink('/taxes/enmiendas')).toBe('gate');
    expect(classifyLink('/irs/')).toBe('gate');
    expect(classifyLink('/contacto')).toBe('gate');
    expect(classifyLink('/')).toBe('gate');
  });
  it('marca como "warn" secciones aún no construidas', () => {
    expect(classifyLink('/notary-public/affidavit')).toBe('warn');
    expect(classifyLink('/nosotros')).toBe('warn');
    expect(classifyLink('/en/taxes')).toBe('warn');
  });
});

describe('KNOWN_PENDING', () => {
  it('contiene las hijas de taxes que Plan 2 aún no construye', () => {
    for (const path of [
      '/taxes/declaracion-negocio', '/taxes/todos-los-estados',
      '/taxes/enmiendas', '/taxes/seguimiento-reembolso', '/taxes/formularios-1099',
    ]) {
      expect(KNOWN_PENDING.has(path)).toBe(true);
    }
  });
  it('classifyLink sigue devolviendo "gate" para esos paths (la degradación ocurre en main)', () => {
    expect(classifyLink('/taxes/declaracion-negocio')).toBe('gate');
    expect(classifyLink('/contacto')).toBe('gate');
  });
});
