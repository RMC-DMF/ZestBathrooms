import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://zestbathroomsandkitchens.co.uk',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (p) => !/\/(thank-you|404)$/.test(p) })],
  // Static site. The Netlify adapter is here only for its Image CDN: on Netlify, <Picture>
  // emits /.netlify/images?… URLs and each size/format is rendered on first request at the
  // edge, so the build doesn't spend ~50 minutes generating 4,600 AVIF/WebP files.
  // Locally (astro dev, or astro build without NETLIFY=true) Astro falls back to sharp.
  adapter: netlify({ imageCDN: true }),
  image: { domains: [] },
});
