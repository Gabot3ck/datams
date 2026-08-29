import { describe, expect, it } from 'vitest';
import { canonicalURL, SITE_URL, SITE_NAME, BUSINESS, TRUST_BAR_DEFAULT_ES, buildServiceJsonLd, buildLocalBusinessJsonLd } from './site';

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
  it('normaliza la home EN a /en/ con barra', () => {
    expect(canonicalURL('/en')).toBe(`${SITE_URL}/en/`);
  });
  it('no rebana una ruta top-level que empieza con "en" (prefijo laxo prohibido)', () => {
    expect(canonicalURL('/enero-algo')).toBe(`${SITE_URL}/enero-algo`);
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

describe('buildServiceJsonLd', () => {
  const jsonld = buildServiceJsonLd({
    name: 'Declaración de Impuestos Personales',
    description: 'Declaramos tus impuestos personales en español.',
    serviceType: 'Tax preparation',
    url: 'https://tudominio.com/taxes/declaracion-personal',
    lang: 'es',
  });
  it('es un Service con contexto schema.org', () => {
    expect(jsonld['@context']).toBe('https://schema.org');
    expect(jsonld['@type']).toBe('Service');
  });
  it('incluye provider LocalBusiness con teléfono', () => {
    const provider = jsonld.provider as Record<string, unknown>;
    expect(provider['@type']).toBe('LocalBusiness');
    expect(provider.telephone).toBe('+17026400088');
  });
  it('propaga url e inLanguage', () => {
    expect(jsonld.url).toBe('https://tudominio.com/taxes/declaracion-personal');
    expect(jsonld.inLanguage).toBe('es');
  });
  it('areaServed es Las Vegas', () => {
    const area = jsonld.areaServed as Record<string, unknown>;
    expect(area.name).toBe('Las Vegas');
  });
});

describe('buildLocalBusinessJsonLd', () => {
  it('arma NAP completo', () => {
    const b = buildLocalBusinessJsonLd('es');
    expect(b['@type']).toBe('LocalBusiness');
    expect(b.name).toBe("Data's & Multiservices");
    const addr = b.address as Record<string, unknown>;
    expect(addr.postalCode).toBe('89101');
  });
});
