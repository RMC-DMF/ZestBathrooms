import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// On Netlify (NETLIFY=true is set in every Netlify build) the adapter switches <Picture> to the
// Netlify Image CDN: the build emits /.netlify/images?… URLs and each size/format is rendered on
// first request at the edge, so the build takes seconds rather than ~50 minutes of AVIF encoding.
// Anywhere else — `astro dev` on a Mac, a CI build — the adapter is left off and Astro's default
// sharp service generates real files, so images work locally without `netlify dev`.
const onNetlify = process.env.NETLIFY === 'true';
const adapter = onNetlify ? (await import('@astrojs/netlify')).default({ imageCDN: true }) : undefined;

export default defineConfig({
  site: 'https://zestbathroomsandkitchens.co.uk',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (p) => !/\/(thank-you|404)$/.test(p) })],
  ...(adapter ? { adapter } : {}),
  image: { domains: [] },
});
