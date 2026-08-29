import { describe, expect, it } from 'vitest';
import { canonicalURL, SITE_URL, SITE_NAME, BUSINESS, TRUST_BAR_DEFAULT_ES } from './site';

describe('canonicalURL', () => {
  it('deja la home como raíz con barra', () => {
    expect(canonicalURL('/')).toBe(`${SITE_URL}/`);
  });
  it('agrega barra final a un pilar sin barra', () => {
    expect(canonicalURL('/taxes')).toBe(`${SITE_URL}/taxes/`);
  });
  it('conserva la barra final de un pilar', () => {
    expect(canonicalURL('/taxes/')).toBe(`${SITE_URL}/taxes/`);
  });
  it('quita la barra final de una página hija', () => {
    expect(canonicalURL('/taxes/enmiendas/')).toBe(`${SITE_URL}/taxes/enmiendas`);
  });
  it('no toca una página hija sin barra', () => {
    expect(canonicalURL('/taxes/enmiendas')).toBe(`${SITE_URL}/taxes/enmiendas`);
  });
  it('normaliza pilar en inglés', () => {
    expect(canonicalURL('/en/irs')).toBe(`${SITE_URL}/en/irs/`);
  });
  it('trata /contacto como hija (sin barra)', () => {
    expect(canonicalURL('/contacto')).toBe(`${SITE_URL}/contacto`);
  });
});

describe('constantes', () => {
  it('marca correctamente', () => {
    expect(SITE_NAME).toBe("Data's & Multiservices");
  });
  it('teléfono en formato E.164', () => {
    expect(BUSINESS.phone).toBe('+17026400088');
  });
  it('trust bar tiene 4 ítems', () => {
    expect(TRUST_BAR_DEFAULT_ES).toHaveLength(4);
  });
});
