// Genera las fotos de la página Nosotros desde la carpeta del cliente.
// Uso: node scripts/build-team-photos.mjs <dirFuente>   (p. ej. "../datams/team")
// Se corre a mano cuando cambian las fotos; las salidas se commitean.
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Falta la carpeta fuente: node scripts/build-team-photos.mjs ../datams/team');
  process.exit(1);
}
const out = 'src/assets/images/team';
mkdirSync(out, { recursive: true });

const n = (f) => join(src, 'nosotros', `WhatsApp Image 2026-06-22 at ${f}.jpeg`);

const PORTRAITS = [
  { id: 1, file: n('1.20.29 PM') },
  { id: 2, file: n('1.19.26 PM (2)') },
  // Lleva una placa de otra empresa ("Professional Multiservices · David Takamura"):
  // se tapa con un parche del color de la chaqueta (ver DECISIONES-NEGOCIO P19).
  { id: 3, file: n('1.19.26 PM'), patch: { left: 1700, top: 2930, width: 630, height: 380 } },
  { id: 4, file: n('1.20.30 PM (1)') },
  { id: 5, file: n('1.20.30 PM (4)') },
];

async function patched(file, rect) {
  const img = sharp(file);
  // Color de la chaqueta: promedio de una franja justo debajo de la placa.
  // (stats() ignora extract() en la misma cadena: hay que pasar por un buffer.)
  const sample = await sharp(file)
    .extract({ left: rect.left + 150, top: rect.top + rect.height + 90, width: rect.width - 300, height: 120 })
    .toBuffer();
  const [r, g, b] = (await sharp(sample).stats()).channels.map((c) => Math.round(c.mean));
  // Parche con bordes suaves: rectángulo opaco al centro que se desvanece hacia afuera.
  const pad = 40;
  const mask = Buffer.from(
    `<svg width="${rect.width + pad * 2}" height="${rect.height + pad * 2}"><filter id="b"><feGaussianBlur stdDeviation="14"/></filter>` +
      `<rect x="${pad}" y="${pad}" width="${rect.width}" height="${rect.height}" rx="24" fill="rgb(${r},${g},${b})" filter="url(#b)"/></svg>`
  );
  return img.composite([{ input: mask, left: rect.left - pad, top: rect.top - pad }]).toBuffer();
}

function report(path) {
  return sharp(path)
    .metadata()
    .then((m) => console.log(`${path}  ${m.width}x${m.height}  ${Math.round(statSync(path).size / 1024)} KB`));
}

for (const p of PORTRAITS) {
  const input = p.patch ? await patched(p.file, p.patch) : p.file;
  const dest = join(out, `datamultiservices-asesor-${p.id}.webp`);
  await sharp(input).resize(720, 960, { fit: 'cover', position: 'top' }).webp({ quality: 80 }).toFile(dest);
  await report(dest);
}

const group = join(out, 'datamultiservices-equipo-las-vegas.webp');
await sharp(n('1.20.30 PM (3)')).webp({ quality: 82 }).toFile(group);
await report(group);
