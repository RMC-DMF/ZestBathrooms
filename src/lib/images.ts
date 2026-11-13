import type { ImageMetadata } from 'astro';

/** Every optimisable image under src/assets/images, keyed by its content path (/images/...). */
const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}');
const byPath = new Map<string, () => Promise<{ default: ImageMetadata }>>();
for (const [file, loader] of Object.entries(modules)) byPath.set(file.replace('/src/assets', ''), loader);

/** Resolve "/images/projects/viadux-01.jpg" to ImageMetadata, or null if it isn't under src/assets. */
export async function resolveImage(src?: string | null): Promise<ImageMetadata | null> {
  if (!src) return null;
  const loader = byPath.get(src);
  if (!loader) return null;
  return (await loader()).default;
}

/** A 24px blurred preview of the image as a data URI, used as the <img> background so the frame is never blank while it loads.
 *  Built once per source at build time and cached. Returns null for anything not under src/assets. */
const lqips = new Map<string, Promise<string | null>>();
export function getLqip(src?: string | null): Promise<string | null> {
  if (!src || !byPath.has(src)) return Promise.resolve(null);
  let p = lqips.get(src);
  if (!p) {
    p = (async () => {
      try {
        const sharp = (await import('sharp')).default;
        const buf = await sharp(`${process.cwd()}/src/assets${src}`).rotate().resize(24, 24, { fit: 'inside' }).blur(0.6).webp({ quality: 40 }).toBuffer();
        return `data:image/webp;base64,${buf.toString('base64')}`;
      } catch { return null; }
    })();
    lqips.set(src, p);
  }
  return p;
}
