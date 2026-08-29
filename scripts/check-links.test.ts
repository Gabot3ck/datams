import { describe, expect, it } from 'vitest';
import { classifyLink } from './check-links.mjs';

describe('classifyLink', () => {
  it('ignora anclas, mailto, tel y externos', () => {
    expect(classifyLink('#top')).toBe('ignore');
    expect(classifyLink('mailto:a@b.com')).toBe('ignore');
    expect(classifyLink('tel:+1702')).toBe('ignore');
    expect(classifyLink('https://irs.gov')).toBe('ignore');
  });
  it('marca como "gate" los destinos dentro del alcance construido', () => {
    expect(classifyLink('/taxes/enmiendas')).toBe('gate');
    expect(classifyLink('/irs/')).toBe('gate');
    expect(classifyLink('/contacto')).toBe('gate');
    expect(classifyLink('/')).toBe('gate');
  });
  it('marca como "warn" secciones aún no construidas', () => {
    expect(classifyLink('/notaria/affidavit')).toBe('warn');
    expect(classifyLink('/nosotros')).toBe('warn');
  });
});
