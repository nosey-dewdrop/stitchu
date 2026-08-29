// header-diff.mjs — proves the canonical site header is byte-identical on every
// page that carries it: the 12 hand-written main pages and the 24 generated
// style pages (styles/). One header, no drift: same brandpatch, same 6 nav items
// (create · closet · collections · benchmark · patch notes · API) in the same
// order with the same EN/TR text, same EN·TR toggle.
//
// The 7th item, "Pattern Blog", was removed in TUR 13: it pointed into
// web/patterns/, which af49514 deleted, so on 95 pages it was a link to a 404 —
// and on the 24 styles/ pages it was href="index.html" class="sh-active", i.e.
// it resolved to the styles hub and every styles page announced itself as the
// Pattern Blog. Not a 404, so no link checker could see it; only this tool did,
// by going DRIFT the moment the other 95 were repaired.
//
// Two axes are legitimately allowed to vary and are normalised away before the
// compare:
//   1. relative-path prefix — subdir pages (styles/) reach root pages with "../".
//   2. active marker — the current page marks ONE link with class="sh-active".
// Everything else must match exactly. Exit non-zero on any drift.
//   run: node engine/tools/header-diff.mjs
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, '../../web');

// Every page that MUST carry the canonical header.
// H1 "depo temiz" removed patches.html, collection-60s70s.html and
// collections/index.html from the site; they are dropped here in the same
// commit so this tool reports a real drift instead of a stale expectation.
const mainPages = ['index.html', 'create.html', 'closet.html', 'benchmark.html',
  'showcase.html', 'signature.html',
  'api.html', 'privacy.html', 'studio.html',
  // GECE7 / F8: the AL DENE page. A page that ships with a hand-edited copy of
  // the header drifts silently, and this one is the entry point a stranger is
  // handed, so it is the worst page to let drift.
  'al-dene.html'];
// Generated page classes. `patterns/` is NOT one of them any more: commit
// af49514 deleted the whole fake pattern gallery (67 svgs + 22 product pages)
// on purpose — it presented output that fails the buyable-object test. This
// tool kept reading that directory and CRASHED at readdirSync (ENOENT), so
// scripts/deploy.sh proof #2 has been unrunnable ever since. A missing or
// empty declared dir is now a LOUD failure — never a crash, never a silent
// skip (Tur 9 katman-lint class). `styles/` left the same way in H1 "depo
// temiz" (the style library and its producer were deleted together), so the
// one surviving generated page class is `guide/`.
const REQUIRED_DIRS = ['guide'];
let dirFail = 0;
const subdirPages = REQUIRED_DIRS.flatMap((d) => {
  let names;
  try { names = readdirSync(join(WEB, d)); }
  catch { console.error(`FAIL  required page dir web/${d}/ is MISSING — a declared page class cannot be checked`); dirFail++; return []; }
  const html = names.filter((f) => f.endsWith('.html'));
  if (html.length === 0) { console.error(`FAIL  required page dir web/${d}/ carries ZERO html pages — nothing to enforce`); dirFail++; }
  return html.map((f) => `${d}/${f}`);
});
const stylePages = subdirPages.filter((p) => p.startsWith('styles/'));
const pages = [...mainPages, ...subdirPages];

function extractHeader(html, rel) {
  const m = html.match(/<header class="sh-header">[\s\S]*?<\/header>/);
  if (!m) throw new Error(`${rel}: no <header class="sh-header"> block`);
  return m[0];
}

// Normalise the two allowed axes so a byte compare proves everything else matches.
function normalise(header) {
  return header
    // drop the active marker wherever it sits (each page marks a different link)
    .replace(/ class="sh-active"/g, '')
    // strip subdir "../" prefixes so root and subdir headers align
    .replace(/href="\.\.\//g, 'href="')
    // collections link: "collections/index.html" (root, after "../" strip) vs
    // "index.html" on the collections index page itself.
    .replace(/href="collections\/index\.html"/g, 'href="__COLLECTIONS__"')
    .replace(/(<a href=")index\.html(" data-en="Collections")/g, '$1__COLLECTIONS__$2')
    // brand link: "index.html" (root) vs "../index.html"->"index.html" (subdir),
    // already aligned by the prefix strip above.
    .trim();
}

const shared = {};
let fail = dirFail;
for (const rel of pages) {
  let html;
  try { html = readFileSync(join(WEB, rel), 'utf8'); }
  catch { console.error(`MISSING FILE: ${rel}`); fail++; continue; }
  let norm;
  try { norm = normalise(extractHeader(html, rel)); }
  catch (e) { console.error(`FAIL  ${rel}: ${e.message}`); fail++; continue; }
  (shared[norm] ??= []).push(rel);

  // Every page must also carry the shared-header css + js (one behaviour source).
  if (!/css\/shared-header\.css/.test(html)) { console.error(`FAIL  ${rel}: missing shared-header.css`); fail++; }
  if (!/js\/shared-header\.js/.test(html)) { console.error(`FAIL  ${rel}: missing shared-header.js`); fail++; }
}

const variants = Object.keys(shared);
if (variants.length === 1 && fail === 0) {
  console.log(`OK  header identical across ${pages.length} pages (${mainPages.length} main + ${stylePages.length} styles).`);
  process.exit(0);
}

if (variants.length > 1) {
  console.error(`DRIFT  ${variants.length} distinct headers found:`);
  variants.forEach((v, i) => {
    console.error(`\n--- variant ${i + 1} (${shared[v].length} pages: ${shared[v].slice(0, 4).join(', ')}${shared[v].length > 4 ? ' ...' : ''}) ---`);
    console.error(v);
  });
}
console.error(`\nheader-diff FAILED (${fail} hard failures, ${variants.length} header variants).`);
process.exit(1);
