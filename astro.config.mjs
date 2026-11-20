import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sitio from './src/config/sitio.json' with { type: 'json' };

export default defineConfig({
  site: sitio.dominio,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
