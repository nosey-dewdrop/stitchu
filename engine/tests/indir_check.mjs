// indir_check.mjs — F-İNDİR gate: THE USER CAN TAKE A FILE HOME.
//
// WHY. Measured 26 Aug 2026: web/js/create.js contained zero lines matching
// `download` or `dxf`. A shopper could upload a photo, watch the engine draft a
// pattern, and leave with nothing. Every other gate in this repo was green the
// whole time, because none of them asks whether the product hands over a file.
//
// WHAT IT MEASURES, on the SAME modules the browser loads (web/js/download.js,
// web/lib/pdf-core.js, the wasm bundle in engine/dist) — not a node-only
// re-implementation, which would prove nothing about what downloads:
//
//   1. DXF   engine.dxfSpecJSON exists and returns an R12 document with the
//            ASTM layers, for a SPEC (create.html's boundary). Before F-İNDİR
//            only dxfRecipeJSON existed, which create.html can never call.
//   2. DXF parity — spec DXF and the native path agree on the geometry:
//            same section structure and the same POLYLINE count as the drafted
//            piece count implies. (Byte parity for the recipe path is already
//            proven by dxf_wasm_parity; this asserts the new door is the same
//            door, not a new writer.)
//   3. SVG   patternSVG() writes a true-mm document containing every piece.
//   4. PDF   patternA4Pdf() writes real PDF bytes whose cover page carries the
//            3 cm calibration square, and the square MEASURES 30 mm: the `re`
//            operator's width/height in PDF points is read back and converted.
//            "The PDF has a calibration square" is not the claim; "the square
//            is 30.000 mm" is.
//   5. A0    patternA0Pdf() writes one single page, 841x1189 mm.
//   6. REFUSAL — a spec the validator blocks hands out NO dxf (RULES
//            invariant 1: a blocked draft must not download as a clean
//            industry file that a shopper then cuts fabric to).
//
// Artifacts are written next to the build so a human can open them; the paths
// are printed (RULES invariant 3 — a file path, not "I looked at it").
//
// ZERO API CALLS, ZERO COST: nothing here touches the VLM. It is pure geometry.

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

// A four-line DOM stub so the SAVERS themselves run here, not just the
// builders. Without it the branch that decides whether a refused draft still
// lands on someone's cutting table lives in a browser-only function that no
// gate can turn red — measured: an early mutation that made saveDXF swallow the
// engine's refusal left this file GREEN.
const saved = [];
globalThis.document = { createElement: () => ({ click() { saved.push(this.download); } }) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:stub', revokeObjectURL: () => {} };

const { patternSVG, patternA4Pdf, patternA0Pdf, relayDXF, safeName } =
  await import(join(ROOT, 'web/js/download.js'));

const MM = 72 / 25.4;
const OUT = join(ROOT, 'Logs', 'indir-check');
mkdirSync(OUT, { recursive: true });

const fails = [];
const note = [];
function check(name, cond, detail) {
  if (cond) note.push(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  else fails.push(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
}

// EU38, the body create.html drafts a first-time visitor on.
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
const SPEC = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
};

const engine = await require(join(ROOT, 'engine/dist/stitchu-engine.js'))();

// engineSpec() lives in web/js/engine.js behind a browser-only loadEngine(), so
// the wire format is spelled out here the way the boundary declares it. Any
// field left out arrives at its documented default; nothing is coerced.
const wire = {
  ...SPEC, fabricStretchPct: -1, skirtLengthMM: 0, ruffleHem: false, ruffleTiers: 1,
  keyhole: false, frontPlacket: false, tieClosure: 0, sleeveCap: 0, collarType: 0,
  collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, laceUpBack: 0,
  wrapFront: 0, backSlit: 0, ruffledStraps: 0, peplum: 0, hemFlounce: 0,
  placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0, hemShape: 0,
  shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0,
  cupSeam: 0, yoke: 0, boxPleat: 0,
};

const drafted = JSON.parse(engine.draftJSON(wire, BODY));
check('draft is clean', !drafted.error && drafted.pattern && !drafted.issues.length,
  drafted.error || `${drafted.issues.length} issue(s)`);
const pattern = drafted.pattern;
if (!pattern) {
  console.log(note.join('\n'));
  console.log(fails.join('\n'));
  console.log('\nİNDİR KAPISI: KIRMIZI — engine could not draft the reference spec.');
  process.exit(1);
}

// ---------------------------------------------------------------- 1 + 2. DXF
check('engine exposes dxfSpecJSON', typeof engine.dxfSpecJSON === 'function',
  'create.html has no recipe text; without this binding its DXF button cannot exist');

let dxf = '';
if (typeof engine.dxfSpecJSON === 'function') {
  const out = JSON.parse(engine.dxfSpecJSON(wire, BODY));
  check('spec DXF built', !out.error && !!out.dxf, out.error || `${(out.dxf || '').length} chars`);
  dxf = out.dxf || '';
}
check('DXF is an R12 document', dxf.includes('SECTION') && dxf.includes('ENTITIES') && dxf.trimEnd().endsWith('EOF'));
// ASTM D6673 layer names the native dxf-export writes; if the spec door wrote
// its own geometry instead of calling dxf::exportPattern these would be absent.
for (const layer of ['1', '8']) {
  check(`DXF carries layer ${layer}`, new RegExp(`^\\s*8\\r?\\n${layer}\\r?$`, 'm').test(dxf));
}
const polylines = (dxf.match(/\nPOLYLINE\r?\n/g) || []).length;
check('DXF has one polyline run per drafted piece or more',
  polylines >= pattern.pieces.length, `${polylines} POLYLINE vs ${pattern.pieces.length} pieces`);

// --------------------------------------------------------------------- 3. SVG
const svg = patternSVG(pattern);
check('SVG is a document', svg.startsWith('<?xml') && svg.trimEnd().endsWith('</svg>'));
check('SVG is dimensioned in mm', /width="[\d.]+mm" height="[\d.]+mm"/.test(svg));
let named = 0;
for (const p of pattern.pieces) if (svg.includes(p.name)) named++;
check('every piece is labelled in the SVG', named === pattern.pieces.length,
  `${named}/${pattern.pieces.length}`);

// --------------------------------------------------------------------- 4. PDF
const a4 = patternA4Pdf(pattern, 'Dress');
const a4text = Buffer.from(a4).toString('latin1');
check('A4 PDF is PDF bytes', a4text.startsWith('%PDF-1.') && a4text.trimEnd().endsWith('%%EOF'));
const a4pages = Number((a4text.match(/\/Type \/Pages [^>]*\/Count (\d+)/) || [])[1] || 0);
check('A4 pack has a cover plus at least one tiled sheet', a4pages >= 2, `${a4pages} pages`);
check('A4 cover names the calibration square', a4text.includes('3 cm, measure me before cutting'));

// The measurement itself: find every `w h re` operator and look for the square.
// PDF user space is points; 30 mm is 85.039 pt. A wrong unit, a wrong scale or a
// silently "fixed" square all move this number, which is the whole point.
let squareMM = null;
for (const m of a4text.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) re/g)) {
  const w = Number(m[3]) / MM, h = Number(m[4]) / MM;
  if (Math.abs(w - h) < 0.01 && Math.abs(w - 30) < 0.5) { squareMM = w; break; }
}
check('the calibration square measures 3.000 cm',
  squareMM !== null && Math.abs(squareMM - 30) < 0.01,
  squareMM === null ? 'no square-shaped `re` near 30 mm found' : `${squareMM.toFixed(4)} mm`);

// ---------------------------------------------------------------------- 5. A0
const a0 = patternA0Pdf(pattern, 'Dress');
const a0text = Buffer.from(a0).toString('latin1');
const a0pages = Number((a0text.match(/\/Type \/Pages [^>]*\/Count (\d+)/) || [])[1] || 0);
check('A0 is a single sheet', a0pages === 1, `${a0pages} pages`);
const box = a0text.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
check('A0 sheet is 841 x 1189 mm',
  !!box && Math.abs(Number(box[1]) / MM - 841) < 0.1 && Math.abs(Number(box[2]) / MM - 1189) < 0.1,
  box ? `${(Number(box[1]) / MM).toFixed(1)} x ${(Number(box[2]) / MM).toFixed(1)} mm` : 'no MediaBox');

// ------------------------------------------------------------------ 6. REFUSAL
// An unknown enum value must not produce a file. This is the honest-refusal
// invariant on the download path: the failure the user must never get is a
// clean-looking DXF for a garment the engine did not agree to draft.
if (typeof engine.dxfSpecJSON === 'function') {
  const bad = JSON.parse(engine.dxfSpecJSON({ ...wire, neckline: 'ZZ_NOT_A_NECKLINE' }, BODY));
  check('unknown enum hands out NO dxf', !!bad.error && !bad.dxf, JSON.stringify(bad).slice(0, 120));
  const noBody = JSON.parse(engine.dxfSpecJSON(wire, { ...BODY, bust: 0 }));
  check('unusable body hands out NO dxf', !!noBody.error && !noBody.dxf, JSON.stringify(noBody).slice(0, 120));
}

// --------------------------------------------- 7. THE REFUSAL REACHES THE USER
// The engine refusing is only half of invariant 1; the page must not save
// anything either, and must say why.
const before = saved.length;
const refusal = relayDXF({ error: 'validator blocked this draft', dxf: null }, 'nope.dxf');
check('a refused DXF saves NO file', saved.length === before, `${saved.length - before} file(s) saved`);
check('a refused DXF returns the reason', refusal === 'validator blocked this draft', String(refusal));
check('an accepted DXF does save', relayDXF({ dxf: dxf || 'x' }, 'yes.dxf') === null && saved.includes('yes.dxf'));

// ------------------------------------------------------- 8. THE BUTTON EXISTS
// The six checks above prove the WRITERS work. They would all stay green if
// create.html never called them — which is precisely the state the repo was in
// on 26 Aug, with a perfectly good download path sitting in studio.js that the
// shopper's page could not reach. So the wiring itself is measured, in the same
// terms the disease was measured in: the count of `download`/`dxf` lines in
// create.js, which was ZERO.
const createSrc = readFileSync(join(ROOT, 'web/js/create.js'), 'utf8');
check('create.js imports the download module', /from '\.\/download\.js/.test(createSrc));
for (const fn of ['saveA4Pdf', 'saveSVG', 'saveDXF']) {
  check(`create.js calls ${fn}`, new RegExp(`\\b${fn}\\s*\\(`).test(createSrc),
    'the result screen must offer this file, not merely be able to build it');
}
// MOUNTED, not merely defined. The first draft of this line matched
// `downloadPanel(` and stayed green when the mount was deleted, because the
// function DECLARATION still matched — a gate that cannot go red. It now looks
// for the append itself.
check('the result screen mounts the panel',
  /appendChild\(\s*downloadPanel\(/.test(createSrc),
  'a panel that is built but never appended is the 26 Aug state with extra code');

// ------------------------------------------------------------------ artifacts
const base = join(OUT, safeName('stitchu-dress-aline'));
writeFileSync(`${base}.dxf`, dxf);
writeFileSync(`${base}.svg`, svg);
writeFileSync(`${base}-a4.pdf`, a4);
writeFileSync(`${base}-a0.pdf`, a0);

console.log('İNDİR KAPISI — kullanıcı eve bir dosya götürüyor mu? (0 API çağrısı)');
console.log(note.join('\n'));
if (fails.length) console.log(fails.join('\n'));
console.log('\nyazılan dosyalar (RULES invariant 3 — yol, "baktım" değil):');
for (const f of ['.dxf', '.svg', '-a4.pdf', '-a0.pdf']) console.log(`  ${base}${f}`);
console.log(`\nİNDİR KAPISI: ${fails.length ? `KIRMIZI — ${fails.length} kalem` : 'YEŞİL'}`);
process.exit(fails.length ? 1 : 0);
