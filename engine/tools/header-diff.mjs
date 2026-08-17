// header-diff.mjs — proves the canonical site header is byte-identical on every
// page that carries it: the 7 hand-written main pages, the 24 generated style
// pages (styles/) AND the 13 generated pattern pages (patterns/). One header,
// no drift: same brandpatch, same 7 nav items (create · closet · patterns ·
// blog · benchmark · patch notes · API) in the same order with the same EN/TR text,
// same EN·TR toggle.
//
// Two axes are legitimately allowed to vary and are normalised away before the
// compare:
//   1. relative-path prefix — subdir pages (styles/, patterns/) reach root pages
//      with "../"; the "patterns" link itself is "patterns/index.html" from root
//      but "index.html" from inside a subdir.
//   2. active marker — the current page marks ONE link with class="sh-active".
// Everything else must match exactly. Exit non-zero on any drift.
//   run: node engine/tools/header-diff.mjs
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, '../../web');

// Every page that MUST carry the canonical header.
const mainPages = ['index.html', 'create.html', 'closet.html', 'benchmark.html',
  'patches.html', 'showcase.html', 'collection-60s70s.html', 'signature.html',
  'collections/index.html', 'api.html', 'privacy.html', 'studio.html'];
// Generated page classes. `patterns/` is NOT one of them any more: commit
// af49514 deleted the whole fake pattern gallery (67 svgs + 22 product pages)
// on purpose — it presented output that fails the buyable-object test. This
// tool kept reading that directory and CRASHED at readdirSync (ENOENT), so
// scripts/deploy.sh proof #2 has been unrunnable ever since. A missing or
// empty declared dir is now a LOUD failure — never a crash, never a silent
// skip (Tur 9 katman-lint class).
const REQUIRED_DIRS = ['styles'];
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
    // collapse the patterns link href to one canonical token: from root it is
    // "patterns/index.html", from a subdir it is "index.html"
    .replace(/href="patterns\/index\.html"/g, 'href="__PATTERNS__"')
    .replace(/(<a href=")index\.html(" data-en="Pattern Blog")/g, '$1__PATTERNS__$2')
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
