#!/usr/bin/env node
// Copy and rename images from the WordPress export into public/images using scripts/image-map.json.
// Usage: node scripts/import-images.mjs <export-dir>   e.g. node scripts/import-images.mjs ~/Desktop/export
// Resizes anything wider than 2000px and converts PNG photos to JPEG. Safe to rerun.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const EXPORT = process.argv[2] || '../export';
const map = JSON.parse(await fs.readFile('scripts/image-map.json', 'utf8'));
let ok = 0, missing = 0;
for (const [from, m] of Object.entries(map)) {
  const src = path.join(EXPORT, from);
  const dest = m.to;
  try { await fs.access(src); } catch { missing++; console.warn('missing', from); continue; }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const ext = path.extname(dest).toLowerCase();
  let img = sharp(src).rotate();
  const meta = await img.metadata();
  if ((meta.width || 0) > 2000) img = img.resize({ width: 2000, withoutEnlargement: true });
  if (ext === '.jpg') img = img.jpeg({ quality: 82, mozjpeg: true });
  else if (ext === '.webp') img = img.webp({ quality: 82 });
  else img = img.png();
  await img.toFile(dest);
  ok++;
}
console.log(`copied ${ok}, missing ${missing}`);
