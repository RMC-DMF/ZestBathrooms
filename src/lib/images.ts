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
