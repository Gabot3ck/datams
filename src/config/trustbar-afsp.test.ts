import { describe, expect, it } from 'vitest';
import { TRUST_BAR_DEFAULT_ES } from './site';

describe('TRUST_BAR_DEFAULT_ES — credencial AFSP (DECISIONES-NEGOCIO.md §1.4)', () => {
  it('dice "completaron", sin "certificado" ni "participantes del … del IRS"', () => {
    expect(TRUST_BAR_DEFAULT_ES).toContain('Preparadores que completaron el Annual Filing Season Program del IRS');
    for (const item of TRUST_BAR_DEFAULT_ES) expect(item).not.toMatch(/certificad/i);
  });
});
