#!/usr/bin/env node
// al_dene_check — "AL DENE" IS A SENTENCE SOMEBODY CAN ACT ON (GECE7 / F8).
//
// WHAT IT DOES AND DOES NOT CLAIM.
//
// The claim being shipped is: a stranger opens ONE page, sees TEN real
// photographs, clicks any of them, and leaves with a pattern, a flat and a PDF —
// without an account, an upload, or a cent of API spend.
//
// Two thirds of that sentence are ALREADY under gates and are deliberately NOT
// re-measured here, because a second implementation of a measurement is a second
// truth and this repo has paid for that lesson:
//
//   * "ten of ten actually draft"  -> hedef_kosu.mjs H1, which runs the SAME
//     banked readings from the SAME fixtures and reports 10/10 (n=10).
//   * "a PDF really downloads, 1:1, with a 30.000 mm calibration square"
//     -> indir_check.mjs items 4 and 5, on web/js/download.js itself.
//
// So what is left over — and what nothing measured until today — is the WIRING
// between those two facts and the page: that the page's ten really are the
// ratchet's ten, that the photographs shipped are the photographs that were
// credited and measured, and that the example path does not quietly become a
// paid one. That is this file.
//
// 🚨 THE HOLDOUT. contract/hedef-kosu-taban.json seals which ten (§3.8 md.2) and
// the referee holds four photographs back (11 · 12 · 30 · 35) plus a reserve five
// (K16). A public page that shipped one of them would burn a holdout that has
// survived nine cards, permanently and silently. This gate refuses that
// explicitly rather than trusting that nobody will do it.
//
// ZERO API CALLS, ZERO COST.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const fails = [];
const note = [];
const check = (name, cond, detail) => {
  if (cond) note.push(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  else fails.push(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
};
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const readJSON = (rel) => JSON.parse(read(rel));

// ── 1. THE TEN ARE THE SEALED TEN ──────────────────────────────────────────
const data = readJSON('web/data/al-dene.json');
const taban = readJSON('contract/hedef-kosu-taban.json');
const sealedTen = (function find(o) {
  if (o && typeof o === 'object') {
    if (Array.isArray(o.hedef_10)) return o.hedef_10;
    for (const v of Object.values(o)) { const r = find(v); if (r) return r; }
  }
  return null;
})(taban);

check('the baseline still seals a measurement set of ten',
  Array.isArray(sealedTen) && sealedTen.length === 10, `${sealedTen ? sealedTen.length : 0}`);
const shipped = (data.ornekler || []).map((o) => o.dosya);
check('the page ships EXACTLY the sealed ten, in the sealed order',
  JSON.stringify(shipped) === JSON.stringify(sealedTen),
  `${shipped.length} shipped`);

// 🚨 THE HOLDOUT AND THE RESERVE, BY NAME (K16). Named rather than derived: a
// derivation that silently returned an empty set would make this pass while
// proving nothing.
const FORBIDDEN = ['11', '12', '30', '35', '10', '14', '15', '34', '36'];
const leaked = shipped.filter((f) => FORBIDDEN.includes(f.split('-')[0]));
check('no holdout or reserve photograph is published on the page',
  leaked.length === 0,
  leaked.length ? `LEAKED: ${leaked.join(', ')}` : 'holdout 11·12·30·35 + reserve 10·14·15·34·36 all absent');

// ── 2. THE SHIPPED PHOTOGRAPHS ARE THE MEASURED ONES ───────────────────────
// A re-encoded or cropped copy would measure differently in measure.js than the
// file the banked labels were read from, and the page would silently stop being
// the same experiment it cites.
const credits = readJSON('vision/eval/credits.json');
for (const ex of (data.ornekler || [])) {
  const p = join(ROOT, 'web/ornek', ex.dosya);
  if (!existsSync(p)) { check(`web/ornek/${ex.dosya} ships`, false, 'missing'); continue; }
  const digest = createHash('sha256').update(readFileSync(p)).digest('hex');
  const c = credits[ex.dosya];
  check(`"${ex.dosya}" is byte-identical to the credited original`,
    !!c && digest === c.sha256, `${digest.slice(0, 12)} vs ${c ? c.sha256.slice(0, 12) : 'NO CREDIT'}`);
  check(`"${ex.dosya}" carries author + licence + source on the page`,
    !!ex.kunye && !!ex.kunye.author && !!ex.kunye.license && /^https?:/.test(ex.kunye.commons_page || ''),
    ex.kunye ? `${ex.kunye.author} · ${ex.kunye.license}` : 'no credit block');
  check(`"${ex.dosya}" carries a banked reading the engine can draft`,
    !!ex.seen && ['skirt', 'dress', 'top'].includes(ex.seen.garment),
    ex.seen ? String(ex.seen.garment) : 'no reading');
}
// Nothing extra sits in the public folder either — an uncredited photograph
// shipping alongside the credited ten is the same licensing problem.
const inFolder = readdirSync(join(ROOT, 'web/ornek')).filter((f) => /\.jpe?g$/i.test(f));
check('web/ornek/ holds the ten and nothing else',
  inFolder.length === 10 && inFolder.every((f) => shipped.includes(f)),
  `${inFolder.length} file(s)`);

// ── 3. THE BANKED READINGS COME FROM THE RATCHET'S OWN FIXTURES ────────────
// This is the join that lets hedef_kosu's H1 = 10/10 be said about THIS page.
// If the page ever carried its own edited copy of a reading, the ratchet and the
// page would be describing two different experiments under one sentence.
const fixtures = {};
for (const f of (data._kaynak && data._kaynak.goru) || []) Object.assign(fixtures, readJSON(f));
let drift = [];
for (const ex of (data.ornekler || [])) {
  const banked = fixtures[ex.dosya];
  if (!banked) { drift.push(`${ex.dosya}: not in any fixture`); continue; }
  if (JSON.stringify(banked) !== JSON.stringify(ex.seen)) drift.push(`${ex.dosya}: reading differs`);
}
check('every published reading is byte-equal to the banked fixture the ratchet runs on',
  drift.length === 0, drift.join(' · ') || `${(data.ornekler || []).length} reading(s) match`);

// ── 4. THE EXAMPLE PATH IS FREE (§3.9) ─────────────────────────────────────
const analyzeSrc = read('web/js/analyze.js');
const createSrc = read('web/js/create.js');
check('analyze.js exposes a BANKED reader beside the paid one',
  /export async function analyzeBankedPhoto\(/.test(analyzeSrc));
// The banked reader must not reach the Worker. Measured on the function body,
// not on the file: the paid path in the same file legitimately does fetch it.
const bankedBody = analyzeSrc.slice(analyzeSrc.indexOf('export async function analyzeBankedPhoto('));
check('the banked reader never touches BACKEND_URL',
  !/BACKEND_URL/.test(bankedBody), 'an example that spends money is not an example');
check('the banked reader still measures the REAL image (it returns pixels)',
  /downscale\(/.test(bankedBody) && /pixels/.test(bankedBody),
  'only the LABELS are a recording; the proportions are measured live');
check('create.js reads ?ornek= and feeds the banked photo to the SHARED ingest',
  /URLSearchParams\(location\.search\)\.get\('ornek'\)/.test(createSrc) &&
  /analyzeBankedPhoto\(/.test(createSrc) &&
  /await ingestReading\(reading, pixels, ornekStatus\)/.test(createSrc));
// ⭐ ONE INGEST, TWO DOORS. The upload path and the example path must call the
// SAME function — a copied 300-line spec-building block is exactly the failure
// create.js already documents (the honesty flags that drifted into missing.js).
// Comment lines are stripped first: this file's own prose mentions the name,
// and a gate that counts its own documentation is measuring nothing.
const codeLines = createSrc.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l));
const defs = codeLines.filter((l) => /async function ingestReading\(/.test(l)).length;
const calls = codeLines.filter((l) => /await ingestReading\(/.test(l)).length;
check('the photo ingest has ONE definition and BOTH doors call it',
  defs === 1 && calls === 2, `${defs} definition, ${calls} call site(s)`);
// ⭐ THE EXAMPLE PATH MUST NOT SIT INSIDE `if (photoAvailable())`. Measured by
// INDENTATION rather than by a text window: the guard's body is indented one
// level deeper than showSpec()'s, so a two-space `const ornekNo` is outside it
// and a four-space one is inside. A regex over surrounding characters would
// match this file's own explanatory comments — it did, on the first try.
const ornekDecl = codeLines.find((l) => /const ornekNo =/.test(l)) || '';
check('the example path is NOT hidden behind the paid-worker guard',
  /^ {2}const ornekNo =/.test(ornekDecl) &&
  codeLines.some((l) => /^ {6}if \(!file\.files\[0\]\) return;/.test(l)),
  `"${ornekDecl.trim()}" at indent ${ornekDecl.length - ornekDecl.trimStart().length} ` +
  '(the guarded upload handler sits deeper) — a stranger can walk the chain with the Worker closed');

// ── 5. THE PAGE ITSELF IS REACHABLE AND HONEST ─────────────────────────────
const page = read('web/al-dene.html');
check('the page builds its cards from the generated file, not from typed HTML',
  /fetch\('data\/al-dene\.json/.test(page) && !/Rijksmuseum/.test(page),
  'a hand-typed credit line under somebody else\'s photograph is the drift that matters');
check('the page links every card into the product',
  /create\.html\?ornek=/.test(page));
check('the landing page links to it — an unreachable page is not a page',
  /href="al-dene\.html"/.test(read('web/index.html')));
check('it is in the sitemap', /al-dene\.html/.test(read('web/sitemap.xml')));
// House rule (CLAUDE.md): a heading in question form ends with a question mark.
const headings = [...page.matchAll(/<h[12][^>]*>([^<]+)<\/h[12]>/g)].map((m) => m[1].trim());
const badQ = headings.filter((h) => /^(what|why|how|can|does|is|are|should|who|where|when)\b/i.test(h) && !h.endsWith('?'));
check('every question-shaped heading ends with a question mark', badQ.length === 0,
  badQ.join(' · ') || headings.join(' · '));
// The generated data file must declare that it is generated, so nobody edits it.
check('the data file says out loud that it is generated',
  /gen-al-dene\.py/.test(JSON.stringify(data._uretildi || '')),
  String(data._uretildi || ''));

console.log('AL DENE KAPISI — bir yabancı tek sayfadan dosya alabiliyor mu? (0 API çağrısı)');
console.log(note.join('\n'));
if (fails.length) console.log(fails.join('\n'));
console.log('\n⚠ BU KAPI "10/10 ÇİZİLİYOR" DEMİYOR — onu hedef_kosu H1 ölçüyor (10/10, n=10),');
console.log('  ve "PDF iniyor"u indir_check ölçüyor (kalibrasyon karesi 30.000 mm).');
console.log('  Buradaki iddia o iki ölçümün BU SAYFAYA bağlandığıdır: aynı on fotoğraf,');
console.log('  aynı bankalı okumalar, aynı indirme modülü, ve sıfır API çağrısı.');
console.log(`\nAL DENE KAPISI: ${fails.length ? `KIRMIZI — ${fails.length} kalem` : 'YEŞİL'}`);
process.exit(fails.length ? 1 : 0);
