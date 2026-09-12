// gen-sitemap.mjs — the ONE sitemap generator. Writes web/sitemap.xml + robots.txt.
//
// It replaces TWO generators that were both wrong in opposite directions, and
// that is exactly how the live sitemap could be broken in both directions at once:
//
//   web/gen-sitemap.py (wired into scripts/deploy.sh) walked the disk, which is
//   the right idea, but its SKIP_DIRS was a list of ASSET directories — assets,
//   css, js, vendor, data ... and "styles". web/styles/ is not a stylesheet
//   directory, it is 24 real content pages. The file even had a RULES entry
//   giving styles/ a priority of 0.6; SKIP_DIRS killed those pages before RULES
//   was ever consulted. Running deploy.sh today would have dropped 24 live pages
//   out of the sitemap.
//
//   engine/tools/gen-style-pages.mjs built a sitemap from a HARDCODED page list
//   plus web/patterns/svg/meta.json. af49514 deleted that tree, so the try/catch
//   swallowed it — but the sitemap it had already written stayed on disk, frozen
//   at 2026-07-28, advertising 22 URLs under /patterns/ that return 404.
//
// Reporting 404s to Google is direct SEO damage, and omitting live pages is
// invisibility. Both come from a sitemap that is a LIST someone maintains. This
// one is not a list: it is derived from what is actually on disk, every run. A
// page exists => it is advertised. A page does not exist => it cannot be.
//
// Excluded, by rule and not by hand:
//   - non-.html files, and 404.html
//   - <meta name="robots" ... noindex> pages
//   - redirect stubs (<meta http-equiv="refresh">) — they are plumbing for old
//     inbound links, not destinations
// engine/tools/site-health.mjs enforces this file's output against the same
// disk, so the two can never quietly disagree.
//
//   run: node engine/tools/gen-sitemap.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const WEB = join(ROOT, 'web');
const BASE = 'https://stitchu.noseydewdrop.com';

// Asset dirs hold no pages; skipping them is a speed choice, not a policy one
// (a .html in any of them would be a mistake regardless).
const SKIP_DIRS = new Set(['assets', 'css', 'js', 'vendor', 'data', 'pdf', '.git', '.vercel', 'node_modules']);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

// priority / changefreq by section. Content that earns search traffic ranks
// highest, hubs mid, patch notes are numerous but low intent.
function rank(rel) {
  const dir = rel.includes('/') ? rel.split('/')[0] : '';
  const isHub = rel === 'index.html' || rel.endsWith('/index.html');
  if (rel === 'index.html') return ['1.0', 'daily'];
  if (dir === 'patches') return [isHub ? '0.6' : '0.5', 'monthly'];
  if (dir === 'collections') return [isHub ? '0.8' : '0.7', 'weekly'];
  if (dir === 'styles') return [isHub ? '0.7' : '0.6', 'monthly'];
  if (dir === 'guide') return ['0.7', 'monthly'];
  if (dir === '' && ['create.html', 'benchmark.html'].includes(rel)) return ['0.8', 'weekly'];
  return ['0.6', 'weekly'];
}

const skipped = [];
const entries = [];
for (const full of walk(WEB)) {
  const rel = relative(WEB, full).split('\\').join('/');
  if (rel.endsWith('404.html')) { skipped.push([rel, '404 page']); continue; }
  const head = readFileSync(full, 'utf8').slice(0, 4000);
  if (/name=["']robots["'][^>]*noindex/i.test(head)) { skipped.push([rel, 'noindex']); continue; }
  if (/http-equiv=["']refresh["']/i.test(head)) { skipped.push([rel, 'redirect stub']); continue; }
  const loc = `${BASE}/${rel.replace(/(^|\/)index\.html$/, '$1')}`;
  const lastmod = new Date(statSync(full).mtime).toISOString().slice(0, 10);
  const [priority, changefreq] = rank(rel);
  entries.push({ loc, lastmod, changefreq, priority });
}

// stable order: priority desc, then url — so a rerun with no page changes
// produces a byte-identical file apart from lastmod.
entries.sort((a, b) => (b.priority - a.priority) || a.loc.localeCompare(b.loc));

const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map((e) => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod>` +
    `<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`),
  '</urlset>', ''].join('\n');

writeFileSync(join(WEB, 'sitemap.xml'), xml);
writeFileSync(join(WEB, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

console.log(`sitemap.xml: ${entries.length} urls (skipped ${skipped.length}: ` +
  `${skipped.map(([r, why]) => `${r} [${why}]`).join(', ') || 'none'})`);
console.log('robots.txt: rewritten');
