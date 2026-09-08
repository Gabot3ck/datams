// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, canonicalURL, stripTrailingSlash } from './src/config/site.ts';
import { ROUTES } from './src/config/routes.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    react(),
    sitemap({
      // Mantener una página si NO está bajo /en/, o si ROUTES tiene una entrada
      // enBuilt cuya ruta EN (normalizada) coincide con el pathname (normalizado).
      // Se auto-mantiene a medida que el Plan 2 va marcando enBuilt.
      filter: (page) => {
        const path = new URL(page).pathname;
        const norm = stripTrailingSlash(path);
        if (norm !== '/en' && !path.includes('/en/')) return true;
        return ROUTES.some(
          (r) => r.enBuilt && stripTrailingSlash(r.en) === norm,
        );
      },
      // Cada <loc> debe coincidir con el <link rel="canonical"> de la página.
      serialize: (item) => ({
        ...item,
        url: canonicalURL(new URL(item.url).pathname),
      }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
