// Content QA gate. Scans every built page for placeholders, unfinished copy and
// images that bypassed the pipeline. Usage: node scripts/audit-content.mjs dist [--strict]
// --strict exits 1 on any finding (use before pointing the real domain at a build).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'dist';
const strict = process.argv.includes('--strict');
const ignoreImages = [/\/images\/brand\//];

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}
const decode = (s) => s.replace(/&#38;|&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
const findings = {};
for (const file of walk(root)) {
  const html = readFileSync(file, 'utf8');
  const body = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '');
  const text = decode(body.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  const found = [];
  for (const m of text.matchAll(/\[[^\]\n]{2,120}\]/g)) found.push(`bracket: ${m[0]}`);
  for (const m of text.matchAll(/\b(TODO|TBC|lorem ipsum|placeholder)\b/gi)) found.push(`word: …${text.slice(Math.max(0, m.index - 40), m.index + 50)}…`);
  for (const m of text.matchAll(/\*\*[^*]{2,60}\*\*|\]\(https?:\/\/|\]\(\//g)) found.push(`markdown: …${text.slice(Math.max(0, m.index - 30), m.index + 50)}…`);
  for (const m of body.matchAll(/<img[^>]+src="(\/images\/[^"]*)"/g)) if (!ignoreImages.some((r) => r.test(m[1]))) found.push(`image not in pipeline (missing file?): ${m[1]}`);
  if (found.length) findings[relative(root, file)] = found;
}
const pages = Object.keys(findings);
const total = pages.reduce((n, p) => n + findings[p].length, 0);
for (const p of pages) { console.log(`\n${p}`); for (const f of findings[p]) console.log(`  - ${f}`); }
console.log(`\n${total} finding(s) on ${pages.length} page(s).`);
if (strict && total) process.exit(1);
