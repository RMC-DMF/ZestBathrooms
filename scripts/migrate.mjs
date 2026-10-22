#!/usr/bin/env node
// Migrate the WordPress export (pages.json, posts.json, manifest.csv) into Astro content collections.
// Usage: node scripts/migrate.mjs <export-dir>   (export-dir holds content/pages.json, content/posts.json, manifest.csv)
// Writes src/content/{case-studies,projects,brands,journal}/*.md and scripts/image-map.json.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import TurndownService from 'turndown';

const EXPORT = process.argv[2] || '../export';
const OUT = 'src/content';
const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
td.remove(['script', 'style', 'noscript', 'form', 'button', 'iframe']);

const strip = (h) => (h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&#8211;/g, '–').replace(/&#038;/g, '&').replace(/\s+/g, ' ').trim();
const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const yaml = (v) => (typeof v === 'string' ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map((x) => JSON.stringify(x)).join(', ')}]` : v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
const fm = (o) => '---\n' + Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && !v.length)).map(([k, v]) => (typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) ? `${k}:\n` + Object.entries(v).map(([k2, v2]) => `  ${k2}: ${yaml(v2)}`).join('\n') : `${k}: ${yaml(v)}`)).join('\n') + '\n---\n';

const pages = JSON.parse(await fs.readFile(path.join(EXPORT, 'content/pages.json'), 'utf8'));
const posts = JSON.parse(await fs.readFile(path.join(EXPORT, 'content/posts.json'), 'utf8'));
const manifest = parse(await fs.readFile(path.join(EXPORT, 'manifest.csv'), 'utf8'), { columns: true });
const pathOf = (p) => p.link.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');

// ---------- images ----------
// Build the renamed-image map: every image attached to a page/post gets <collection>/<slug>-NN.<ext>
const imageMap = {}; // original local_path -> new public path
const bySlug = {};
for (const r of manifest) {
  if (!r.attached_to_slug) continue;
  (bySlug[r.attached_to_slug] ||= []).push(r);
}
const isRendition = (f) => /-\d+x\d+\.\w+$/.test(f) || /-scaled-\d+/.test(f);
const isNoise = (f) => /logo|favicon|icon|brochure|pdf|google-review|widget|banner|red-dot|^untitled|screenshot|^image\d/i.test(f);
function assignImages(slug, folder) {
  const rows = (bySlug[slug] || []).filter((r) => !isRendition(r.filename) && !isNoise(r.filename) && Number(r.width) >= 800);
  // dedupe copies: prefer the largest width per base name
  const seen = new Map();
  for (const r of rows) {
    const base = r.filename.replace(/-copy(-\d+)?|-scaled|-\d+$|\.\w+$/g, '').toLowerCase();
    if (!seen.has(base) || Number(seen.get(base).width) < Number(r.width)) seen.set(base, r);
  }
  const picked = [...seen.values()].sort((a, b) => Number(b.width) * Number(b.height) - Number(a.width) * Number(a.height));
  return picked.map((r, i) => {
    const ext = path.extname(r.filename).toLowerCase() === '.png' ? '.png' : path.extname(r.filename).toLowerCase() === '.webp' ? '.webp' : '.jpg';
    const newPath = `/images/${folder}/${slug}-${String(i + 1).padStart(2, '0')}${ext}`;
    imageMap[r.local_path] = { to: `public${newPath}`, width: Number(r.width), height: Number(r.height), alt: r.alt || '' };
    return { src: newPath, alt: r.alt || '', width: Number(r.width), height: Number(r.height) };
  });
}

// ---------- case-study facts from the excerpt ----------
function facts(ex) {
  const t = strip(ex);
  const d = {};
  const keys = ['Client', 'Architect', 'Interior Designer', 'Project', 'Location', 'Sector', 'Units', 'Size'];
  for (const k of keys) {
    const m = t.match(new RegExp(k + '\\s*:?\\s*(.+?)(?=\\s(?:' + keys.join('|') + ')\\s*:|\\s[A-Z][a-z]+ [a-z]|$)'));
    if (m) d[k] = m[1].trim().replace(/\s+Download PDF.*$/, '').slice(0, 80);
  }
  const u = (d.Units || '').match(/\d[\d,]*/);
  d.unitsNum = u ? Number(u[0].replace(/,/g, '')) : undefined;
  return d;
}
const fixes = {
  'hyll-hotel-cotswolds': { Client: 'YOUTH', Location: 'Cotswolds', Sector: 'Hospitality' },
  'audley-villages-redwood-bristol': { Sector: 'Retirement Living', unitsLabel: '106 apartments and 20 cottages', unitsNum: 126, Location: 'Redwood, Bristol' },
  'the-links-west-kirby-luxury-kitchen-bathroom-design': { Location: 'Meols Drive, West Kirby, Wirral', unitsNum: 10 },
  'urban-green': { Client: 'The Heaton Group' },
  'the-mount-hale-barns': { Sector: 'Residential development', Location: 'Hale Barns, Cheshire' },
  'glassworks': { unitsLabel: '47,000 sq ft' },
  'beaufort-house-birmingham': { Sector: 'Residential' },
  'altin-homes': { Sector: 'Residential', Client: 'Altin Homes' },
};
const areaOf = (loc = '') => {
  const l = loc.toLowerCase();
  if (/chester zoo|chester\b/.test(l) && !/manchester/.test(l)) return 'chester';
  if (/manchester|sale|stockport|hale/.test(l)) return 'manchester';
  if (/liverpool/.test(l)) return 'liverpool';
  if (/wirral|west kirby|meols/.test(l)) return 'wirral';
  if (/knutsford|tarporley|northwich|prestbury|cheshire|sandiway/.test(l)) return 'cheshire';
  return undefined;
};
const brandsIn = (html) => ['SieMatic', 'Leicht', 'Gessi', 'AXOR', 'Bette', 'Novello', 'Villeroy & Boch', 'Hansgrohe', 'Duravit', 'Gaggenau', 'Effe', 'Cielo', 'Artelinea', 'Oasis', 'Victoria + Albert', 'Siemens', 'Matki'].filter((b) => new RegExp(b.replace(/[+&]/g, '.'), 'i').test(html)).map((b) => slugify(b));

// Clean Elementor HTML down to the article body, then to Markdown
function bodyMarkdown(html) {
  let h = html
    .replace(/<div[^>]*class="[^"]*(elementor-button|elementor-icon|share|breadcrumb)[^"]*"[^>]*>[\s\S]*?<\/div>/g, ' ')
    .replace(/<a[^>]*class="[^"]*elementor-button[^"]*"[^>]*>[\s\S]*?<\/a>/g, ' ');
  let md = td.turndown(h);
  md = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images are handled via the gallery
    .replace(/\[(more case studies|Get in touch|Download PDF|Discover refined living with Zest|Luxury begins here|Get Inspired|Built on trust\. Defined by design\.)\]\([^)]*\)/gi, '')
    .replace(/^(CASE STUDY.*|more case studies|Built on trust\. Defined by design\.|Luxury begins here|Get Inspired|Project Information)$/gim, '')
    .replace(/^#{1,6}\s*(Client|Location|Sector|Units|Architect|Project|Interior Designer)\s*:?.*$/gim, '')
    .replace(/^(Client|Location|Sector|Units|Architect|Project|Interior Designer)\s*:?\s*.*$/gim, '')
    .replace(/\[(.*?)\]\(https?:\/\/zestbathroomsandkitchens\.co\.uk([^)]*)\)/g, '[$1]($2)')
    .replace(/\[\s*\]\([^)]*\)/g, '') // empty links left by gallery images
    .replace(/^#{1,6}\s*(Built on trust.*|Luxury begins here|Get Inspired|more case studies)\s*$/gim, '')
    .replace(/^(kitchen|bathroom|kitchen & bathroom|bathroom & kitchen)?\s*CASE STUDY\s*(–|-)?\s*(Projects|bATHROOMS|Bathrooms|Kitchens)?\s*$/gim, '')
    .replace(/^#\s+.*$/gm, '') // H1s duplicate the title
    .replace(/^\d{1,2}(st|nd|rd|th)? [A-Z][a-z]+ \d{4}$/gm, '') // stray date lines
    .replace(/^.{0,40} at Zest Bathrooms & Kitchens$/gm, '') // brand-page eyebrow
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return md;
}

await Promise.all(['case-studies/kitchens', 'case-studies/bathrooms', 'projects', 'brands', 'journal', 'areas', 'team'].map((d) => fs.mkdir(path.join(OUT, d), { recursive: true })));
let counts = { caseStudies: 0, projects: 0, journal: 0, brands: 0 };

for (const p of posts) {
  const url = pathOf(p);
  const slug = p.slug;
  const html = p.content?.rendered || '';
  const title = strip(p.title.rendered);
  const f = { ...facts(p.excerpt?.rendered), ...(fixes[slug] || {}) };
  const date = p.date.slice(0, 10);
  if (url.startsWith('/blog/')) {
    const imgs = assignImages(slug, 'journal');
    const md = bodyMarkdown(html);
    const summary = strip(p.excerpt?.rendered).replace(/\s*\[…\]$/, '').slice(0, 200);
    await fs.writeFile(path.join(OUT, 'journal', `${slug}.md`), fm({ title, summary, date, hero: imgs[0] && { src: imgs[0].src, alt: imgs[0].alt || title }, tags: brandsIn(html), legacyUrl: url, decision: 'review' }) + '\n' + md + '\n');
    counts.journal++;
    continue;
  }
  const isProject = url.startsWith('/projects/');
  const folder = isProject ? 'projects' : url.startsWith('/kitchens/') ? 'kitchens' : 'bathrooms';
  if (url.startsWith('/uncategorized/')) continue; // duplicate of the Tarporley kitchen
  const imgs = assignImages(slug, isProject ? 'projects' : `case-studies/${folder}`);
  const md = bodyMarkdown(html);
  const summaryRaw = strip(p.excerpt?.rendered).replace(/^.*?(?:Units|Location|Sector|Client|Architect|Project)\s*:?\s*[^.]*?\.?\s*(?=[A-Z][a-z]+ )/, '');
  const summary = (md.split('\n').find((l) => l.length > 60) || summaryRaw || title).replace(/[#*_]/g, '').slice(0, 200);
  const common = { title, summary, location: f.Location, area: areaOf(f.Location), client: f.Client && !/private/i.test(f.Client) ? f.Client : undefined, brands: brandsIn(html), hero: imgs[0] && { src: imgs[0].src, alt: imgs[0].alt || title }, gallery: imgs.slice(1, 13).map((i) => ({ src: i.src, alt: i.alt })), date, legacyUrl: url };
  if (isProject) {
    await fs.writeFile(path.join(OUT, 'projects', `${slug}.md`), fm({ ...common, architect: f.Architect || f['Interior Designer'], sector: f.Sector && ['Residential', 'Hospitality', 'Student', 'Retirement Living', 'Commercial', 'Leisure', 'Residential development'].includes(f.Sector) ? f.Sector : undefined, units: f.unitsNum, unitsLabel: f.unitsLabel, featured: ['renaker-deansgate-square', 'viadux', 'municipal-hotel'].includes(slug) }) + '\n' + md + '\n');
    counts.projects++;
  } else {
    await fs.writeFile(path.join(OUT, 'case-studies', folder, `${slug}.md`), fm({ ...common, room: folder, collaborators: f['Interior Designer'] ? [f['Interior Designer']] : [], featured: /leicht-aluro|edgeley|woodlands/.test(slug) }) + '\n' + md + '\n');
    counts.caseStudies++;
  }
}

// ---------- brands (from /about/<brand>-at-zest pages) ----------
const brandMeta = {
  artelinea: { category: 'Furniture', country: 'Italy' }, axor: { category: 'Brassware', country: 'Germany' }, bette: { category: 'Baths', country: 'Germany' },
  cielo: { category: 'Sanitaryware', country: 'Italy' }, effe: { category: 'Wellness', country: 'Italy' }, gaggenau: { category: 'Appliances', country: 'Germany' },
  gessi: { category: 'Brassware', country: 'Italy', featured: true, order: 1 }, 'glass-design': { category: 'Sanitaryware', country: 'Italy' }, novello: { category: 'Furniture', country: 'Italy' },
  oasis: { category: 'Furniture', country: 'Italy' }, sunshower: { category: 'Wellness', country: 'Netherlands' }, 'victoria-albert': { category: 'Baths', country: 'UK' },
};
for (const p of pages) {
  const url = pathOf(p);
  const m = url.match(/^\/about\/(.+?)-?(?:at-)?zest-bathrooms-kitchens(?:-2)?$/);
  if (!m) continue;
  let key = m[1].replace(/-$/, '');
  if (key === 'betteat') key = 'bette';
  const title = strip(p.title.rendered).replace(/\s*(at|-)?\s*Zest Bathrooms.*$/i, '').trim();
  const imgs = assignImages(p.slug, 'brands');
  const md = bodyMarkdown(p.content.rendered);
  const meta = brandMeta[key] || { category: 'Sanitaryware' };
  await fs.writeFile(path.join(OUT, 'brands', `${key}.md`), fm({ title, ...meta, summary: (md.split('\n').find((l) => l.length > 60) || title).replace(/[#*_]/g, '').slice(0, 200), hero: imgs[0] && { src: imgs[0].src, alt: imgs[0].alt || title }, gallery: imgs.slice(1, 9).map((i) => ({ src: i.src, alt: i.alt })), legacyUrl: url }) + '\n' + md + '\n');
  counts.brands++;
}
// Brands with no page yet
for (const [key, title, meta] of [['siematic', 'SieMatic', { category: 'Kitchens', country: 'Germany', featured: true, order: 1 }], ['leicht', 'Leicht', { category: 'Kitchens', country: 'Germany', order: 2 }], ['villeroy-boch', 'Villeroy & Boch', { category: 'Sanitaryware', country: 'Germany' }], ['hansgrohe', 'Hansgrohe', { category: 'Brassware', country: 'Germany' }], ['duravit', 'Duravit', { category: 'Sanitaryware', country: 'Germany' }]]) {
  const file = path.join(OUT, 'brands', `${key}.md`);
  try { await fs.access(file); } catch { await fs.writeFile(file, fm({ title, ...meta, summary: `[Write a 200-character summary of what Zest carries from ${title} and what is on display in Chester.]` }) + `\n[Brand page copy for ${title} — to write.]\n`); counts.brands++; }
}

// ---------- static page copy (rewritten later; migrated so nothing is lost) ----------
const staticPages = { 'about/our-story': 'our-story', 'about/design-service': 'design-service', 'about/our-showroom': 'showroom', 'about/faq': 'faq', 'about/what-we-do': 'what-we-do', 'projects/how-we-work': 'how-we-work', 'bathrooms/wellness': 'wellness', 'luxury-tiles-for-bathrooms-kitchens-interiors': 'tiles', 'bathrooms': 'bathrooms', 'kitchens/siematic-kitchens': 'siematic', 'projects': 'projects', 'about': 'about', 'contact-us': 'contact', 'the-siematic-difference-seven-essentials-of-lasting-luxury': 'siematic-difference', 'siematic-kitchens-where-design-meets-longevity': 'siematic-longevity', 'introducing-our-new-siematic-display': 'siematic-display', 'testimonials': 'testimonials', 'about/luxury-kitchen-bathroom-design-service-in-chester-zest': 'design-service-chester' };
await fs.mkdir(path.join(OUT, 'pages'), { recursive: true });
let pageCount = 0;
for (const p of pages) {
  const key = pathOf(p).replace(/^\//, '');
  const name = staticPages[key];
  if (!name) continue;
  const imgs = assignImages(p.slug, 'pages');
  const md = bodyMarkdown(p.content.rendered);
  await fs.writeFile(path.join(OUT, 'pages', `${name}.md`), fm({ title: strip(p.title.rendered), legacyUrl: pathOf(p), hero: imgs[0] && { src: imgs[0].src, alt: imgs[0].alt || strip(p.title.rendered) }, gallery: imgs.slice(1, 13).map((i) => ({ src: i.src, alt: i.alt })) }) + '\n' + md + '\n');
  pageCount++;
}
counts.pages = pageCount;

await fs.writeFile('scripts/image-map.json', JSON.stringify(imageMap, null, 1));
console.log(counts, `images mapped: ${Object.keys(imageMap).length}`);
