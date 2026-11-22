import { defineConfig } from 'astro/config';

// Adresse définitive à confirmer en phase 3 (hébergement)
export default defineConfig({
  site: 'https://marine-rimpot.pages.dev',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
});
