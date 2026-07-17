// Wearability benchmark driver. Reads the latest benchmark-58 results JSON (the
// vision-read specs for the 54 real product photos), maps each garment spec to
// engine params the SAME way web/js/create.js does for the opening-relevant
// fields (closure -> placket/tie, backDetail -> back opening), emits a TSV, and
// pipes it through the compiled wearability-bench CLI to count how many specs the
// engine currently drafts into an UNWEARABLE pattern.
//
// Usage: node engine/tools/wearability-bench.mjs [results.json] [wearability-bench-binary]
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// --- locate the newest results-*.json (the labelled vision reads) --------------
let resultsPath = process.argv[2];
if (!resultsPath) {
  const dir = join(root, 'benchmark-58');
  const files = existsSync(dir)
    ? readdirSync(dir).filter((f) => /^results-\d{4}-\d\d-\d\d\.json$/.test(f)).sort()
    : [];
  if (!files.length) { console.error('no benchmark-58/results-*.json found (data is local/gitignored)'); process.exit(2); }
  resultsPath = join(dir, files[files.length - 1]);
}
const bin = process.argv[3] || join(root, 'engine', 'build', 'wearability-bench');
if (!existsSync(bin)) { console.error('build the CLI first: cmake --build engine/build (target wearability-bench)'); process.exit(2); }

console.error('results:', resultsPath);
const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

// --- opening mapping, mirroring create.js pickTiePlacement / pickBackOpening ----
const TIE = { none: 0, backWaist: 1, backWaistBow: 2, frontNeckBow: 3, tieBack: 4, cuffTies: 5 };
const BACK = { none: 0, round: 1, lowV: 2, square: 3, keyhole: 4 };

function pickTiePlacement(seen) {
  const oov = Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '';
  const isDrawstring = (s) => /drawstring|gathered|shirr|smock/.test((s || '').toLowerCase());
  if (seen.backDetail === 'tieBack') return 'tieBack';
  const c = seen.closure;
  if (c && (c.type === 'ties')) {
    const loc = (c.location || '').toLowerCase();
    if (loc.includes('neck') && isDrawstring(oov)) return 'none';
    if (loc.includes('waist')) return 'backWaistBow';
    if (loc.includes('back')) return 'backWaistBow';
    if (loc.includes('neck')) return isDrawstring(oov) ? 'none' : 'frontNeckBow';
    if (loc.includes('front') || loc.includes('center')) return 'frontNeckBow';
    return 'backWaistBow';
  }
  return 'none';
}
function pickBackOpening(seen) {
  const words = [seen.backDetail, Array.isArray(seen.outOfVocab) ? seen.outOfVocab.join(' | ') : '']
    .filter(Boolean).join(' ').toLowerCase();
  const named = /open.?back|back.?cutout|backless|low open back/.test(words) || seen.backDetail === 'openBack';
  if (!named) return null;
  if (/keyhole/.test(words)) return 'keyhole';
  if (/square/.test(words)) return 'square';
  if (/\bv-?\b|low-?v|deep v|v cut|v-cut|plunge/.test(words)) return 'lowV';
  return 'round';
}
function pickFrontPlacket(seen) {
  const c = seen.closure;
  if (c && (c.type === 'buttons' || c.type === 'placket')) {
    const loc = (c.location || '').toLowerCase();
    // create.js: a front/center button closure is drawn as a placket; a back/side
    // closure stays honest.
    if (!loc || loc.includes('front') || loc.includes('center') || loc.includes('cf')) return true;
  }
  return false;
}

// --- normalize the vision garment/neckline/sleeve to engine strings ------------
function garmentOf(s) { return s.garment === 'skirt' ? 'skirt' : s.garment === 'top' ? 'top' : 'dress'; }
function necklineOf(s) {
  const n = (s.neckline || '').toLowerCase();
  if (n.includes('scoop')) return 'scoop';
  if (n.includes('v')) return 'vNeck';
  if (n.includes('square')) return 'square';
  if (n.includes('boat') || n.includes('bateau')) return 'boat';
  if (n.includes('sweetheart') || n.includes('heart')) return 'sweetheart';
  if (n.includes('halter')) return 'halter';
  return 'crew';
}
function sleeveOf(s) {
  const v = (s.sleeveStyle || '').toLowerCase();
  if (v === 'straight' || v === 'set-in' || v === 'fitted') return 'straight';
  if (v === 'balloon' || v === 'puff' || v === 'bishop') return 'balloon';
  return 'none';
}

const rows = [];
for (const [key, entry] of Object.entries(results)) {
  const s = entry.spec;
  if (!s || !s.garment || s.garment === 'other') continue; // rejects/non-garments
  const tie = pickTiePlacement(s);
  const back = pickBackOpening(s);
  const fp = pickFrontPlacket(s);
  const id = (entry.name || key).replace(/\s+/g, '_').slice(0, 28);
  rows.push([
    id, garmentOf(s), necklineOf(s), sleeveOf(s),
    fp ? '1' : '0', String(TIE[tie] ?? 0), String(back ? (BACK[back] ?? 0) : 0),
    s.keyhole ? '1' : '0',
  ].join('\t'));
}

const tsv = rows.join('\n') + '\n';
const out = execFileSync(bin, { input: tsv, encoding: 'utf8' });
process.stdout.write(out);
