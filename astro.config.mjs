// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        // excluir rutas /en/* que aún no existen como archivo
        !page.includes('/en/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
