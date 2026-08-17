// site-health.mjs — the gate that was missing while the live site rotted.
//
// Three defects shipped silently to Damla's public face and NOTHING measured
// them (TUR 12/12C):
//   1. 187 internal links into web/patterns/ — a directory deliberately deleted
//      by af49514. web/index.html itself linked to a 404.
//   2. web/sitemap.xml froze on 2026-07-28: it advertised 22 URLs that return
//      404 to Google, and omitted 24 live styles/ pages entirely.
//   3. engine/tools/gen-style-pages.mjs wrote `?v=84` onto a site standing at
//      `?v=136` — a generator that exits 0 while pushing the site 52 bumps
//      BACKWARD. The crashing generators were honest; this one lied quietly.
//
// Every one of the three is a link/asset/version fact that a machine can check
// in a fresh clone with node alone, which is why this file exists and why
// .github/workflows/pages.yml runs it before `deploy`.
//
// CHECKS
//   A. dead internal reference — every local href/src/srcset under web/**.html
//      must resolve to a file that exists on disk.
//   B. sitemap points at 404 — every <loc> must map to a real file.
//   C. sitemap omits a live page — every indexable .html must have a <loc>.
//   D. version regression — no generator may hardcode a ?v literal below the
//      single canonical version carried by web/.
//
// NOT checked here (declared, not hidden): external http(s) links. They need
// network and would make the gate flaky; a red gate nobody trusts is a mute
// button (see pages.yml on why ctest is not wired in).
//
//   run: node engine/tools/site-health.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const WEB = join(ROOT, 'web');
const TOOLS = here;
const DOMAIN = 'https://stitchu.noseydewdrop.com';

let fail = 0;
const red = (msg) => { console.error(msg); fail++; };

// ---------------------------------------------------------------- file walk
function walk(dir, filter, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === '.vercel' || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, filter, acc);
    else if (filter(name)) acc.push(full);
  }
  return acc;
}

const htmlFiles = walk(WEB, (n) => n.endsWith('.html')).sort();
if (htmlFiles.length === 0) red('FAIL  web/ carries ZERO html pages — nothing to check');

// ------------------------------------------- A. dead internal href/src refs
// Pull every local reference out of an html file. Skips anchors, protocol
// URLs, mailto/tel, data: and template placeholders.
const REF_RE = /(?:href|src)\s*=\s*"([^"]+)"/g;
function localRefs(html) {
  const out = [];
  for (const m of html.matchAll(REF_RE)) {
    const raw = m[1].trim();
    if (!raw) continue;
    if (/^(#|https?:|\/\/|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    if (raw.includes('${') || raw.includes('{{')) continue;
    out.push(raw);
  }
  return out;
}

// Resolve a reference the way a static host does: strip query/hash, and treat a
// trailing "/" as that directory's index.html.
function resolveRef(fromFile, ref) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return null;                       // pure "#frag" / "?q" — same page
  const base = clean.startsWith('/') ? WEB : dirname(fromFile);
  const target = resolve(base, clean.startsWith('/') ? '.' + clean : clean);
  return clean.endsWith('/') ? join(target, 'index.html') : target;
}

let refCount = 0;
const dead = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const ref of localRefs(html)) {
    const target = resolveRef(file, ref);
    if (target === null) continue;
    refCount++;
    if (existsSync(target)) continue;
    // a bare directory path is also legal if it holds an index.html
    if (existsSync(join(target, 'index.html'))) continue;
    dead.push(`${relative(ROOT, file)} -> ${ref}`);
  }
}
if (dead.length) {
  red(`FAIL  ${dead.length} dead internal reference(s) — these are 404s on the live site:`);
  for (const d of dead.slice(0, 40)) console.error(`        ${d}`);
  if (dead.length > 40) console.error(`        ... and ${dead.length - 40} more`);
}

// --------------------------------------------------- sitemap: B (404) + C (gaps)
const SITEMAP = join(WEB, 'sitemap.xml');
let locs = [];
if (!existsSync(SITEMAP)) {
  red('FAIL  web/sitemap.xml is MISSING');
} else {
  const xml = readFileSync(SITEMAP, 'utf8');
  locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) red('FAIL  web/sitemap.xml carries ZERO <loc> entries — an empty seal is not a pass');
}

// Which pages SHOULD be in the sitemap: every .html under web/ that is not
// noindex, not a 404 page, and not a redirect stub.
function indexable(file) {
  const head = readFileSync(file, 'utf8').slice(0, 4000);
  if (/name=["']robots["'][^>]*noindex/i.test(head)) return false;
  if (/http-equiv=["']refresh["']/i.test(head)) return false;
  return true;
}
const wanted = new Map();   // canonical URL -> file
for (const file of htmlFiles) {
  const rel = relative(WEB, file).split('\\').join('/');
  if (rel.endsWith('404.html')) continue;
  if (!indexable(file)) continue;
  wanted.set(`${DOMAIN}/${rel.replace(/(^|\/)index\.html$/, '$1')}`, rel);
}

// B — every advertised URL must be a real file.
function fileForLoc(loc) {
  if (!loc.startsWith(DOMAIN)) return null;      // wrong domain: reported separately
  let p = loc.slice(DOMAIN.length).replace(/^\//, '');
  if (p === '' || p.endsWith('/')) p += 'index.html';
  return join(WEB, p);
}
const dead404 = [];
const wrongDomain = [];
for (const loc of locs) {
  const f = fileForLoc(loc);
  if (f === null) { wrongDomain.push(loc); continue; }
  if (!existsSync(f)) dead404.push(loc);
}
if (wrongDomain.length) {
  red(`FAIL  ${wrongDomain.length} sitemap <loc> not on ${DOMAIN}:`);
  for (const l of wrongDomain.slice(0, 10)) console.error(`        ${l}`);
}
if (dead404.length) {
  red(`FAIL  ${dead404.length} sitemap URL(s) return 404 — we are reporting dead pages to Google:`);
  for (const l of dead404.slice(0, 30)) console.error(`        ${l}`);
  if (dead404.length > 30) console.error(`        ... and ${dead404.length - 30} more`);
}

// C — every live indexable page must be advertised.
const locSet = new Set(locs);
const missing = [...wanted.keys()].filter((u) => !locSet.has(u));
if (missing.length) {
  red(`FAIL  ${missing.length} live indexable page(s) absent from the sitemap — invisible to search:`);
  for (const u of missing.slice(0, 30)) console.error(`        ${u}`);
  if (missing.length > 30) console.error(`        ... and ${missing.length - 30} more`);
}

// ------------------------------------------------ D. ?v single source + regression
const assetFiles = walk(WEB, (n) => /\.(html|js|css)$/.test(n));

// D0 — the stamp must be `?v=N`. gen-guide.mjs wrote `?v83` (no "="), because it
// held 'v83' and interpolated it as `?${V}`. Nothing caught it: deploy.sh bumps
// with s/\?v=[0-9]+/, pages.yml counts /\?v=[0-9]*/, and BOTH skip a stamp with
// no "=". So 6 live guide pages sat frozen at v83 while the rest of the site
// advanced to 136 — browsers cached them under a key no deploy could ever move.
const malformed = [];
for (const f of assetFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/\?v(\d+)/g)) {
    malformed.push(`${relative(ROOT, f)} carries "?v${m[1]}" — must be "?v=${m[1]}"`);
  }
}
if (malformed.length) {
  red(`FAIL  ${malformed.length} malformed cache-bust stamp(s) — a "?vN" without "=" is invisible to every bump:`);
  for (const s of malformed.slice(0, 20)) console.error(`        ${s}`);
  if (malformed.length > 20) console.error(`        ... and ${malformed.length - 20} more`);
}

const vLits = [...new Set(
  assetFiles.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/\?v=(\d+)/g)].map((m) => m[1]))
)];
if (vLits.length !== 1) {
  red(`FAIL  web/ carries ${vLits.length} distinct ?v versions (must be exactly 1): ${vLits.join(', ')}`);
} else {
  // Every generator that writes html into web/ must take the version from the
  // shared reader, never a literal. A literal is how gen-style-pages.mjs pushed
  // the site from ?v=136 back to ?v=84 while exiting 0.
  const CANON = vLits[0];
  const genFiles = readdirSync(TOOLS)
    .filter((n) => n.startsWith('gen-') && /\.(mjs|js)$/.test(n))
    .map((n) => join(TOOLS, n));
  const stale = [];
  for (const g of genFiles) {
    const src = readFileSync(g, 'utf8');
    const hits = new Set();
    // inline literal:  ?v=84
    for (const m of src.matchAll(/\?v=(\d+)/g)) hits.add(m[1]);
    // bare version-string literal anywhere:  'v=80'
    for (const m of src.matchAll(/['"`]v=(\d+)['"`]/g)) hits.add(m[1]);
    // ANY digit literal reachable from the version variable's own declaration.
    // This deliberately does not enumerate shapes. Three earlier attempts here
    // each enumerated, and each one had a hole:
    //   /\?v=(\d+)/                    missed gen-vintage-page's 'v=80'
    //   /process\.env\.V \|\| '(\d+)'/ missed a plain  const V = '84'
    // and the second hole was found by MUTATION, not by reading — re-arming the
    // original TUR 12 defect as `const V = '84'` sailed through a gate written
    // to catch that exact defect. So: take the whole right-hand side of the V
    // declaration and refuse every number in it. siteVersion() has no digits,
    // which is the point — the only passing form is the shared reader.
    for (const decl of src.matchAll(/(?:const|let|var)\s+V\s*=\s*([^;]+);/g)) {
      // Array/argument indexing is not a version: process.argv[2] must not be
      // read as "pinned at 2". Everything else numeric in the declaration is.
      const rhs = decl[1].replace(/\[\s*\d+\s*\]/g, '[]');
      for (const m of rhs.matchAll(/(\d+)/g)) hits.add(m[1]);
    }
    for (const v of hits) if (v !== CANON) stale.push(`${relative(ROOT, g)} hardcodes version ${v} (site is at ?v=${CANON})`);
  }
  if (stale.length) {
    red(`FAIL  ${stale.length} generator version literal(s) would push the live site BACKWARD:`);
    for (const s of stale) console.error(`        ${s}`);
  }
}

// ------------------------------------------------------------------- verdict
console.log(`checked: ${htmlFiles.length} pages, ${refCount} internal refs, ` +
            `${locs.length} sitemap urls, ${wanted.size} indexable pages`);
if (fail) { console.error(`\nsite-health: ${fail} FAIL`); process.exit(1); }
console.log('OK  site-health: no dead links, sitemap matches the site, one version.');
