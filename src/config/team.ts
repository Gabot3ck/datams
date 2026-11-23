// Equipo de la página Nosotros (/nosotros ↔ /en/about).
// Fotos generadas con scripts/build-team-photos.mjs desde la carpeta del cliente.
// [PLACEHOLDER: nombres y cargos reales — pregunta 28 de DECISIONES-NEGOCIO.md].
// Mientras los nombres sean provisorios NO se emite JSON-LD Person.
import asesor1 from '../assets/images/team/datamultiservices-asesor-1.webp';
import asesor2 from '../assets/images/team/datamultiservices-asesor-2.webp';
import asesor3 from '../assets/images/team/datamultiservices-asesor-3.webp';
import asesor4 from '../assets/images/team/datamultiservices-asesor-4.webp';
import asesor5 from '../assets/images/team/datamultiservices-asesor-5.webp';
import groupPhoto from '../assets/images/team/datamultiservices-equipo-las-vegas.webp';

export interface TeamMember {
  id: string;
  name: { es: string; en: string };
  /** Igual en ES y EN, como en sus placas. Nunca "certified". */
  role: string;
  photo: ImageMetadata;
}

const photos = [asesor1, asesor2, asesor3, asesor4, asesor5];

export const TEAM: TeamMember[] = photos.map((photo, i) => ({
  id: `asesor-${i + 1}`,
  name: { es: `Asesor ${i + 1}`, en: `Advisor ${i + 1}` },
  role: 'Tax Preparer',
  photo,
}));

/** 1024×728 (WhatsApp): no mostrar más ancha que su tamaño real. */
export const TEAM_GROUP_PHOTO: ImageMetadata = groupPhoto;

/** Mismos números que CommunitySection del Home. */
export const YEARS_LABEL = '10+';
export const FAMILIES_SERVED_LABEL = '5,000+';
