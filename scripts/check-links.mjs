import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = 'dist';
const GATE_PREFIXES = ['/taxes', '/irs', '/itin-ein', '/contacto'];
const ASSET_EXT = /\.(css|js|mjs|svg|ico|png|jpg|jpeg|gif|webp|avif|woff|woff2|xml|txt|json|pdf)$/i;

export function classifyLink(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
      href.startsWith('tel:') || /^https?:\/\//.test(href) || href.startsWith('//')) {
    return 'ignore';
  }
  if (!href.startsWith('/')) return 'ignore';
  if (href.startsWith('/_astro/') || ASSET_EXT.test(href.split('#')[0].split('?')[0])) {
    return 'ignore';
  }
  const path = href.split('#')[0].split('?')[0];
  if (path === '/' || GATE_PREFIXES.some((p) => path === p || path.startsWith(p + '/') || path === p + '/')) {
    return 'gate';
  }
  return 'warn';
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (extname(entry.name) === '.html') out.push(full);
  }
  return out;
}

function resolves(path) {
  const clean = path.replace(/\/$/, '');
  return existsSync(join(DIST, clean, 'index.html')) ||
         existsSync(join(DIST, clean + '.html')) ||
         (path === '/' && existsSync(join(DIST, 'index.html')));
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('No existe dist/. Corré `astro build` primero.');
    process.exit(1);
  }
  const files = await walk(DIST);
  const broken = { gate: [], warn: [] };
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
      const kind = classifyLink(href);
      if (kind === 'ignore') continue;
      const path = href.split('#')[0].split('?')[0];
      if (!resolves(path)) broken[kind].push({ file: file.replace(DIST, ''), href });
    }
  }
  if (broken.warn.length) {
    console.warn(`\n⚠️  ${broken.warn.length} enlaces a secciones aún no construidas (OK por ahora):`);
    for (const b of [...new Set(broken.warn.map((b) => b.href))].sort()) console.warn(`   ${b}`);
  }
  if (broken.gate.length) {
    console.error(`\n❌ ${broken.gate.length} enlaces rotos DENTRO del alcance construido:`);
    for (const b of broken.gate) console.error(`   ${b.file}  →  ${b.href}`);
    process.exit(1);
  }
  console.log('\n✅ Sin enlaces rotos en el alcance construido.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
