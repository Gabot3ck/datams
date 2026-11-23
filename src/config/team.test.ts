import { describe, expect, it } from 'vitest';
import { TEAM, TEAM_GROUP_PHOTO, YEARS_LABEL, FAMILIES_SERVED_LABEL } from './team';

describe('TEAM', () => {
  it('tiene 5 asesores en orden asesor-1…asesor-5', () => {
    expect(TEAM.map((m) => m.id)).toEqual(['asesor-1', 'asesor-2', 'asesor-3', 'asesor-4', 'asesor-5']);
  });

  it('usa nombres provisorios "Asesor N" / "Advisor N" hasta que el cliente confirme', () => {
    expect(TEAM[0].name).toEqual({ es: 'Asesor 1', en: 'Advisor 1' });
    expect(TEAM[4].name).toEqual({ es: 'Asesor 5', en: 'Advisor 5' });
  });

  it('todos con cargo "Tax Preparer" y sin términos prohibidos', () => {
    for (const m of TEAM) {
      expect(m.role).toBe('Tax Preparer');
      expect(`${m.name.es} ${m.name.en} ${m.role}`).not.toMatch(/certific|realtor|notari/i);
    }
  });

  it('cada asesor tiene foto 3:4', () => {
    for (const m of TEAM) expect(m.photo.height / m.photo.width).toBeCloseTo(4 / 3, 2);
  });
});

describe('datos de la empresa', () => {
  it('foto grupal no mayor a 1024px de ancho', () => {
    expect(TEAM_GROUP_PHOTO.width).toBeLessThanOrEqual(1024);
  });
  it('mismos números que CommunitySection', () => {
    expect(YEARS_LABEL).toBe('10+');
    expect(FAMILIES_SERVED_LABEL).toBe('5,000+');
  });
});
